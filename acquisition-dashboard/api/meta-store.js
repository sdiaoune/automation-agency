import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

export const DEFAULT_GRAPH_VERSION = 'v25.0'
export const FACEBOOK_PUBLISH_SCOPE = 'pages_manage_posts'
export const INSTAGRAM_PUBLISH_SCOPE = 'instagram_content_publish'

const CONNECTION_FILE =
  process.env.META_CONNECTIONS_FILE ||
  path.join(process.cwd(), '.meta-social-connections.json')

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

export async function readMetaConnections() {
  try {
    const raw = await fs.readFile(CONNECTION_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    return {
      pages: [],
      pendingStates: [],
      selectedPageId: '',
      userAccessToken: '',
      userTokenExpiresAt: null,
    }
  }
}

export async function writeMetaConnections(connections) {
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

export function publicPage(page) {
  return {
    id: page.id,
    instagramBusinessAccount: page.instagramBusinessAccount || null,
    name: page.name,
  }
}

export async function createPendingState(values = {}) {
  const connections = await readMetaConnections()
  const payload = {
    createdAt: new Date().toISOString(),
    nonce: crypto.randomBytes(16).toString('hex'),
    ...values,
  }
  const state = encodeStatePayload(payload)

  await writeMetaConnections({
    ...connections,
    pendingStates: [
      ...(connections.pendingStates || []),
      { ...payload, state },
    ],
  })

  return state
}

export async function consumePendingState(state) {
  const connections = await readMetaConnections()
  const pendingStates = connections.pendingStates || []
  const matchingState = pendingStates.find((item) => item.state === state)

  if (!matchingState) {
    return decodeStatePayload(state) || false
  }

  await writeMetaConnections({
    ...connections,
    pendingStates: pendingStates.filter((item) => item.state !== state),
  })

  return matchingState
}

export async function saveOAuthConnection({
  pages,
  selectedPageId,
  userAccessToken,
  userTokenExpiresAt,
}) {
  const connections = await readMetaConnections()

  return writeMetaConnections({
    ...connections,
    pages,
    selectedPageId:
      selectedPageId ||
      connections.selectedPageId ||
      process.env.FACEBOOK_PAGE_ID ||
      pages[0]?.id ||
      '',
    userAccessToken,
    userTokenExpiresAt,
  })
}

export async function selectMetaPage(pageId) {
  const connections = await readMetaConnections()
  const page = (connections.pages || []).find((item) => item.id === pageId)

  if (!page) {
    throw new Error('That Page is not connected.')
  }

  await writeMetaConnections({
    ...connections,
    selectedPageId: pageId,
  })

  return page
}

export async function getActiveMetaConfig() {
  const connections = await readMetaConnections()
  const pages = connections.pages || []
  const selectedPage =
    pages.find((page) => page.id === connections.selectedPageId) || pages[0]
  const envPageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || ''
  const pageAccessToken = selectedPage?.accessToken || envPageAccessToken
  const appSecret = process.env.FACEBOOK_APP_SECRET || ''

  return {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret,
    appSecretProof:
      appSecret && pageAccessToken
        ? crypto.createHmac('sha256', appSecret).update(pageAccessToken).digest('hex')
        : '',
    facebookPageId: selectedPage?.id || process.env.FACEBOOK_PAGE_ID || '',
    instagramBusinessAccountId:
      selectedPage?.instagramBusinessAccount?.id ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
      process.env.INSTAGRAM_ACCOUNT_ID ||
      '',
    pageAccessToken,
    pageName: selectedPage?.name || '',
    pages,
    selectedPage,
    version: process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_VERSION,
  }
}

export async function inspectAccessToken(token) {
  const config = await getActiveMetaConfig()

  if (!config.appId || !config.appSecret || !token) {
    return {
      isValid: false,
      missingScopes: [FACEBOOK_PUBLISH_SCOPE],
      scopes: [],
      type: null,
    }
  }

  const url = new URL(`https://graph.facebook.com/${config.version}/debug_token`)
  url.searchParams.set('input_token', token)
  url.searchParams.set('access_token', `${config.appId}|${config.appSecret}`)
  const response = await fetch(url)
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      error: json?.error?.message || `Token debug returned ${response.status}.`,
      isValid: false,
      missingScopes: [FACEBOOK_PUBLISH_SCOPE],
      scopes: [],
      type: null,
    }
  }

  const scopes = Array.isArray(json.data?.scopes) ? json.data.scopes : []

  return {
    expiresAt: json.data?.expires_at
      ? new Date(json.data.expires_at * 1000).toISOString()
      : null,
    isValid: Boolean(json.data?.is_valid),
    missingScopes: [FACEBOOK_PUBLISH_SCOPE].filter(
      (scope) => !scopes.includes(scope),
    ),
    scopes,
    type: json.data?.type || null,
  }
}
