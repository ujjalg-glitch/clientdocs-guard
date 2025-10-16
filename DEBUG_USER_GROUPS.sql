-- Debug script to check user group memberships
-- Run this in Supabase SQL Editor to debug group membership issues

-- 1. Check if group_members table exists and has data
SELECT 'group_members table check' as check_type, COUNT(*) as count FROM group_members;

-- 2. Check if client_groups table exists and has data  
SELECT 'client_groups table check' as check_type, COUNT(*) as count FROM client_groups;

-- 3. Check current user's memberships (replace 'your-user-id' with actual user ID)
SELECT 
  'user memberships' as check_type,
  gm.id as membership_id,
  gm.user_id,
  gm.role,
  gm.joined_at,
  cg.id as group_id,
  cg.name as group_name,
  cg.description as group_description
FROM group_members gm
JOIN client_groups cg ON gm.group_id = cg.id
WHERE gm.user_id = 'your-user-id-here';

-- 4. Check all group memberships
SELECT 
  'all memberships' as check_type,
  gm.id as membership_id,
  gm.user_id,
  gm.role,
  gm.joined_at,
  cg.id as group_id,
  cg.name as group_name
FROM group_members gm
JOIN client_groups cg ON gm.group_id = cg.id
ORDER BY gm.joined_at DESC;

-- 5. Check auth.users table structure
SELECT 'auth users check' as check_type, COUNT(*) as count FROM auth.users;

-- 6. Sample query to get user groups (replace with actual user ID)
SELECT 
  gm.*,
  cg.name as group_name,
  cg.description,
  cg.created_at as group_created_at,
  cg.created_by as group_creator_id
FROM group_members gm
JOIN client_groups cg ON gm.group_id = cg.id
WHERE gm.user_id = 'your-user-id-here';
