-- DROP AND CREATE DATABASE - COMPLETE RESET
-- Run this ENTIRE script in Supabase SQL Editor

-- Step 1: Drop all existing tables (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS "user_permissions" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "files" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Step 2: Create User table
CREATE TABLE "User" (
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
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create permissions table
CREATE TABLE "permissions" (
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
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create user_permissions table
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 7: Create role_permissions table
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 8: Create files table
CREATE TABLE "files" (
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- Step 10: Add foreign key constraints
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" 
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" 
FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" 
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" 
FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" 
FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 11: Disable RLS for development
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;

-- Step 12: Insert initial roles
INSERT INTO "roles" ("id", "name", "description", "is_active", "updated_at") VALUES 
('super-admin-role', 'super_admin', 'Super Administrator with full system access', true, CURRENT_TIMESTAMP),
('admin-role', 'admin', 'Administrator with management access', true, CURRENT_TIMESTAMP),
('user-role', 'user', 'Regular user with basic access', true, CURRENT_TIMESTAMP);

-- Step 13: Insert initial permissions
INSERT INTO "permissions" ("id", "name", "description", "resource", "action", "updated_at") VALUES 
('perm-users-create', 'users.create', 'Create users', 'users', 'create', CURRENT_TIMESTAMP),
('perm-users-read', 'users.read', 'Read users', 'users', 'read', CURRENT_TIMESTAMP),
('perm-users-update', 'users.update', 'Update users', 'users', 'update', CURRENT_TIMESTAMP),
('perm-users-delete', 'users.delete', 'Delete users', 'users', 'delete', CURRENT_TIMESTAMP),
('perm-files-create', 'files.create', 'Upload files', 'files', 'create', CURRENT_TIMESTAMP),
('perm-files-read', 'files.read', 'Read files', 'files', 'read', CURRENT_TIMESTAMP),
('perm-files-update', 'files.update', 'Update files', 'files', 'update', CURRENT_TIMESTAMP),
('perm-files-delete', 'files.delete', 'Delete files', 'files', 'delete', CURRENT_TIMESTAMP),
('perm-admin-access', 'admin.access', 'Access admin panel', 'admin', 'access', CURRENT_TIMESTAMP);

-- Step 14: Assign all permissions to super admin role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "granted") VALUES
('rp-super-admin-users-create', 'super-admin-role', 'perm-users-create', true),
('rp-super-admin-users-read', 'super-admin-role', 'perm-users-read', true),
('rp-super-admin-users-update', 'super-admin-role', 'perm-users-update', true),
('rp-super-admin-users-delete', 'super-admin-role', 'perm-users-delete', true),
('rp-super-admin-files-create', 'super-admin-role', 'perm-files-create', true),
('rp-super-admin-files-read', 'super-admin-role', 'perm-files-read', true),
('rp-super-admin-files-update', 'super-admin-role', 'perm-files-update', true),
('rp-super-admin-files-delete', 'super-admin-role', 'perm-files-delete', true),
('rp-super-admin-access', 'super-admin-role', 'perm-admin-access', true);

-- Step 15: Create your super admin user
INSERT INTO "User" ("id", "email", "name", "role", "isActive") VALUES 
('super-admin-user-id', 'superadmin@clientdocs.com', 'Super Admin', 'super_admin', true);

-- Step 16: Assign super admin role to your user
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'super-admin-user-id', 'super-admin-role');

-- Step 17: Verify setup
SELECT 'Database setup complete! Checking results...' as status;

SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as role_count FROM "roles";
SELECT COUNT(*) as permission_count FROM "permissions";
SELECT COUNT(*) as file_count FROM "files";
SELECT COUNT(*) as user_role_count FROM "user_roles";
SELECT COUNT(*) as role_permission_count FROM "role_permissions";

-- Step 18: Test the User query that the app uses
SELECT id, email, name, role, "isActive", "createdAt" FROM "User" LIMIT 5;

SELECT '✅ Database setup complete! All tables created with data.' as final_status;
