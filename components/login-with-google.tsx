'use client'

import * as React from 'react'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/client'
import { absoluteUrl } from '@/lib/utils'

const LoginWithGoogle = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>((props, ref) => {
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

  async function onSubmit() {
    try {
      setIsSubmitting(true)

      const supabase = createClient()
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Application code configuration
          // 1. (Supabase) URL Configuration
          //   - Site URL: https://example.com
          // 2. (Google) Consent Screen configuration:
          //   - Authorized domains: <PROJECT_ID>.supabase.co
          // 3. (Google) API Credentials:
          //   - Authorized JavaScript origins: http://localhost:3000
          //   - Authorized redirect URLs: https://<your-project-ref>.supabase.co/auth/v1/callback
          redirectTo: absoluteUrl('/api/auth/callback?next=/dashboard'),
          // Google does not send out a refresh token by default,
          // so you will need to pass parameters like these to signInWithOAuth() in order to extract the provider_refresh_token:
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })

      if (result.error) throw new Error(result.error.message)
    } catch (e: unknown) {
      toast.error((e as Error)?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button ref={ref} onClick={onSubmit} disabled={isSubmitting} {...props}>
      Login with Google
    </Button>
  )
})
LoginWithGoogle.displayName = 'LoginWithGoogle'

export { LoginWithGoogle }
