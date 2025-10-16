import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator with full system access',
      isActive: true,
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with management access',
      isActive: true,
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with basic access',
      isActive: true,
    },
  })

  console.log('✅ Roles created')

  // Create permissions
  const permissions = [
    // User management
    { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
    { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
    
    // File management
    { name: 'files.create', description: 'Upload files', resource: 'files', action: 'create' },
    { name: 'files.read', description: 'Read files', resource: 'files', action: 'read' },
    { name: 'files.update', description: 'Update files', resource: 'files', action: 'update' },
    { name: 'files.delete', description: 'Delete files', resource: 'files', action: 'delete' },
    
    // Post management
    { name: 'posts.create', description: 'Create posts', resource: 'posts', action: 'create' },
    { name: 'posts.read', description: 'Read posts', resource: 'posts', action: 'read' },
    { name: 'posts.update', description: 'Update posts', resource: 'posts', action: 'update' },
    { name: 'posts.delete', description: 'Delete posts', resource: 'posts', action: 'delete' },
    
    // Admin access
    { name: 'admin.access', description: 'Access admin panel', resource: 'admin', action: 'access' },
    { name: 'admin.users', description: 'Manage users in admin', resource: 'admin', action: 'users' },
    { name: 'admin.files', description: 'Manage files in admin', resource: 'admin', action: 'files' },
    { name: 'admin.settings', description: 'Manage system settings', resource: 'admin', action: 'settings' },
  ]

  const createdPermissions = []
  for (const permission of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    })
    createdPermissions.push(created)
  }

  console.log('✅ Permissions created')

  // Assign all permissions to super admin role
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: { granted: true },
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
        granted: true,
      },
    })
  }

  // Assign basic permissions to admin role
  const adminPermissions = createdPermissions.filter(p => 
    p.resource === 'users' || p.resource === 'files' || p.resource === 'posts' || p.name === 'admin.access'
  )
  
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: { granted: true },
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
        granted: true,
      },
    })
  }

  // Assign basic permissions to user role
  const userPermissions = createdPermissions.filter(p => 
    p.name === 'files.create' || p.name === 'files.read' || p.name === 'posts.create' || p.name === 'posts.read'
  )
  
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: { granted: true },
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
        granted: true,
      },
    })
  }

  console.log('✅ Role permissions assigned')

  // Create super admin user
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@clientdocs.com' },
    update: {},
    create: {
      email: 'superadmin@clientdocs.com',
      name: 'Super Administrator',
      role: 'super_admin',
      isActive: true,
    },
  })

  // Assign super admin role to the user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  })

  console.log('✅ Super admin user created')
  console.log('📧 Super Admin Email: superadmin@clientdocs.com')
  console.log('🔑 You can now login with this email in your application')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })