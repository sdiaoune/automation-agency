import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getActiveMetaConfig,
  inspectAccessToken,
  readMetaConnections,
  writeMetaConnections,
} from '../acquisition-dashboard/api/meta-store.js'
import {
  abortCarouselPost,
  completeCarouselPost,
  reserveCarouselPost,
} from './meta-carousel-history.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const historyPath = path.join(root, '.meta-carousel-post-history.json')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadConfig(configPath) {
  const raw = await fs.readFile(configPath, 'utf8')
  return JSON.parse(raw)
}

async function saveConnectionsWithFreshPageToken() {
  const connections = await readMetaConnections()

  if (!connections.userAccessToken) {
    throw new Error('Meta user access token is missing.')
  }

  const config = await getActiveMetaConfig()
  const url = new URL(`https://graph.facebook.com/${config.version}/me/accounts`)
  url.searchParams.set('fields', 'id,name,access_token,instagram_business_account{id,name,username}')
  url.searchParams.set('limit', '100')
  url.searchParams.set('access_token', connections.userAccessToken)

  const response = await fetch(url)
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json?.error?.message || `Meta me/accounts returned ${response.status}.`)
  }

  const pages = (json.data || []).map((page) => ({
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

  await writeMetaConnections({
    ...connections,
    pages,
    pendingStates: [],
    selectedPageId: connections.selectedPageId || pages[0]?.id || '',
  })
}

async function ensureMetaReady() {
  let config = await getActiveMetaConfig()
  let token = await inspectAccessToken(config.pageAccessToken)

  if (!token.isValid || token.type !== 'PAGE') {
    await saveConnectionsWithFreshPageToken()
    config = await getActiveMetaConfig()
    token = await inspectAccessToken(config.pageAccessToken)
  }

  const facebookReady = Boolean(
    config.facebookPageId &&
      config.pageAccessToken &&
      token.isValid &&
      token.type === 'PAGE' &&
      token.scopes.includes('pages_manage_posts'),
  )
  const instagramReady = Boolean(
    facebookReady &&
      config.instagramBusinessAccountId &&
      token.scopes.includes('instagram_content_publish'),
  )

  return {
    config,
    facebookReady,
    instagramReady,
    token,
  }
}

async function withAuthParams(params) {
  const config = await getActiveMetaConfig()
  params.set('access_token', config.pageAccessToken)

  if (config.appSecretProof) {
    params.set('appsecret_proof', config.appSecretProof)
  }
}

async function graphPost(pathname, params) {
  const config = await getActiveMetaConfig()
  const body = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      body.set(key, String(value))
    }
  }

  await withAuthParams(body)

  const response = await fetch(`https://graph.facebook.com/${config.version}/${pathname}`, {
    body,
    method: 'POST',
  })
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json?.error?.message || `Meta POST ${pathname} returned ${response.status}.`)
  }

  return json
}

async function graphGet(pathname, params = {}) {
  const config = await getActiveMetaConfig()
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }

  await withAuthParams(query)

  const response = await fetch(`https://graph.facebook.com/${config.version}/${pathname}?${query}`)
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json?.error?.message || `Meta GET ${pathname} returned ${response.status}.`)
  }

  return json
}

async function verifyImageUrl(url) {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const response = await fetch(url, { method: 'GET' }).catch(() => null)
    const type = response?.headers?.get('content-type') || ''

    if (response?.ok && type.startsWith('image/')) {
      return true
    }

    await sleep(4000)
  }

  throw new Error(`Slide URL did not become available as an image: ${url}`)
}

async function waitForInstagramContainer(containerId) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const status = await graphGet(containerId, { fields: 'status,status_code' })

    if (status.status_code === 'FINISHED') {
      return status
    }

    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(status.status || `Instagram container ${containerId} failed.`)
    }

    await sleep(5000)
  }

  throw new Error(`Instagram container ${containerId} did not finish in time.`)
}

async function publishInstagramCarousel(slideUrls, caption) {
  const config = await getActiveMetaConfig()
  const children = []

  for (const imageUrl of slideUrls) {
    const child = await graphPost(`${config.instagramBusinessAccountId}/media`, {
      image_url: imageUrl,
      is_carousel_item: 'true',
    })
    await waitForInstagramContainer(child.id)
    children.push(child.id)
  }

  const parent = await graphPost(`${config.instagramBusinessAccountId}/media`, {
    caption,
    children: children.join(','),
    media_type: 'CAROUSEL',
  })
  await waitForInstagramContainer(parent.id)

  const published = await graphPost(`${config.instagramBusinessAccountId}/media_publish`, {
    creation_id: parent.id,
  })

  return {
    childContainerIds: children,
    containerId: parent.id,
    postId: published.id,
  }
}

async function publishFacebookCarousel(slideUrls, caption) {
  const config = await getActiveMetaConfig()
  const mediaIds = []

  for (const imageUrl of slideUrls) {
    const media = await graphPost(`${config.facebookPageId}/photos`, {
      published: 'false',
      url: imageUrl,
    })
    mediaIds.push(media.id)
  }

  const attached = {}
  for (const [index, mediaId] of mediaIds.entries()) {
    attached[`attached_media[${index}]`] = JSON.stringify({ media_fbid: mediaId })
  }

  const published = await graphPost(`${config.facebookPageId}/feed`, {
    message: caption,
    ...attached,
  })

  const [, postId] = String(published.id || '').split('_')

  return {
    mediaIds,
    postId: published.id,
    postUrl: postId ? `https://www.facebook.com/${config.facebookPageId}/posts/${postId}` : '',
  }
}

const configPath = process.argv[2]

if (!configPath) {
  throw new Error('Usage: node scripts/post-meta-carousel.mjs <config.json>')
}

const run = await loadConfig(path.resolve(configPath))
let releaseReservation
const reservationEntry = {
  date: run.date,
  hook: run.hook,
  slot: run.slot,
  slideUrls: run.slideUrls,
  topic: run.topic,
}

try {
  releaseReservation = await reserveCarouselPost(historyPath, reservationEntry)
} catch (error) {
  console.error(error.message)
  process.exit(0)
}

try {
const metaState = await ensureMetaReady()

if (!metaState.facebookReady || !metaState.instagramReady) {
  throw new Error(
    JSON.stringify(
      {
        facebookReady: metaState.facebookReady,
        instagramReady: metaState.instagramReady,
        tokenType: metaState.token.type,
        tokenValid: metaState.token.isValid,
        scopes: metaState.token.scopes,
      },
      null,
      2,
    ),
  )
}

for (const url of run.slideUrls) {
  await verifyImageUrl(url)
}

const instagram = await publishInstagramCarousel(run.slideUrls, run.captions.instagram)
const facebook = await publishFacebookCarousel(run.slideUrls, run.captions.facebook)

const historyEntry = {
  caption: run.captions.instagram,
  channels: ['instagram', 'facebook'],
  createdAt: new Date().toISOString(),
  date: run.date,
  facebookCaption: run.captions.facebook,
  facebookPostId: facebook.postId,
  facebookPostUrl: facebook.postUrl,
  hook: run.hook,
  instagramPostId: instagram.postId,
  slot: run.slot,
  slideUrls: run.slideUrls,
  topic: run.topic,
}

await completeCarouselPost(historyPath, historyEntry)

console.log(JSON.stringify({ facebook, historyPath, instagram, topic: run.topic }, null, 2))
} catch (error) {
  await abortCarouselPost(historyPath, reservationEntry)
  throw error
} finally {
  await releaseReservation()
}
