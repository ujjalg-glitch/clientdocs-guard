'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Key, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const RESOURCES = ['users', 'files', 'posts', 'admin', 'roles', 'permissions']
const ACTIONS = ['create', 'read', 'update', 'delete', 'access', 'manage']

export default function CreatePermissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Auto-generate name if not provided
      const permissionName = formData.name || `${formData.resource}.${formData.action}`

      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: permissionName
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create permission')
      }

      toast.success('Permission created successfully!')
      router.push('/admin/permissions')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating permission:', error)
      toast.error(error.message || 'Failed to create permission')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-update name when resource or action changes
    if (field === 'resource' || field === 'action') {
      const resource = field === 'resource' ? value : formData.resource
      const action = field === 'action' ? value : formData.action
      
      if (resource && action && !formData.name) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          name: `${resource}.${action}`
        }))
      }
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Create New Permission"
        text="Add a new permission to the system"
      >
        <Link href="/admin/permissions">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Permissions
          </Button>
        </Link>
      </AdminHeader>

      <Card>
        <CardHeader>
          <CardTitle>Permission Information</CardTitle>
          <CardDescription>
            Fill in the details to create a new permission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resource">Resource *</Label>
                <Select value={formData.resource} onValueChange={(value) => handleInputChange('resource', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map((resource) => (
                      <SelectItem key={resource} value={resource}>
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  What this permission applies to
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action *</Label>
                <Select value={formData.action} onValueChange={(value) => handleInputChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  What action can be performed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Permission Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Auto-generated from resource.action"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Will be auto-generated as "{formData.resource && formData.action ? `${formData.resource}.${formData.action}` : 'resource.action'}" if left blank
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this permission allows"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.resource || !formData.action}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Create Permission
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  )
}

