'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Download, Eye, Trash2, FileText, Image as ImageIcon, Share2, BarChart3, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShareDialog } from '@/components/files/share-dialog'
import { ExplainToClient } from '@/components/files/explain-to-client'
import Link from 'next/link'

export default function AdminFilesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchFiles()
  }, [])

  const checkAuthAndFetchFiles = async () => {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Get user's role from database
      const { data: userData } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single()

      const userRole = userData?.role || 'user'
      const isAdmin = ['admin', 'super_admin'].includes(userRole)

      // Fetch files from database
      // Admins see all files, regular users see only their own
      let query = supabase
        .from('files')
        .select('*')

      if (!isAdmin) {
        query = query.eq('uploaded_by', user.id)
      }

      const { data: filesData, error: filesError } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (filesError) {
        setError(filesError)
      } else {
        setFiles(filesData || [])
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading files...</p>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="My Files"
        text="View and manage your documents"
      >
        <Link href="/admin/upload">
          <Button>Upload New File</Button>
        </Link>
      </AdminHeader>

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {files?.length || 0} file(s) uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Error loading files. Make sure the files table exists in your database.</p>
              <p className="text-sm mt-2">Run basic_setup.sql in Supabase SQL Editor</p>
            </div>
          )}

          {!error && (!files || files.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No files uploaded yet</p>
              <p className="text-sm mt-2">Upload your first document to get started</p>
              <Link href="/admin/upload">
                <Button className="mt-4">Upload File</Button>
              </Link>
            </div>
          )}

          {files && files.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.mime_type)}
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[300px]">
                            {file.original_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {file.filename}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {file.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{file.view_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{file.download_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={file.is_public ? 'default' : 'secondary'}>
                          {file.is_public ? 'Public' : 'Private'}
                        </Badge>
                        {file.watermark_text && (
                          <Badge variant="outline" className="text-xs">
                            Watermarked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(file.created_at).toLocaleDateString()}</p>
                        {file.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(file.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const a = document.createElement('a')
                            a.href = file.url
                            a.download = file.original_name
                            a.click()
                          }}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <ShareDialog
                            fileId={file.id}
                            fileName={file.original_name}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                            }
                          />
                          <ExplainToClient
                            fileId={file.id}
                            fileName={file.original_name}
                            documentContent=""
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Explain to Client
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/analytics?fileId=${file.id}`}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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

