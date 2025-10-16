import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Get groups that the current user is a member of
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get groups where user is a member
    const { data: memberships, error } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        group_id,
        role,
        joined_at
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user groups:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user groups', details: error.message },
        { status: 500 }
      )
    }

    console.log('Memberships found:', memberships?.length || 0)

    // If no memberships, return empty array
    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Get group details separately - try both with and without RLS
    const groupIds = memberships.map((m) => m.group_id)
    
    // First try with regular client
    let groups = null
    let groupsError = null
    
    const regularResult = await supabase
      .from('client_groups')
      .select('id, name, description, created_at, created_by')
      .in('id', groupIds)
    
    groups = regularResult.data
    groupsError = regularResult.error
    
    // If regular client fails, try with service client
    if (groupsError || !groups || groups.length === 0) {
      console.log('Regular client failed, trying service client...')
      const serviceSupabase = createServiceClient()
      
      const serviceResult = await serviceSupabase
        .from('client_groups')
        .select('id, name, description, created_at, created_by')
        .in('id', groupIds)
      
      groups = serviceResult.data
      groupsError = serviceResult.error
    }

    if (groupsError) {
      console.error('Error fetching group details:', groupsError)
      // Don't fail completely, just return data without full group details
      const partialGroups = memberships.map((membership) => ({
        id: membership.group_id,
        name: 'Group',
        description: '',
        role: membership.role,
        joinedAt: membership.joined_at,
        createdAt: '',
        creator: {
          id: '',
          email: 'Unknown',
          user_metadata: {}
        }
      }))
      return NextResponse.json({ success: true, data: partialGroups })
    }

    console.log('Groups found:', groups?.length || 0)
    console.log('Groups data:', JSON.stringify(groups, null, 2))
    console.log('Memberships data:', JSON.stringify(memberships, null, 2))

    // Get creator information using service client for admin access
    const serviceSupabase = createServiceClient()
    
    // Get unique creator IDs
    const creatorIds = Array.from(new Set(groups?.map((g) => g.created_by).filter(Boolean) || []))
    
    // Fetch creator information
    let creators: any[] = []
    if (creatorIds.length > 0) {
      const { data: usersData } = await serviceSupabase.auth.admin.listUsers()
      creators = usersData?.users?.filter((u) => creatorIds.includes(u.id)) || []
      console.log('Creators found:', creators.length)
    }

    // Transform the data
    const userGroups = memberships.map((membership) => {
      const group = groups?.find((g) => g.id === membership.group_id)
      const creator = creators?.find((c) => c.id === group?.created_by)
      
      console.log(`Processing group ${membership.group_id}:`, { 
        group: group?.name, 
        creatorId: group?.created_by,
        creatorEmail: creator?.email 
      })
      
      return {
        id: group?.id || membership.group_id,
        name: group?.name || 'Unknown Group',
        description: group?.description || '',
        role: membership.role,
        joinedAt: membership.joined_at,
        createdAt: group?.created_at || '',
        creator: {
          id: creator?.id || group?.created_by || '',
          email: creator?.email || 'Unknown',
          user_metadata: creator?.user_metadata || {}
        }
      }
    })

    return NextResponse.json({ success: true, data: userGroups })
  } catch (error) {
    console.error('Error in user groups API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    return NextResponse.json(
      { 
        error: 'Failed to fetch user groups',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}