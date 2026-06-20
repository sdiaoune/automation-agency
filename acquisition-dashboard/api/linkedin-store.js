import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const CONNECTIONS_FILE =
  process.env.LINKEDIN_CONNECTIONS_FILE ||
  path.join(process.cwd(), '.linkedin-social-connections.json')
const CONNECTION_COOKIE = 'emc2ops_linkedin_connection'
const STATE_COOKIE = 'emc2ops_linkedin_state'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 55
const STATE_MAX_AGE = 60 * 10

export const LINKEDIN_MEMBER_POST_SCOPE = 'w_member_social'
export const LINKEDIN_ORGANIZATION_POST_SCOPE = 'w_organization_social'
export const LINKEDIN_POST_SCOPES = [
  'openid',
  'profile',
  'email',
  LINKEDIN_MEMBER_POST_SCOPE,
]

function cookieSecret() {
  return process.env.LINKEDIN_COOKIE_SECRET || process.env.LINKEDIN_CLIENT_SECRET || ''
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url')
}

function signCookiePayload(payload) {
  const secret = cookieSecret()

  if (!secret) return ''

  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

function encodeSignedCookie(value) {
  const payload = base64Url(JSON.stringify(value))
  const signature = signCookiePayload(payload)

  return signature ? `${payload}.${signature}` : ''
}

function decodeSignedCookie(rawValue) {
  if (!rawValue) return null

  const [payload, signature] = String(rawValue).split('.')
  const expectedSignature = signCookiePayload(payload)

  if (!payload || !signature || !expectedSignature) return null

  const actual = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (
    actual.length !== expected.length ||
    !crypto.timingSafeEqual(actual, expected)
  ) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

function requestCookies(request) {
  const cookieHeader = request?.headers?.cookie || request?.headers?.get?.('cookie') || ''

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf('=')
        if (separatorIndex === -1) return [cookie, '']

        return [
          decodeURIComponent(cookie.slice(0, separatorIndex)),
          decodeURIComponent(cookie.slice(separatorIndex + 1)),
        ]
      }),
  )
}

function appendSetCookie(response, cookie) {
  const current = response.getHeader?.('Set-Cookie')

  if (!current) {
    response.setHeader('Set-Cookie', cookie)
    return
  }

  response.setHeader(
    'Set-Cookie',
    Array.isArray(current) ? [...current, cookie] : [current, cookie],
  )
}

function setSignedCookie(response, name, value, maxAge) {
  const encoded = encodeSignedCookie(value)
  const attributes = [
    `${name}=${encodeURIComponent(encoded)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    attributes.push('Secure')
  }

  appendSetCookie(response, attributes.join('; '))
}

function clearCookie(response, name) {
  appendSetCookie(
    response,
    `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
      process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : ''
    }`,
  )
}

function expiresAt(tokenPayload) {
  return tokenPayload.expires_in
    ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
    : null
}

export async function readLinkedInConnections() {
  try {
    return JSON.parse(await fs.readFile(CONNECTIONS_FILE, 'utf8'))
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn(`Could not read LinkedIn connections: ${error.message}`)
    }

    return {}
  }
}

export async function writeLinkedInConnections(connections) {
  await fs.writeFile(
    CONNECTIONS_FILE,
    `${JSON.stringify(connections, null, 2)}\n`,
    'utf8',
  )
}

export async function createLinkedInPendingState({ redirectUri, response }) {
  const connections = await readLinkedInConnections()
  const state = crypto.randomUUID()
  const pendingState = {
    createdAt: new Date().toISOString(),
    redirectUri,
    state,
  }

  if (response) {
    setSignedCookie(response, STATE_COOKIE, pendingState, STATE_MAX_AGE)
    return state
  }

  await writeLinkedInConnections({
    ...connections,
    pendingStates: {
      ...(connections.pendingStates || {}),
      [state]: pendingState,
    },
  })

  return state
}

export async function consumeLinkedInPendingState(state, { request, response } = {}) {
  const cookieState = decodeSignedCookie(requestCookies(request)[STATE_COOKIE])

  if (cookieState?.state === state) {
    if (response) clearCookie(response, STATE_COOKIE)
    return cookieState
  }

  const connections = await readLinkedInConnections()
  const pendingState = connections.pendingStates?.[state] || null

  if (!pendingState) return null

  const { [state]: _consumed, ...remainingStates } = connections.pendingStates
  await writeLinkedInConnections({
    ...connections,
    pendingStates: remainingStates,
  })

  return pendingState
}

export async function saveLinkedInOAuthConnection(tokenPayload, user = null, { response } = {}) {
  const connections = await readLinkedInConnections()
  const connection = {
    accessToken: tokenPayload.access_token,
    expiresAt: expiresAt(tokenPayload),
    scope: tokenPayload.scope || connections.scope || '',
    tokenType: tokenPayload.token_type || connections.tokenType || 'Bearer',
    user: user
      ? {
          email: user.email || '',
          name: user.name || '',
          picture: user.picture || '',
          sub: user.sub || '',
        }
      : connections.user || null,
  }

  if (response) {
    setSignedCookie(response, CONNECTION_COOKIE, connection, COOKIE_MAX_AGE)
    return
  }

  return writeLinkedInConnections({
    ...connections,
    ...connection,
    idToken: tokenPayload.id_token || connections.idToken || null,
  })
}

export async function getActiveLinkedInConfig(request = null) {
  const connections = await readLinkedInConnections()
  const cookieConnection =
    decodeSignedCookie(requestCookies(request)[CONNECTION_COOKIE]) || {}
  const activeConnection = {
    ...connections,
    ...cookieConnection,
  }
  const expiresAtTime = activeConnection.expiresAt
    ? new Date(activeConnection.expiresAt).getTime()
    : null
  const expired = Boolean(expiresAtTime && expiresAtTime <= Date.now() + 60_000)
  const explicitAuthorUrn = process.env.LINKEDIN_AUTHOR_URN || ''
  const personAuthorUrn = activeConnection.user?.sub
    ? `urn:li:person:${activeConnection.user.sub}`
    : ''
  const authorUrn = explicitAuthorUrn || personAuthorUrn
  const authorType = authorUrn.startsWith('urn:li:organization:')
    ? 'organization'
    : 'person'
  const requiredScope =
    authorType === 'organization'
      ? LINKEDIN_ORGANIZATION_POST_SCOPE
      : LINKEDIN_MEMBER_POST_SCOPE
  const connectionScopes = (activeConnection.scope || '')
    .split(/[\s,]+/)
    .filter(Boolean)
  const envScopes = (process.env.LINKEDIN_OAUTH_SCOPES || '')
    .split(/[\s,]+/)
    .filter(Boolean)
  const scopes = connectionScopes.length ? connectionScopes : envScopes
  const missingScopes =
    authorUrn && !scopes.includes(requiredScope) ? [requiredScope] : []

  return {
    accessToken: activeConnection.accessToken || process.env.LINKEDIN_ACCESS_TOKEN || '',
    authorType,
    authorUrn,
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    connections: activeConnection,
    expiresAt: activeConnection.expiresAt || null,
    oauthConnected: Boolean(activeConnection.accessToken),
    oauthExpired: expired,
    oauthReady: Boolean(
      (activeConnection.accessToken || process.env.LINKEDIN_ACCESS_TOKEN) && !expired,
    ),
    missingScopes,
    requiredScope,
    scopes,
    user: activeConnection.user || null,
    version: process.env.LINKEDIN_API_VERSION || '202605',
  }
}

export function publicLinkedInUser(user) {
  if (!user) return null

  return {
    email: user.email || '',
    name: user.name || '',
    picture: user.picture || '',
    sub: user.sub || '',
  }
}
