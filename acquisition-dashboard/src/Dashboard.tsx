import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LogOut, Megaphone, Target } from 'lucide-react'
import { AcquisitionDashboard } from './AcquisitionDashboard'
import { SocialMediaMarketing } from './SocialMediaMarketing'
import {
  buildDashboardStats,
  currentDate,
  initialActivity,
  initialProspect,
  initialSocialDraft,
  initialTask,
  type DashboardTab,
  type SocialChannel,
  type SocialPostHistoryItem,
} from './dashboard-model'
import { defaultSprintTasks } from './strategy'
import type {
  EmailApproval,
  EmailApprovalStatus,
  OutreachActivity,
  Prospect,
  ProspectStage,
  SprintTask,
  TaskStatus,
} from './types'
import { supabase } from './lib/supabase'
import { LoadingScreen } from './SharedUi'

export function Dashboard({ session }: { session: Session }) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [activities, setActivities] = useState<OutreachActivity[]>([])
  const [tasks, setTasks] = useState<SprintTask[]>([])
  const [emailApprovals, setEmailApprovals] = useState<EmailApproval[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('acquisition')
  const [prospectDraft, setProspectDraft] = useState(initialProspect)
  const [activityDraft, setActivityDraft] = useState(initialActivity)
  const [taskDraft, setTaskDraft] = useState(initialTask)
  const [socialDraft, setSocialDraft] = useState(initialSocialDraft)
  const [socialPostHistory, setSocialPostHistory] = useState<
    SocialPostHistoryItem[]
  >([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [socialMessage, setSocialMessage] = useState('')
  const [socialPosting, setSocialPosting] = useState(false)
  const handledMetaCallback = useRef(false)

  useEffect(() => {
    void loadDashboard()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error_message') || params.get('error')

    if (error) {
      queueMicrotask(() => setMessage(`Meta connection failed: ${error}`))
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (!code || !state || handledMetaCallback.current) return

    handledMetaCallback.current = true

    const completeUrl = new URL('/api/meta/auth/complete', window.location.origin)
    completeUrl.searchParams.set('code', code)
    completeUrl.searchParams.set('state', state)

    void fetch(completeUrl)
      .then((response) => response.json())
      .then((result: { error?: string; pages?: Array<{ name: string }> }) => {
        if (result.error) {
          setMessage(`Meta connection failed: ${result.error}`)
          return
        }

        setMessage(
          `Meta connected: ${result.pages?.length ?? 0} Page${
            result.pages?.length === 1 ? '' : 's'
          } found.`,
        )
      })
      .catch(() => setMessage('Meta connection failed.'))
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname)
      })
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setMessage('')

    const [prospectResult, activityResult, taskResult, approvalResult] =
      await Promise.all([
        supabase.from('prospects').select('*').order('created_at', {
          ascending: false,
        }),
        supabase.from('outreach_activities').select('*').order('occurred_on', {
          ascending: false,
        }),
        supabase
          .from('sprint_tasks')
          .select('*')
          .order('week_number')
          .order('created_at'),
        supabase.from('email_approvals').select('*').order('created_at', {
          ascending: false,
        }),
      ])

    const firstError =
      prospectResult.error ??
      activityResult.error ??
      taskResult.error ??
      approvalResult.error

    if (firstError) {
      setMessage(firstError.message)
    } else {
      setProspects((prospectResult.data ?? []) as Prospect[])
      setActivities((activityResult.data ?? []) as OutreachActivity[])
      setTasks((taskResult.data ?? []) as SprintTask[])
      setEmailApprovals((approvalResult.data ?? []) as EmailApproval[])
    }

    setLoading(false)
  }

  async function seedSprintBoard() {
    setBusy(true)
    const { error } = await supabase.from('sprint_tasks').upsert(
      defaultSprintTasks.map((task) => ({
        owner_id: session.user.id,
        ...task,
      })),
      {
        ignoreDuplicates: true,
        onConflict: 'owner_id,week_number,title',
      },
    )

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadDashboard()
  }

  async function addProspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    const { error } = await supabase.from('prospects').insert({
      ...prospectDraft,
      next_follow_up_date: prospectDraft.next_follow_up_date || null,
    })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setProspectDraft(initialProspect)
    await loadDashboard()
  }

  async function addActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    const { error } = await supabase.from('outreach_activities').insert({
      ...activityDraft,
      prospect_id: activityDraft.prospect_id || null,
    })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setActivityDraft({ ...initialActivity, occurred_on: currentDate() })
    await loadDashboard()
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    const { error } = await supabase.from('sprint_tasks').insert({
      ...taskDraft,
      due_date: taskDraft.due_date || null,
    })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setTaskDraft(initialTask)
    await loadDashboard()
  }

  async function updateProspectStage(id: string, stage: ProspectStage) {
    const { error } = await supabase
      .from('prospects')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setProspects((currentProspects) =>
      currentProspects.map((prospect) =>
        prospect.id === id ? { ...prospect, stage } : prospect,
      ),
    )
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    const { error } = await supabase
      .from('sprint_tasks')
      .update({ status })
      .eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, status } : task,
      ),
    )
  }

  async function updateEmailApprovalStatus(
    id: string,
    status: Extract<EmailApprovalStatus, 'approved' | 'rejected'>,
  ) {
    const values = {
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      status,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('email_approvals')
      .update(values)
      .eq('id', id)
      .in('status', ['draft', 'failed', 'approved'])

    if (error) {
      setMessage(error.message)
      return
    }

    setEmailApprovals((currentApprovals) =>
      currentApprovals.map((approval) =>
        approval.id === id ? { ...approval, ...values } : approval,
      ),
    )
  }

  async function updateEmailApprovalCopy(
    id: string,
    values: Pick<EmailApproval, 'body' | 'subject'>,
  ) {
    const updates = {
      ...values,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('email_approvals')
      .update(updates)
      .eq('id', id)
      .in('status', ['draft', 'failed', 'approved'])

    if (error) {
      setMessage(error.message)
      return false
    }

    setEmailApprovals((currentApprovals) =>
      currentApprovals.map((approval) =>
        approval.id === id ? { ...approval, ...updates } : approval,
      ),
    )
    return true
  }

  async function publishSocialPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSocialPosting(true)
    setSocialMessage('')

    const formData = new FormData(event.currentTarget)
    formData.set('campaign', socialDraft.campaign)
    formData.set('caption', socialDraft.caption)
    formData.set('channels', JSON.stringify(socialDraft.channels))
    formData.set('linkUrl', socialDraft.linkUrl)
    formData.set('mediaUrl', socialDraft.mediaUrl)
    formData.set('postType', socialDraft.postType)

    const response = await fetch('/api/social-post', {
      body: formData,
      method: 'POST',
    })
    const result = (await response.json().catch(() => null)) as {
      error?: string
      results?: Array<{ channel: SocialChannel; id?: string; ok: boolean }>
    } | null

    setSocialPosting(false)

    if (!response.ok || result?.error) {
      setSocialMessage(result?.error ?? 'Could not publish the social post.')
      return
    }

    const channels =
      result?.results
        ?.filter((postResult) => postResult.ok)
        .map((postResult) => postResult.channel) ?? socialDraft.channels

    setSocialPostHistory((currentHistory) => [
      {
        channels,
        id: crypto.randomUUID(),
        message: socialDraft.caption,
        postedAt: new Date().toLocaleString(),
      },
      ...currentHistory,
    ])
    setSocialMessage(`Posted to ${channels.join(' and ')}.`)
    setSocialDraft((currentDraft) => ({ ...currentDraft, caption: '' }))
  }

  const dashboardStats = useMemo(
    () => buildDashboardStats(activities, prospects),
    [activities, prospects],
  )

  if (loading) {
    return <LoadingScreen label="Loading acquisition records" />
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow compact">EMC2Ops</p>
          <h1>30-day client acquisition dashboard</h1>
        </div>
        <div className="topbar-actions">
          <span>{session.user.email}</span>
          <button
            aria-label="Sign out"
            className="icon-action"
            onClick={() => void supabase.auth.signOut()}
            title="Sign out"
            type="button"
          >
            <LogOut />
          </button>
        </div>
      </header>

      {message && <p className="status-banner">{message}</p>}

      <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'acquisition' ? (
        <AcquisitionDashboard
          activities={activities}
          activityDraft={activityDraft}
          busy={busy}
          dashboardStats={dashboardStats}
          emailApprovals={emailApprovals}
          onActivityChange={setActivityDraft}
          onActivitySubmit={addActivity}
          onEmailApprovalCopyChange={updateEmailApprovalCopy}
          onEmailApprovalStatusChange={updateEmailApprovalStatus}
          onProspectChange={setProspectDraft}
          onProspectStageChange={updateProspectStage}
          onProspectSubmit={addProspect}
          onSeedSprintBoard={seedSprintBoard}
          onTaskDraftChange={setTaskDraft}
          onTaskStatusChange={updateTaskStatus}
          onTaskSubmit={addTask}
          prospectDraft={prospectDraft}
          prospects={prospects}
          taskDraft={taskDraft}
          tasks={tasks}
        />
      ) : (
        <SocialMediaMarketing
          draft={socialDraft}
          history={socialPostHistory}
          message={socialMessage}
          onChange={setSocialDraft}
          onSubmit={publishSocialPost}
          posting={socialPosting}
        />
      )}
    </main>
  )
}

function DashboardTabs({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab
  onChange: (tab: DashboardTab) => void
}) {
  return (
    <nav aria-label="Dashboard tabs" className="dashboard-tabs">
      <button
        aria-current={activeTab === 'acquisition' ? 'page' : undefined}
        onClick={() => onChange('acquisition')}
        type="button"
      >
        <Target />
        Client Acquisition
      </button>
      <button
        aria-current={activeTab === 'social' ? 'page' : undefined}
        onClick={() => onChange('social')}
        type="button"
      >
        <Megaphone />
        Social Media Marketing
      </button>
    </nav>
  )
}
