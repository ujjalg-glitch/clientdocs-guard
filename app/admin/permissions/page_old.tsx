import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

export default async function AdminPermissionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch permissions
  const { data: permissions, error } = await supabase
    .from('permissions')
    .select(`
      id,
      name,
      description,
      resource,
      action,
      created_at,
      updated_at
    `)
    .order('resource', { ascending: true })
    .order('action', { ascending: true })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getResourceBadge = (resource: string) => {
    const colors: { [key: string]: string } = {
      'users': 'bg-blue-100 text-blue-800',
      'files': 'bg-green-100 text-green-800',
      'posts': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800'
    }
    
    return colors[resource] || 'bg-gray-100 text-gray-800'
  }

  const getActionBadge = (action: string) => {
    const colors: { [key: string]: string } = {
      'create': 'bg-green-100 text-green-800',
      'read': 'bg-blue-100 text-blue-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'access': 'bg-purple-100 text-purple-800'
    }
    
    return colors[action] || 'bg-gray-100 text-gray-800'
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
              <p className="text-sm mt-2">Run COMPLETE_SETUP.sql in Supabase SQL Editor</p>
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
                          <p className="text-xs text-muted-foreground">ID: {permission.id}</p>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Permission
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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
    </AdminShell>
  )
}
