'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploadForm } from '@/components/admin/file-upload-form'

export default function UploadPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Upload Files"
        text="Upload and manage your documents"
      />
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload PDF files and other documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadForm />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

