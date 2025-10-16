import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a new client group
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, memberIds } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('client_groups')
      .insert({
        name,
        description: description || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      console.error('Group creation error:', groupError)
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      const { error: memberError } = await supabase
        .from('group_members')
        .insert(
          memberIds.map((userId: string) => ({
            group_id: group.id,
            user_id: userId,
            role: 'member',
          }))
        )

      if (memberError) {
        console.error('Member addition error:', memberError)
      }
    }

    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    console.error('Group creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}

// Get all client groups
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get groups created by user or where user is a member
    const { data: groups, error } = await supabase
      .from('client_groups')
      .select(`
        *,
        group_members (
          id,
          user_id,
          role,
          joined_at
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      )
    }

    // Filter to only groups user has access to
    const filteredGroups = groups?.filter(
      (group) =>
        group.created_by === user.id ||
        group.group_members?.some((m: any) => m.user_id === user.id)
    )

    // Add counts
    const groupsWithCounts = filteredGroups?.map((group) => ({
      ...group,
      _count: {
        members: group.group_members?.length || 0,
        shares: 0, // TODO: Add shares count
      },
    }))

    return NextResponse.json({ success: true, data: groupsWithCounts })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

