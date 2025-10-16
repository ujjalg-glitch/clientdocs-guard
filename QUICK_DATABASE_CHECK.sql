-- Quick Database Status Check
-- Run this in Supabase SQL Editor to see what's set up

-- Check if our custom tables exist
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

-- Check if auth.users exists (Supabase default)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') 
    THEN '✅ auth.users EXISTS' 
    ELSE '❌ auth.users MISSING' 
  END as auth_status;

-- Check current user count in auth.users
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- Check if we have any data in our tables
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
SELECT 'user_permissions' as table_name, COUNT(*) as record_count FROM "user_permissions"
UNION ALL
SELECT 'role_permissions' as table_name, COUNT(*) as record_count FROM "role_permissions";

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
