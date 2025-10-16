'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Download, FileText } from 'lucide-react'
import {
  addWatermarkToPDF,
  extractPDFPages,
  mergePDFs,
  rotatePDFPages,
  getPDFMetadata,
} from '@/lib/pdf-utils'

export default function PDFToolsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [pageNumbers, setPageNumbers] = useState('1,2,3')
  const [rotation, setRotation] = useState<90 | 180 | 270>(90)
  const [processing, setProcessing] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setMetadata(null)
    } else {
      toast.error('Please select a PDF file')
    }
  }

  const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleAddWatermark = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const watermarkedPDF = await addWatermarkToPDF(arrayBuffer, watermarkText)
      downloadPDF(watermarkedPDF, `watermarked_${file.name}`)
      toast.success('Watermark added successfully!')
    } catch (error) {
      console.error('Watermark error:', error)
      toast.error('Failed to add watermark')
    } finally {
      setProcessing(false)
    }
  }

  const handleExtractPages = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pages = pageNumbers.split(',').map((p) => parseInt(p.trim()))
      const extractedPDF = await extractPDFPages(arrayBuffer, pages)
      downloadPDF(extractedPDF, `extracted_${file.name}`)
      toast.success('Pages extracted successfully!')
    } catch (error) {
      console.error('Extract error:', error)
      toast.error('Failed to extract pages')
    } finally {
      setProcessing(false)
    }
  }

  const handleRotatePages = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const rotatedPDF = await rotatePDFPages(arrayBuffer, rotation)
      downloadPDF(rotatedPDF, `rotated_${file.name}`)
      toast.success('Pages rotated successfully!')
    } catch (error) {
      console.error('Rotate error:', error)
      toast.error('Failed to rotate pages')
    } finally {
      setProcessing(false)
    }
  }

  const handleGetMetadata = async () => {
    if (!file) return
    setProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const meta = await getPDFMetadata(arrayBuffer)
      setMetadata(meta)
      toast.success('Metadata extracted successfully!')
    } catch (error) {
      console.error('Metadata error:', error)
      toast.error('Failed to get metadata')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="PDF Tools"
        text="Advanced PDF manipulation and processing"
      />

      <div className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Select PDF</CardTitle>
            <CardDescription>
              Choose a PDF file to work with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pdf-file">PDF File</Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PDF Tools */}
        {file && (
          <Tabs defaultValue="watermark" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="watermark">Watermark</TabsTrigger>
              <TabsTrigger value="extract">Extract</TabsTrigger>
              <TabsTrigger value="rotate">Rotate</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="watermark">
              <Card>
                <CardHeader>
                  <CardTitle>Add Watermark</CardTitle>
                  <CardDescription>
                    Add a text watermark to all pages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="watermark">Watermark Text</Label>
                    <Input
                      id="watermark"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                    />
                  </div>
                  <Button
                    onClick={handleAddWatermark}
                    disabled={processing || !watermarkText}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {processing ? 'Processing...' : 'Add Watermark'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extract">
              <Card>
                <CardHeader>
                  <CardTitle>Extract Pages</CardTitle>
                  <CardDescription>
                    Extract specific pages from the PDF
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pages">Page Numbers (comma-separated)</Label>
                    <Input
                      id="pages"
                      value={pageNumbers}
                      onChange={(e) => setPageNumbers(e.target.value)}
                      placeholder="e.g., 1,2,3"
                    />
                  </div>
                  <Button
                    onClick={handleExtractPages}
                    disabled={processing || !pageNumbers}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {processing ? 'Processing...' : 'Extract Pages'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rotate">
              <Card>
                <CardHeader>
                  <CardTitle>Rotate Pages</CardTitle>
                  <CardDescription>
                    Rotate all pages in the PDF
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Rotation Angle</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={rotation === 90 ? 'default' : 'outline'}
                        onClick={() => setRotation(90)}
                      >
                        90°
                      </Button>
                      <Button
                        variant={rotation === 180 ? 'default' : 'outline'}
                        onClick={() => setRotation(180)}
                      >
                        180°
                      </Button>
                      <Button
                        variant={rotation === 270 ? 'default' : 'outline'}
                        onClick={() => setRotation(270)}
                      >
                        270°
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleRotatePages}
                    disabled={processing}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {processing ? 'Processing...' : 'Rotate Pages'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata">
              <Card>
                <CardHeader>
                  <CardTitle>PDF Metadata</CardTitle>
                  <CardDescription>
                    View document information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleGetMetadata}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? 'Processing...' : 'Get Metadata'}
                  </Button>

                  {metadata && (
                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-medium">Page Count:</div>
                        <div>{metadata.pageCount}</div>
                        {metadata.title && (
                          <>
                            <div className="font-medium">Title:</div>
                            <div>{metadata.title}</div>
                          </>
                        )}
                        {metadata.author && (
                          <>
                            <div className="font-medium">Author:</div>
                            <div>{metadata.author}</div>
                          </>
                        )}
                        {metadata.creator && (
                          <>
                            <div className="font-medium">Creator:</div>
                            <div>{metadata.creator}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminShell>
  )
}

