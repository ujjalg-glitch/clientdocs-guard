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
import { MoreHorizontal, UserPlus, Edit, Trash2, Shield, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { EditUserDialog } from '@/components/admin/edit-user-dialog'
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog'

export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [editUser, setEditUser] = useState<any>(null)
  const [deleteUser, setDeleteUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchUsers()
  }, [])

  const checkAuthAndFetchUsers = async () => {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Try to fetch users from User table (our custom table)
      const { data: usersData, error: usersError } = await supabase
        .from('User')
        .select(`
          id,
          email,
          name,
          role,
          isActive,
          createdAt
        `)
        .order('createdAt', { ascending: false })
        .limit(50)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        // If User table doesn't exist, show a helpful message
        if (usersError.message?.includes('relation "User" does not exist')) {
          setError({
            message: 'Database not set up. Please run COMPLETE_SETUP.sql in Supabase SQL Editor.',
            code: 'TABLE_NOT_EXISTS'
          })
        } else {
          setError(usersError)
        }
      } else {
        setUsers(usersData || [])
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (userRole: string) => {
    if (!userRole) {
      return <Badge variant="secondary">No Role</Badge>
    }
    
    const variant = userRole === 'super_admin' ? 'destructive' : 
                   userRole === 'admin' ? 'default' : 'secondary'
    
    return <Badge variant={variant}>{userRole}</Badge>
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="User Management"
        text="Manage users, roles, and permissions"
      >
        <Link href="/admin/users/create">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </AdminHeader>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {users?.length || 0} user(s) registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Error loading users. Make sure the database is properly set up.</p>
              <p className="text-sm mt-2">Run COMPLETE_SETUP.sql in Supabase SQL Editor</p>
            </div>
          )}

          {!error && (!users || users.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-2">Users will appear here once they register</p>
              <Link href="/admin/users/create">
                <Button className="mt-4">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create First User
                </Button>
              </Link>
            </div>
          )}

          {users && users.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {userItem.name || userItem.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {userItem.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(userItem.role)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={userItem.isActive !== false ? 'default' : 'secondary'}>
                        {userItem.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(userItem.createdAt)}
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
                          <DropdownMenuItem onClick={() => setEditUser(userItem)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Manage Roles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteUser(userItem)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
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

      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
        />
      )}

      {deleteUser && (
        <DeleteUserDialog
          userId={deleteUser.id}
          userEmail={deleteUser.email}
          open={!!deleteUser}
          onOpenChange={(open) => !open && setDeleteUser(null)}
        />
      )}
    </AdminShell>
  )
}