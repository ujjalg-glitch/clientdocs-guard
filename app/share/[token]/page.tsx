'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SimplePDFViewer } from '@/components/pdf/simple-pdf-viewer'
import { FileQAChat } from '@/components/files/file-qa-chat'
import { NextStepHints } from '@/components/files/next-step-hints'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Lock,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

export default function SharedDocumentPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [share, setShare] = useState<any>(null)
  const [documentContent, setDocumentContent] = useState('')

  useEffect(() => {
    if (token) {
      loadShare()
    }
  }, [token])

  const loadShare = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/shares/access/${token}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load share')
      }

      const data = await response.json()
      setShare(data.data)

      // Load document content for Q&A if it's a text/PDF file
      if (data.data.file.url) {
        try {
          const contentResponse = await fetch(data.data.file.url)
          const content = await contentResponse.text()
          setDocumentContent(content.substring(0, 10000)) // Limit content size
        } catch (err) {
          console.error('Error loading document content:', err)
        }
      }
    } catch (err: any) {
      console.error('Error loading share:', err)
      setError(err.message || 'Failed to load shared document')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!share || share.viewOnly) {
      toast.error('Download is not allowed for this document')
      return
    }

    try {
      // Track download
      await fetch(`/api/shares/access/${token}`, {
        method: 'POST',
      })

      // Download file
      const link = document.createElement('a')
      link.href = share.file.url
      link.download = share.file.originalName
      link.click()

      toast.success('Download started')
      
      // Reload to update download count
      loadShare()
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPDF = share.file.mimeType === 'application/pdf'
  const expiresAt = share.expiresAt ? new Date(share.expiresAt) : null
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <FileText className="h-6 w-6" />
                {share.file.originalName}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Shared by {share.sharer.name || share.sharer.email}
                </span>
                {expiresAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {daysUntilExpiry && daysUntilExpiry > 0
                      ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`
                      : 'Expired'}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {share.watermarkEnabled && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Watermarked
                </Badge>
              )}
              {share.viewOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View Only
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Size: {(share.file.size / 1024).toFixed(2)} KB</span>
            <span>Type: {share.file.mimeType}</span>
            {share.maxDownloads && (
              <span>
                Downloads: {share.downloadCount}/{share.maxDownloads}
              </span>
            )}
          </div>
          {!share.viewOnly && (
            <Button
              onClick={handleDownload}
              className="mt-4"
              disabled={
                share.maxDownloads &&
                share.downloadCount >= share.maxDownloads
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download Document
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="hints">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {isPDF ? (
            <SimplePDFViewer
              url={share.file.url}
              title={share.file.originalName}
              watermarkText={
                share.watermarkEnabled
                  ? `SHARED WITH ${share.sharer.name?.toUpperCase() || 'CLIENT'}`
                  : undefined
              }
              allowDownload={!share.viewOnly}
              onDownload={handleDownload}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>File Preview</CardTitle>
                <CardDescription>
                  Preview not available for this file type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please download the file to view its contents.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="qa">
          {documentContent ? (
            <FileQAChat
              fileId={share.file.id}
              fileName={share.file.originalName}
              documentContent={documentContent}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Q&A not available for this document type</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hints">
          <NextStepHints fileId={share.file.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

