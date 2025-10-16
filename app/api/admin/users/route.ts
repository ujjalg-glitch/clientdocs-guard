import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query auth.users table for all users
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map users to expected format
    const mappedUsers = users.users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.email,
      role: u.user_metadata?.role || 'user',
      createdAt: u.created_at,
      isActive: !u.banned_at
    }))

    return NextResponse.json({ 
      success: true, 
      data: mappedUsers 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role, isActive } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use service client for admin operations
    const serviceClient = createServiceClient()

    // Create user in auth
    const { data: authData, error: authCreateError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: role || 'user'
      }
    })

    if (authCreateError || !authData.user) {
      return NextResponse.json(
        { error: authCreateError?.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user in database
    const { data: userData, error: dbError } = await supabase
      .from('User')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: role || 'user',
        isActive: isActive !== false
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ user: userData }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

