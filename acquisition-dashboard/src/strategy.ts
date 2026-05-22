import type { ActivityType, ProspectStage, TaskStatus } from './types'

export const stageOptions: Array<{ value: ProspectStage; label: string }> = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'audit_booked', label: 'Audit booked' },
  { value: 'call_held', label: 'Call held' },
  { value: 'proposal_sent', label: 'Proposal sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export const activityOptions: Array<{ value: ActivityType; label: string }> = [
  { value: 'cold_email', label: 'Cold email' },
  { value: 'follow_up_email', label: 'Follow-up email' },
  { value: 'phone_call', label: 'Phone call' },
  { value: 'linkedin_touch', label: 'LinkedIn touch' },
  { value: 'loom_audit', label: 'Loom audit' },
  { value: 'workflow_audit', label: 'Workflow audit' },
  { value: 'partner_conversation', label: 'Partner conversation' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'other', label: 'Other' },
]

export const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
]

export const dailyTargets: Array<{
  value: ActivityType
  label: string
  floor: number
  ceiling: number
}> = [
  { value: 'cold_email', label: 'Cold emails', floor: 30, ceiling: 40 },
  { value: 'follow_up_email', label: 'Follow-ups', floor: 10, ceiling: 10 },
  { value: 'phone_call', label: 'Phone calls', floor: 10, ceiling: 10 },
  { value: 'linkedin_touch', label: 'LinkedIn touches', floor: 10, ceiling: 15 },
  { value: 'loom_audit', label: 'Loom audits', floor: 2, ceiling: 3 },
]

export const defaultSprintTasks = [
  {
    week_number: 1,
    title: 'Fix booking flow and keep email as the secondary path',
    notes: 'Add the audit booking calendar before scaling outreach.',
  },
  {
    week_number: 1,
    title: 'Record the missed-call workflow demo',
    notes: 'Keep the demo focused on text-back, qualification, and routing.',
  },
  {
    week_number: 1,
    title: 'Build the first 100 property-management accounts',
    notes: 'Track market, contact path, software clues, and pain signals.',
  },
  {
    week_number: 2,
    title: 'Review replies and refine ICP relevance',
    notes: 'Use the first ten business days to tighten targeting and first lines.',
  },
  {
    week_number: 2,
    title: 'Add Loom audits, call blocks, and partner outreach',
    notes: 'Push founder-led outbound while opening referral channels.',
  },
  {
    week_number: 3,
    title: 'Send proposals within 24 hours of qualified calls',
    notes: 'Scope the seven-day missed-call recovery workflow first.',
  },
  {
    week_number: 3,
    title: 'Publish one workflow breakdown',
    notes: 'Use proof-oriented content instead of broad AI automation claims.',
  },
  {
    week_number: 4,
    title: 'Re-engage non-responders and ask for referrals',
    notes: 'Use the strongest learned pain signal from the sprint.',
  },
  {
    week_number: 4,
    title: 'Turn delivery into proof and offer optimization',
    notes: 'Capture proof from the first implementation.',
  },
]
