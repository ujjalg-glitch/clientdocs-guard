'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  User, 
  Users, 
  BarChart3, 
  Settings,
  Home
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUserRole, canAccessAdmin } from '@/lib/permissions-simple'

export function SidebarNav() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const loadRole = async () => {
      const role = await getCurrentUserRole()
      setUserRole(role)
    }
    loadRole()
  }, [])

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true
    },
    {
      title: 'My Files',
      href: '/dashboard/files',
      icon: FileText,
      show: true
    },
    {
      title: 'Upload',
      href: '/dashboard/upload',
      icon: Upload,
      show: true
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      show: true
    },
    {
      title: 'Client Groups',
      href: '/admin/client-groups',
      icon: Users,
      show: userRole ? canAccessAdmin(userRole) : false
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      show: userRole ? canAccessAdmin(userRole) : false
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      show: true
    },
  ]

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold">ClientDocs Guard</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-2 p-4">
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          
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
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
