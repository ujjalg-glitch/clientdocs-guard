'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { useEffect, useState } from 'react'
import { getCurrentUserRole, canAccessAdmin } from '@/lib/permissions-simple'

export function MainNav() {
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
      show: true
    },
    {
      title: 'My Files',
      href: '/dashboard/files',
      show: true
    },
    {
      title: 'Upload',
      href: '/dashboard/upload',
      show: true
    },
    {
      title: 'Admin',
      href: '/admin',
      show: userRole ? canAccessAdmin(userRole) : false
    },
  ]

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex gap-6">
        {navItems.filter(item => item.show).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center text-sm font-medium transition-colors hover:text-foreground/80',
              pathname?.startsWith(item.href)
                ? 'text-foreground'
                : 'text-foreground/60'
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

