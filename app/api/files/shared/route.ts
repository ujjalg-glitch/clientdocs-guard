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

    // First, get the groups the user belongs to
    const { data: userGroups } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id)

    const groupIds = userGroups?.map((g) => g.group_id) || []
    
    console.log('User groups:', groupIds)

    // Get files shared with the user directly OR through their groups
    let query = supabase
      .from('document_shares')
      .select(`
        *,
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
      .eq('is_active', true)

    // Build the OR condition
    if (groupIds.length > 0) {
      query = query.or(`shared_with.eq.${user.id},client_group_id.in.(${groupIds.join(',')})`)
    } else {
      query = query.eq('shared_with', user.id)
    }

    const { data: sharedFiles, error } = await query

    if (error) {
      console.error('Error fetching shared files:', error)
      console.error('Query details:', { userGroups, groupIds, query })
      return NextResponse.json(
        { error: 'Failed to fetch shared files', details: error.message },
        { status: 500 }
      )
    }

    console.log('Shared files found:', sharedFiles?.length || 0)
    console.log('Raw shared files:', JSON.stringify(sharedFiles, null, 2))

    // Get additional info (sharer and group details) separately
    const sharerIds = Array.from(new Set(sharedFiles?.map((s) => s.shared_by).filter(Boolean) || []))
    const groupIdsInShares = Array.from(new Set(sharedFiles?.map((s) => s.client_group_id).filter(Boolean) || []))

    // Fetch sharer info
    let sharers: any[] = []
    if (sharerIds.length > 0) {
      const { createServiceClient } = await import('@/lib/supabase/service')
      const serviceSupabase = createServiceClient()
      const { data: usersData } = await serviceSupabase.auth.admin.listUsers()
      sharers = usersData?.users?.filter((u) => sharerIds.includes(u.id)) || []
    }

    // Fetch group info
    let groups: any[] = []
    if (groupIdsInShares.length > 0) {
      const { data: groupsData } = await supabase
        .from('client_groups')
        .select('id, name, description')
        .in('id', groupIdsInShares)
      groups = groupsData || []
    }

    // Transform the data to match the expected format
    const transformedFiles = sharedFiles?.map((share) => {
      const sharer = sharers.find((s) => s.id === share.shared_by)
      const group = groups.find((g) => g.id === share.client_group_id)
      
      return {
        ...share.file,
        shareInfo: {
          id: share.id,
          sharedBy: sharer ? {
            id: sharer.id,
            email: sharer.email,
            user_metadata: sharer.user_metadata
          } : { id: share.shared_by, email: 'Unknown', user_metadata: {} },
          clientGroup: group || null,
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

    return NextResponse.json({ success: true, data: transformedFiles })
  } catch (error) {
    console.error('Error fetching shared files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared files' },
      { status: 500 }
    )
  }
}
