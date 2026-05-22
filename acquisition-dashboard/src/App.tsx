import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  ClipboardPlus,
  LogOut,
  MailPlus,
  PhoneCall,
  Plus,
  Target,
} from 'lucide-react'
import { supabase } from './lib/supabase'
import {
  activityOptions,
  dailyTargets,
  defaultSprintTasks,
  stageOptions,
  taskStatusOptions,
} from './strategy'
import type {
  ActivityType,
  OutreachActivity,
  Prospect,
  ProspectStage,
  SprintTask,
  TaskStatus,
} from './types'

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

const initialProspect = {
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

function currentDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

const initialActivity = {
  activity_type: 'cold_email' as ActivityType,
  prospect_id: '',
  occurred_on: currentDate(),
  outcome: '',
  notes: '',
}

const initialTask = {
  week_number: 1,
  title: '',
  due_date: '',
  notes: '',
}

function stageLabel(stage: ProspectStage) {
  return stageOptions.find((option) => option.value === stage)?.label ?? stage
}

function activityLabel(activity: ActivityType) {
  return (
    activityOptions.find((option) => option.value === activity)?.label ??
    activity
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return <LoadingScreen label="Checking your dashboard session" />
  }

  return session ? <Dashboard session={session} /> : <AuthScreen />
}

function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    const result =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setBusy(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Confirm the email before signing in.')
      return
    }

    setMessage('Signed in.')
  }

  return (
    <main className="auth-shell">
      <section className="auth-context">
        <p className="eyebrow">EMC2Ops acquisition sprint</p>
        <h1>One board for the next 30 days of client acquisition.</h1>
        <div className="auth-targets">
          <Target />
          <span>500-800 touches</span>
          <PhoneCall />
          <span>10-20 qualified calls</span>
          <CheckCircle2 />
          <span>1-3 paying clients</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="panel-heading">
          <CircleUserRound />
          <div>
            <p className="eyebrow compact">Private workspace</p>
            <h2>{mode === 'signin' ? 'Sign in' : 'Create your account'}</h2>
          </div>
        </div>

        <form className="stack-form" onSubmit={handleAuth}>
          <label>
            Email
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button className="primary-action" disabled={busy} type="submit">
            {busy
              ? 'Working...'
              : mode === 'signin'
                ? 'Open dashboard'
                : 'Create account'}
          </button>
        </form>

        {message && <p className="form-message">{message}</p>}

        <button
          className="text-action"
          onClick={() =>
            setMode((currentMode) =>
              currentMode === 'signin' ? 'signup' : 'signin',
            )
          }
          type="button"
        >
          {mode === 'signin'
            ? 'Need the first account? Create it'
            : 'Already created it? Sign in'}
        </button>
      </section>
    </main>
  )
}

function Dashboard({ session }: { session: Session }) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [activities, setActivities] = useState<OutreachActivity[]>([])
  const [tasks, setTasks] = useState<SprintTask[]>([])
  const [prospectDraft, setProspectDraft] = useState(initialProspect)
  const [activityDraft, setActivityDraft] = useState(initialActivity)
  const [taskDraft, setTaskDraft] = useState(initialTask)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setMessage('')

    const [prospectResult, activityResult, taskResult] = await Promise.all([
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
    ])

    const firstError =
      prospectResult.error ?? activityResult.error ?? taskResult.error

    if (firstError) {
      setMessage(firstError.message)
    } else {
      setProspects((prospectResult.data ?? []) as Prospect[])
      setActivities((activityResult.data ?? []) as OutreachActivity[])
      setTasks((taskResult.data ?? []) as SprintTask[])
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

  const dashboardStats = useMemo(() => {
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
  }, [activities, prospects])

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

      <section className="metric-grid">
        <MetricCard
          current={dashboardStats.outboundTouches}
          label="Outbound touches"
          target={500}
          targetLabel="500-800"
        />
        <MetricCard
          current={dashboardStats.qualifiedCalls}
          label="Qualified calls"
          target={10}
          targetLabel="10-20"
        />
        <MetricCard
          current={dashboardStats.payingClients}
          label="Paying clients"
          target={1}
          targetLabel="1-3"
        />
        <MetricCard
          current={dashboardStats.partnerConversations}
          label="Partner conversations"
          target={3}
          targetLabel="3-5"
        />
      </section>

      <section className="dashboard-grid">
        <article className="surface daily-surface">
          <SectionHeading
            icon={<Target />}
            title="Today's cadence"
            value={`${dashboardStats.todayActivities.length} logged`}
          />
          <div className="target-list">
            {dailyTargets.map((target) => {
              const count = dashboardStats.todayActivities.filter(
                (activity) => activity.activity_type === target.value,
              ).length

              return (
                <div className="target-row" key={target.value}>
                  <div>
                    <strong>{target.label}</strong>
                    <span>
                      {count} / {target.floor}
                      {target.ceiling > target.floor
                        ? `-${target.ceiling}`
                        : ''}
                    </span>
                  </div>
                  <progress max={target.floor} value={count} />
                </div>
              )
            })}
          </div>
        </article>

        <article className="surface pipeline-surface">
          <SectionHeading
            icon={<ArrowUpRight />}
            title="Pipeline"
            value={`${dashboardStats.proposals} proposals`}
          />
          <div className="pipeline-grid">
            {stageOptions.map((stage) => (
              <div className="stage-tile" key={stage.value}>
                <strong>
                  {
                    prospects.filter((prospect) => prospect.stage === stage.value)
                      .length
                  }
                </strong>
                <span>{stage.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="surface followup-surface">
          <SectionHeading
            icon={<CalendarClock />}
            title="Follow-ups due"
            value={`${dashboardStats.bookedCalls} booked+`}
          />
          {dashboardStats.dueFollowUps.length === 0 ? (
            <EmptyState label="No follow-ups are due today." />
          ) : (
            <div className="compact-list">
              {dashboardStats.dueFollowUps.slice(0, 5).map((prospect) => (
                <div key={prospect.id}>
                  <strong>{prospect.company_name}</strong>
                  <span>
                    {prospect.next_follow_up_date} / {stageLabel(prospect.stage)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="work-grid">
        <ProspectEntry
          busy={busy}
          draft={prospectDraft}
          onChange={setProspectDraft}
          onSubmit={addProspect}
          total={prospects.length}
        />
        <ActivityEntry
          activities={activities}
          busy={busy}
          draft={activityDraft}
          onChange={setActivityDraft}
          onSubmit={addActivity}
          prospects={prospects}
        />
      </section>

      <ProspectTable
        onStageChange={updateProspectStage}
        prospects={prospects}
      />

      <SprintBoard
        busy={busy}
        draft={taskDraft}
        onDraftChange={setTaskDraft}
        onSeed={seedSprintBoard}
        onStatusChange={updateTaskStatus}
        onSubmit={addTask}
        tasks={tasks}
      />
    </main>
  )
}

function ProspectEntry({
  busy,
  draft,
  onChange,
  onSubmit,
  total,
}: {
  busy: boolean
  draft: typeof initialProspect
  onChange: (draft: typeof initialProspect) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  total: number
}) {
  return (
    <article className="surface">
      <SectionHeading
        icon={<ClipboardPlus />}
        title="Add prospect"
        value={`${total} accounts`}
      />
      <form className="entry-form" onSubmit={onSubmit}>
        <div className="field-grid">
          <DraftInput draft={draft} field="company_name" label="Company" onChange={onChange} required />
          <DraftInput draft={draft} field="market" label="Market" onChange={onChange} />
          <DraftInput draft={draft} field="decision_maker" label="Decision maker" onChange={onChange} />
          <DraftInput draft={draft} field="email" label="Email" onChange={onChange} type="email" />
          <DraftInput draft={draft} field="phone" label="Phone" onChange={onChange} />
          <DraftInput draft={draft} field="next_follow_up_date" label="Next follow-up" onChange={onChange} type="date" />
          <DraftInput draft={draft} field="website" label="Website" onChange={onChange} />
          <DraftInput draft={draft} field="source" label="Source" onChange={onChange} />
        </div>
        <DraftInput draft={draft} field="software_clues" label="Software clues" onChange={onChange} />
        <DraftTextArea draft={draft} field="pain_signal" label="Pain signal" onChange={onChange} />
        <DraftTextArea draft={draft} field="notes" label="Notes" onChange={onChange} />
        <button className="primary-action" disabled={busy} type="submit">
          <Plus />
          Save prospect
        </button>
      </form>
    </article>
  )
}

function ActivityEntry({
  activities,
  busy,
  draft,
  onChange,
  onSubmit,
  prospects,
}: {
  activities: OutreachActivity[]
  busy: boolean
  draft: typeof initialActivity
  onChange: (draft: typeof initialActivity) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  prospects: Prospect[]
}) {
  return (
    <article className="surface">
      <SectionHeading
        icon={<MailPlus />}
        title="Log outreach"
        value={`${activities.length} activities`}
      />
      <form className="entry-form" onSubmit={onSubmit}>
        <div className="field-grid">
          <label>
            Activity
            <select
              onChange={(event) =>
                onChange({
                  ...draft,
                  activity_type: event.target.value as ActivityType,
                })
              }
              value={draft.activity_type}
            >
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              onChange={(event) =>
                onChange({ ...draft, occurred_on: event.target.value })
              }
              required
              type="date"
              value={draft.occurred_on}
            />
          </label>
          <label>
            Account
            <select
              onChange={(event) =>
                onChange({ ...draft, prospect_id: event.target.value })
              }
              value={draft.prospect_id}
            >
              <option value="">No linked account</option>
              {prospects.map((prospect) => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.company_name}
                </option>
              ))}
            </select>
          </label>
          <DraftInput draft={draft} field="outcome" label="Outcome" onChange={onChange} />
        </div>
        <DraftTextArea draft={draft} field="notes" label="Notes" onChange={onChange} rows={3} />
        <button className="primary-action" disabled={busy} type="submit">
          <Plus />
          Log activity
        </button>
      </form>

      <div className="recent-block">
        <h3>Recent activity</h3>
        {activities.length === 0 ? (
          <EmptyState label="Log the first outreach touch." />
        ) : (
          <div className="compact-list">
            {activities.slice(0, 6).map((activity) => (
              <div key={activity.id}>
                <strong>{activityLabel(activity.activity_type)}</strong>
                <span>
                  {activity.occurred_on}
                  {activity.outcome ? ` / ${activity.outcome}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

function ProspectTable({
  onStageChange,
  prospects,
}: {
  onStageChange: (id: string, stage: ProspectStage) => Promise<void>
  prospects: Prospect[]
}) {
  return (
    <section className="surface table-surface">
      <SectionHeading
        icon={<CircleUserRound />}
        title="Prospect list"
        value="Manual pipeline control"
      />
      {prospects.length === 0 ? (
        <EmptyState label="Add the first property-management account." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Contact</th>
                <th>Pain signal</th>
                <th>Follow-up</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((prospect) => (
                <tr key={prospect.id}>
                  <td>
                    <strong>{prospect.company_name}</strong>
                    <span>{prospect.market || prospect.source || 'Unsorted'}</span>
                  </td>
                  <td>
                    <strong>{prospect.decision_maker || 'Unknown contact'}</strong>
                    <span>{prospect.email || prospect.phone || prospect.website}</span>
                  </td>
                  <td>{prospect.pain_signal || prospect.software_clues || 'Add signal'}</td>
                  <td>{prospect.next_follow_up_date || 'Not set'}</td>
                  <td>
                    <select
                      aria-label={`Stage for ${prospect.company_name}`}
                      onChange={(event) =>
                        void onStageChange(
                          prospect.id,
                          event.target.value as ProspectStage,
                        )
                      }
                      value={prospect.stage}
                    >
                      {stageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function SprintBoard({
  busy,
  draft,
  onDraftChange,
  onSeed,
  onStatusChange,
  onSubmit,
  tasks,
}: {
  busy: boolean
  draft: typeof initialTask
  onDraftChange: (draft: typeof initialTask) => void
  onSeed: () => Promise<void>
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  tasks: SprintTask[]
}) {
  return (
    <section className="surface sprint-surface">
      <SectionHeading
        icon={<CheckCircle2 />}
        title="Weekly sprint board"
        value={`${tasks.filter((task) => task.status === 'done').length} done`}
      />

      <div className="task-controls">
        <button
          className="secondary-action"
          disabled={busy}
          onClick={() => void onSeed()}
          type="button"
        >
          Load strategy tasks
        </button>

        <form className="task-form" onSubmit={onSubmit}>
          <label>
            Week
            <select
              onChange={(event) =>
                onDraftChange({
                  ...draft,
                  week_number: Number(event.target.value),
                })
              }
              value={draft.week_number}
            >
              {[1, 2, 3, 4].map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </label>
          <DraftInput draft={draft} field="title" label="Task" onChange={onDraftChange} required className="grow-field" />
          <DraftInput draft={draft} field="due_date" label="Due" onChange={onDraftChange} type="date" />
          <button className="primary-action" disabled={busy} type="submit">
            <Plus />
            Add
          </button>
        </form>
      </div>

      <div className="week-grid">
        {[1, 2, 3, 4].map((week) => (
          <article className="week-column" key={week}>
            <h3>Week {week}</h3>
            {tasks.filter((task) => task.week_number === week).length === 0 ? (
              <EmptyState label="No tasks yet." />
            ) : (
              tasks
                .filter((task) => task.week_number === week)
                .map((task) => (
                  <div className={`task-card status-${task.status}`} key={task.id}>
                    <strong>{task.title}</strong>
                    {task.notes && <p>{task.notes}</p>}
                    <div>
                      <span>{task.due_date || 'No due date'}</span>
                      <select
                        aria-label={`Status for ${task.title}`}
                        onChange={(event) =>
                          void onStatusChange(
                            task.id,
                            event.target.value as TaskStatus,
                          )
                        }
                        value={task.status}
                      >
                        {taskStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function DraftInput<T extends Record<string, string | number>>({
  className,
  draft,
  field,
  label,
  onChange,
  required,
  type = 'text',
}: {
  className?: string
  draft: T
  field: keyof T
  label: string
  onChange: (draft: T) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className={className}>
      {label}
      <input
        onChange={(event) =>
          onChange({ ...draft, [field]: event.target.value } as T)
        }
        required={required}
        type={type}
        value={String(draft[field])}
      />
    </label>
  )
}

function DraftTextArea<T extends Record<string, string | number>>({
  draft,
  field,
  label,
  onChange,
  rows = 2,
}: {
  draft: T
  field: keyof T
  label: string
  onChange: (draft: T) => void
  rows?: number
}) {
  return (
    <label>
      {label}
      <textarea
        onChange={(event) =>
          onChange({ ...draft, [field]: event.target.value } as T)
        }
        rows={rows}
        value={String(draft[field])}
      />
    </label>
  )
}

function MetricCard({
  current,
  label,
  target,
  targetLabel,
}: {
  current: number
  label: string
  target: number
  targetLabel: string
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{current}</strong>
      <div>
        <progress max={target} value={current} />
        <small>Target {targetLabel}</small>
      </div>
    </article>
  )
}

function SectionHeading({
  icon,
  title,
  value,
}: {
  icon: ReactNode
  title: string
  value: string
}) {
  return (
    <div className="section-heading">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <span>{value}</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <p className="empty-state">{label}</p>
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="loading-shell">
      <span />
      <p>{label}</p>
    </main>
  )
}

export default App
