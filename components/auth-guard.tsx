"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Session } from "@supabase/supabase-js"

interface AuthGuardProps {
  children: React.ReactNode
  fallback: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-12 w-12 border-[3px] border-zinc-800 border-t-zinc-400 rounded-none animate-spin" />
            <div className="absolute inset-0 h-12 w-12 border-[3px] border-transparent border-b-zinc-600 rounded-none animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-center">
            <p className="text-[13px] text-zinc-400 font-semibold tracking-wide">Loading dashboard</p>
            <p className="text-[11px] text-zinc-600 mt-1">Verifying session...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return session
}

export async function signOut() {
  await supabase.auth.signOut()
}
