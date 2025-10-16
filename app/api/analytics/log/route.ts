import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Log an action
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { fileId, shareId, action } = await req.json()

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referrer = req.headers.get('referer') || null

    const { error } = await supabase.from('access_logs').insert({
      file_id: fileId || null,
      share_id: shareId || null,
      user_id: user?.id || null,
      action,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
    })

    if (error) {
      console.error('Log creation error:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log creation error:', error)
    return NextResponse.json(
      { error: 'Failed to log action' },
      { status: 500 }
    )
  }
}
