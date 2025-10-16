# 🔧 Fix: "Access Denied" for Shared Files

## The Problems
1. **"Shared with Me" tab is empty** - Even though you're in "Techshu" and "Group 2" groups
2. **Direct share link access denied** - `http://localhost:3000/share/vnHknO1EQo4OTWzp21rp2_6u7U76c9TJo` returns access denied

## Root Cause
**RLS (Row Level Security) policies** are blocking access to:
- `document_shares` table (where shares are stored)
- `files` table (file details)
- `access_logs` table (for analytics)

## The Fix

### Step 1: Run the RLS Fix Script ⚡ CRITICAL

**File**: `FIX_SHARED_FILES_RLS.sql`

This script will:
- Drop old conflicting RLS policies
- Create new policies that allow:
  - Users to see shares to their groups
  - Users to access files shared with them
  - Direct share link access to work
  - Proper analytics logging

**Run this in Supabase SQL Editor:**
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Copy and paste the entire `FIX_SHARED_FILES_RLS.sql` file
4. Click "Run"

### Step 2: Check the Results

After running the script, look for:
```
✅ 4 policies created for document_shares
✅ 4 policies created for files
✅ 2 policies created for access_logs
```

And test queries at the bottom should show:
```
Shares to user groups: 1 (or more)
Files shared to user groups: 1 (or more)
Share by token: [your-token] | true | [filename]
```

## How to Test

### Test 1: Check "Shared with Me" Tab
1. **Refresh your browser** (Ctrl+Shift+R)
2. **Go to** `/admin/files`
3. **Click "Shared with Me" tab**
4. **Should see files** shared to your groups

### Test 2: Check Direct Share Link
1. **Try the link again**: `http://localhost:3000/share/vnHknO1EQo4OTWzp21rp2_6u7U76c9TJo`
2. **Should open** the shared file directly

### Test 3: Check Browser Console
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for logs**:
   ```
   User groups: ['group-uuid-1', 'group-uuid-2']
   Shared files found: 1
   Raw shared files: [...]
   ```

## What the RLS Policies Do

### For `document_shares` table:
```sql
-- Users can see shares where:
-- 1. They are the direct recipient (shared_with = user.id)
-- 2. They are a member of the group (client_group_id in their groups)
-- 3. They created the share (shared_by = user.id)
```

### For `files` table:
```sql
-- Users can see files where:
-- 1. They uploaded the file (uploaded_by = user.id)
-- 2. File is shared with them directly
-- 3. File is shared with their groups
```

### For `access_logs` table:
```sql
-- Users can see logs for:
-- 1. Files they uploaded
-- 2. Files shared with their groups
```

## Debugging Steps

### If "Shared with Me" is still empty:

1. **Check your groups**:
   ```sql
   SELECT * FROM group_members WHERE user_id = 'your-user-id';
   ```

2. **Check shares to those groups**:
   ```sql
   SELECT ds.*, f.original_name 
   FROM document_shares ds
   JOIN files f ON ds.file_id = f.id
   WHERE ds.client_group_id IN (
     SELECT group_id FROM group_members WHERE user_id = 'your-user-id'
   );
   ```

3. **Check browser console** for error messages

### If direct link still fails:

1. **Check if share exists**:
   ```sql
   SELECT * FROM document_shares 
   WHERE access_token = 'vnHknO1EQo4OTWzp21rp2_6u7U76c9TJo';
   ```

2. **Check if share is active**:
   ```sql
   SELECT access_token, is_active, expires_at 
   FROM document_shares 
   WHERE access_token = 'vnHknO1EQo4OTWzp21rp2_6u7U76c9TJo';
   ```

## Expected Results After Fix

### "Shared with Me" Tab:
```
Shared with Me (1)
┌─────────────────────────────────────────────────┐
│ document.pdf  |  2.5 MB  |  Shared by Admin   │
│ Shared on Oct 16, 2025  |  [View] [Download] │
└─────────────────────────────────────────────────┘
```

### Direct Share Link:
- ✅ Opens file directly in browser
- ✅ Shows file viewer with download option
- ✅ Logs access for analytics

### Console Logs:
```
User groups: ['uuid1', 'uuid2']
Shared files found: 1
Raw shared files: [{"id":"...","file_id":"...",...}]
```

## Troubleshooting

### Issue 1: Still "Access Denied"
**Cause**: RLS policies not applied correctly

**Solution**: 
1. Re-run the SQL script
2. Check if policies were created:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'document_shares';
   ```

### Issue 2: "Shared with Me" still empty
**Cause**: No files shared to your groups yet

**Solution**:
1. Have someone share a file to "Techshu" or "Group 2"
2. Check if the share was created correctly

### Issue 3: Direct link works but tab is empty
**Cause**: Different RLS policies for different access methods

**Solution**: Ensure both `document_shares` and `files` policies are created

## Summary

### ✅ What This Fixes:
1. **"Shared with Me" tab** - Shows files shared to your groups
2. **Direct share links** - Work without authentication
3. **File access** - Can view/download shared files
4. **Analytics** - Access logs are recorded

### 🔧 What to Do:
1. **Run `FIX_SHARED_FILES_RLS.sql`** in Supabase SQL Editor
2. **Refresh your browser**
3. **Check "Shared with Me" tab**
4. **Test direct share link**

**This should fix both the empty "Shared with Me" tab and the "access denied" error!** 🚀
