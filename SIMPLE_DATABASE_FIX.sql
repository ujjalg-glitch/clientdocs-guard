-- SIMPLE DATABASE FIX
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Check what exists
SELECT 'Checking existing tables...' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('User', 'roles', 'permissions', 'files', 'user_roles', 'user_permissions', 'role_permissions')
ORDER BY table_name;

-- Step 2: Create User table if it doesn't exist
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create roles table
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create permissions table
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- Step 5: Create user_roles table
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create user_permissions table
CREATE TABLE IF NOT EXISTS "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 7: Create role_permissions table
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 8: Create files table
CREATE TABLE IF NOT EXISTS "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- Step 9: Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- Step 10: Disable RLS for development
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;

-- Step 11: Insert initial data
INSERT INTO "roles" ("id", "name", "description", "is_active", "updated_at") VALUES 
('super-admin-role', 'super_admin', 'Super Administrator with full system access', true, CURRENT_TIMESTAMP),
('admin-role', 'admin', 'Administrator with management access', true, CURRENT_TIMESTAMP),
('user-role', 'user', 'Regular user with basic access', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "permissions" ("id", "name", "description", "resource", "action", "updated_at") VALUES 
('perm-users-create', 'users.create', 'Create users', 'users', 'create', CURRENT_TIMESTAMP),
('perm-users-read', 'users.read', 'Read users', 'users', 'read', CURRENT_TIMESTAMP),
('perm-users-update', 'users.update', 'Update users', 'users', 'update', CURRENT_TIMESTAMP),
('perm-users-delete', 'users.delete', 'Delete users', 'users', 'delete', CURRENT_TIMESTAMP),
('perm-files-create', 'files.create', 'Upload files', 'files', 'create', CURRENT_TIMESTAMP),
('perm-files-read', 'files.read', 'Read files', 'files', 'read', CURRENT_TIMESTAMP),
('perm-files-update', 'files.update', 'Update files', 'files', 'update', CURRENT_TIMESTAMP),
('perm-files-delete', 'files.delete', 'Delete files', 'files', 'delete', CURRENT_TIMESTAMP),
('perm-admin-access', 'admin.access', 'Access admin panel', 'admin', 'access', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Step 12: Assign all permissions to super admin role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "granted") VALUES
('rp-super-admin-users-create', 'super-admin-role', 'perm-users-create', true),
('rp-super-admin-users-read', 'super-admin-role', 'perm-users-read', true),
('rp-super-admin-users-update', 'super-admin-role', 'perm-users-update', true),
('rp-super-admin-users-delete', 'super-admin-role', 'perm-users-delete', true),
('rp-super-admin-files-create', 'super-admin-role', 'perm-files-create', true),
('rp-super-admin-files-read', 'super-admin-role', 'perm-files-read', true),
('rp-super-admin-files-update', 'super-admin-role', 'perm-files-update', true),
('rp-super-admin-files-delete', 'super-admin-role', 'perm-files-delete', true),
('rp-super-admin-access', 'super-admin-role', 'perm-admin-access', true)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- Step 13: Create your user record
INSERT INTO "User" ("id", "email", "name", "role", "isActive") VALUES 
('temp-user-id', 'superadmin@clientdocs.com', 'Super Admin', 'super_admin', true)
ON CONFLICT ("email") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "isActive" = EXCLUDED."isActive";

-- Step 14: Assign super admin role to your user
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'temp-user-id', 'super-admin-role')
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- Step 15: Verify setup
SELECT 'Setup complete! Checking results...' as status;

SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as role_count FROM "roles";
SELECT COUNT(*) as permission_count FROM "permissions";
SELECT COUNT(*) as file_count FROM "files";

SELECT 'Database setup complete! You can now use the admin pages.' as final_status;
