import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get analytics for user's files
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
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    if (fileId) {
      // Analytics for specific file
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fileError || !file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      if (file.uploaded_by !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Get access logs
      const { data: logs } = await supabase
        .from('access_logs')
        .select('*')
        .eq('file_id', fileId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      // Calculate stats
      const totalViews = file.view_count || 0
      const totalDownloads = file.download_count || 0
      const uniqueVisitors = new Set(
        logs?.map((log) => log.ip_address || log.user_id).filter(Boolean)
      ).size

      // Group by action
      const actionCounts = (logs || []).reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return NextResponse.json({
        success: true,
        data: {
          file: {
            id: file.id,
            name: file.original_name,
            totalViews,
            totalDownloads,
            uniqueVisitors,
          },
          stats: {
            actionCounts,
          },
          recentActivity: logs?.slice(0, 20) || [],
        },
      })
    } else {
      // Overall analytics for user's files
      const { data: files } = await supabase
        .from('files')
        .select('*')
        .eq('uploaded_by', user.id)

      const totalFiles = files?.length || 0
      const totalViews = files?.reduce((sum, f) => sum + (f.view_count || 0), 0) || 0
      const totalDownloads = files?.reduce((sum, f) => sum + (f.download_count || 0), 0) || 0

      // Get shares count
      const { data: shares } = await supabase
        .from('document_shares')
        .select('id')
        .eq('shared_by', user.id)
        .eq('is_active', true)

      const totalShares = shares?.length || 0

      // Recent activity
      const { data: recentActivity } = await supabase
        .from('access_logs')
        .select('*, files(original_name)')
        .in(
          'file_id',
          files?.map((f) => f.id) || []
        )
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      // Top files by views
      const topFiles =
        files
          ?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 10)
          .map((f) => ({
            id: f.id,
            name: f.original_name,
            views: f.view_count || 0,
            downloads: f.download_count || 0,
            shares: 0,
          })) || []

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalFiles,
            totalViews,
            totalDownloads,
            totalShares,
          },
          topFiles,
          recentActivity: recentActivity || [],
        },
      })
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
