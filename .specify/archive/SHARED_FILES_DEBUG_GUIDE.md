# 🔍 Shared Files Debug Guide

## Current Issue
You can see your groups ("Techshu" and "Group 2") but shared files are not showing in the "Shared with Me" tab.

## Debug Steps

### Step 1: Check Debug API
I created a debug endpoint to see what's in the database:

**Visit in browser:** `http://localhost:3000/api/debug/shares`

This will show:
- Your user ID
- Your group memberships
- All shares in the database
- Which shares are relevant to you

### Step 2: Check if Files Were Actually Shared to Groups

**Test the sharing process:**
1. **Login as admin** (or file owner)
2. **Go to** `/admin/files` → "My Files" tab
3. **Click actions** on a file → "Share"
4. **Select "Techshu" group**
5. **Click "Create Share"**
6. **Note**: Does it show "Share created successfully"?

### Step 3: Check Database Directly

**Run this SQL in Supabase SQL Editor:**

```sql
-- Check if any shares exist
SELECT COUNT(*) as total_shares FROM document_shares;

-- Check shares to groups
SELECT 
  ds.*,
  f.original_name,
  cg.name as group_name
FROM document_shares ds
LEFT JOIN files f ON ds.file_id = f.id
LEFT JOIN client_groups cg ON ds.client_group_id = cg.id
WHERE ds.is_active = true;

-- Check your user's group memberships
SELECT 
  gm.*,
  cg.name as group_name
FROM group_members gm
JOIN client_groups cg ON gm.group_id = cg.id
WHERE gm.user_id = 'your-user-id-here';
```

### Step 4: Test the Shared Files API

**Check browser console (F12) when visiting `/admin/files`:**
Look for:
```
Fetching shared files...
Response status: 200
Shared files found: X
```

## Common Issues & Solutions

### Issue 1: No Shares in Database
**Symptoms**: Debug API shows `allShares: []`

**Solutions**:
1. **Share a file to a group** first
2. **Check if sharing actually works** - look for success message
3. **Verify database tables exist** - run basic setup SQL

### Issue 2: Shares Exist But Not Showing
**Symptoms**: Debug API shows shares but `relevantShares: []`

**Causes**:
1. **User not in the group** the file was shared to
2. **Wrong group ID** in the share record
3. **RLS policies blocking** the query

**Solutions**:
```sql
-- Fix RLS for document_shares
DROP POLICY IF EXISTS "Users can view shares to their groups" ON document_shares;

CREATE POLICY "Users can view shares to their groups"
  ON document_shares
  FOR SELECT
  USING (
    auth.uid() = shared_with 
    OR 
    client_group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );
```

### Issue 3: API Error
**Symptoms**: Browser console shows API errors

**Check**:
1. **Authentication** - are you logged in?
2. **Database connection** - are tables accessible?
3. **Environment variables** - is `SUPABASE_SERVICE_ROLE_KEY` set?

### Issue 4: Files Show But Can't Open
**Symptoms**: Files appear but View/Download don't work

**Fix Applied**: Updated the links to use share tokens:
- **Before**: `href={file.url}`
- **After**: `href={/share/${file.shareInfo?.accessToken}}`

## Testing Checklist

### ✅ Test 1: Create a Share
1. Login as admin
2. Go to Files → My Files
3. Share a file to "Techshu" group
4. Should see "Share created successfully"

### ✅ Test 2: Check as Group Member
1. Login as a member of "Techshu"
2. Go to Files → "Shared with Me" tab
3. Should see the shared file

### ✅ Test 3: Open Shared File
1. Click View or Download on shared file
2. Should open the file via share token

## Expected Results

### Debug API Response:
```json
{
  "success": true,
  "debug": {
    "userId": "user-uuid",
    "userGroups": [
      {"group_id": "group-uuid", "group": {"name": "Techshu"}}
    ],
    "allShares": [
      {
        "id": "share-uuid",
        "file_id": "file-uuid",
        "client_group_id": "group-uuid",
        "is_active": true,
        "file": {"original_name": "document.pdf"},
        "group": {"name": "Techshu"}
      }
    ],
    "relevantShares": [
      // Same as above if user is in the group
    ]
  }
}
```

### Shared Files Tab:
```
Shared with Me (1)
┌─────────────────────────────────────────────────┐
│ document.pdf  |  2.5 MB  |  Shared by Admin   │
│ Shared on Oct 16, 2025  |  [View] [Download] │
└─────────────────────────────────────────────────┘
```

## Quick Fixes

### If No Shares Exist:
1. **Share a file** to "Techshu" group
2. **Check success message**

### If Shares Exist But Not Showing:
1. **Run RLS fix SQL** (above)
2. **Refresh browser**

### If Files Show But Can't Open:
1. **Refresh browser** (I fixed the links)
2. **Try View/Download again**

## Next Steps

1. **Visit** `/api/debug/shares` and share the response
2. **Try sharing** a file to "Techshu" group
3. **Check** "Shared with Me" tab as a group member
4. **Report** what you see in each step

This will help identify exactly where the issue is!
