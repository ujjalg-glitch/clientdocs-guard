-- ============================================
-- CLIENTDOCS GUARD - COMPLETE DATABASE SETUP
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This replaces basic_setup.sql and fixes all issues

-- ============================================
-- STEP 1: DROP EXISTING TABLES (Clean slate)
-- ============================================
DROP TABLE IF EXISTS "user_permissions" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "files" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES (With correct UUID types)
-- ============================================

-- Create roles table
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Create permissions table
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

-- Create user_roles table (UUID for Supabase Auth)
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Create user_permissions table (UUID for Supabase Auth)
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- Create role_permissions table
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Create files table (UUID for Supabase Auth)
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");
CREATE INDEX "files_uploaded_by_idx" ON "files"("uploaded_by");
CREATE INDEX "files_created_at_idx" ON "files"("created_at");

-- ============================================
-- STEP 4: ADD FOREIGN KEYS
-- ============================================
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" 
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" 
FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" 
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" 
FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" 
FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- STEP 5: DISABLE RLS (For Development)
-- ============================================
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: INSERT INITIAL DATA
-- ============================================

-- Insert roles
INSERT INTO "roles" ("id", "name", "description", "is_active", "updated_at") VALUES 
('super-admin-role', 'super_admin', 'Super Administrator with full system access', true, CURRENT_TIMESTAMP),
('admin-role', 'admin', 'Administrator with management access', true, CURRENT_TIMESTAMP),
('user-role', 'user', 'Regular user with basic access', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert permissions
INSERT INTO "permissions" ("id", "name", "description", "resource", "action", "updated_at") VALUES 
-- User management
('perm-users-create', 'users.create', 'Create users', 'users', 'create', CURRENT_TIMESTAMP),
('perm-users-read', 'users.read', 'Read users', 'users', 'read', CURRENT_TIMESTAMP),
('perm-users-update', 'users.update', 'Update users', 'users', 'update', CURRENT_TIMESTAMP),
('perm-users-delete', 'users.delete', 'Delete users', 'users', 'delete', CURRENT_TIMESTAMP),

-- File management
('perm-files-create', 'files.create', 'Upload files', 'files', 'create', CURRENT_TIMESTAMP),
('perm-files-read', 'files.read', 'Read files', 'files', 'read', CURRENT_TIMESTAMP),
('perm-files-update', 'files.update', 'Update files', 'files', 'update', CURRENT_TIMESTAMP),
('perm-files-delete', 'files.delete', 'Delete files', 'files', 'delete', CURRENT_TIMESTAMP),

-- Admin access
('perm-admin-access', 'admin.access', 'Access admin panel', 'admin', 'access', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Assign all permissions to super admin role
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

-- ============================================
-- STEP 7: ASSIGN SUPER ADMIN ROLE TO YOUR USER
-- ============================================
-- YOU NEED TO RUN THIS SEPARATELY AFTER GETTING YOUR USER ID

-- First, find your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'superadmin@clientdocs.com';

-- Then run this (replace with actual UUID):
/*
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'YOUR_USER_UUID_HERE', 'super-admin-role')
ON CONFLICT ("user_id", "role_id") DO NOTHING;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up:

-- Check roles
SELECT * FROM roles;

-- Check permissions  
SELECT * FROM permissions;

-- Check role permissions
SELECT * FROM role_permissions;

-- Check your user ID
SELECT id, email FROM auth.users WHERE email = 'superadmin@clientdocs.com';

-- After assigning role, check user roles
SELECT * FROM user_roles;

COMMIT;

