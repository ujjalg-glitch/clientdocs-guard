-- Quick test to check database status
-- Run this in Supabase SQL Editor

-- Check if files table exists and has data
SELECT COUNT(*) as file_count FROM files;

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'files' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'files';

-- Show recent files
SELECT id, filename, original_name, uploaded_by, created_at 
FROM files 
ORDER BY created_at DESC 
LIMIT 5;
