import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { relativeUrl } from '@/lib/utils'

// Password-based Auth
// https://supabase.com/docs/guides/auth/passwords
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = relativeUrl(next)

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    // redirect user to specified redirect URL or root of app
    if (!error) return NextResponse.redirect(redirectTo)
  }

  // redirect the user to an error page with some instructions
  redirectTo.pathname = '/auth/error'
  return NextResponse.redirect(redirectTo)
}
