import type { FormEvent } from 'react'
import { useState } from 'react'
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  ClipboardPlus,
  MailPlus,
  Pencil,
  Plus,
  Save,
  Send,
  Target,
  X,
} from 'lucide-react'
import {
  activityOptions,
  dailyTargets,
  emailApprovalStatusLabels,
  stageOptions,
  taskStatusOptions,
} from './strategy'
import type {
  ActivityType,
  EmailApproval,
  EmailApprovalStatus,
  OutreachActivity,
  Prospect,
  ProspectStage,
  SprintTask,
  TaskStatus,
} from './types'
import {
  activityLabel,
  buildDashboardStats,
  initialActivity,
  initialProspect,
  initialTask,
  stageLabel,
} from './dashboard-model'
import {
  DraftInput,
  DraftTextArea,
  EmptyState,
  MetricCard,
  SectionHeading,
} from './SharedUi'

type DashboardStats = ReturnType<typeof buildDashboardStats>

export function AcquisitionDashboard({
  activities,
  busy,
  dashboardStats,
  emailApprovals,
  onActivityChange,
  onActivitySubmit,
  onEmailApprovalCopyChange,
  onEmailApprovalStatusChange,
  onProspectChange,
  onProspectStageChange,
  onProspectSubmit,
  onSeedSprintBoard,
  onTaskDraftChange,
  onTaskStatusChange,
  onTaskSubmit,
  activityDraft,
  prospectDraft,
  prospects,
  taskDraft,
  tasks,
}: {
  activities: OutreachActivity[]
  busy: boolean
  dashboardStats: DashboardStats
  emailApprovals: EmailApproval[]
  onActivityChange: (draft: typeof initialActivity) => void
  onActivitySubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onEmailApprovalCopyChange: (
    id: string,
    values: Pick<EmailApproval, 'body' | 'subject'>,
  ) => Promise<boolean>
  onEmailApprovalStatusChange: (
    id: string,
    status: Extract<EmailApprovalStatus, 'approved' | 'rejected'>,
  ) => Promise<void>
  onProspectChange: (draft: typeof initialProspect) => void
  onProspectStageChange: (id: string, stage: ProspectStage) => Promise<void>
  onProspectSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onSeedSprintBoard: () => Promise<void>
  onTaskDraftChange: (draft: typeof initialTask) => void
  onTaskStatusChange: (id: string, status: TaskStatus) => Promise<void>
  onTaskSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  activityDraft: typeof initialActivity
  prospectDraft: typeof initialProspect
  prospects: Prospect[]
  taskDraft: typeof initialTask
  tasks: SprintTask[]
}) {
  return (
    <>
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
                    prospects.filter(
                      (prospect) => prospect.stage === stage.value,
                    ).length
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
                    {prospect.next_follow_up_date} /{' '}
                    {stageLabel(prospect.stage)}
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
          onChange={onProspectChange}
          onSubmit={onProspectSubmit}
          total={prospects.length}
        />
        <ActivityEntry
          activities={activities}
          busy={busy}
          draft={activityDraft}
          onChange={onActivityChange}
          onSubmit={onActivitySubmit}
          prospects={prospects}
        />
      </section>

      <ProspectTable
        onStageChange={onProspectStageChange}
        prospects={prospects}
      />

      <EmailApprovalQueue
        approvals={emailApprovals}
        onCopyChange={onEmailApprovalCopyChange}
        onStatusChange={onEmailApprovalStatusChange}
        prospects={prospects}
      />

      <SprintBoard
        busy={busy}
        draft={taskDraft}
        onDraftChange={onTaskDraftChange}
        onSeed={onSeedSprintBoard}
        onStatusChange={onTaskStatusChange}
        onSubmit={onTaskSubmit}
        tasks={tasks}
      />
    </>
  )
}

function EmailApprovalQueue({
  approvals,
  onCopyChange,
  onStatusChange,
  prospects,
}: {
  approvals: EmailApproval[]
  onCopyChange: (
    id: string,
    values: Pick<EmailApproval, 'body' | 'subject'>,
  ) => Promise<boolean>
  onStatusChange: (
    id: string,
    status: Extract<EmailApprovalStatus, 'approved' | 'rejected'>,
  ) => Promise<void>
  prospects: Prospect[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ body: '', subject: '' })
  const prospectsById = new Map(
    prospects.map((prospect) => [prospect.id, prospect]),
  )

  function startEditing(approval: EmailApproval) {
    setEditingId(approval.id)
    setEditDraft({ body: approval.body, subject: approval.subject })
  }

  function cancelEditing() {
    setEditingId(null)
    setEditDraft({ body: '', subject: '' })
  }

  async function saveEditing(approval: EmailApproval) {
    const saved = await onCopyChange(approval.id, editDraft)
    if (saved) {
      cancelEditing()
    }
    return saved
  }

  async function saveAndApprove(approval: EmailApproval) {
    const saved = await saveEditing(approval)
    if (saved) {
      await onStatusChange(approval.id, 'approved')
    }
  }

  return (
    <section className="surface approval-surface">
      <SectionHeading
        icon={<Send />}
        title="Email approvals"
        value={`${approvals.filter((approval) => approval.status === 'draft' || approval.status === 'failed').length} review`}
      />
      {approvals.length === 0 ? (
        <EmptyState label="Agent-created email drafts will wait here for approval." />
      ) : (
        <div className="approval-list">
          {approvals.slice(0, 10).map((approval) => {
            const prospect = approval.prospect_id
              ? prospectsById.get(approval.prospect_id)
              : null
            const reviewable =
              approval.status === 'draft' ||
              approval.status === 'failed' ||
              approval.status === 'approved'
            const isEditing = editingId === approval.id

            return (
              <article className="approval-row" key={approval.id}>
                <div className="approval-meta">
                  <strong>{prospect?.company_name || approval.recipient_email}</strong>
                  <span>
                    {approval.recipient_email} /{' '}
                    {emailApprovalStatusLabels[approval.status]}
                  </span>
                </div>
                {isEditing ? (
                  <div className="approval-editor">
                    <label>
                      Subject
                      <input
                        onChange={(event) =>
                          setEditDraft((currentDraft) => ({
                            ...currentDraft,
                            subject: event.target.value,
                          }))
                        }
                        value={editDraft.subject}
                      />
                    </label>
                    <label>
                      Email body
                      <textarea
                        onChange={(event) =>
                          setEditDraft((currentDraft) => ({
                            ...currentDraft,
                            body: event.target.value,
                          }))
                        }
                        rows={7}
                        value={editDraft.body}
                      />
                    </label>
                    {approval.last_error && <small>{approval.last_error}</small>}
                  </div>
                ) : (
                  <div className="approval-copy">
                    <strong>{approval.subject}</strong>
                    <p>{approval.body}</p>
                    {approval.last_error && <small>{approval.last_error}</small>}
                  </div>
                )}
                {reviewable && (
                  <div className="approval-actions">
                    {isEditing ? (
                      <>
                        <button
                          className="secondary-action"
                          onClick={() => void saveEditing(approval)}
                          type="button"
                        >
                          <Save />
                          Save
                        </button>
                        <button
                          className="secondary-action"
                          disabled={approval.status === 'approved'}
                          onClick={() => void saveAndApprove(approval)}
                          type="button"
                        >
                          <CheckCircle2 />
                          Save & Approve
                        </button>
                        <button
                          className="text-action reject-action"
                          onClick={cancelEditing}
                          type="button"
                        >
                          <X />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="secondary-action"
                          onClick={() => startEditing(approval)}
                          type="button"
                        >
                          <Pencil />
                          Edit
                        </button>
                        <button
                          className="secondary-action"
                          disabled={approval.status === 'approved'}
                          onClick={() =>
                            void onStatusChange(approval.id, 'approved')
                          }
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="text-action reject-action"
                          onClick={() =>
                            void onStatusChange(approval.id, 'rejected')
                          }
                          type="button"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
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
