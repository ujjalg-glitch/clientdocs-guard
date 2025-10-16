import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasRole } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ hasRole: false }, { status: 401 })
    }

    const { role } = await req.json()

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    const hasAccess = await hasRole(user.id, role)

    return NextResponse.json({ hasRole: hasAccess })
  } catch (error) {
    console.error('Role check error:', error)
    return NextResponse.json({ hasRole: false }, { status: 500 })
  }
}

