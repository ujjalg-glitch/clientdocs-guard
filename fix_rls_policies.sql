-- Fix Row Level Security Policies for ClientDocs Guard
-- Run this in Supabase SQL Editor

-- ============================================
-- DISABLE RLS FOR DEVELOPMENT (TEMPORARY)
-- ============================================
-- This is a quick fix for testing. In production, use proper policies below.

ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user_permissions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OR USE PROPER RLS POLICIES (RECOMMENDED FOR PRODUCTION)
-- ============================================
-- Comment out the DISABLE statements above and use these instead:

/*
-- Enable RLS
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;

-- Files policies
DROP POLICY IF EXISTS "Users can view their own files" ON "files";
DROP POLICY IF EXISTS "Users can upload files" ON "files";
DROP POLICY IF EXISTS "Users can update their own files" ON "files";
DROP POLICY IF EXISTS "Users can delete their own files" ON "files";

CREATE POLICY "Users can view their own files" ON "files"
    FOR SELECT
    USING (auth.uid()::text = uploaded_by::text OR is_public = true);

CREATE POLICY "Users can upload files" ON "files"
    FOR INSERT
    WITH CHECK (auth.uid()::text = uploaded_by::text);

CREATE POLICY "Users can update their own files" ON "files"
    FOR UPDATE
    USING (auth.uid()::text = uploaded_by::text);

CREATE POLICY "Users can delete their own files" ON "files"
    FOR DELETE
    USING (auth.uid()::text = uploaded_by::text);

-- Roles policies (read-only for authenticated users)
DROP POLICY IF EXISTS "Anyone can view roles" ON "roles";
CREATE POLICY "Anyone can view roles" ON "roles"
    FOR SELECT
    USING (true);

-- Permissions policies (read-only for authenticated users)
DROP POLICY IF EXISTS "Anyone can view permissions" ON "permissions";
CREATE POLICY "Anyone can view permissions" ON "permissions"
    FOR SELECT
    USING (true);

-- User roles policies
DROP POLICY IF EXISTS "Users can view all user roles" ON "user_roles";
CREATE POLICY "Users can view all user roles" ON "user_roles"
    FOR SELECT
    USING (true);

-- User permissions policies
DROP POLICY IF EXISTS "Users can view all user permissions" ON "user_permissions";
CREATE POLICY "Users can view all user permissions" ON "user_permissions"
    FOR SELECT
    USING (true);

-- Role permissions policies
DROP POLICY IF EXISTS "Anyone can view role permissions" ON "role_permissions";
CREATE POLICY "Anyone can view role permissions" ON "role_permissions"
    FOR SELECT
    USING (true);
*/

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================
-- These need to be created in the Supabase Dashboard
-- Go to: Storage → documents bucket → Policies

-- For now, we'll make the bucket public for testing
-- In production, use authenticated user policies

COMMIT;

