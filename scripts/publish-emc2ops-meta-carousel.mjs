import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  abortCarouselPost,
  completeCarouselPost,
  reserveCarouselPost,
} from './meta-carousel-history.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dashboardRoot = path.join(root, 'acquisition-dashboard')
const args = process.argv.slice(2)
const manifestArg = args.find((value) => !value.startsWith('--'))
const instagramOnly = args.includes('--instagram-only')
const manifestPath =
  manifestArg ||
  path.join(
    root,
    'public/social-assets/carousel/2026-06-05-morning-first-workflow-scorecard/manifest.json',
  )
const historyPath = path.join(root, '.meta-carousel-post-history.json')
const siteUrl = 'https://www.emc2ops.com'

async function loadEnvFile(envPath) {
  const raw = await fs.readFile(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback
    throw error
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createMetaClient() {
  await loadEnvFile(path.join(dashboardRoot, '.env.local'))
  process.env.META_CONNECTIONS_FILE = path.join(
    dashboardRoot,
    '.meta-social-connections.json',
  )
  const metaStore = await import(path.join(dashboardRoot, 'api/meta-store.js'))
  const config = await metaStore.getActiveMetaConfig()
  const token = await metaStore.inspectAccessToken(config.pageAccessToken)

  const ready = Boolean(
    config.facebookPageId &&
      config.instagramBusinessAccountId &&
      token.isValid &&
      token.type === 'PAGE' &&
      token.scopes.includes('pages_manage_posts') &&
      token.scopes.includes('instagram_content_publish'),
  )

  if (!ready) {
    throw new Error(
      `Meta credentials not ready. Facebook page: ${config.facebookPageId || 'missing'}, Instagram account: ${
        config.instagramBusinessAccountId || 'missing'
      }, token valid: ${token.isValid}, token type: ${token.type || 'missing'}, scopes: ${
        token.scopes.join(', ') || 'none'
      }`,
    )
  }

  async function addAuthParams(params) {
    params.set('access_token', config.pageAccessToken)

    if (config.appSecretProof) {
      params.set('appsecret_proof', config.appSecretProof)
    }
  }

  async function postGraph(graphPath, params) {
    const body = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        body.set(key, String(value))
      }
    }
    await addAuthParams(body)

    const response = await fetch(
      `https://graph.facebook.com/${config.version}/${graphPath}`,
      { method: 'POST', body },
    )
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.error?.message || `Graph API returned ${response.status}.`)
    }

    return data
  }

  async function getGraph(graphPath, params = {}) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value))
      }
    }
    await addAuthParams(query)

    const response = await fetch(
      `https://graph.facebook.com/${config.version}/${graphPath}?${query.toString()}`,
    )
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.error?.message || `Graph API returned ${response.status}.`)
    }

    return data
  }

  return { config, getGraph, postGraph, token }
}

async function waitForInstagramContainer(client, containerId) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const status = await client.getGraph(containerId, {
      fields: 'status_code,status',
    })

    if (status.status_code === 'FINISHED') return status
    if (status.status_code === 'ERROR') {
      throw new Error(status.status || 'Instagram media processing failed.')
    }

    await wait(2500)
  }

  throw new Error(`Instagram container ${containerId} did not finish processing in time.`)
}

async function verifyLiveUrls(slideUrls) {
  for (const slideUrl of slideUrls) {
    const response = await fetch(slideUrl, { redirect: 'follow' })
    if (!response.ok) {
      throw new Error(`Slide URL failed verification: ${slideUrl} returned ${response.status}.`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      throw new Error(
        `Slide URL failed content-type verification: ${slideUrl} returned ${contentType || 'missing'}.`,
      )
    }
  }
}

async function publishInstagramCarousel(client, manifest, slideUrls) {
  const childIds = []

  for (const slideUrl of slideUrls) {
    const child = await client.postGraph(`${client.config.instagramBusinessAccountId}/media`, {
      image_url: slideUrl,
      is_carousel_item: 'true',
    })
    await waitForInstagramContainer(client, child.id)
    childIds.push(child.id)
  }

  const parent = await client.postGraph(`${client.config.instagramBusinessAccountId}/media`, {
    caption: manifest.captionInstagram,
    children: childIds.join(','),
    media_type: 'CAROUSEL',
  })
  await waitForInstagramContainer(client, parent.id)

  const published = await client.postGraph(
    `${client.config.instagramBusinessAccountId}/media_publish`,
    { creation_id: parent.id },
  )

  const details = await client
    .getGraph(published.id, { fields: 'id,permalink' })
    .catch(() => ({ id: published.id }))

  return {
    childIds,
    creationId: parent.id,
    postId: published.id,
    permalink: details.permalink || null,
  }
}

async function publishFacebookMultiPhoto(client, manifest, slideUrls) {
  try {
    const media = []

    for (const slideUrl of slideUrls) {
      const upload = await client.postGraph(`${client.config.facebookPageId}/photos`, {
        published: 'false',
        url: slideUrl,
      })
      media.push(upload.id)
    }

    const params = { message: manifest.captionFacebook }
    for (const [index, mediaId] of media.entries()) {
      params[`attached_media[${index}]`] = JSON.stringify({ media_fbid: mediaId })
    }

    const post = await client.postGraph(`${client.config.facebookPageId}/feed`, params)
    const details = await client
      .getGraph(post.id, { fields: 'id,permalink_url' })
      .catch(() => ({ id: post.id }))

    return {
      mode: 'multi_photo_post',
      photoIds: media,
      postId: post.id,
      permalink: details.permalink_url || null,
    }
  } catch (error) {
    const album = await client.postGraph(`${client.config.facebookPageId}/albums`, {
      message: manifest.captionFacebook,
      name: `${manifest.topic} | EMC2Ops`,
    })

    const photoIds = []
    for (const slideUrl of slideUrls) {
      const upload = await client.postGraph(`${album.id}/photos`, {
        published: 'true',
        url: slideUrl,
      })
      photoIds.push(upload.id)
    }

    return {
      fallbackReason: error.message,
      mode: 'album_fallback',
      photoIds,
      postId: album.id,
      permalink: `https://www.facebook.com/media/set/?set=a.${album.id}`,
    }
  }
}

async function main() {
  const manifest = await readJson(manifestPath)
  if (!manifest) {
    throw new Error(`Missing manifest: ${manifestPath}`)
  }

  const slideUrls = Array.isArray(manifest.slideUrls) && manifest.slideUrls.length > 0
    ? manifest.slideUrls
    : manifest.slidePaths.map((slide) => `${siteUrl}${slide.relativeUrl}`)
  const reservationEntry = {
    date: manifest.date,
    hook: manifest.hook,
    slot: manifest.slot,
    slideUrls,
    topic: manifest.topic,
  }
  const releaseReservation = await reserveCarouselPost(historyPath, reservationEntry)

  try {
    await verifyLiveUrls(slideUrls)
    const client = await createMetaClient()
    const instagram = await publishInstagramCarousel(client, manifest, slideUrls)
    const facebook = instagramOnly
      ? null
      : await publishFacebookMultiPhoto(client, manifest, slideUrls)
    const channels = instagramOnly ? ['instagram'] : ['instagram', 'facebook']

    const entry = {
      publishedAt: new Date().toISOString(),
      date: manifest.date,
      slot: manifest.slot,
      channels,
      topic: manifest.topic,
      hook: manifest.hook,
      slideDirectory: manifest.outputDir || path.dirname(manifestPath),
      slideUrls,
      caption: manifest.captionInstagram,
      ...(instagramOnly ? {} : { facebookCaption: manifest.captionFacebook }),
      captions: {
        instagram: manifest.captionInstagram,
        ...(instagramOnly ? {} : { facebook: manifest.captionFacebook }),
      },
      postIds: {
        instagram: instagram.postId,
        ...(facebook ? { facebook: facebook.postId } : {}),
      },
      postUrls: {
        instagram: instagram.permalink,
        ...(facebook ? { facebook: facebook.permalink } : {}),
      },
      instagramPostId: instagram.postId,
      instagramPermalink: instagram.permalink,
      ...(facebook
        ? {
            facebookPostId: facebook.postId,
            facebookPermalink: facebook.permalink,
            facebookMode: facebook.mode,
          }
        : {}),
    }

    await completeCarouselPost(historyPath, entry)
    console.log(
      JSON.stringify(
        {
          entry,
          instagram,
          ...(facebook ? { facebook } : {}),
          manifestPath,
          instagramOnly,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    await abortCarouselPost(historyPath, reservationEntry)
    throw error
  } finally {
    await releaseReservation()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
