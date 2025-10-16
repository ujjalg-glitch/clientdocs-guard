// Simple permission helper - just checks user role from database
import { createClient } from '@/lib/supabase/client'

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Get user's role from database
  const { data } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return data?.role || 'user'
}

export function canAccessAdmin(role: string): boolean {
  return ['super_admin', 'admin'].includes(role)
}

export function canManageUsers(role: string): boolean {
  return ['super_admin', 'admin'].includes(role)
}

export function canManageFiles(role: string): boolean {
  return ['super_admin', 'admin'].includes(role)
}

export function canManageRoles(role: string): boolean {
  return role === 'super_admin'
}

