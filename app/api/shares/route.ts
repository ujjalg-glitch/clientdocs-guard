import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

// Create a new share
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      fileId,
      sharedWith,
      clientGroupId,
      expiresAt,
      maxDownloads,
      watermarkEnabled,
      viewOnly,
    } = await req.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Verify file exists
    const { data: file } = await supabase
      .from('files')
      .select('id, original_name')
      .eq('id', fileId)
      .single()

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Generate secure access token
    const accessToken = nanoid(32)

    // Create share
    const { data: share, error } = await supabase
      .from('document_shares')
      .insert({
        file_id: fileId,
        shared_by: user.id,
        shared_with: sharedWith || null,
        client_group_id: clientGroupId || null,
        access_token: accessToken,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        max_downloads: maxDownloads || null,
        watermark_enabled: watermarkEnabled || false,
        view_only: viewOnly || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Share creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create share' },
        { status: 500 }
      )
    }

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${accessToken}`

    return NextResponse.json({
      success: true,
      data: {
        ...share,
        shareUrl,
      },
    })
  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    )
  }
}

// Get all shares created by user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: shares, error } = await supabase
      .from('document_shares')
      .select('*, files(original_name, mime_type, size)')
      .eq('shared_by', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shares:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shares' },
        { status: 500 }
      )
    }

    // Add share URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const sharesWithUrls = shares?.map((share) => ({
      ...share,
      shareUrl: `${baseUrl}/share/${share.access_token}`,
    }))

    return NextResponse.json({ success: true, data: sharesWithUrls })
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}
