import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Get files shared to a specific group
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = params

    // Check if user is a member of this group
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('group_id', groupId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get group details
    const { data: group } = await supabase
      .from('client_groups')
      .select('id, name, description, created_at')
      .eq('id', groupId)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get files shared to this group
    const { data: shares, error: sharesError } = await supabase
      .from('document_shares')
      .select(`
        id,
        file_id,
        shared_by,
        created_at,
        expires_at,
        max_downloads,
        download_count,
        watermark_enabled,
        view_only,
        access_token,
        file:file_id (
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
          uploaded_by
        )
      `)
      .eq('client_group_id', groupId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (sharesError) {
      console.error('Error fetching group files:', sharesError)
      return NextResponse.json(
        { error: 'Failed to fetch group files', details: sharesError.message },
        { status: 500 }
      )
    }

    // Get sharer information
    const sharerIds = Array.from(new Set(shares?.map((s) => s.shared_by).filter(Boolean) || []))
    let sharers: any[] = []
    
    if (sharerIds.length > 0) {
      const serviceSupabase = createServiceClient()
      const { data: usersData } = await serviceSupabase.auth.admin.listUsers()
      sharers = usersData?.users?.filter((u) => sharerIds.includes(u.id)) || []
    }

    // Transform the data
    const groupFiles = shares?.map((share) => {
      const sharer = sharers.find((s) => s.id === share.shared_by)
      
      return {
        ...share.file,
        shareInfo: {
          id: share.id,
          sharedBy: sharer ? {
            id: sharer.id,
            email: sharer.email,
            user_metadata: sharer.user_metadata
          } : { id: share.shared_by, email: 'Unknown', user_metadata: {} },
          expiresAt: share.expires_at,
          maxDownloads: share.max_downloads,
          downloadCount: share.download_count,
          watermarkEnabled: share.watermark_enabled,
          viewOnly: share.view_only,
          accessToken: share.access_token,
          createdAt: share.created_at,
        },
        isShared: true,
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        group,
        files: groupFiles
      }
    })
  } catch (error) {
    console.error('Error fetching group files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
