import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Access shared document via token
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient()
    const { token } = params

    // Find share by access token
    const { data: share, error } = await supabase
      .from('document_shares')
      .select('*, files(*)')
      .eq('access_token', token)
      .single()

    if (error || !share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Check if share is active
    if (!share.is_active) {
      return NextResponse.json({ error: 'Share is no longer active' }, { status: 403 })
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      await supabase
        .from('document_shares')
        .update({ is_active: false })
        .eq('id', share.id)
      return NextResponse.json({ error: 'Share has expired' }, { status: 403 })
    }

    // Check download limit
    if (share.max_downloads && share.download_count >= share.max_downloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 403 }
      )
    }

    // Log access
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await supabase.from('access_logs').insert({
      file_id: share.file_id,
      share_id: share.id,
      action: 'view',
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    // Increment view count
    await supabase
      .from('files')
      .update({ view_count: (share.files.view_count || 0) + 1 })
      .eq('id', share.file_id)

    return NextResponse.json({ success: true, data: share })
  } catch (error) {
    console.error('Share access error:', error)
    return NextResponse.json(
      { error: 'Failed to access share' },
      { status: 500 }
    )
  }
}

// Record download
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient()
    const { token } = params

    const { data: share } = await supabase
      .from('document_shares')
      .select('*, files(*)')
      .eq('access_token', token)
      .single()

    if (!share || !share.is_active) {
      return NextResponse.json({ error: 'Invalid share' }, { status: 403 })
    }

    if (share.view_only) {
      return NextResponse.json({ error: 'Download not allowed' }, { status: 403 })
    }

    // Check download limit
    if (share.max_downloads && share.download_count >= share.max_downloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 403 }
      )
    }

    // Log download
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await supabase.from('access_logs').insert({
      file_id: share.file_id,
      share_id: share.id,
      action: 'download',
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    // Increment download counts
    await Promise.all([
      supabase
        .from('document_shares')
        .update({ download_count: share.download_count + 1 })
        .eq('id', share.id),
      supabase
        .from('files')
        .update({ download_count: (share.files.download_count || 0) + 1 })
        .eq('id', share.file_id),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Download tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    )
  }
}
