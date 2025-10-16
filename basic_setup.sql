-- Basic setup for ClientDocs Guard - Run this first
-- Go to Supabase SQL Editor and run this

-- Create roles table
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Create files table
CREATE TABLE IF NOT EXISTS "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_resource_action_key" ON "permissions"("resource", "action");
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- Add foreign key constraints
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert initial roles
INSERT INTO "roles" ("id", "name", "description", "is_active", "updated_at") VALUES 
('super-admin-role', 'super_admin', 'Super Administrator with full system access', true, CURRENT_TIMESTAMP),
('admin-role', 'admin', 'Administrator with management access', true, CURRENT_TIMESTAMP),
('user-role', 'user', 'Regular user with basic access', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert basic permissions
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

-- Create super admin user
INSERT INTO "User" ("id", "email", "name") VALUES 
(1, 'superadmin@clientdocs.com', 'Super Administrator')
ON CONFLICT ("email") DO UPDATE SET 
    "name" = EXCLUDED."name";

-- Assign super admin role to the user
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 1, 'super-admin-role')
ON CONFLICT ("user_id", "role_id") DO NOTHING;

COMMIT;
