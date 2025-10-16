-- Quick Storage Fix for ClientDocs Guard
-- Run this in Supabase SQL Editor

-- Step 1: Create the documents bucket (if it doesn't exist)
-- Note: You need to create this manually in Supabase Dashboard
-- Go to Storage → New bucket → Name: "documents" → Create

-- Step 2: Make bucket public for easy testing
-- Go to Storage → documents → Edit → Check "Public bucket" → Save

-- Step 3: Add public access policy
CREATE POLICY "Public documents access"
ON storage.objects FOR ALL
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Step 4: Disable RLS for files table (for development)
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage setup completed!';
    RAISE NOTICE '📦 Make sure to create "documents" bucket in Storage dashboard';
    RAISE NOTICE '🔓 Bucket should be public for testing';
END $$;
