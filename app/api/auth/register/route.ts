import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { z } from 'zod'
import { registerFormSchema } from '@/schemas/auth'
import { ApiResponse, STATUS_CODES } from '@/lib/http'
import { verifyCsrfAndAjax } from '@/lib/crypto'

type RegisterFormValues = z.infer<typeof registerFormSchema>

export async function POST(req: NextRequest) {
  const body = await req.json()
  const form = registerFormSchema.safeParse(body)

  if (!verifyCsrfAndAjax(req)) {
    return ApiResponse.json({ user: null, message: 'Invalid csrf token' }, { status: STATUS_CODES.UNAUTHORIZED })
  }

  if (!form.success) {
    return ApiResponse.json({ user: null }, { status: STATUS_CODES.BAD_REQUEST })
  }

  // Email authentication is enabled by default.
  //
  // You can configure whether users need to verify their email to sign in.
  // On hosted Supabase projects, this is true by default.
  // On self-hosted projects or in local development, this is false by default.
  //
  // Change this setting on the Auth Providers page for hosted projects,
  // or in the configuration file for self-hosted projects.
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({ email: form.data.email, password: form.data.newPassword })

  if (error || !user) {
    return ApiResponse.json({ user: null, message: error?.message }, { status: error?.status })
  }

  return ApiResponse.json({ user, message: 'You have registered successfully' })
}
