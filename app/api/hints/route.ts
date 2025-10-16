import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a next-step hint
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId, hintText, actionType, priority } = await req.json()

    if (!fileId || !hintText || !actionType) {
      return NextResponse.json(
        { error: 'File ID, hint text, and action type are required' },
        { status: 400 }
      )
    }

    // Verify file exists
    const { data: file } = await supabase
      .from('files')
      .select('id')
      .eq('id', fileId)
      .single()

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const { data: hint, error } = await supabase
      .from('next_step_hints')
      .insert({
        file_id: fileId,
        hint_text: hintText,
        action_type: actionType,
        priority: priority || 1,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Hint creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create hint' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: hint })
  } catch (error) {
    console.error('Hint creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create hint' },
      { status: 500 }
    )
  }
}

// Get hints for a file
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    const { data: hints, error } = await supabase
      .from('next_step_hints')
      .select('*')
      .eq('file_id', fileId)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching hints:', error)
      return NextResponse.json(
        { error: 'Failed to fetch hints' },
        { status: 500 }
      )
    }

    // Add creator info from auth.users if needed
    const hintsWithCreator = hints?.map((hint) => ({
      ...hint,
      creator: {
        name: null,
        email: null,
      },
    }))

    return NextResponse.json({ success: true, data: hintsWithCreator })
  } catch (error) {
    console.error('Error fetching hints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hints' },
      { status: 500 }
    )
  }
}
