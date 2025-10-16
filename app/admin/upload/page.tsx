import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { FileUploadForm } from '@/components/admin/file-upload-form'

export default async function AdminUploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Upload Files"
        text="Upload your documents and files"
      />
      
      <div className="max-w-2xl">
        <FileUploadForm />
      </div>
    </AdminShell>
  )
}
