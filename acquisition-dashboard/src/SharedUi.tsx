import type { ReactNode } from 'react'

export function DraftInput<T extends Record<string, string | number>>({
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

export function DraftTextArea<T extends Record<string, string | number>>({
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

export function MetricCard({
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

export function SectionHeading({
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

export function EmptyState({ label }: { label: string }) {
  return <p className="empty-state">{label}</p>
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="loading-shell">
      <span />
      <p>{label}</p>
    </main>
  )
}
