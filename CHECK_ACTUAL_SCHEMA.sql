-- Check what tables and columns actually exist in your database
-- Run this in Supabase SQL Editor

-- 1. Check if User table exists and what columns it has
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if auth.users exists (Supabase default)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 3. List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4. Check if our custom tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User' AND table_schema = 'public') 
    THEN '✅ User table EXISTS' 
    ELSE '❌ User table MISSING' 
  END as user_table_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles' AND table_schema = 'public') 
    THEN '✅ roles table EXISTS' 
    ELSE '❌ roles table MISSING' 
  END as roles_table_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'files' AND table_schema = 'public') 
    THEN '✅ files table EXISTS' 
    ELSE '❌ files table MISSING' 
  END as files_table_status;
