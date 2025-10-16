import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get files shared with the current user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get files shared with the user through groups
    const { data: sharedFiles, error } = await supabase
      .from('document_shares')
      .select(`
        *,
        file:files (
          id,
          filename,
          original_name,
          mime_type,
          size,
          url,
          watermark_text,
          expires_at,
          download_count,
          view_count,
          created_at,
          uploader:uploaded_by
        ),
        sharer:shared_by (
          id,
          email,
          user_metadata
        ),
        client_group:client_group_id (
          id,
          name,
          description
        )
      `)
      .eq('is_active', true)
      .or(`shared_with.eq.${user.id},client_group_id.in.(
        select group_id from group_members where user_id = '${user.id}'
      )`)

    if (error) {
      console.error('Error fetching shared files:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shared files' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedFiles = sharedFiles?.map((share) => ({
      ...share.file,
      shareInfo: {
        id: share.id,
        sharedBy: share.sharer,
        clientGroup: share.client_group,
        expiresAt: share.expires_at,
        maxDownloads: share.max_downloads,
        downloadCount: share.download_count,
        watermarkEnabled: share.watermark_enabled,
        viewOnly: share.view_only,
        accessToken: share.access_token,
        createdAt: share.created_at,
      },
      isShared: true,
    })) || []

    return NextResponse.json({ success: true, data: transformedFiles })
  } catch (error) {
    console.error('Error fetching shared files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared files' },
      { status: 500 }
    )
  }
}
