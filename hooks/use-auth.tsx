'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  return { user, authenticated: !!user }
}

export async function signOut(options?: { redirect?: boolean; redirectTo?: string }) {
  const supabase = createClient()
  await supabase.auth.signOut()

  const redirect = options?.redirect ?? true
  const redirectTo = options?.redirectTo ?? '/auth/login'

  if (redirect) window.location.href = redirectTo
}
