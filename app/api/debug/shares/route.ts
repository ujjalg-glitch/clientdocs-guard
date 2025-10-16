import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Debug endpoint to check shares and groups
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's groups
    const { data: userGroups, error: groupsError } = await supabase
      .from('group_members')
      .select('group_id, group:group_id(name)')
      .eq('user_id', user.id)

    console.log('User groups:', userGroups)

    // Get all document shares
    const { data: allShares, error: sharesError } = await supabase
      .from('document_shares')
      .select(`
        id,
        file_id,
        shared_by,
        shared_with,
        client_group_id,
        is_active,
        created_at,
        file:file_id(original_name),
        group:client_group_id(name)
      `)
      .eq('is_active', true)

    console.log('All shares:', allShares)

    // Get shares relevant to this user
    const groupIds = userGroups?.map((g) => g.group_id) || []
    const relevantShares = allShares?.filter((share) => 
      share.shared_with === user.id || 
      (share.client_group_id && groupIds.includes(share.client_group_id))
    )

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        userGroups: userGroups || [],
        allShares: allShares || [],
        relevantShares: relevantShares || [],
        groupIds
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
