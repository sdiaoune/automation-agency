import crypto from 'node:crypto'
import { Readable } from 'node:stream'
import {
  FACEBOOK_PUBLISH_SCOPE,
  getActiveMetaConfig,
  INSTAGRAM_PUBLISH_SCOPE,
  inspectAccessToken,
} from './meta-store.js'
import { getActiveXConfig, saveXOAuthConnection } from './x-store.js'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function clean(value, maxLength = 2000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

async function readBody(request) {
  const contentType =
    request.headers['content-type'] || request.headers.get?.('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const webRequest = new Request('http://localhost/api/social-post', {
      body: Readable.toWeb(request),
      duplex: 'half',
      headers: request.headers,
      method: request.method,
    })
    const formData = await webRequest.formData()

    return {
      campaign: formData.get('campaign'),
      caption: formData.get('caption'),
      channels: JSON.parse(String(formData.get('channels') || '[]')),
      linkUrl: formData.get('linkUrl'),
      mediaFile: formData.get('mediaFile'),
      mediaUrl: formData.get('mediaUrl'),
      postType: formData.get('postType'),
    }
  }

  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string') return request.body ? JSON.parse(request.body) : {}

  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks).toString('utf8')
  return rawBody ? JSON.parse(rawBody) : {}
}

async function configuredResponse() {
  const config = await getActiveMetaConfig()
  const xConfig = await getActiveXConfig()
  const token = await inspectAccessToken(config.pageAccessToken)
  const facebookReady = Boolean(
    config.facebookPageId &&
      config.pageAccessToken &&
      token.isValid &&
      token.type === 'PAGE' &&
      token.missingScopes.length === 0,
  )

  return {
    configured: {
      facebook: facebookReady,
      facebookStatus:
        config.facebookPageId && config.pageAccessToken
          ? facebookReady
            ? `Ready: ${config.pageName || config.facebookPageId}`
            : `Needs Page token with ${FACEBOOK_PUBLISH_SCOPE}`
          : 'Connect a Facebook Page',
      instagram: Boolean(
        facebookReady &&
          config.instagramBusinessAccountId &&
          token.scopes.includes(INSTAGRAM_PUBLISH_SCOPE),
      ),
      instagramStatus: config.instagramBusinessAccountId
        ? token.scopes.includes(INSTAGRAM_PUBLISH_SCOPE)
          ? 'Ready'
          : `Needs ${INSTAGRAM_PUBLISH_SCOPE}`
        : 'No linked Instagram professional account',
      tokenType: token.type,
      version: config.version,
      x: Boolean(xConfig.oauth2Ready || xConfig.envOAuth1Ready),
      xStatus: xConfig.oauth2Ready
        ? `Ready: @${xConfig.user?.username || 'connected'}`
        : xConfig.envOAuth1Ready
          ? 'Ready with user access token'
          : 'Connect X or add user tokens',
    },
  }
}

async function addAuthParams(params) {
  const config = await getActiveMetaConfig()
  params.set('access_token', config.pageAccessToken)

  if (config.appSecretProof) {
    params.set('appsecret_proof', config.appSecretProof)
  }
}

async function postGraph(path, params) {
  const config = await getActiveMetaConfig()
  const body = new URLSearchParams(params)
  await addAuthParams(body)

  const response = await fetch(
    `https://graph.facebook.com/${config.version}/${path}`,
    {
      body,
      method: 'POST',
    },
  )
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Graph API returned ${response.status}.`,
    )
  }

  return data
}

async function postGraphForm(path, formData) {
  const config = await getActiveMetaConfig()
  await addAuthParams(formData)

  const response = await fetch(
    `https://graph.facebook.com/${config.version}/${path}`,
    {
      body: formData,
      method: 'POST',
    },
  )
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Graph API returned ${response.status}.`,
    )
  }

  return data
}

async function publishFacebookPost(payload) {
  const config = await getActiveMetaConfig()
  if (!config.facebookPageId || !config.pageAccessToken) {
    throw new Error('Facebook Page publishing is not configured.')
  }

  const params = {
    message: payload.caption,
  }

  if (payload.postType === 'link' && payload.linkUrl) {
    params.link = payload.linkUrl
  }

  if (payload.mediaFile) {
    if (!payload.mediaFile.type?.startsWith('image/')) {
      throw new Error('Upload a PNG, JPEG, WebP, or GIF image.')
    }

    if (payload.mediaFile.size > MAX_IMAGE_BYTES) {
      throw new Error('Upload an image smaller than 8 MB.')
    }

    const imageBuffer = Buffer.from(await payload.mediaFile.arrayBuffer())
    const formData = new FormData()
    formData.set('caption', payload.caption)
    formData.set(
      'source',
      new Blob([imageBuffer], {
        type: payload.mediaFile.type || 'application/octet-stream',
      }),
      payload.mediaFile.name || 'social-post-image',
    )

    const data = await postGraphForm(`${config.facebookPageId}/photos`, formData)
    return { channel: 'facebook', id: data.id || data.post_id, ok: true }
  }

  if (payload.mediaUrl && payload.postType === 'photo') {
    const data = await postGraph(`${config.facebookPageId}/photos`, {
      caption: payload.caption,
      url: payload.mediaUrl,
    })
    return { channel: 'facebook', id: data.id || data.post_id, ok: true }
  }

  const data = await postGraph(`${config.facebookPageId}/feed`, params)
  return { channel: 'facebook', id: data.id, ok: true }
}

async function publishInstagramPost(payload) {
  const config = await getActiveMetaConfig()
  if (!config.instagramBusinessAccountId || !config.pageAccessToken) {
    throw new Error('Instagram publishing is not configured.')
  }

  if (!payload.mediaUrl) {
    throw new Error('Instagram publishing requires a public media URL.')
  }

  const containerParams = {
    caption: payload.caption,
  }

  if (payload.postType === 'video' || payload.postType === 'reel') {
    containerParams.media_type = payload.postType === 'reel' ? 'REELS' : 'VIDEO'
    containerParams.video_url = payload.mediaUrl
  } else {
    containerParams.image_url = payload.mediaUrl
  }

  const container = await postGraph(
    `${config.instagramBusinessAccountId}/media`,
    containerParams,
  )
  const published = await postGraph(
    `${config.instagramBusinessAccountId}/media_publish`,
    {
      creation_id: container.id,
    },
  )

  return { channel: 'instagram', id: published.id, ok: true }
}

function encodeOAuthValue(value) {
  return encodeURIComponent(value)
    .replaceAll('!', '%21')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('*', '%2A')
}

function oauth1Header({
  accessToken,
  accessTokenSecret,
  consumerKey,
  consumerSecret,
  method,
  url,
}) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }
  const parameterString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeOAuthValue(key)}=${encodeOAuthValue(value)}`)
    .join('&')
  const signatureBase = [
    method.toUpperCase(),
    encodeOAuthValue(url),
    encodeOAuthValue(parameterString),
  ].join('&')
  const signingKey = `${encodeOAuthValue(consumerSecret)}&${encodeOAuthValue(accessTokenSecret)}`
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64')

  return `OAuth ${Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeOAuthValue(key)}="${encodeOAuthValue(value)}"`)
    .join(', ')}`
}

async function refreshXOAuth2Token(config) {
  if (!config.connections.refreshToken || !config.clientId) return null

  const body = new URLSearchParams({
    client_id: config.clientId,
    grant_type: 'refresh_token',
    refresh_token: config.connections.refreshToken,
  })
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (config.clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString('base64')}`
  }

  const response = await fetch('https://api.x.com/2/oauth2/token', {
    body,
    headers,
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || 'Could not refresh X connection.')
  }

  await saveXOAuthConnection(data)
  return data.access_token
}

function xTextFromPayload(payload) {
  const text = payload.postType === 'link' && payload.linkUrl
    ? `${payload.caption}\n\n${payload.linkUrl}`
    : payload.caption

  if (text.length > 280) {
    throw new Error('X posts must be 280 characters or fewer.')
  }

  return text
}

async function publishXPost(payload) {
  const config = await getActiveXConfig()
  const url = 'https://api.x.com/2/tweets'
  const headers = {
    'Content-Type': 'application/json',
  }

  if (config.oauth2Ready) {
    headers.Authorization = `Bearer ${config.connections.accessToken}`
  } else if (config.oauth2Connected && config.oauth2Expired) {
    const accessToken = await refreshXOAuth2Token(config)
    headers.Authorization = `Bearer ${accessToken}`
  } else if (config.envOAuth1Ready) {
    headers.Authorization = oauth1Header({
      accessToken: config.accessToken,
      accessTokenSecret: config.accessTokenSecret,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      method: 'POST',
      url,
    })
  } else {
    throw new Error('X publishing is not configured.')
  }

  const response = await fetch(url, {
    body: JSON.stringify({ text: xTextFromPayload(payload) }),
    headers,
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.detail || data?.title || data?.error || `X returned ${response.status}.`)
  }

  return { channel: 'x', id: data.data?.id, ok: true }
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    return sendJson(response, 200, await configuredResponse())
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  let body
  try {
    body = await readBody(request)
  } catch {
    return sendJson(response, 400, { error: 'Invalid JSON payload.' })
  }

  const channels = Array.isArray(body.channels)
    ? body.channels.filter((channel) =>
        ['facebook', 'instagram', 'x'].includes(channel),
      )
    : []
  const payload = {
    campaign: clean(body.campaign, 160),
    caption: clean(body.caption, 2200),
    channels,
    linkUrl: clean(body.linkUrl, 500),
    mediaFile:
      body.mediaFile && typeof body.mediaFile === 'object' && body.mediaFile.size
        ? body.mediaFile
        : null,
    mediaUrl: clean(body.mediaUrl, 500),
    postType: clean(body.postType, 20) || 'text',
  }

  if (!payload.caption) {
    return sendJson(response, 400, { error: 'Post copy is required.' })
  }

  if (payload.channels.length === 0) {
    return sendJson(response, 400, { error: 'Choose at least one channel.' })
  }

  try {
    const results = []

    if (payload.channels.includes('facebook')) {
      results.push(await publishFacebookPost(payload))
    }

    if (payload.channels.includes('instagram')) {
      results.push(await publishInstagramPost(payload))
    }

    if (payload.channels.includes('x')) {
      results.push(await publishXPost(payload))
    }

    return sendJson(response, 200, { ok: true, results })
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Could not publish post.',
    })
  }
}
