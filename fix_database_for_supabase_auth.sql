-- Fix database to work with Supabase Auth UUIDs
-- Run this in Supabase SQL Editor

-- First, disable RLS on all our custom tables
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;

-- Drop the files table and recreate with correct user_id type
DROP TABLE IF EXISTS "files" CASCADE;

-- Recreate files table with UUID for uploaded_by (to match Supabase Auth)
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "files_uploaded_by_idx" ON "files"("uploaded_by");
CREATE INDEX IF NOT EXISTS "files_created_at_idx" ON "files"("created_at");

-- Add foreign key to auth.users (Supabase Auth table)
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" 
FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Recreate user_roles with UUID
DROP TABLE IF EXISTS "user_roles" CASCADE;

CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" 
FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Recreate user_permissions with UUID
DROP TABLE IF EXISTS "user_permissions" CASCADE;

CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "permission_id" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" 
FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

-- ============================================
-- Now insert the super admin role assignment
-- ============================================
-- Replace 'YOUR_SUPER_ADMIN_USER_ID' with the actual UUID from Authentication -> Users

-- Example:
-- INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
-- ('ur-super-admin', 'YOUR_SUPER_ADMIN_USER_ID_HERE', 'super-admin-role')
-- ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- To find your user ID:
-- Go to: Supabase Dashboard -> Authentication -> Users
-- Copy the ID (UUID format) of superadmin@clientdocs.com

