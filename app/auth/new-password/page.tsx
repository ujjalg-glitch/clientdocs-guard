import * as React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NewPasswordForm } from '@/components/new-password-form'

export default async function NewPasswordPage({
  params,
  searchParams,
}: {
  params: {}
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const token_hash = searchParams?.token_hash?.toString()
  const type = searchParams?.type?.toString()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/forgot-password')
  else if (!token_hash) redirect('/auth/forgot-password')
  else if (!token_hash.startsWith('pkce_')) redirect('/auth/forgot-password')
  else if (type !== 'recovery') redirect('/auth/forgot-password')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Please enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <NewPasswordForm />
        <div className="mt-4 text-center text-sm">
          <ArrowLeft className="-ml-4 inline size-4" />
          {` Back to `}
          <Link href="/auth/login" className="underline underline-offset-4">
            sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
