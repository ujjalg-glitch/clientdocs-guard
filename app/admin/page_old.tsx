import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Shield, 
  Key, 
  Upload, 
  BarChart3,
  TrendingUp,
  Activity,
  Database
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch dashboard statistics
  const [
    { count: userCount },
    { count: fileCount },
    { count: roleCount },
    { count: permissionCount }
  ] = await Promise.all([
    supabase.from('User').select('*', { count: 'exact', head: true }),
    supabase.from('files').select('*', { count: 'exact', head: true }),
    supabase.from('roles').select('*', { count: 'exact', head: true }),
    supabase.from('permissions').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    {
      title: 'Total Users',
      value: userCount || 0,
      icon: Users,
      description: 'Registered users',
      href: '/admin/users',
      color: 'text-blue-600'
    },
    {
      title: 'Files Uploaded',
      value: fileCount || 0,
      icon: FileText,
      description: 'Documents stored',
      href: '/admin/files',
      color: 'text-green-600'
    },
    {
      title: 'Roles',
      value: roleCount || 0,
      icon: Shield,
      description: 'User roles defined',
      href: '/admin/roles',
      color: 'text-purple-600'
    },
    {
      title: 'Permissions',
      value: permissionCount || 0,
      icon: Key,
      description: 'System permissions',
      href: '/admin/permissions',
      color: 'text-orange-600'
    }
  ]

  const quickActions = [
    {
      title: 'Upload File',
      description: 'Add new documents to the system',
      href: '/admin/upload',
      icon: Upload,
      color: 'bg-blue-500'
    },
    {
      title: 'Create User',
      description: 'Add new users to the system',
      href: '/admin/users/create',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Manage Roles',
      description: 'Configure user roles and permissions',
      href: '/admin/roles',
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      title: 'View Analytics',
      description: 'System usage and performance metrics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ]

  return (
    <AdminShell>
      <AdminHeader
        heading="Dashboard"
        text="Welcome to ClientDocs Guard"
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <Link href={stat.href}>
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                    View details →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Role System</span>
              <Badge variant="default">Configured</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">System initialized</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Admin user created</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Roles and permissions configured</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">File upload system ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}