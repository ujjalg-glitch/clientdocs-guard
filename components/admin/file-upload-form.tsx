'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  // New options
  const [watermarkText, setWatermarkText] = useState('')
  const [enableWatermark, setEnableWatermark] = useState(false)
  const [expiryDays, setExpiryDays] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please select a PDF or image file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setUploadSuccess(false)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreviewUrl(null)
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadProgress(0)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to upload files')
        return
      }

      // Create unique filename
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const filePath = `uploads/${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      setUploadProgress(70)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      setUploadProgress(90)

      // Calculate expiry date if set
      const expiresAt = expiryDays
        ? new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString()
        : null

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          id: crypto.randomUUID(),
          filename: fileName,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          path: filePath,
          url: urlData.publicUrl,
          is_public: false,
          uploaded_by: user.id,
          watermark_text: enableWatermark && watermarkText ? watermarkText : null,
          expires_at: expiresAt,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        toast.error('File uploaded but failed to save metadata')
      }

      setUploadProgress(100)
      setUploadSuccess(true)
      toast.success('File uploaded successfully!')

      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null)
        setPreviewUrl(null)
        setUploadProgress(0)
        setUploadSuccess(false)
        setWatermarkText('')
        setEnableWatermark(false)
        setExpiryDays('')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
    setUploadSuccess(false)
    setUploadProgress(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload PDF documents or images. Maximum file size: 10MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              disabled={uploading}
              className="cursor-pointer"
            />
            {file && !uploading && (
              <Button
                variant="outline"
                size="icon"
                onClick={removeFile}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* File Preview */}
        {file && (
          <div className="space-y-4">
            {/* Upload Options */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Upload Options</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-watermark">Enable Watermark</Label>
                  <p className="text-xs text-muted-foreground">
                    Add watermark text to the document
                  </p>
                </div>
                <Switch
                  id="enable-watermark"
                  checked={enableWatermark}
                  onCheckedChange={setEnableWatermark}
                />
              </div>

              {enableWatermark && (
                <div className="space-y-2">
                  <Label htmlFor="watermark-text">Watermark Text</Label>
                  <Input
                    id="watermark-text"
                    placeholder="e.g., CONFIDENTIAL"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expiry">Auto-Delete After (Optional)</Label>
                <Select value={expiryDays || 'never'} onValueChange={(value) => setExpiryDays(value === 'never' ? '' : value)}>
                  <SelectTrigger id="expiry">
                    <SelectValue placeholder="Never expires" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">180 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {file.type === 'application/pdf' ? (
                    <FileText className="h-12 w-12 text-red-500" />
                  ) : (
                    previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded"
                      />
                    )
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file.type}
                  </p>
                </div>
                {uploadSuccess && (
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            {!uploadSuccess && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            )}

            {uploadSuccess && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  File uploaded successfully!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        {!file && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>PDF documents (.pdf)</li>
                <li>Images (.png, .jpg, .jpeg)</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
    </Card>
  )
}
