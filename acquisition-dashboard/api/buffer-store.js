const BUFFER_API_URL = 'https://api.buffer.com'
const LINKEDIN_SERVICE = 'linkedin'

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function getBufferConfig() {
  return {
    apiKey: clean(process.env.BUFFER_API_KEY),
    linkedinChannelId: clean(process.env.BUFFER_LINKEDIN_CHANNEL_ID),
    mode: clean(process.env.BUFFER_POST_MODE) || 'shareNow',
    organizationId: clean(process.env.BUFFER_ORGANIZATION_ID),
  }
}

export async function bufferGraphql(query, variables = {}) {
  const config = getBufferConfig()

  if (!config.apiKey) {
    throw new Error('Buffer API key is not configured.')
  }

  const response = await fetch(BUFFER_API_URL, {
    body: JSON.stringify({ query, variables }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.message || `Buffer returned ${response.status}.`,
    )
  }

  if (data.errors?.length) {
    throw new Error(data.errors.map((error) => error.message).join(' '))
  }

  return data.data || {}
}

export async function getBufferOrganizations() {
  const data = await bufferGraphql(`
    query GetBufferOrganizations {
      account {
        organizations {
          id
          name
        }
      }
    }
  `)

  return data.account?.organizations || []
}

export async function getBufferChannels(organizationId) {
  if (!organizationId) return []

  const data = await bufferGraphql(
    `
      query GetBufferChannels($organizationId: OrganizationId!) {
        channels(input: { organizationId: $organizationId }) {
          id
          name
          displayName
          service
          isQueuePaused
        }
      }
    `,
    { organizationId },
  )

  return data.channels || []
}

export async function getBufferLinkedInStatus() {
  const config = getBufferConfig()

  if (!config.apiKey) {
    return {
      appConfigured: false,
      channel: null,
      channelId: '',
      connected: false,
      organizationId: config.organizationId,
      status: 'Add BUFFER_API_KEY',
    }
  }

  try {
    const organizations = config.organizationId
      ? [{ id: config.organizationId, name: '' }]
      : await getBufferOrganizations()
    const organization = organizations[0] || null
    const channels = organization?.id
      ? await getBufferChannels(organization.id)
      : []
    const channel = config.linkedinChannelId
      ? channels.find((item) => item.id === config.linkedinChannelId) || null
      : channels.find((item) => item.service === LINKEDIN_SERVICE) || null

    return {
      appConfigured: true,
      channel: channel
        ? {
            displayName: channel.displayName || '',
            id: channel.id,
            name: channel.name || '',
            service: channel.service || '',
          }
        : null,
      channelId: channel?.id || config.linkedinChannelId,
      connected: Boolean(channel?.id || config.linkedinChannelId),
      organizationId: organization?.id || config.organizationId,
      status: channel
        ? `Ready via Buffer: ${channel.displayName || channel.name || channel.id}`
        : config.linkedinChannelId
          ? 'Ready via configured Buffer channel'
          : 'Connect LinkedIn in Buffer',
    }
  } catch (error) {
    return {
      appConfigured: true,
      channel: null,
      channelId: config.linkedinChannelId,
      connected: false,
      organizationId: config.organizationId,
      status:
        error instanceof Error
          ? `Buffer check failed: ${error.message}`
          : 'Buffer check failed',
    }
  }
}

export async function getBufferLinkedInChannelId() {
  const config = getBufferConfig()

  if (config.linkedinChannelId) return config.linkedinChannelId

  const status = await getBufferLinkedInStatus()
  if (status.channelId) return status.channelId

  throw new Error('Connect a LinkedIn channel in Buffer before publishing.')
}

export async function createBufferPost(input) {
  const data = await bufferGraphql(
    `
      mutation CreateBufferPost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess {
            post {
              id
              text
              dueAt
              status
            }
          }
          ... on MutationError {
            message
          }
        }
      }
    `,
    { input },
  )
  const result = data.createPost

  if (result?.message && !result.post) {
    throw new Error(result.message)
  }

  if (!result?.post?.id) {
    throw new Error('Buffer did not return a created post.')
  }

  return result.post
}
