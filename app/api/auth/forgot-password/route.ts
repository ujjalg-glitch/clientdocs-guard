import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { z } from 'zod'
import { forgotPasswordFormSchema } from '@/schemas/auth'
import { ApiResponse, STATUS_CODES } from '@/lib/http'
import { verifyCsrfAndAjax } from '@/lib/crypto'

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export async function POST(req: NextRequest) {
  const body = await req.json()
  const form = forgotPasswordFormSchema.safeParse(body)

  if (!verifyCsrfAndAjax(req)) {
    return ApiResponse.json({ message: 'Invalid csrf token' }, { status: STATUS_CODES.UNAUTHORIZED })
  }

  if (!form.success) {
    return ApiResponse.json({}, { status: STATUS_CODES.BAD_REQUEST })
  }

  // Implicit flow
  // - This URL needs to be configured in your redirect URLs:
  // - http://localhost:3000/**
  // - Your signup email template should contain the following HTML:
  // - <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

  // const supabase = await createClient()
  // const { error } = await supabase.auth.resetPasswordForEmail(form.data.email, {
  //   redirectTo: absoluteUrl('/auth/new-password'),
  // })

  // PKCE flow
  // - Your signup email template should contain the following HTML:
  // - <p><a href="{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/new-password">Reset Password</a></p>

  const supabase = await createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(form.data.email, {
    redirectTo: 'https://clientdocs-guard.vercel.app/auth/new-password'
  })

  if (error) {
    return ApiResponse.json({ message: error?.message }, { status: error?.status })
  }

  return ApiResponse.json({ message: 'An email has been sent to reset your password.' })
}
