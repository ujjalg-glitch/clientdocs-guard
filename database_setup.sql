-- Database setup for ClientDocs Guard with roles, permissions, and file management
-- Run this SQL directly in your Supabase SQL Editor

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

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
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

-- Create files table with document management features
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
    "watermark_text" TEXT,
    "expires_at" TIMESTAMP(3),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- Create client_groups table
CREATE TABLE IF NOT EXISTS "client_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "client_groups_pkey" PRIMARY KEY ("id")
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS "group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- Create document_shares table for sharing with signed URLs
CREATE TABLE IF NOT EXISTS "document_shares" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "shared_by" INTEGER NOT NULL,
    "shared_with" INTEGER,
    "client_group_id" TEXT,
    "signed_url" TEXT,
    "access_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "max_downloads" INTEGER,
    "watermark_enabled" BOOLEAN NOT NULL DEFAULT false,
    "view_only" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- Create access_logs table for analytics
CREATE TABLE IF NOT EXISTS "access_logs" (
    "id" TEXT NOT NULL,
    "file_id" TEXT,
    "share_id" TEXT,
    "user_id" INTEGER,
    "action" TEXT NOT NULL, -- 'view', 'download', 'share', 'comment'
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id")
);

-- Create document_comments table for Q&A
CREATE TABLE IF NOT EXISTS "document_comments" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "page_number" INTEGER,
    "x_position" DECIMAL,
    "y_position" DECIMAL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "parent_comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);

-- Create next_step_hints table
CREATE TABLE IF NOT EXISTS "next_step_hints" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "hint_text" TEXT NOT NULL,
    "action_type" TEXT NOT NULL, -- 'sign', 'review', 'approve', 'comment'
    "priority" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "next_step_hints_pkey" PRIMARY KEY ("id")
);

-- Add is_active column to User table if it doesn't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_resource_action_key" ON "permissions"("resource", "action");
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- Add foreign key constraints
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_groups" ADD CONSTRAINT "client_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "client_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_shared_with_fkey" FOREIGN KEY ("shared_with") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_client_group_id_fkey" FOREIGN KEY ("client_group_id") REFERENCES "client_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_share_id_fkey" FOREIGN KEY ("share_id") REFERENCES "document_shares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "document_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "next_step_hints" ADD CONSTRAINT "next_step_hints_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "next_step_hints" ADD CONSTRAINT "next_step_hints_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert initial roles
INSERT INTO "roles" ("id", "name", "description", "is_active") VALUES 
('super-admin-role', 'super_admin', 'Super Administrator with full system access', true),
('admin-role', 'admin', 'Administrator with management access', true),
('user-role', 'user', 'Regular user with basic access', true)
ON CONFLICT ("id") DO NOTHING;

-- Insert permissions
INSERT INTO "permissions" ("id", "name", "description", "resource", "action") VALUES 
-- User management
('perm-users-create', 'users.create', 'Create users', 'users', 'create'),
('perm-users-read', 'users.read', 'Read users', 'users', 'read'),
('perm-users-update', 'users.update', 'Update users', 'users', 'update'),
('perm-users-delete', 'users.delete', 'Delete users', 'users', 'delete'),

-- File management
('perm-files-create', 'files.create', 'Upload files', 'files', 'create'),
('perm-files-read', 'files.read', 'Read files', 'files', 'read'),
('perm-files-update', 'files.update', 'Update files', 'files', 'update'),
('perm-files-delete', 'files.delete', 'Delete files', 'files', 'delete'),

-- Document sharing
('perm-docs-share', 'docs.share', 'Share documents', 'docs', 'share'),
('perm-docs-watermark', 'docs.watermark', 'Add watermarks', 'docs', 'watermark'),
('perm-docs-analytics', 'docs.analytics', 'View document analytics', 'docs', 'analytics'),

-- Client groups
('perm-groups-create', 'groups.create', 'Create client groups', 'groups', 'create'),
('perm-groups-manage', 'groups.manage', 'Manage client groups', 'groups', 'manage'),

-- Comments and Q&A
('perm-comments-create', 'comments.create', 'Create comments', 'comments', 'create'),
('perm-comments-moderate', 'comments.moderate', 'Moderate comments', 'comments', 'moderate'),

-- Admin access
('perm-admin-access', 'admin.access', 'Access admin panel', 'admin', 'access'),
('perm-admin-users', 'admin.users', 'Manage users in admin', 'admin', 'users'),
('perm-admin-files', 'admin.files', 'Manage files in admin', 'admin', 'files'),
('perm-admin-analytics', 'admin.analytics', 'View system analytics', 'admin', 'analytics'),
('perm-admin-settings', 'admin.settings', 'Manage system settings', 'admin', 'settings')
ON CONFLICT ("id") DO NOTHING;

-- Assign all permissions to super admin role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "granted") 
SELECT 
    'rp-' || generate_random_uuid()::text,
    'super-admin-role',
    p.id,
    true
FROM "permissions" p
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- Assign basic permissions to admin role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "granted") 
SELECT 
    'rp-' || generate_random_uuid()::text,
    'admin-role',
    p.id,
    true
FROM "permissions" p
WHERE p.resource IN ('users', 'files', 'posts') OR p.name = 'admin.access'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- Assign basic permissions to user role
INSERT INTO "role_permissions" ("id", "role_id", "permission_id", "granted") 
SELECT 
    'rp-' || generate_random_uuid()::text,
    'user-role',
    p.id,
    true
FROM "permissions" p
WHERE p.name IN ('files.create', 'files.read', 'posts.create', 'posts.read')
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

-- Create uploads directory structure (this will be handled by the application)
-- For now, we'll just ensure the files table is ready

COMMIT;
