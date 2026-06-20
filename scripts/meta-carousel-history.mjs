import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback
    throw error
  }
}

export function getHistoryPosts(history) {
  if (Array.isArray(history)) return history
  if (history && Array.isArray(history.posts)) return history.posts
  return []
}

export function writeHistoryShape(originalHistory, posts) {
  if (Array.isArray(originalHistory)) return posts
  return { ...(originalHistory && typeof originalHistory === 'object' ? originalHistory : {}), posts }
}

export function carouselIdentity(entry) {
  const firstSlide = Array.isArray(entry.slideUrls) ? entry.slideUrls[0] : ''
  return [
    entry.date || '',
    entry.slot || '',
    entry.topic || '',
    entry.hook || '',
    firstSlide,
  ].join('::')
}

function carouselLockKey(entry) {
  return crypto.createHash('sha256').update(carouselIdentity(entry)).digest('hex')
}

export function hasPublishedPost(post) {
  return Boolean(
    post?.instagramPostId ||
      post?.facebookPostId ||
      post?.postIds?.instagram ||
      post?.postIds?.facebook ||
      post?.instagram?.id ||
      post?.facebook?.id,
  )
}

export function findExistingPost(posts, entry) {
  const identity = carouselIdentity(entry)
  return posts.find((post) => carouselIdentity(post) === identity)
}

export async function assertNoExistingPost(historyPath, entry) {
  const history = await readJson(historyPath, [])
  const existing = findExistingPost(getHistoryPosts(history), entry)

  if (existing && (existing.status === 'publishing' || hasPublishedPost(existing))) {
    throw new Error(
      `Meta carousel already ${existing.status === 'publishing' ? 'reserved' : 'published'} for ${entry.date} ${entry.slot || ''}: ${entry.topic || entry.hook || 'untitled'}.`,
    )
  }
}

export async function reserveCarouselPost(historyPath, entry) {
  const lockDir = path.join(path.dirname(historyPath), '.meta-carousel-locks')
  await fs.mkdir(lockDir, { recursive: true })

  const lockName = carouselLockKey(entry)
  const lockPath = path.join(lockDir, `${lockName}.lock`)
  let handle

  try {
    handle = await fs.open(lockPath, 'wx')
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(
        `Meta carousel is already being published for ${entry.date} ${entry.slot || ''}: ${entry.topic || entry.hook || 'untitled'}.`,
      )
    }
    throw error
  }

  await handle.writeFile(
    JSON.stringify(
      {
        acquiredAt: new Date().toISOString(),
        date: entry.date,
        hook: entry.hook,
        slot: entry.slot,
        topic: entry.topic,
      },
      null,
      2,
    ),
  )

  const release = async () => {
    await handle?.close().catch(() => {})
    await fs.unlink(lockPath).catch(() => {})
  }

  try {
    const history = await readJson(historyPath, [])
    const posts = getHistoryPosts(history)
    const existing = findExistingPost(posts, entry)

    if (existing && (existing.status === 'publishing' || hasPublishedPost(existing))) {
      throw new Error(
        `Meta carousel already ${existing.status === 'publishing' ? 'reserved' : 'published'} for ${entry.date} ${entry.slot || ''}: ${entry.topic || entry.hook || 'untitled'}.`,
      )
    }

    const reservation = {
      ...entry,
      reservedAt: new Date().toISOString(),
      status: 'publishing',
    }
    const nextPosts = posts.filter((post) => carouselIdentity(post) !== carouselIdentity(entry))
    nextPosts.push(reservation)
    await fs.writeFile(historyPath, `${JSON.stringify(writeHistoryShape(history, nextPosts), null, 2)}\n`)

    return release
  } catch (error) {
    await release()
    throw error
  }
}

export async function completeCarouselPost(historyPath, entry) {
  const history = await readJson(historyPath, [])
  const posts = getHistoryPosts(history)
  const nextPosts = posts.filter((post) => carouselIdentity(post) !== carouselIdentity(entry))
  nextPosts.push({ ...entry, status: 'published' })
  await fs.writeFile(historyPath, `${JSON.stringify(writeHistoryShape(history, nextPosts), null, 2)}\n`)
}

export async function abortCarouselPost(historyPath, entry) {
  const history = await readJson(historyPath, [])
  const posts = getHistoryPosts(history)
  const nextPosts = posts.filter((post) => {
    if (carouselIdentity(post) !== carouselIdentity(entry)) return true
    return post.status !== 'publishing'
  })
  await fs.writeFile(historyPath, `${JSON.stringify(writeHistoryShape(history, nextPosts), null, 2)}\n`)
}
