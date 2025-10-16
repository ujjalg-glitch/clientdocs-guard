# 🎯 Storage Policy Setup - Step by Step

## You're in the RIGHT place! 
**Supabase Storage → documents bucket → Adding new policy**

---

## 📋 Fill out the form exactly like this:

### 1️⃣ **Policy Name**
```
Allow authenticated users to upload files
```

### 2️⃣ **Allowed Operations**
✅ **Check ALL of these:**
- [x] SELECT
- [x] INSERT  
- [x] UPDATE
- [x] DELETE

### 3️⃣ **Target Roles**
- **Dropdown**: Select `authenticated` (not "public")

### 4️⃣ **Policy Definition**
**Replace the existing SQL with this:**

```sql
bucket_id = 'documents' AND auth.role() = 'authenticated'
```

### 5️⃣ **Save the Policy**
- Click **"Review"** button
- Click **"Save Policy"** button

---

## ✅ What This Does

This policy allows:
- ✅ Authenticated users to upload files
- ✅ Authenticated users to view their files  
- ✅ Authenticated users to update/delete their files
- ✅ Only works for the `documents` bucket
- ✅ Only works for logged-in users

---

## 🧪 Test After Setup

1. **Go to your app**: http://localhost:3000/admin/upload
2. **Select a file** (PDF, image, etc.)
3. **Click Upload**
4. **Should work now!** ✅

---

## 🔍 If Still Having Issues

### Check 1: Is the bucket public?
- Go to Storage → documents bucket
- Click **Settings** (gear icon)
- Make sure **"Public bucket"** is **ENABLED**

### Check 2: Database RLS
You still need to run `COMPLETE_SETUP.sql` in SQL Editor to fix the database tables.

### Check 3: User Authentication
Make sure you're logged in at `/auth/login`

---

## 🎉 Expected Result

After setting up the policy:
- ✅ File upload completes successfully
- ✅ File appears in Storage → documents bucket
- ✅ File metadata saved in database
- ✅ No more "Row Level Security" errors!

---

## 📞 Quick Reference

**Current URL**: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq/storage/buckets/documents

**What to do**: Fill out the policy form with the settings above, then save.

**Next step**: Test file upload at http://localhost:3000/admin/upload
