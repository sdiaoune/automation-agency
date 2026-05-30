import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthScreen } from './AuthScreen'
import { Dashboard } from './Dashboard'
import { LoadingScreen } from './SharedUi'
import { supabase } from './lib/supabase'

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

export default App
