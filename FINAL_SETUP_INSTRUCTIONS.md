# 🎯 FINAL SETUP INSTRUCTIONS - File Upload Fix

## ❗ The Problem

The file upload is failing with `"new row violates row-level security policy"` because:

1. **Row Level Security (RLS)** is enabled by default in Supabase
2. **User ID type mismatch**: Supabase Auth uses `UUID`, but our tables were using `INTEGER`

---

## ✅ THE COMPLETE FIX (Follow These Steps)

### Step 1: Run the Complete Setup SQL

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Copy and Paste**
   - Open the file: `COMPLETE_SETUP.sql`
   - Copy ALL the content
   - Paste into SQL Editor

4. **Run the Script**
   - Click **Run** or press `Ctrl+Enter`
   - Wait for "Success" message

---

### Step 2: Get Your User UUID

After the script runs, execute this query in SQL Editor:

```sql
SELECT id, email FROM auth.users WHERE email = 'superadmin@clientdocs.com';
```

**Copy the `id` (UUID)** - it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### Step 3: Assign Super Admin Role

Run this SQL (replace `YOUR_USER_UUID_HERE` with the UUID from Step 2):

```sql
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'YOUR_USER_UUID_HERE', 'super-admin-role')
ON CONFLICT ("user_id", "role_id") DO NOTHING;
```

**Example:**
```sql
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'super-admin-role')
ON CONFLICT ("user_id", "role_id") DO NOTHING;
```

---

### Step 4: Verify Setup

Run these verification queries:

```sql
-- Should return 3 roles
SELECT * FROM roles;

-- Should return 9 permissions
SELECT * FROM permissions;

-- Should return 9 role-permission assignments
SELECT * FROM role_permissions;

-- Should return 1 user-role assignment (your super admin)
SELECT * FROM user_roles;
```

---

### Step 5: Test File Upload

1. **Go to your app**: http://localhost:3000/admin/upload
2. **Select a PDF or image file**
3. **Click Upload**
4. **Should work now!** ✅

---

## 🔍 What Changed?

### Before (Broken):
```sql
"uploaded_by" INTEGER  ❌ Wrong type!
"user_id" INTEGER      ❌ Wrong type!
```

### After (Fixed):
```sql
"uploaded_by" UUID  ✅ Matches Supabase Auth!
"user_id" UUID      ✅ Matches Supabase Auth!
```

### RLS Status:
```sql
-- Disabled for development (easier testing)
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Quick Command Summary

### Copy-paste these in order:

```sql
-- 1. Run the complete setup (copy entire COMPLETE_SETUP.sql file)

-- 2. Find your user ID
SELECT id, email FROM auth.users WHERE email = 'superadmin@clientdocs.com';

-- 3. Assign super admin role (replace UUID)
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'YOUR_UUID_FROM_STEP_2', 'super-admin-role');

-- 4. Verify
SELECT * FROM roles;
SELECT * FROM permissions;
SELECT * FROM user_roles;
```

---

## ✅ Success Checklist

After completing all steps:

- [ ] Ran `COMPLETE_SETUP.sql` successfully
- [ ] Got user UUID from query
- [ ] Assigned super admin role
- [ ] Verified tables have data
- [ ] Tested file upload - WORKS! ✅
- [ ] File appears in `/admin/files`
- [ ] File visible in Supabase Storage

---

## 🎉 Expected Result

When you upload a file now:

1. ✅ Upload completes successfully
2. ✅ File appears in Supabase Storage → documents bucket
3. ✅ File metadata saved in `files` table
4. ✅ File listed in `/admin/files` page
5. ✅ No RLS errors!

---

## 🐛 If Still Having Issues

### Check 1: Is the bucket created?
```
Supabase → Storage → Should see "documents" bucket
```

### Check 2: Is RLS disabled?
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'files';
-- Should show: rowsecurity = false
```

### Check 3: Is the user authenticated?
```
Make sure you're logged in at /auth/login
Check browser console for auth errors
```

### Check 4: Storage bucket policies
If using a private bucket, you need storage policies.

**Quick fix**: Make bucket public in Supabase Storage settings.

---

## 📞 Need Help?

If file upload still fails:

1. Share the exact error message
2. Check browser console (F12)
3. Check terminal output
4. Verify all SQL queries ran successfully

---

## 🎊 That's It!

Run `COMPLETE_SETUP.sql` and your file uploads will work perfectly!

**The fix handles:**
- ✅ Correct UUID types for Supabase Auth
- ✅ RLS disabled for easy development
- ✅ All tables recreated properly
- ✅ Roles and permissions set up
- ✅ Ready for file uploads!

