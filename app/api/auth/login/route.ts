import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { z } from 'zod'
import { loginFormSchema } from '@/schemas/auth'
import { ApiResponse, STATUS_CODES } from '@/lib/http'
import { verifyCsrfAndAjax } from '@/lib/crypto'

type LoginFormValues = z.infer<typeof loginFormSchema>

export async function POST(req: NextRequest) {
  const body = await req.json()
  const form = loginFormSchema.safeParse(body)

  if (!verifyCsrfAndAjax(req)) {
    return ApiResponse.json({ user: null, message: 'Invalid csrf token' }, { status: STATUS_CODES.UNAUTHORIZED })
  }

  if (!form.success) {
    return ApiResponse.json({ user: null }, { status: STATUS_CODES.BAD_REQUEST })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email: form.data.email, password: form.data.password })

  if (error || !user) {
    return ApiResponse.json({ user: null, message: error?.message }, { status: error?.status })
  }

  return ApiResponse.json({ user, message: 'You have successfully logged in' })
}
