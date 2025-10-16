import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/permissions'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const { resource, action } = await req.json()

    if (!resource || !action) {
      return NextResponse.json(
        { error: 'Resource and action are required' },
        { status: 400 }
      )
    }

    const hasAccess = await hasPermission(user.id, resource, action)

    return NextResponse.json({ hasPermission: hasAccess })
  } catch (error) {
    console.error('Permission check error:', error)
    return NextResponse.json({ hasPermission: false }, { status: 500 })
  }
}

