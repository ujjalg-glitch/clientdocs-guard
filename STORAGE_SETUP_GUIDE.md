# 📦 Supabase Storage Setup Guide

## Issue: "new row violates row-level security policy"

This error occurs because Supabase has Row Level Security (RLS) enabled by default.

---

## 🚀 Quick Fix (For Development/Testing)

### Option 1: Disable RLS (Fastest - Development Only)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq

2. **Run SQL Script**
   - Go to **SQL Editor**
   - Copy and paste `fix_rls_policies.sql`
   - Click **Run**

This will disable RLS for all tables, allowing uploads to work immediately.

⚠️ **Warning**: Only use this for development! For production, use proper RLS policies.

---

## 🔒 Proper Setup (For Production)

### Step 1: Create Storage Bucket

1. **Go to Storage**
   - Supabase Dashboard → Storage (left sidebar)

2. **Create Bucket**
   - Click **"New bucket"**
   - Name: `documents`
   - Public bucket: **NO** (keep private)
   - Click **"Create bucket"**

---

### Step 2: Set Up Storage Policies

1. **Click on the `documents` bucket**

2. **Go to "Policies" tab**

3. **Click "New Policy"**

4. **Create Upload Policy**
   - Template: **"Give users access to their own folder"**
   - Or create custom policy:

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

5. **Create Read Policy**

```sql
-- Policy 2: Allow users to read their own files
CREATE POLICY "Allow users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

6. **Create Update Policy**

```sql
-- Policy 3: Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

7. **Create Delete Policy**

```sql
-- Policy 4: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### Step 3: Alternative - Make Bucket Public (Simpler)

If you want simpler setup for testing:

1. **Edit the bucket**
2. **Check "Public bucket"**
3. **Save**

Then add this policy:

```sql
-- Allow anyone to upload (public bucket)
CREATE POLICY "Public access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

---

## 🎯 Quick Testing Solution

### For Immediate Testing (Easiest):

1. **Run this SQL** in Supabase SQL Editor:

```sql
-- Disable RLS for files table
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
```

2. **Make storage bucket public**:
   - Storage → documents → Edit
   - ✅ Check "Public bucket"
   - Save

3. **Add public storage policy**:

```sql
-- Allow public access to documents bucket
CREATE POLICY "Public documents access"
ON storage.objects FOR ALL
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

This will allow file uploads to work immediately!

---

## 🐛 Troubleshooting

### Error: "Bucket not found"
**Solution:**
1. Go to Storage
2. Create bucket named `documents`

### Error: "Policy violation"
**Solution:**
1. Run `fix_rls_policies.sql`
2. Or follow the storage policies setup above

### Error: "Unauthorized"
**Solution:**
1. Make sure you're logged in
2. Check bucket is created
3. Check RLS is disabled OR policies are set

---

## ✅ Verify It's Working

### Test 1: Check Bucket Exists
```
Supabase Dashboard → Storage → Should see "documents" bucket
```

### Test 2: Check RLS Status
Run in SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'files';
```

Result should show `rowsecurity = false` if RLS is disabled.

### Test 3: Upload Test
1. Go to http://localhost:3000/admin/upload
2. Select a file
3. Click upload
4. Should succeed!

---

## 📋 Complete Setup Checklist

- [ ] Created `documents` storage bucket
- [ ] Ran `fix_rls_policies.sql` to disable RLS
- [ ] OR set up proper storage policies
- [ ] Tested file upload - works!
- [ ] Files appear in Storage → documents
- [ ] Files listed in `/admin/files` page

---

## 🔐 Security Notes

### For Development:
- ✅ Disable RLS for easy testing
- ✅ Use public bucket

### For Production:
- ❌ Never disable RLS
- ✅ Use proper authenticated policies
- ✅ Private bucket with user-specific folders
- ✅ Validate file types server-side
- ✅ Scan uploaded files for viruses

---

## 🎉 Success!

Once you run `fix_rls_policies.sql`, your file uploads will work immediately!

Visit: http://localhost:3000/admin/upload

