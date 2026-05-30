export type ProspectStage =
  | 'prospecting'
  | 'contacted'
  | 'replied'
  | 'audit_booked'
  | 'call_held'
  | 'proposal_sent'
  | 'won'
  | 'lost'

export type ActivityType =
  | 'cold_email'
  | 'follow_up_email'
  | 'phone_call'
  | 'linkedin_touch'
  | 'loom_audit'
  | 'workflow_audit'
  | 'partner_conversation'
  | 'proposal'
  | 'other'

export type TaskStatus = 'todo' | 'doing' | 'done'
export type EmailApprovalStatus =
  | 'draft'
  | 'approved'
  | 'rejected'
  | 'sending'
  | 'sent'
  | 'failed'

export type Prospect = {
  id: string
  company_name: string
  market: string
  website: string
  decision_maker: string
  email: string
  phone: string
  source: string
  software_clues: string
  pain_signal: string
  notes: string
  next_follow_up_date: string | null
  stage: ProspectStage
  created_at: string
  updated_at: string
}

export type OutreachActivity = {
  id: string
  prospect_id: string | null
  activity_type: ActivityType
  occurred_on: string
  outcome: string
  notes: string
  created_at: string
}

export type SprintTask = {
  id: string
  week_number: number
  title: string
  status: TaskStatus
  due_date: string | null
  notes: string
  created_at: string
}

export type EmailApproval = {
  id: string
  prospect_id: string | null
  recipient_email: string
  subject: string
  body: string
  activity_type: 'cold_email' | 'follow_up_email'
  status: EmailApprovalStatus
  approved_at: string | null
  sent_at: string | null
  provider_message_id: string
  last_error: string
  created_at: string
  updated_at: string
}
