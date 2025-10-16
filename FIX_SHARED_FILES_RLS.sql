-- Fix RLS Policies for Shared Files Access
-- This script fixes both "Shared with Me" tab and direct share link access

-- 1. Check current RLS status
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('document_shares', 'group_members', 'client_groups', 'files');

-- 2. Drop existing policies for document_shares
DROP POLICY IF EXISTS "Users can view shares" ON document_shares;
DROP POLICY IF EXISTS "Users can view their own shares" ON document_shares;
DROP POLICY IF EXISTS "Users can view shares to their groups" ON document_shares;
DROP POLICY IF EXISTS "document_shares_select_policy" ON document_shares;
DROP POLICY IF EXISTS "document_shares_insert_policy" ON document_shares;
DROP POLICY IF EXISTS "document_shares_update_policy" ON document_shares;
DROP POLICY IF EXISTS "document_shares_delete_policy" ON document_shares;

-- 3. Drop existing policies for files table
DROP POLICY IF EXISTS "Users can view files" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "files_select_policy" ON files;
DROP POLICY IF EXISTS "files_insert_policy" ON files;
DROP POLICY IF EXISTS "files_update_policy" ON files;
DROP POLICY IF EXISTS "files_delete_policy" ON files;

-- 4. Enable RLS on tables
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for document_shares
-- Allow users to see shares where they are the direct recipient OR a member of the client_group
CREATE POLICY "Users can view relevant shares"
  ON document_shares
  FOR SELECT
  USING (
    -- Direct share to user
    shared_with = auth.uid()
    OR
    -- Share to group where user is a member
    client_group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
    OR
    -- User created the share
    shared_by = auth.uid()
  );

-- Allow authenticated users to create shares (admin check happens in application)
CREATE POLICY "Authenticated users can create shares"
  ON document_shares
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own shares
CREATE POLICY "Users can update their shares"
  ON document_shares
  FOR UPDATE
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

-- Allow users to delete their own shares
CREATE POLICY "Users can delete their shares"
  ON document_shares
  FOR DELETE
  USING (shared_by = auth.uid());

-- 6. Create policies for files table
-- Allow users to view files they uploaded OR files shared with them
CREATE POLICY "Users can view accessible files"
  ON files
  FOR SELECT
  USING (
    -- User uploaded the file
    uploaded_by = auth.uid()
    OR
    -- File is shared with user directly
    id IN (
      SELECT file_id 
      FROM document_shares 
      WHERE shared_with = auth.uid() AND is_active = true
    )
    OR
    -- File is shared with user's groups
    id IN (
      SELECT file_id 
      FROM document_shares 
      WHERE client_group_id IN (
        SELECT group_id 
        FROM group_members 
        WHERE user_id = auth.uid()
      ) AND is_active = true
    )
  );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
  ON files
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own files
CREATE POLICY "Users can update their files"
  ON files
  FOR UPDATE
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete their files"
  ON files
  FOR DELETE
  USING (uploaded_by = auth.uid());

-- 7. Create policies for access_logs (for analytics)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view access logs" ON access_logs;
DROP POLICY IF EXISTS "access_logs_select_policy" ON access_logs;
DROP POLICY IF EXISTS "access_logs_insert_policy" ON access_logs;

CREATE POLICY "Users can view relevant access logs"
  ON access_logs
  FOR SELECT
  USING (
    -- User uploaded the file
    file_id IN (SELECT id FROM files WHERE uploaded_by = auth.uid())
    OR
    -- User is in a group that has access to the file
    file_id IN (
      SELECT file_id 
      FROM document_shares 
      WHERE client_group_id IN (
        SELECT group_id 
        FROM group_members 
        WHERE user_id = auth.uid()
      ) AND is_active = true
    )
  );

CREATE POLICY "System can insert access logs"
  ON access_logs
  FOR INSERT
  WITH CHECK (true);

-- 8. Verify policies are created
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
  AND tablename IN ('document_shares', 'files', 'access_logs')
ORDER BY tablename, policyname;

-- 9. Test queries
-- Test: Can current user see shares to their groups?
SELECT 
  'Shares to user groups' as test_type,
  COUNT(*) as count
FROM document_shares ds
JOIN group_members gm ON ds.client_group_id = gm.group_id
WHERE gm.user_id = auth.uid() AND ds.is_active = true;

-- Test: Can current user see files shared to their groups?
SELECT 
  'Files shared to user groups' as test_type,
  COUNT(*) as count
FROM files f
JOIN document_shares ds ON f.id = ds.file_id
JOIN group_members gm ON ds.client_group_id = gm.group_id
WHERE gm.user_id = auth.uid() AND ds.is_active = true;

-- Test: Can current user access a specific share by token?
SELECT 
  'Share by token' as test_type,
  ds.access_token,
  ds.is_active,
  f.original_name
FROM document_shares ds
JOIN files f ON ds.file_id = f.id
WHERE ds.access_token = 'vnHknO1EQo4OTWzp21rp2_6u7U76c9TJo';

-- 10. Check if the specific share exists and is active
SELECT 
  ds.*,
  f.original_name,
  f.url
FROM document_shares ds
JOIN files f ON ds.file_id = f.id
WHERE ds.access_token = 'vnHknO1EQo4OTWzp21rp2_6u7U76c9TJo';
