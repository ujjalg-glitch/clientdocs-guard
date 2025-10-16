-- VERIFY DATABASE SETUP
-- Run this after SIMPLE_DATABASE_FIX.sql to check if everything is working

-- Check if all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('User', 'roles', 'permissions', 'user_roles', 'user_permissions', 'role_permissions', 'files') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('User', 'roles', 'permissions', 'user_roles', 'user_permissions', 'role_permissions', 'files')
ORDER BY table_name;

-- Check User table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'User' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we have data
SELECT 'User' as table_name, COUNT(*) as record_count FROM "User"
UNION ALL
SELECT 'roles' as table_name, COUNT(*) as record_count FROM "roles"
UNION ALL
SELECT 'permissions' as table_name, COUNT(*) as record_count FROM "permissions"
UNION ALL
SELECT 'files' as table_name, COUNT(*) as record_count FROM "files"
UNION ALL
SELECT 'user_roles' as table_name, COUNT(*) as record_count FROM "user_roles"
UNION ALL
SELECT 'role_permissions' as table_name, COUNT(*) as record_count FROM "role_permissions";

-- Test the User query that the app uses
SELECT id, email, name, role, isActive, createdAt FROM "User" LIMIT 5;

-- Check RLS status
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '🔒 RLS ENABLED' 
    ELSE '🔓 RLS DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE tablename IN ('User', 'roles', 'permissions', 'user_roles', 'user_permissions', 'role_permissions', 'files')
ORDER BY tablename;
