'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Download, Eye, ArrowLeft, Users, Calendar, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface GroupFile {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  created_at: string
  shareInfo: {
    id: string
    sharedBy: {
      id: string
      email: string
      user_metadata: any
    }
    createdAt: string
    accessToken: string
    viewOnly: boolean
  }
}

interface Group {
  id: string
  name: string
  description: string
  created_at: string
}

export default function GroupPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [group, setGroup] = useState<Group | null>(null)
  const [files, setFiles] = useState<GroupFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const groupId = params.groupId as string

  useEffect(() => {
    if (groupId) {
      fetchGroupFiles()
    }
  }, [groupId])

  const fetchGroupFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/files`)
      
      if (response.ok) {
        const data = await response.json()
        setGroup(data.data.group)
        setFiles(data.data.files)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch group files')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading group files...</p>
          </div>
        </div>
      </AdminShell>
    )
  }

  if (error) {
    return (
      <AdminShell>
        <AdminHeader
          heading="Error"
          text="Failed to load group"
        >
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </AdminHeader>

        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">Error Loading Group</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHeader
        heading={group?.name || 'Group Files'}
        text={group?.description || 'Files shared to this group'}
      >
        <Link href="/admin">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </AdminHeader>

      {/* Group Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">{group?.name}</h3>
              <p className="text-sm text-muted-foreground">{group?.description}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created: {group?.created_at ? formatDate(group.created_at) : 'Unknown'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Files ({files.length})</CardTitle>
          <CardDescription>
            Files shared to this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No files shared yet</p>
              <p className="text-sm mt-2">Files shared to this group will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Shared By</TableHead>
                  <TableHead>Shared On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      {file.original_name}
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {file.shareInfo.sharedBy.user_metadata?.name || 
                           file.shareInfo.sharedBy.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(file.shareInfo.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <a href={`/share/${file.shareInfo.accessToken}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </DropdownMenuItem>
                          {!file.shareInfo.viewOnly && (
                            <DropdownMenuItem asChild>
                              <a href={`/share/${file.shareInfo.accessToken}`} download>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}
