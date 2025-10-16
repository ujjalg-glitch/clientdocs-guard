'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getCurrentUserRole, canAccessAdmin } from '@/lib/permissions-simple'
import {
  Users,
  FileText,
  Settings,
  Shield,
  Upload,
  Home,
  Key,
  UserCircle,
  BarChart3,
  UsersRound
} from 'lucide-react'

export function AdminNav() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const loadRole = async () => {
      const role = await getCurrentUserRole()
      setUserRole(role)
    }
    loadRole()
  }, [])

  const isAdmin = userRole ? canAccessAdmin(userRole) : false

  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
      show: true,
      description: 'Overview and quick stats'
    },
    {
      title: 'My Files',
      href: '/admin/files',
      icon: FileText,
      show: true,
      description: 'View and manage your files'
    },
    {
      title: 'Upload',
      href: '/admin/upload',
      icon: Upload,
      show: true,
      description: 'Upload new documents'
    },
    {
      title: 'Profile',
      href: '/admin/profile',
      icon: UserCircle,
      show: true,
      description: 'Manage your profile'
    },
    {
      title: 'Client Groups',
      href: '/admin/client-groups',
      icon: UsersRound,
      show: isAdmin,
      description: 'Manage client groups and members'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      show: isAdmin,
      description: 'View system analytics and reports'
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      show: isAdmin,
      description: 'Manage system users'
    },
    {
      title: 'Roles',
      href: '/admin/roles',
      icon: Shield,
      show: isAdmin,
      description: 'Manage user roles'
    },
    {
      title: 'Permissions',
      href: '/admin/permissions',
      icon: Key,
      show: isAdmin,
      description: 'Configure permissions'
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      show: isAdmin,
      description: 'System settings and configuration'
    },
  ]

  return (
    <nav className="flex flex-col space-y-2">
      {navItems.filter(item => item.show).map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || 
          (item.href !== '/admin' && pathname?.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
            title={item.description}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
