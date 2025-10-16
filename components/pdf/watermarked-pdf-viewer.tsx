'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2, Lock } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker path - use a more reliable CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString()
}

interface WatermarkedPDFViewerProps {
  url: string
  title?: string
  watermarkText?: string
  allowDownload?: boolean
  onDownload?: () => void
}

export function WatermarkedPDFViewer({
  url,
  title = 'PDF Document',
  watermarkText = 'CONFIDENTIAL',
  allowDownload = false,
  onDownload,
}: WatermarkedPDFViewerProps) {
  const [pdf, setPdf] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadPDF()
  }, [url])

  useEffect(() => {
    if (pdf) {
      renderPage(currentPage)
    }
  }, [pdf, currentPage, scale])

  const loadPDF = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadingTask = pdfjsLib.getDocument(url)
      const pdfDoc = await loadingTask.promise
      setPdf(pdfDoc)
      setTotalPages(pdfDoc.numPages)
      setLoading(false)
    } catch (err) {
      console.error('Error loading PDF:', err)
      setError('Failed to load PDF document')
      setLoading(false)
    }
  }

  const renderPage = async (pageNumber: number) => {
    if (!pdf || !canvasRef.current) return

    try {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // Add watermark overlay
      if (watermarkText && context) {
        context.save()
        context.globalAlpha = 0.2
        context.font = `${50 * scale}px Arial`
        context.fillStyle = '#999999'
        context.textAlign = 'center'
        context.translate(canvas.width / 2, canvas.height / 2)
        context.rotate(-Math.PI / 4)
        context.fillText(watermarkText, 0, 0)
        context.restore()
      }
    } catch (err) {
      console.error('Error rendering page:', err)
    }
  }

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
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
            <Lock className="h-5 w-5 text-muted-foreground" />
            {title}
          </CardTitle>
          {watermarkText && (
            <span className="text-sm text-muted-foreground">
              Watermarked: {watermarkText}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center p-12 text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{Math.round(scale * 100)}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                {allowDownload && (
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-auto max-h-[600px] bg-gray-50 flex justify-center">
              <canvas ref={canvasRef} className="shadow-lg" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

