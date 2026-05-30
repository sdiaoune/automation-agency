import crypto from 'node:crypto'
import {
  consumeXPendingState,
  createXPendingState,
  getActiveXConfig,
  saveXOAuthConnection,
  X_TWEET_SCOPES,
} from './x-store.js'

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
  return process.env.X_OAUTH_REDIRECT_URI || `${originFromRequest(request)}/auth/callback`
}

function codeVerifier() {
  return crypto.randomBytes(48).toString('base64url')
}

function codeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

function tokenAuthHeader(config) {
  if (!config.clientSecret) return null

  return `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
}

async function readJson(response) {
  return response.json().catch(() => ({}))
}

async function exchangeCodeForToken(code, pendingState, request) {
  const config = await getActiveXConfig()
  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: pendingState.codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: pendingState.redirectUri || redirectUri(request),
  })
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const authHeader = tokenAuthHeader(config)

  if (authHeader) {
    headers.Authorization = authHeader
  }

  const response = await fetch('https://api.x.com/2/oauth2/token', {
    body,
    headers,
    method: 'POST',
  })
  const data = await readJson(response)

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || `X returned ${response.status}.`)
  }

  return data
}

async function fetchXUser(accessToken) {
  const response = await fetch('https://api.x.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const data = await readJson(response)

  if (!response.ok) return null

  return data.data || null
}

async function statusResponse() {
  const config = await getActiveXConfig()
  const oauth2User =
    config.oauth2Ready && !config.user
      ? await fetchXUser(config.connections.accessToken).catch(() => null)
      : config.user

  return {
    appConfigured: Boolean(config.clientId),
    connected: Boolean(config.oauth2Ready || config.envOAuth1Ready),
    oauth1: config.envOAuth1Ready,
    oauth2: config.oauth2Ready,
    status: config.oauth2Ready
      ? `Ready: @${oauth2User?.username || config.user?.username || 'connected'}`
      : config.envOAuth1Ready
        ? 'Ready with user access token'
        : 'Connect X or add user tokens',
    user: oauth2User || config.user || null,
  }
}

async function handleStart(request, response) {
  const config = await getActiveXConfig()

  if (!config.clientId) {
    return sendJson(response, 500, {
      error: 'Add X_CLIENT_ID before connecting X.',
    })
  }

  const verifier = codeVerifier()
  const challenge = codeChallenge(verifier)
  const callbackUri = redirectUri(request)
  const state = await createXPendingState({
    codeChallenge: challenge,
    codeVerifier: verifier,
    redirectUri: callbackUri,
  })
  const url = new URL('https://x.com/i/oauth2/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', callbackUri)
  url.searchParams.set('scope', X_TWEET_SCOPES.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return redirect(response, url.toString())
}

async function handleCallback(request, response) {
  const requestUrl = new URL(request.url || '', originFromRequest(request))
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error_description') || requestUrl.searchParams.get('error')

  if (error) {
    response.statusCode = 400
    response.setHeader('Content-Type', 'text/html')
    response.end(`<p>X connection failed: ${error}</p>`)
    return
  }

  const pendingState = code && state ? await consumeXPendingState(state) : null
  const localStateFallback =
    !pendingState && code && state && isLocalRequest(request)
      ? { codeVerifier: null, redirectUri: redirectUri(request) }
      : null

  if (!code || !state || (!pendingState && !localStateFallback)) {
    response.statusCode = 400
    response.setHeader('Content-Type', 'text/html')
    response.end('<p>X connection failed because the OAuth state was invalid.</p>')
    return
  }

  if (!pendingState?.codeVerifier) {
    response.statusCode = 400
    response.setHeader('Content-Type', 'text/html')
    response.end('<p>X connection failed because the OAuth verifier was missing.</p>')
    return
  }

  try {
    const tokenPayload = await exchangeCodeForToken(code, pendingState, request)
    const user = await fetchXUser(tokenPayload.access_token)
    await saveXOAuthConnection(tokenPayload, user)

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html')
    response.end(`
      <!doctype html>
      <title>X connected</title>
      <main style="font-family: system-ui; padding: 2rem;">
        <h1>X connected</h1>
        <p>${user?.username ? `Connected @${user.username}.` : 'Your X account is connected.'}</p>
        <p><a href="/?x_connected=1">Return to the dashboard</a></p>
        <script>setTimeout(() => location.href = '/?x_connected=1', 900)</script>
      </main>
    `)
  } catch (callbackError) {
    response.statusCode = 500
    response.setHeader('Content-Type', 'text/html')
    response.end(
      `<p>X connection failed: ${
        callbackError instanceof Error ? callbackError.message : 'Unknown error'
      }</p>`,
    )
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

  if (request.method === 'GET' && pathname.endsWith('/auth/status')) {
    return sendJson(response, 200, await statusResponse())
  }

  return sendJson(response, 404, { error: 'X auth route not found.' })
}
