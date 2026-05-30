import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const CONNECTION_FILE =
  process.env.X_CONNECTIONS_FILE ||
  path.join(process.cwd(), '.x-social-connections.json')

export const X_TWEET_SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']

function encodeStatePayload(payload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodeStatePayload(state) {
  try {
    const payload = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
    const createdAt = Date.parse(payload.createdAt || '')

    if (!Number.isFinite(createdAt) || Date.now() - createdAt > 15 * 60_000) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function hasEnvOAuth1Credentials() {
  return Boolean(
    process.env.X_CONSUMER_KEY &&
      process.env.X_CONSUMER_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_TOKEN_SECRET,
  )
}

export async function readXConnections() {
  try {
    const raw = await fs.readFile(CONNECTION_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    return {
      accessToken: '',
      expiresAt: null,
      pendingStates: [],
      refreshToken: '',
      scope: '',
      tokenType: '',
      user: null,
    }
  }
}

export async function writeXConnections(connections) {
  const payload = {
    ...connections,
    pendingStates: (connections.pendingStates || []).filter((state) => {
      const createdAt = Date.parse(state.createdAt || '')
      return Number.isFinite(createdAt) && Date.now() - createdAt < 15 * 60_000
    }),
    updatedAt: new Date().toISOString(),
  }

  await fs.writeFile(CONNECTION_FILE, `${JSON.stringify(payload, null, 2)}\n`, {
    mode: 0o600,
  })

  return payload
}

export async function createXPendingState({ codeChallenge, codeVerifier, redirectUri }) {
  const connections = await readXConnections()
  const payload = {
    codeChallenge,
    codeVerifier,
    createdAt: new Date().toISOString(),
    nonce: crypto.randomBytes(16).toString('hex'),
    redirectUri,
  }
  const state = encodeStatePayload(payload)

  await writeXConnections({
    ...connections,
    pendingStates: [
      ...(connections.pendingStates || []),
      { ...payload, state },
    ],
  })

  return state
}

export async function consumeXPendingState(state) {
  const connections = await readXConnections()
  const pendingStates = connections.pendingStates || []
  const matchingState = pendingStates.find((item) => item.state === state)

  if (!matchingState) {
    return decodeStatePayload(state) || false
  }

  await writeXConnections({
    ...connections,
    pendingStates: pendingStates.filter((item) => item.state !== state),
  })

  return matchingState
}

export async function saveXOAuthConnection(tokenPayload, user = null) {
  const connections = await readXConnections()

  return writeXConnections({
    ...connections,
    accessToken: tokenPayload.access_token || '',
    expiresAt: tokenPayload.expires_in
      ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
      : null,
    refreshToken: tokenPayload.refresh_token || connections.refreshToken || '',
    scope: tokenPayload.scope || '',
    tokenType: tokenPayload.token_type || 'bearer',
    user: user || connections.user || null,
  })
}

export async function getActiveXConfig() {
  const connections = await readXConnections()
  const oauth2Connected = Boolean(connections.accessToken)
  const oauth2Expired = connections.expiresAt
    ? Date.parse(connections.expiresAt) <= Date.now() + 60_000
    : false

  return {
    accessToken: process.env.X_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET || '',
    bearerToken: process.env.X_BEARER_TOKEN || '',
    clientId: process.env.X_CLIENT_ID || '',
    clientSecret: process.env.X_CLIENT_SECRET || '',
    consumerKey: process.env.X_CONSUMER_KEY || '',
    consumerSecret: process.env.X_CONSUMER_SECRET || '',
    connections,
    envOAuth1Ready: hasEnvOAuth1Credentials(),
    oauth2Connected,
    oauth2Expired,
    oauth2Ready: oauth2Connected && !oauth2Expired,
    user: connections.user || null,
  }
}
