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
import { MoreHorizontal, Key, Edit, Trash2, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { EditPermissionDialog } from '@/components/admin/edit-permission-dialog'
import { DeletePermissionDialog } from '@/components/admin/delete-permission-dialog'

export default function AdminPermissionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [editPermission, setEditPermission] = useState<any>(null)
  const [deletePermission, setDeletePermission] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchPermissions()
  }, [])

  const checkAuthAndFetchPermissions = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true })

      if (permissionsError) {
        setError(permissionsError)
      } else {
        setPermissions(permissionsData || [])
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getResourceBadge = (resource: string) => {
    const colors: { [key: string]: string } = {
      'users': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'files': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'posts': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'roles': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'permissions': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    }

    return colors[resource] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  const getActionBadge = (action: string) => {
    const colors: { [key: string]: string } = {
      'create': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'read': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'update': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'delete': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'access': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'manage': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }

    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading permissions...</p>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Permission Management"
        text="Manage system permissions and access controls"
      >
        <Link href="/admin/permissions/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </Link>
      </AdminHeader>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            {permissions?.length || 0} permission(s) defined
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Error loading permissions. Make sure the database is properly set up.</p>
              <p className="text-sm mt-2">Run DROP_AND_CREATE_DATABASE.sql in Supabase SQL Editor</p>
            </div>
          )}

          {!error && (!permissions || permissions.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No permissions found</p>
              <p className="text-sm mt-2">Permissions will appear here once they are created</p>
              <Link href="/admin/permissions/create">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Permission
                </Button>
              </Link>
            </div>
          )}

          {permissions && permissions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {permission.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getResourceBadge(permission.resource)}>
                        {permission.resource}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionBadge(permission.action)}>
                        {permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {permission.description || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {formatDate(permission.created_at)}
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
                          <DropdownMenuItem onClick={() => setEditPermission(permission)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Permission
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeletePermission(permission)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permission
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

      {editPermission && (
        <EditPermissionDialog
          permission={editPermission}
          open={!!editPermission}
          onOpenChange={(open) => !open && setEditPermission(null)}
        />
      )}

      {deletePermission && (
        <DeletePermissionDialog
          permissionId={deletePermission.id}
          permissionName={deletePermission.name}
          open={!!deletePermission}
          onOpenChange={(open) => !open && setDeletePermission(null)}
        />
      )}
    </AdminShell>
  )
}

