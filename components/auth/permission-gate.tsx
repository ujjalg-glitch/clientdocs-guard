'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PermissionGateProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function PermissionGate({
  children,
  requiredPermission,
  requiredRole,
  fallback,
  redirectTo = '/dashboard'
}: PermissionGateProps) {
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkPermissions()
  }, [requiredPermission, requiredRole])

  const checkPermissions = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // If no specific permission or role required, just check if user is authenticated
      if (!requiredPermission && !requiredRole) {
        setHasPermission(true)
        setLoading(false)
        return
      }

      // Check role-based access
      if (requiredRole) {
        const { data: userRoles, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            role (
              name
            )
          `)
          .eq('user_id', user.id)

        if (roleError) {
          console.error('Error checking roles:', roleError)
          setHasPermission(false)
          setLoading(false)
          return
        }

        const hasRequiredRole = userRoles?.some((ur: any) => ur.role?.name === requiredRole)
        
        if (!hasRequiredRole) {
          setHasPermission(false)
          setLoading(false)
          return
        }
      }

      // Check permission-based access
      if (requiredPermission) {
        const { data: userPermissions, error: permError } = await supabase
          .from('user_permissions')
          .select(`
            permission_id,
            granted,
            permission (
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('granted', true)

        if (permError) {
          console.error('Error checking permissions:', permError)
          setHasPermission(false)
          setLoading(false)
          return
        }

        const hasRequiredPermission = userPermissions?.some((up: any) => 
          up.permission?.name === requiredPermission && up.granted
        )

        if (!hasRequiredPermission) {
          setHasPermission(false)
          setLoading(false)
          return
        }
      }

      setHasPermission(true)
    } catch (error) {
      console.error('Permission check error:', error)
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {requiredRole && (
                <p>Required role: <span className="font-medium">{requiredRole}</span></p>
              )}
              {requiredPermission && (
                <p>Required permission: <span className="font-medium">{requiredPermission}</span></p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => router.push(redirectTo)} className="w-full">
                Go Back
              </Button>
              <Button variant="outline" onClick={() => router.push('/auth/login')} className="w-full">
                Sign In as Different User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}