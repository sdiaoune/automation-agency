import { getBufferLinkedInStatus } from './buffer-store.js'

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

async function statusResponse() {
  const status = await getBufferLinkedInStatus()

  return {
    appConfigured: status.appConfigured,
    channel: status.channel,
    channelId: status.channelId,
    connected: status.connected,
    expiresAt: null,
    organizationId: status.organizationId,
    status: status.status,
    user: status.channel
      ? {
          email: '',
          name: status.channel.displayName || status.channel.name || '',
          picture: '',
          sub: status.channel.id,
        }
      : null,
    version: 'Buffer GraphQL',
  }
}

export default async function handler(request, response) {
  const requestUrl = new URL(request.url || '', originFromRequest(request))
  const pathname = requestUrl.pathname

  if (request.method === 'GET' && pathname.endsWith('/auth/status')) {
    return sendJson(response, 200, await statusResponse())
  }

  if (request.method === 'GET' && pathname.endsWith('/auth/start')) {
    return redirect(response, 'https://account.buffer.com/channels')
  }

  return sendJson(response, 404, { error: 'Buffer LinkedIn route not found.' })
}
