import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Update share
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

    // Verify share exists and user owns it
    const { data: share } = await supabase
      .from('document_shares')
      .select('shared_by')
      .eq('id', id)
      .single()

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    if (share.shared_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update share
    const { data: updatedShare, error } = await supabase
      .from('document_shares')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, files(original_name, mime_type)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data: updatedShare })
  } catch (error) {
    console.error('Share update error:', error)
    return NextResponse.json(
      { error: 'Failed to update share' },
      { status: 500 }
    )
  }
}

// Delete/deactivate share
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

    // Verify share exists and user owns it
    const { data: share } = await supabase
      .from('document_shares')
      .select('shared_by')
      .eq('id', id)
      .single()

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    if (share.shared_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Deactivate share (soft delete)
    const { error } = await supabase
      .from('document_shares')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    )
  }
}
