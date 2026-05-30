import { activityOptions, stageOptions } from './strategy'
import type {
  ActivityType,
  OutreachActivity,
  Prospect,
  ProspectStage,
} from './types'

export type DashboardTab = 'acquisition' | 'social'
export type SocialChannel = 'facebook' | 'instagram' | 'x'
export type SocialPostType = 'text' | 'link' | 'photo' | 'video' | 'reel'
export type SocialPostHistoryItem = {
  channels: SocialChannel[]
  id: string
  message: string
  postedAt: string
}
export type MetaPageOption = {
  id: string
  instagramBusinessAccount: {
    id: string
    name: string
    username: string
  } | null
  name: string
}
export type MetaStatus = {
  appConfigured: boolean
  connected: boolean
  facebook: boolean
  facebookStatus: string
  instagram: boolean
  instagramStatus: string
  pages: MetaPageOption[]
  selectedPageId: string
  tokenType: string | null
  version: string
}
export type XStatus = {
  appConfigured: boolean
  connected: boolean
  oauth1: boolean
  oauth2: boolean
  status: string
  user: {
    id: string
    name: string
    username: string
  } | null
}

const outboundActivityTypes = new Set<ActivityType>([
  'cold_email',
  'follow_up_email',
  'phone_call',
  'linkedin_touch',
  'loom_audit',
])

const qualifiedStages = new Set<ProspectStage>([
  'call_held',
  'proposal_sent',
  'won',
])

const bookedStages = new Set<ProspectStage>([
  'audit_booked',
  'call_held',
  'proposal_sent',
  'won',
])

export const initialProspect = {
  company_name: '',
  market: '',
  website: '',
  decision_maker: '',
  email: '',
  phone: '',
  source: '',
  software_clues: '',
  pain_signal: '',
  next_follow_up_date: '',
  notes: '',
}

export function currentDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

export const initialActivity = {
  activity_type: 'cold_email' as ActivityType,
  prospect_id: '',
  occurred_on: currentDate(),
  outcome: '',
  notes: '',
}

export const initialTask = {
  week_number: 1,
  title: '',
  due_date: '',
  notes: '',
}

export const initialSocialDraft = {
  campaign: 'Property management automation',
  caption: '',
  channels: ['x'] as SocialChannel[],
  linkUrl: '',
  mediaUrl: '',
  postType: 'text' as SocialPostType,
}

export const socialPostTypes: Array<{ value: SocialPostType; label: string }> =
  [
    { value: 'text', label: 'Text' },
    { value: 'link', label: 'Link' },
    { value: 'photo', label: 'Photo' },
    { value: 'video', label: 'Video' },
    { value: 'reel', label: 'Reel' },
  ]

export const socialContentPillars = [
  'Missed-call recovery',
  'Lead follow-up speed',
  'Maintenance intake',
  'Owner update workflows',
]

export function stageLabel(stage: ProspectStage) {
  return stageOptions.find((option) => option.value === stage)?.label ?? stage
}

export function activityLabel(activity: ActivityType) {
  return (
    activityOptions.find((option) => option.value === activity)?.label ??
    activity
  )
}

export function buildDashboardStats(
  activities: OutreachActivity[],
  prospects: Prospect[],
) {
  const today = currentDate()
  const todayActivities = activities.filter(
    (activity) => activity.occurred_on === today,
  )

  return {
    bookedCalls: prospects.filter((prospect) =>
      bookedStages.has(prospect.stage),
    ).length,
    dueFollowUps: prospects.filter(
      (prospect) =>
        prospect.next_follow_up_date &&
        prospect.next_follow_up_date <= today &&
        prospect.stage !== 'won' &&
        prospect.stage !== 'lost',
    ),
    outboundTouches: activities.filter((activity) =>
      outboundActivityTypes.has(activity.activity_type),
    ).length,
    partnerConversations: activities.filter(
      (activity) => activity.activity_type === 'partner_conversation',
    ).length,
    payingClients: prospects.filter((prospect) => prospect.stage === 'won')
      .length,
    proposals: prospects.filter(
      (prospect) =>
        prospect.stage === 'proposal_sent' || prospect.stage === 'won',
    ).length,
    qualifiedCalls: prospects.filter((prospect) =>
      qualifiedStages.has(prospect.stage),
    ).length,
    todayActivities,
  }
}
