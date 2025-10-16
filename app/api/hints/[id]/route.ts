import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Update hint
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const updates = await req.json()

    const { data: hint } = await supabase
      .from('next_step_hints')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!hint) {
      return NextResponse.json({ error: 'Hint not found' }, { status: 404 })
    }

    if (hint.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: updatedHint, error } = await supabase
      .from('next_step_hints')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data: updatedHint })
  } catch (error) {
    console.error('Hint update error:', error)
    return NextResponse.json(
      { error: 'Failed to update hint' },
      { status: 500 }
    )
  }
}

// Delete hint
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const { data: hint } = await supabase
      .from('next_step_hints')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!hint) {
      return NextResponse.json({ error: 'Hint not found' }, { status: 404 })
    }

    if (hint.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('next_step_hints')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hint deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete hint' },
      { status: 500 }
    )
  }
}
