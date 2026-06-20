import type { IntegrationPlatformId, Prospect } from './types'

export type IntegrationPlatform = {
  category: 'Property management' | 'Leasing CRM' | 'Sales CRM'
  description: string
  id: IntegrationPlatformId
  logo: string
  name: string
  status: 'Supported for tagging' | 'Workflow-ready' | 'CRM-ready'
}

export const integrationPlatforms: IntegrationPlatform[] = [
  {
    category: 'Property management',
    description: 'Property, resident, owner, leasing, and accounting context.',
    id: 'appfolio',
    logo: '/integrations/appfolio.png',
    name: 'AppFolio',
    status: 'Supported for tagging',
  },
  {
    category: 'Property management',
    description: 'Portfolio, tenant, owner, maintenance, and accounting records.',
    id: 'buildium',
    logo: '/integrations/buildium.png',
    name: 'Buildium',
    status: 'Supported for tagging',
  },
  {
    category: 'Leasing CRM',
    description: 'Lead pipeline follow-up, sales process, and team handoff signals.',
    id: 'leadsimple',
    logo: '/integrations/leadsimple.png',
    name: 'LeadSimple',
    status: 'Workflow-ready',
  },
  {
    category: 'Property management',
    description: 'Enterprise property operations, leasing, and resident data.',
    id: 'yardi',
    logo: '/integrations/yardi.png',
    name: 'Yardi',
    status: 'Supported for tagging',
  },
  {
    category: 'Property management',
    description: 'Property management, leasing, accounting, and service records.',
    id: 'rent_manager',
    logo: '/integrations/rent-manager.png',
    name: 'Rent Manager',
    status: 'Supported for tagging',
  },
  {
    category: 'Property management',
    description: 'Multifamily leasing, resident, marketing, and operations context.',
    id: 'entrata',
    logo: '/integrations/entrata.png',
    name: 'Entrata',
    status: 'Supported for tagging',
  },
  {
    category: 'Leasing CRM',
    description: 'Renter lead attribution, leasing engagement, and tour workflows.',
    id: 'knock',
    logo: '/integrations/knock.png',
    name: 'Knock',
    status: 'Workflow-ready',
  },
  {
    category: 'Sales CRM',
    description: 'Deals, contacts, lifecycle stage, and sales automation context.',
    id: 'hubspot',
    logo: '/integrations/hubspot.png',
    name: 'HubSpot',
    status: 'CRM-ready',
  },
  {
    category: 'Sales CRM',
    description: 'Accounts, contacts, opportunities, tasks, and revenue pipeline data.',
    id: 'salesforce',
    logo: '/integrations/salesforce.png',
    name: 'Salesforce',
    status: 'CRM-ready',
  },
]

const platformIds = new Set(
  integrationPlatforms.map((platform) => platform.id),
)

export function normalizePlatformIds(value: unknown): IntegrationPlatformId[] {
  if (!Array.isArray(value)) return []

  return value.filter((id): id is IntegrationPlatformId =>
    platformIds.has(id as IntegrationPlatformId),
  )
}

export function platformForId(id: IntegrationPlatformId) {
  return integrationPlatforms.find((platform) => platform.id === id)
}

export function buildIntegrationInsights(prospects: Prospect[]) {
  const counts = new Map<IntegrationPlatformId, number>()

  for (const prospect of prospects) {
    for (const platform of normalizePlatformIds(prospect.platforms)) {
      counts.set(platform, (counts.get(platform) ?? 0) + 1)
    }
  }

  const mostCommonPlatform = [...counts.entries()]
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .at(0)

  return {
    counts,
    mostCommonPlatform: mostCommonPlatform
      ? {
          count: mostCommonPlatform[1],
          platform: platformForId(mostCommonPlatform[0]),
        }
      : null,
    taggedProspects: prospects.filter(
      (prospect) => normalizePlatformIds(prospect.platforms).length > 0,
    ),
    untaggedProspects: prospects.filter(
      (prospect) => normalizePlatformIds(prospect.platforms).length === 0,
    ),
  }
}
