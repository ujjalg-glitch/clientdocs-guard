-- FINAL VERIFICATION - Run after DROP_AND_CREATE_DATABASE.sql
-- This will confirm everything is working correctly

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

-- Test the exact query that the app uses
SELECT id, email, name, role, "isActive", "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 50;

-- Check RLS status (should be disabled)
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

-- Show sample data
SELECT 'Sample User Data:' as info;
SELECT id, email, name, role, "isActive" FROM "User";

SELECT 'Sample Roles:' as info;
SELECT id, name, description FROM "roles";

SELECT 'Sample Permissions:' as info;
SELECT id, name, resource, action FROM "permissions";

SELECT '✅ VERIFICATION COMPLETE - Database is ready!' as final_status;
