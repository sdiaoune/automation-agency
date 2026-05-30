import type { FormEvent } from 'react'
import { useState } from 'react'
import { CheckCircle2, CircleUserRound, PhoneCall, Target } from 'lucide-react'
import { supabase } from './lib/supabase'

export function AuthScreen() {
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
