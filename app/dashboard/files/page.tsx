'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShareDialog } from '@/components/files/share-dialog'
import { ExplainToClient } from '@/components/files/explain-to-client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, Eye, Upload, Share2, BarChart3, MessageSquare, Users } from 'lucide-react'
import Link from 'next/link'

export default function FilesPage() {
  const supabase = createClient()
  const [files, setFiles] = useState<any[]>([])
  const [sharedFiles, setSharedFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'my-files' | 'shared-files'>('my-files')

  useEffect(() => {
    fetchFiles()
    fetchSharedFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get files uploaded by current user
      const { data: filesData, error } = await supabase
        .from('files')
        .select('*')
        .eq('uploaded_by', user?.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setFiles(filesData || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const fetchSharedFiles = async () => {
    try {
      const response = await fetch('/api/files/shared')
      if (response.ok) {
        const data = await response.json()
        setSharedFiles(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching shared files:', error)
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
      <DashboardShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading files...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Files"
        text="View and manage your uploaded documents"
      >
        <Link href="/dashboard/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </Link>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {activeTab === 'my-files' 
              ? `${files?.length || 0} file(s) uploaded`
              : `${sharedFiles?.length || 0} file(s) shared with you`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my-files' | 'shared-files')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-files">
                <Upload className="h-4 w-4 mr-2" />
                My Files ({files?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="shared-files">
                <Users className="h-4 w-4 mr-2" />
                Shared with Me ({sharedFiles?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-files" className="mt-6">
              {files.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No files uploaded yet</p>
                  <p className="text-sm mt-2">Upload your first document to get started</p>
                  <Link href="/dashboard/upload">
                    <Button className="mt-4">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </Link>
                </div>
              ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {file.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        {file.watermark_text && (
                          <Badge variant="secondary" className="text-xs">
                            Watermarked
                          </Badge>
                        )}
                      </div>
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
                      <div>
                        <p className="text-sm">{formatDate(file.created_at)}</p>
                        {file.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(file.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {file.url && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const a = document.createElement('a')
                                a.href = file.url
                                a.download = file.original_name
                                a.click()
                              }}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <ShareDialog
                              fileId={file.id}
                              fileName={file.original_name}
                              trigger={
                                <Button variant="ghost" size="sm" title="Share">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <ExplainToClient
                              fileId={file.id}
                              fileName={file.original_name}
                              documentContent=""
                              trigger={
                                <Button variant="ghost" size="sm" title="Explain to Client">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Link href={`/admin/analytics?fileId=${file.id}`}>
                              <Button variant="ghost" size="sm" title="View Analytics">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              )}
            </TabsContent>

            <TabsContent value="shared-files" className="mt-6">
              {sharedFiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No files shared with you yet</p>
                  <p className="text-sm mt-2">Files shared through client groups will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Shared By</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Shared</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sharedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
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
                          <div className="text-sm">
                            <p className="font-medium">
                              {file.shareInfo?.sharedBy?.user_metadata?.name || 
                               file.shareInfo?.sharedBy?.email || 
                               'Unknown User'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {file.shareInfo?.clientGroup ? (
                            <Badge variant="secondary">
                              {file.shareInfo.clientGroup.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Direct Share</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {formatDate(file.shareInfo?.createdAt || file.created_at)}
                            </p>
                            {file.shareInfo?.expiresAt && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {formatDate(file.shareInfo.expiresAt)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {file.url && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.url, '_blank')}
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {!file.shareInfo?.viewOnly && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const a = document.createElement('a')
                                      a.href = file.url
                                      a.download = file.original_name
                                      a.click()
                                    }}
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/share/${file.shareInfo?.accessToken}`, '_blank')}
                                  title="View Shared Link"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

