import {
  createPendingState,
  FACEBOOK_PUBLISH_SCOPE,
  getActiveMetaConfig,
  INSTAGRAM_PUBLISH_SCOPE,
  inspectAccessToken,
  publicPage,
  readMetaConnections,
  saveOAuthConnection,
  selectMetaPage,
  consumePendingState,
} from './meta-store.js'

const META_DISCOVERY_SCOPES = [
  'pages_show_list',
  'business_management',
]

const META_PUBLISHING_SCOPES = [
  ...META_DISCOVERY_SCOPES,
  'pages_read_engagement',
  FACEBOOK_PUBLISH_SCOPE,
  'instagram_basic',
  INSTAGRAM_PUBLISH_SCOPE,
]

function oauthScopesForMode(mode) {
  const envScopes = process.env.META_OAUTH_SCOPES

  if (envScopes) {
    return envScopes
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean)
  }

  return mode === 'publish' ? META_PUBLISHING_SCOPES : META_DISCOVERY_SCOPES
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

function redirect(response, location) {
  response.statusCode = 302
  response.setHeader('Location', location)
  response.end()
}

function originFromRequest(request) {
  const host = request.headers.host || request.headers.get?.('host')
  const protocol =
    request.headers['x-forwarded-proto'] ||
    request.headers.get?.('x-forwarded-proto') ||
    'http'

  return `${protocol}://${host}`
}

function isLocalRequest(request) {
  const host = request.headers.host || request.headers.get?.('host') || ''
  return host.startsWith('localhost:') || host.startsWith('127.0.0.1:')
}

function redirectUri(request) {
  return (
    process.env.META_OAUTH_REDIRECT_URI ||
    originFromRequest(request)
  )
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string') return request.body ? JSON.parse(request.body) : {}

  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks).toString('utf8')
  return rawBody ? JSON.parse(rawBody) : {}
}

async function graphGet(path, params, token) {
  const config = await getActiveMetaConfig()
  const url = new URL(`https://graph.facebook.com/${config.version}/${path}`)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  if (token) {
    url.searchParams.set('access_token', token)
  }

  const response = await fetch(url)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || `Meta returned ${response.status}.`)
  }

  return data
}

async function exchangeCodeForUserToken(code, request, oauthRedirectUri) {
  const config = await getActiveMetaConfig()
  const shortLived = await graphGet('oauth/access_token', {
    client_id: config.appId,
    client_secret: config.appSecret,
    code,
    redirect_uri: oauthRedirectUri || redirectUri(request),
  })

  const longLived = await graphGet('oauth/access_token', {
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLived.access_token,
    grant_type: 'fb_exchange_token',
  }).catch(() => null)

  return longLived?.access_token ? longLived : shortLived
}

async function fetchConnectedPages(userAccessToken) {
  const result = await graphGet(
    'me/accounts',
    {
      fields:
        'id,name,access_token,instagram_business_account{id,name,username}',
      limit: 100,
    },
    userAccessToken,
  )

  return (result.data || []).map((page) => ({
    accessToken: page.access_token,
    id: page.id,
    instagramBusinessAccount: page.instagram_business_account
      ? {
          id: page.instagram_business_account.id,
          name: page.instagram_business_account.name || '',
          username: page.instagram_business_account.username || '',
        }
      : null,
    name: page.name,
  }))
}

async function statusResponse() {
  const config = await getActiveMetaConfig()
  const token = await inspectAccessToken(config.pageAccessToken)
  const facebookReady = Boolean(
    config.facebookPageId &&
      config.pageAccessToken &&
      token.isValid &&
      token.type === 'PAGE' &&
      token.missingScopes.length === 0,
  )
  const selectedPage = config.selectedPage
  const instagramAccount = selectedPage?.instagramBusinessAccount || null
  const instagramReady = Boolean(
    facebookReady && instagramAccount?.id && token.scopes.includes(INSTAGRAM_PUBLISH_SCOPE),
  )

  return {
    appConfigured: Boolean(config.appId && config.appSecret),
    connected: config.pages.length > 0,
    facebook: facebookReady,
    facebookStatus:
      config.facebookPageId && config.pageAccessToken
        ? facebookReady
          ? `Ready: ${config.pageName || config.facebookPageId}`
          : `Needs Page token with ${FACEBOOK_PUBLISH_SCOPE}`
        : 'Connect a Facebook Page',
    instagram: instagramReady,
    instagramStatus: instagramAccount?.id
      ? instagramReady
        ? `Ready: ${instagramAccount.username || instagramAccount.name || instagramAccount.id}`
        : `Needs ${INSTAGRAM_PUBLISH_SCOPE}`
      : 'No linked Instagram professional account',
    pages: config.pages.map(publicPage),
    selectedPageId: config.facebookPageId,
    tokenType: token.type,
    version: config.version,
  }
}

async function handleStart(request, response) {
  const config = await getActiveMetaConfig()
  const requestUrl = new URL(request.url || '', originFromRequest(request))
  const mode = requestUrl.searchParams.get('mode') === 'publish' ? 'publish' : 'basic'
  const oauthRedirectUri = redirectUri(request)

  if (!config.appId || !config.appSecret) {
    return sendJson(response, 500, {
      error: 'Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET before connecting Meta.',
    })
  }

  const state = await createPendingState({ mode, redirectUri: oauthRedirectUri })
  const url = new URL(`https://www.facebook.com/${config.version}/dialog/oauth`)
  url.searchParams.set('client_id', config.appId)
  url.searchParams.set('redirect_uri', oauthRedirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', oauthScopesForMode(mode).join(','))
  url.searchParams.set('state', state)

  return redirect(response, url.toString())
}

async function handleCallback(request, response) {
  const requestUrl = new URL(request.url || '', originFromRequest(request))
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const oauthRedirectUri = requestUrl.searchParams.get('redirect_uri')
  const error = requestUrl.searchParams.get('error_message')

  if (error) {
    response.statusCode = 400
    response.setHeader('Content-Type', 'text/html')
    response.end(`<p>Meta connection failed: ${error}</p>`)
    return
  }

  const pendingState = code && state ? await consumePendingState(state) : null
  const localStateFallback =
    !pendingState && code && state && isLocalRequest(request)
      ? { redirectUri: oauthRedirectUri || redirectUri(request) }
      : null

  if (!code || !state || (!pendingState && !localStateFallback)) {
    response.statusCode = 400
    response.setHeader('Content-Type', 'text/html')
    response.end('<p>Meta connection failed because the OAuth state was invalid.</p>')
    return
  }

  try {
    const userToken = await exchangeCodeForUserToken(
      code,
      request,
      oauthRedirectUri || pendingState?.redirectUri || localStateFallback?.redirectUri,
    )
    const pages = await fetchConnectedPages(userToken.access_token)
    const selectedPageId =
      process.env.FACEBOOK_PAGE_ID && pages.some((page) => page.id === process.env.FACEBOOK_PAGE_ID)
        ? process.env.FACEBOOK_PAGE_ID
        : pages[0]?.id || ''

    await saveOAuthConnection({
      pages,
      selectedPageId,
      userAccessToken: userToken.access_token,
      userTokenExpiresAt: userToken.expires_in
        ? new Date(Date.now() + userToken.expires_in * 1000).toISOString()
        : null,
    })

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html')
    response.end(`
      <!doctype html>
      <title>Meta connected</title>
      <main style="font-family: system-ui; padding: 2rem;">
        <h1>Meta connected</h1>
        <p>Connected ${pages.length} Page${pages.length === 1 ? '' : 's'}.</p>
        <p><a href="/?meta_connected=1">Return to the dashboard</a></p>
        <script>setTimeout(() => location.href = '/?meta_connected=1', 900)</script>
      </main>
    `)
  } catch (callbackError) {
    response.statusCode = 500
    response.setHeader('Content-Type', 'text/html')
    response.end(
      `<p>Meta connection failed: ${
        callbackError instanceof Error ? callbackError.message : 'Unknown error'
      }</p>`,
    )
  }
}

async function handleComplete(request, response) {
  const requestUrl = new URL(request.url || '', originFromRequest(request))
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const oauthRedirectUri = requestUrl.searchParams.get('redirect_uri')

  if (!code || !state) {
    return sendJson(response, 400, { error: 'Missing OAuth code or state.' })
  }

  const pendingState = await consumePendingState(state)
  const localStateFallback =
    !pendingState && isLocalRequest(request)
      ? { redirectUri: oauthRedirectUri || redirectUri(request) }
      : null

  if (!pendingState && !localStateFallback) {
    return sendJson(response, 400, { error: 'OAuth state is invalid or expired.' })
  }

  try {
    const userToken = await exchangeCodeForUserToken(
      code,
      request,
      oauthRedirectUri || pendingState?.redirectUri || localStateFallback?.redirectUri,
    )
    const pages = await fetchConnectedPages(userToken.access_token)
    const selectedPageId =
      process.env.FACEBOOK_PAGE_ID && pages.some((page) => page.id === process.env.FACEBOOK_PAGE_ID)
        ? process.env.FACEBOOK_PAGE_ID
        : pages[0]?.id || ''

    await saveOAuthConnection({
      pages,
      selectedPageId,
      userAccessToken: userToken.access_token,
      userTokenExpiresAt: userToken.expires_in
        ? new Date(Date.now() + userToken.expires_in * 1000).toISOString()
        : null,
    })

    return sendJson(response, 200, {
      ok: true,
      pages: pages.map(publicPage),
      selectedPageId,
    })
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Meta connection failed.',
    })
  }
}

async function handleSelectPage(request, response) {
  let body

  try {
    body = await readJsonBody(request)
    const page = await selectMetaPage(String(body.pageId || ''))
    return sendJson(response, 200, { ok: true, page: publicPage(page) })
  } catch (error) {
    return sendJson(response, 400, {
      error: error instanceof Error ? error.message : 'Could not select Page.',
    })
  }
}

export default async function handler(request, response) {
  const requestUrl = new URL(request.url || '', originFromRequest(request))
  const pathname = requestUrl.pathname

  if (request.method === 'GET' && pathname.endsWith('/auth/start')) {
    return handleStart(request, response)
  }

  if (request.method === 'GET' && pathname.endsWith('/auth/callback')) {
    return handleCallback(request, response)
  }

  if (request.method === 'GET' && pathname.endsWith('/auth/complete')) {
    return handleComplete(request, response)
  }

  if (request.method === 'GET' && pathname.endsWith('/auth/status')) {
    return sendJson(response, 200, await statusResponse())
  }

  if (request.method === 'POST' && pathname.endsWith('/pages/select')) {
    return handleSelectPage(request, response)
  }

  const connections = await readMetaConnections()

  return sendJson(response, 404, {
    connectedPages: (connections.pages || []).map(publicPage),
    error: 'Meta auth route not found.',
  })
}
