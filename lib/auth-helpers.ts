import { createClient } from '@/lib/supabase/server'

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Check direct role in User table
  const { data: user } = await supabase
    .from('User')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (user?.role === roleName) {
    return true
  }
  
  // Check in user_roles table
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId)
  
  return userRoles?.some((ur: any) => ur.roles?.name === roleName) || false
}

/**
 * Check if user is admin or super admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const isSuperAdmin = await hasRole(userId, 'super_admin')
  const isRegularAdmin = await hasRole(userId, 'admin')
  return isSuperAdmin || isRegularAdmin
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Super admins have all permissions
  if (await hasRole(userId, 'super_admin')) {
    return true
  }
  
  // Check direct user permissions
  const { data: userPerms } = await supabase
    .from('user_permissions')
    .select('permissions(resource, action, name)')
    .eq('user_id', userId)
    .eq('granted', true)
  
  const hasDirectPermission = userPerms?.some(
    (up: any) => 
      up.permissions?.resource === resource && 
      up.permissions?.action === action
  )
  
  if (hasDirectPermission) {
    return true
  }
  
  // Check role-based permissions
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
  
  if (!userRoles || userRoles.length === 0) {
    return false
  }
  
  const roleIds = userRoles.map((ur: any) => ur.role_id)
  
  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('permissions(resource, action, name)')
    .in('role_id', roleIds)
    .eq('granted', true)
  
  return rolePerms?.some(
    (rp: any) => 
      rp.permissions?.resource === resource && 
      rp.permissions?.action === action
  ) || false
}

/**
 * Get user's role from database
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data: user } = await supabase
    .from('User')
    .select('role')
    .eq('id', userId)
    .single()
  
  return user?.role || null
}

/**
 * Check if user is active
 */
export async function isUserActive(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: user } = await supabase
    .from('User')
    .select('isActive')
    .eq('id', userId)
    .single()
  
  return user?.isActive !== false
}

