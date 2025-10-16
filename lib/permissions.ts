import { createClient } from '@/lib/supabase/server'

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check direct user permissions
  const { data: userPerms } = await supabase
    .from('user_permissions')
    .select('*, permission:permissions(*)')
    .eq('user_id', userId)
    .eq('granted', true)

  if (userPerms?.some(
    (p) => p.permission.resource === resource && p.permission.action === action
  )) {
    return true
  }

  // Check role-based permissions
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)

  if (!userRoles || userRoles.length === 0) return false

  const roleIds = userRoles.map((ur) => ur.role_id)

  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('*, permission:permissions(*)')
    .in('role_id', roleIds)
    .eq('granted', true)

  return rolePerms?.some(
    (p) => p.permission.resource === resource && p.permission.action === action
  ) || false
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_roles')
    .select('*, role:roles(*)')
    .eq('user_id', userId)
    .eq('role.name', roleName)
    .single()

  return !!data
}

/**
 * Get all user permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const permissions = new Set<string>()

  // Get direct permissions
  const { data: userPerms } = await supabase
    .from('user_permissions')
    .select('*, permission:permissions(*)')
    .eq('user_id', userId)
    .eq('granted', true)

  userPerms?.forEach((p) => {
    permissions.add(`${p.permission.resource}.${p.permission.action}`)
  })

  // Get role permissions
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)

  if (userRoles && userRoles.length > 0) {
    const roleIds = userRoles.map((ur) => ur.role_id)

    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select('*, permission:permissions(*)')
      .in('role_id', roleIds)
      .eq('granted', true)

    rolePerms?.forEach((p) => {
      permissions.add(`${p.permission.resource}.${p.permission.action}`)
    })
  }

  return Array.from(permissions)
}

/**
 * Check if user is admin or super admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const isSuperAdmin = await hasRole(userId, 'super_admin')
  if (isSuperAdmin) return true
  
  return await hasRole(userId, 'admin')
}

/**
 * Middleware-friendly permission check
 */
export async function requirePermission(
  resource: string,
  action: string
): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  return await hasPermission(user.id, resource, action)
}

/**
 * Middleware-friendly role check
 */
export async function requireRole(roleName: string): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  return await hasRole(user.id, roleName)
}

