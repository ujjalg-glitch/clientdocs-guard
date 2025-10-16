'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Lock, Eye, ExternalLink } from 'lucide-react'

interface SimplePDFViewerProps {
  url: string
  title?: string
  watermarkText?: string
  allowDownload?: boolean
  onDownload?: () => void
}

export function SimplePDFViewer({
  url,
  title = 'PDF Document',
  watermarkText = 'CONFIDENTIAL',
  allowDownload = false,
  onDownload,
}: SimplePDFViewerProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      // Fallback download
      const link = document.createElement('a')
      link.href = url
      link.download = title
      link.click()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {watermarkText && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Watermarked
              </div>
            )}
            {allowDownload && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Watermark overlay */}
          {watermarkText && (
            <div 
              className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'rgba(0, 0, 0, 0.3)',
                transform: 'rotate(-45deg)',
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
              }}
            >
              {watermarkText}
            </div>
          )}
          
          {/* PDF Viewer */}
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={url}
              width="100%"
              height="600px"
              className="border-0"
              title={title}
            />
          </div>
          
          {/* Fallback message */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              If the PDF doesn't display above, you can:
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              {allowDownload && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
