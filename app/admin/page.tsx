'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserGroups } from '@/components/dashboard/user-groups'
import { 
  Users, 
  FileText, 
  Shield, 
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { getCurrentUserRole, canAccessAdmin } from '@/lib/permissions-simple'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState({
    users: 0,
    files: 0,
    roles: 0,
    permissions: 0,
    groups: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Get user role
      const role = await getCurrentUserRole()
      setUserRole(role)

      // Get stats
      const [
        { count: userCount },
        { count: fileCount },
        { count: roleCount },
        { count: permissionCount },
        { count: groupCount }
      ] = await Promise.all([
        supabase.from('User').select('*', { count: 'exact', head: true }),
        supabase.from('files').select('*', { count: 'exact', head: true }),
        supabase.from('roles').select('*', { count: 'exact', head: true }),
        supabase.from('permissions').select('*', { count: 'exact', head: true }),
        supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])

      setStats({
        users: userCount || 0,
        files: fileCount || 0,
        roles: roleCount || 0,
        permissions: permissionCount || 0,
        groups: groupCount || 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = userRole ? canAccessAdmin(userRole) : false

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Dashboard"
        text={`Welcome back, ${user?.email || 'User'}`}
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? 'Total Users' : 'Welcome'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? stats.users : '👋'}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Registered users' : 'You are logged in'}
            </p>
            {isAdmin && (
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  Manage users →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Files
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.files}</div>
            <p className="text-xs text-muted-foreground">
              Documents uploaded
            </p>
            <Link href="/admin/files">
              <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                View files →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Group Memberships - Show for all users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Groups
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groups}</div>
            <p className="text-xs text-muted-foreground">
              Group memberships
            </p>
            {isAdmin && (
              <Link href="/admin/client-groups">
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  Manage groups →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Roles
                </CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.roles}</div>
                <p className="text-xs text-muted-foreground">
                  User roles defined
                </p>
                <Link href="/admin/roles">
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                    Manage roles →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Permissions
                </CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.permissions}</div>
                <p className="text-xs text-muted-foreground">
                  System permissions
                </p>
                <Link href="/admin/permissions">
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                    Manage permissions →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Upload - Everyone */}
            <Link href="/admin/upload">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-blue-500">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Upload File</h3>
                      <p className="text-sm text-muted-foreground">
                        Add new documents
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* View Files - Everyone */}
            <Link href="/admin/files">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-green-500">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">View Files</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your documents
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Admin Actions */}
            {isAdmin && (
              <Link href="/admin/users">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-purple-500">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Manage Users</h3>
                        <p className="text-sm text-muted-foreground">
                          Add and edit users
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Groups - Show for all users */}
      <UserGroups />
    </AdminShell>
  )
}

