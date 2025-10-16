import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
        *,
        group:group_id (
          id,
          name,
          description,
          created_at,
          creator:created_by (
            id,
            email,
            user_metadata
          )
        )
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user groups:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user groups' },
        { status: 500 }
      )
    }

    // Transform the data
    const userGroups = memberships?.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      role: membership.role,
      joinedAt: membership.joined_at,
      createdAt: membership.group.created_at,
      creator: membership.group.creator,
    })) || []

    return NextResponse.json({ success: true, data: userGroups })
  } catch (error) {
    console.error('Error fetching user groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user groups' },
      { status: 500 }
    )
  }
}