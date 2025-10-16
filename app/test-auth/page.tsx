import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestAuthPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>❌ Not authenticated</p>
          <p>Please <a href="/auth/login" className="underline">login</a> first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p>✅ Successfully authenticated!</p>
        <div className="mt-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4">
        <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Go to Dashboard
        </a>
        <a href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded">
          Go to Admin
        </a>
      </div>
    </div>
  )
}
