import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  abortCarouselPost,
  completeCarouselPost,
  reserveCarouselPost,
} from './meta-carousel-history.mjs'

function parseEnv(contents) {
  const env = {}

  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, value] = match
    let parsed = value.trim()
    if (
      (parsed.startsWith('"') && parsed.endsWith('"')) ||
      (parsed.startsWith("'") && parsed.endsWith("'"))
    ) {
      parsed = parsed.slice(1, -1)
    }
    env[key] = parsed
  }

  return env
}

async function loadDashboardEnv(root) {
  const envPath = path.join(root, 'acquisition-dashboard/.env.local')
  const raw = await fs.readFile(envPath, 'utf8')
  const loaded = parseEnv(raw)

  for (const [key, value] of Object.entries(loaded)) {
    if (!(key in process.env)) process.env[key] = value
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || `Request failed with ${response.status}`)
  }

  return data
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function verifyImageUrl(url) {
  const response = await fetch(url, { method: 'GET' })
  const contentType = response.headers.get('content-type') || ''

  if (!response.ok) {
    throw new Error(`URL failed ${response.status}: ${url}`)
  }

  if (!contentType.startsWith('image/')) {
    throw new Error(`URL is not an image (${contentType}): ${url}`)
  }

  return { contentType, ok: true, status: response.status, url }
}

async function getMetaHelpers(root) {
  const modulePath = path.join(root, 'acquisition-dashboard/api/meta-store.js')
  return import(modulePath)
}

async function createAuthParams(metaStore, config, params = new URLSearchParams()) {
  params.set('access_token', config.pageAccessToken)

  if (config.appSecretProof) {
    params.set('appsecret_proof', config.appSecretProof)
  } else if (config.appSecret && config.pageAccessToken) {
    params.set(
      'appsecret_proof',
      crypto.createHmac('sha256', config.appSecret).update(config.pageAccessToken).digest('hex'),
    )
  }

  return params
}

async function postGraph(config, pathName, params) {
  const body =
    params instanceof URLSearchParams || params instanceof FormData
      ? params
      : new URLSearchParams(params)

  await createAuthParams(null, config, body)

  return fetchJson(`https://graph.facebook.com/${config.version}/${pathName}`, {
    body,
    method: 'POST',
  })
}

async function getGraph(config, pathName, params = {}) {
  const query = new URLSearchParams(params)
  await createAuthParams(null, config, query)
  return fetchJson(`https://graph.facebook.com/${config.version}/${pathName}?${query.toString()}`, {
    method: 'GET',
  })
}

async function waitForContainer(config, containerId, label) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const status = await getGraph(config, containerId, { fields: 'status_code,status' })

    if (status.status_code === 'FINISHED') return status
    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(`${label} failed: ${status.status || status.status_code}`)
    }

    await wait(2500)
  }

  throw new Error(`${label} is still processing after 60 seconds`)
}

async function publishInstagramCarousel(config, manifest, slideUrls) {
  const children = []

  for (const [index, imageUrl] of slideUrls.entries()) {
    const child = await postGraph(config, `${config.instagramBusinessAccountId}/media`, {
      image_url: imageUrl,
      is_carousel_item: 'true',
    })
    await waitForContainer(config, child.id, `Instagram child ${index + 1}`)
    children.push(child.id)
  }

  const parent = await postGraph(config, `${config.instagramBusinessAccountId}/media`, {
    caption: manifest.captionInstagram || manifest.caption || '',
    children: children.join(','),
    media_type: 'CAROUSEL',
  })

  await waitForContainer(config, parent.id, 'Instagram carousel parent')

  const published = await postGraph(config, `${config.instagramBusinessAccountId}/media_publish`, {
    creation_id: parent.id,
  })

  const details = await getGraph(config, published.id, { fields: 'id,permalink' }).catch(() => ({
    id: published.id,
    permalink: null,
  }))

  return {
    channel: 'instagram',
    childCreationIds: children,
    creationId: parent.id,
    id: details.id || published.id,
    permalink: details.permalink || null,
  }
}

async function publishFacebookCarousel(config, manifest, slideUrls) {
  const photoIds = []

  for (const imageUrl of slideUrls) {
    const photo = await postGraph(config, `${config.facebookPageId}/photos`, {
      published: 'false',
      url: imageUrl,
    })
    photoIds.push(photo.id)
  }

  const params = new URLSearchParams()
  params.set('message', manifest.captionFacebook || manifest.caption || '')
  photoIds.forEach((id, index) => {
    params.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: id }))
  })

  const published = await postGraph(config, `${config.facebookPageId}/feed`, params)
  const details = await getGraph(config, published.id, { fields: 'id,permalink_url' }).catch(() => ({
    id: published.id,
    permalink_url: null,
  }))

  return {
    channel: 'facebook',
    attachedPhotoIds: photoIds,
    id: details.id || published.id,
    permalink: details.permalink_url || null,
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

function usage() {
  console.error(
    'Usage: node scripts/publish-meta-carousel-run.mjs [--channels instagram|facebook|instagram,facebook] <carousel-dir> [more carousel dirs...]',
  )
  process.exit(1)
}

function parseArgs(argv) {
  const channels = []
  const carouselDirs = []

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--channels') {
      const next = argv[index + 1]
      if (!next) {
        throw new Error('Missing value for --channels')
      }
      channels.push(...next.split(',').map((item) => item.trim()).filter(Boolean))
      index += 1
      continue
    }

    carouselDirs.push(value)
  }

  const selectedChannels = channels.length > 0 ? Array.from(new Set(channels)) : ['instagram', 'facebook']
  const validChannels = new Set(['instagram', 'facebook'])

  for (const channel of selectedChannels) {
    if (!validChannels.has(channel)) {
      throw new Error(`Unsupported channel: ${channel}`)
    }
  }

  return { carouselDirs, selectedChannels }
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
await loadDashboardEnv(root)
process.env.META_CONNECTIONS_FILE =
  process.env.META_CONNECTIONS_FILE ||
  path.join(root, 'acquisition-dashboard/.meta-social-connections.json')

const metaStore = await getMetaHelpers(root)
const config = await metaStore.getActiveMetaConfig()
const token = await metaStore.inspectAccessToken(config.pageAccessToken)

const facebookReady = Boolean(
  config.facebookPageId &&
    config.pageAccessToken &&
    token.isValid &&
    token.type === 'PAGE' &&
    token.missingScopes.length === 0,
)
const instagramReady = Boolean(
  facebookReady &&
    config.instagramBusinessAccountId &&
    token.scopes.includes(metaStore.INSTAGRAM_PUBLISH_SCOPE),
)

const { carouselDirs, selectedChannels } = parseArgs(process.argv.slice(2))

if (
  (selectedChannels.includes('facebook') && !facebookReady) ||
  (selectedChannels.includes('instagram') && !instagramReady)
) {
  throw new Error(
    `Meta credentials are not ready for selected channels. Facebook ready: ${facebookReady}. Instagram ready: ${instagramReady}. Selected: ${selectedChannels.join(', ')}.`,
  )
}

if (carouselDirs.length === 0) usage()

const baseUrl = 'https://www.emc2ops.com/social-assets/carousel'
const summary = []
const historyPath = path.join(root, '.meta-carousel-post-history.json')

for (const providedDir of carouselDirs) {
  const carouselDir = path.resolve(providedDir)
  const manifestPath = path.join(carouselDir, 'manifest.json')
  const manifest = await readJson(manifestPath)
  const directory = manifest.directory || path.basename(carouselDir)
  const slideUrls = manifest.slides.map((_, index) => `${baseUrl}/${directory}/slide-${index + 1}.png`)
  let releaseReservation
  const reservationEntry = {
    date: manifest.date,
    hook: manifest.hook,
    slot: manifest.slot || '',
    slideUrls,
    topic: manifest.topic,
  }

  try {
    releaseReservation = await reserveCarouselPost(historyPath, reservationEntry)
  } catch (error) {
    summary.push({
      directory,
      skipped: true,
      reason: error.message,
    })
    continue
  }

  try {
    const verifiedSlides = []
    for (const url of slideUrls) {
      verifiedSlides.push(await verifyImageUrl(url))
    }

    if (selectedChannels.includes('instagram') && !instagramReady) {
      throw new Error('Instagram publishing is not ready for the selected channels.')
    }

    if (selectedChannels.includes('facebook') && !facebookReady) {
      throw new Error('Facebook publishing is not ready for the selected channels.')
    }

    const instagram = selectedChannels.includes('instagram')
      ? await publishInstagramCarousel(config, manifest, slideUrls)
      : null
    const facebook = selectedChannels.includes('facebook')
      ? await publishFacebookCarousel(config, manifest, slideUrls)
      : null

    const postRecord = {
      captions: {
        facebook: manifest.captionFacebook || manifest.caption || '',
        instagram: manifest.captionInstagram || manifest.caption || '',
      },
      channels: selectedChannels,
      date: manifest.date,
      facebook,
      hook: manifest.hook,
      instagram,
      publishSelection: {
        facebookSelected: selectedChannels.includes('facebook'),
        instagramSelected: selectedChannels.includes('instagram'),
      },
      slot: manifest.slot || '',
      slideDirectory: carouselDir,
      slideUrls,
      topic: manifest.topic,
      verifiedSlides,
    }

    await writeJson(path.join(carouselDir, 'post.json'), postRecord)
    await completeCarouselPost(historyPath, {
      caption: manifest.captionInstagram || manifest.caption || '',
      captions: {
        facebook: manifest.captionFacebook || manifest.caption || '',
        instagram: manifest.captionInstagram || manifest.caption || '',
      },
      channels: selectedChannels,
      date: manifest.date,
      hook: manifest.hook,
      postIds: {
        facebook: facebook?.id || null,
        instagram: instagram?.id || null,
      },
      postUrls: {
        facebook: facebook?.permalink || null,
        instagram: instagram?.permalink || null,
      },
      publishSelection: {
        facebookSelected: selectedChannels.includes('facebook'),
        instagramSelected: selectedChannels.includes('instagram'),
      },
      slideDirectory: carouselDir,
      slideUrls,
      slot: manifest.slot || '',
      topic: manifest.topic,
    })

    summary.push(postRecord)
  } catch (error) {
    await abortCarouselPost(historyPath, reservationEntry)
    throw error
  } finally {
    await releaseReservation()
  }
}

console.log(JSON.stringify(summary, null, 2))
