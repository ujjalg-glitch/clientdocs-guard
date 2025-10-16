'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserRole, canAccessAdmin } from '@/lib/permissions-simple'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredRole?: 'super_admin' | 'admin' | 'user'
  fallback?: React.ReactNode
}

export function PermissionGuard({ children, requiredRole, fallback }: PermissionGuardProps) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    const role = await getCurrentUserRole()
    setUserRole(role)
    setLoading(false)

    // If no role and required, redirect
    if (!role && requiredRole) {
      router.push('/auth/login')
      return
    }

    // Check if user has required role
    if (requiredRole) {
      const roleHierarchy = {
        super_admin: 3,
        admin: 2,
        user: 1
      }

      const userLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0

      if (userLevel < requiredLevel) {
        if (fallback) {
          return
        }
        router.push('/admin')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Check permission
  if (requiredRole && userRole) {
    const roleHierarchy = {
      super_admin: 3,
      admin: 2,
      user: 1
    }

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    if (userLevel < requiredLevel) {
      return fallback || null
    }
  }

  return <>{children}</>
}

