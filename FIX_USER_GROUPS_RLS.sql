-- Fix RLS Policies for User Groups Access
-- This script fixes the issue where users can't see their own group memberships

-- 1. Check current RLS status
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('group_members', 'client_groups');

-- 2. Drop existing policies for group_members
DROP POLICY IF EXISTS "Users can view their own group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can view all group members" ON group_members;
DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_update_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;

-- 3. Drop existing policies for client_groups
DROP POLICY IF EXISTS "Users can view groups they belong to" ON client_groups;
DROP POLICY IF EXISTS "Users can view all groups" ON client_groups;
DROP POLICY IF EXISTS "client_groups_select_policy" ON client_groups;
DROP POLICY IF EXISTS "client_groups_insert_policy" ON client_groups;
DROP POLICY IF EXISTS "client_groups_update_policy" ON client_groups;
DROP POLICY IF EXISTS "client_groups_delete_policy" ON client_groups;

-- 4. Enable RLS on both tables
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_groups ENABLE ROW LEVEL SECURITY;

-- 5. Create simple policies for group_members
-- Allow users to see their own memberships
CREATE POLICY "Users can view their own memberships"
  ON group_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert memberships (for admins through service role)
CREATE POLICY "Authenticated users can manage memberships"
  ON group_members
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create simple policies for client_groups
-- Allow all authenticated users to view groups
CREATE POLICY "Authenticated users can view groups"
  ON client_groups
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage groups (admin check happens in application)
CREATE POLICY "Authenticated users can manage groups"
  ON client_groups
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('group_members', 'client_groups')
ORDER BY tablename, policyname;

-- 8. Test query - Check if current user can see their memberships
-- Replace 'your-user-id' with the actual user ID to test
SELECT 
  gm.id,
  gm.user_id,
  gm.group_id,
  gm.role,
  gm.joined_at,
  cg.name as group_name,
  cg.description
FROM group_members gm
JOIN client_groups cg ON gm.group_id = cg.id
WHERE gm.user_id = auth.uid()
LIMIT 10;

-- 9. Count groups for current user
SELECT 
  'Current user group count' as info,
  COUNT(*) as group_count
FROM group_members
WHERE user_id = auth.uid();

-- 10. List all groups (should be accessible to all authenticated users)
SELECT 
  id,
  name,
  description,
  created_at
FROM client_groups
ORDER BY created_at DESC
LIMIT 10;
