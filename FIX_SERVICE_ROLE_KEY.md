# 🔑 Fix: Add Supabase Service Role Key

## Problem
You're getting `{"code":"not_admin","message":"User not allowed"}` because the API routes need the **Service Role Key** to perform admin operations like creating users.

## Solution (2 minutes)

### Step 1: Get Your Service Role Key

1. **Go to Supabase Dashboard API Settings:**
   ```
   https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq/settings/api
   ```

2. **Find the "Project API keys" section**

3. **Copy the `service_role` key** (NOT the `anon` key)
   - It's labeled as "service_role secret"
   - It's much longer than the anon key
   - It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Add to .env File

1. **Open `.env` file in your project root**

2. **Add this line** (after the NEXT_PUBLIC_SUPABASE_ANON_KEY line):
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Replace `your_service_role_key_here`** with the key you copied

### Step 3: Restart Dev Server

1. **Stop the current dev server** (Ctrl+C in terminal)

2. **Restart it:**
   ```bash
   npm run dev
   ```

---

## Example .env Section

Your `.env` file should look like this:

```bash
# Supabase Auth (CONFIGURED)
NEXT_PUBLIC_SUPABASE_URL=https://rlsdiyunttbhqdiesaeq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsc2RpeXVudHRiaHFkaWVzYWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODM3NTUsImV4cCI6MjA3NjE1OTc1NX0.lXTzNSjM8cRZ1ekLoBK42_ru4siILY0nBFKoLh5avks

# ⚠️ Keep this SECRET! Never commit to git!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsc2RpeXVudHRiaHFkaWVzYWVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU4Mzc1NSwiZXhwIjoyMDc2MTU5NzU1fQ.YOUR_ACTUAL_KEY_HERE
```

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **NEVER share this key publicly**
2. **NEVER commit it to git**
3. **Add `.env` to `.gitignore`** (already done in this project)
4. The service role key has **full admin access** to your Supabase project
5. Only use it on the **server-side** (API routes), never expose it to the client

---

## Why This Is Needed

- **Client-side Supabase**: Uses the `anon` key (limited permissions)
- **Server-side Admin Operations**: Need `service_role` key (full permissions)

Operations that require service role key:
- ✅ Creating users via `admin.createUser()`
- ✅ Updating user metadata via `admin.updateUserById()`
- ✅ Deleting users via `admin.deleteUser()`

---

## Testing After Fix

1. **Restart dev server**
2. **Go to**: http://localhost:3000/admin/users/create
3. **Fill in the form:**
   - Email: `testuser@example.com`
   - Password: `Test123!`
   - Name: `Test User`
   - Role: `user`
4. **Click "Create User"**
5. **Should see**: "User created successfully!" ✅

---

## If Still Not Working

### Check 1: Verify the key is correct
```bash
# In .env, make sure:
# 1. No extra spaces
# 2. No quotes around the key
# 3. Key is on ONE line
```

### Check 2: Restart the dev server
```bash
# Stop with Ctrl+C
npm run dev
```

### Check 3: Check browser console
- Open DevTools (F12)
- Look for error messages
- Check Network tab for API call details

---

## Quick Verification

Run this in your terminal to check if the key is set:

```bash
# Windows PowerShell
Get-Content .env | Select-String "SUPABASE_SERVICE_ROLE_KEY"

# Should show:
# SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

If it doesn't show anything, the key is not in the `.env` file.

---

## ✅ After Fix

Once you add the service role key and restart:

- ✅ User creation will work
- ✅ User editing will work
- ✅ User deletion will work
- ✅ All admin operations will work

**The error will be gone!** 🎉

