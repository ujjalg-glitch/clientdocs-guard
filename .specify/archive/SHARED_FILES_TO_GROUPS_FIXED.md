# ✅ Shared Files to Groups - FIXED!

## What You Wanted
When you share a file to a group (like "Techshu"), all members of that group should see the file in their "Shared with Me" tab automatically.

**Before**: Sharing created a link (`/share/...`) but files didn't appear in group members' dashboards
**After**: Files shared to groups now appear in "Shared with Me" tab for all group members

## The Problem

The `/api/files/shared` endpoint had issues:
1. **Complex nested query** that didn't work correctly with Supabase
2. **Subquery syntax** was failing silently
3. **RLS policies** blocking access to nested data

## The Fix

### Updated `/api/files/shared/route.ts`

**Changed from complex nested query to step-by-step approach:**

1. **Get user's groups first**
   ```typescript
   const { data: userGroups } = await supabase
     .from('group_members')
     .select('group_id')
     .eq('user_id', user.id)
   ```

2. **Query shares with explicit group IDs**
   ```typescript
   query.or(`shared_with.eq.${user.id},client_group_id.in.(${groupIds.join(',')})`)
   ```

3. **Fetch additional info separately**
   - Get sharer details from `auth.users`
   - Get group details from `client_groups`

## How It Works Now

### Sharing Flow

**Step 1: Share File to Group**
1. Go to `/admin/files` → "My Files" tab
2. Click actions on a file → "Share"
3. Select group: "Techshu"
4. Click "Create Share"

**Step 2: Share is Created**
- Entry created in `document_shares` table
- `client_group_id` is set to "Techshu" group ID
- Shareable link generated (optional)

**Step 3: Group Members See File**
- All members of "Techshu" group
- Go to `/admin/files` → "Shared with Me" tab
- See the shared file automatically!

## Testing

### Test 1: Share to Group
1. **Login as admin** (or file owner)
2. **Go to** `/admin/files`
3. **Share a file** to "Techshu" group
4. **Note the share link** (optional)

### Test 2: Check Group Member Dashboard
1. **Login as a member** of "Techshu" group
2. **Go to** `/admin/files`
3. **Click "Shared with Me" tab**
4. **Should see** the file that was shared!

### Test 3: Verify Details
In "Shared with Me" tab, you should see:
- ✅ File name
- ✅ File size
- ✅ "Shared by" (name/email of person who shared)
- ✅ "Shared on" (date)
- ✅ View/Download actions

## Expected Results

### When Admin Shares to "Techshu" Group

**Admin View** (`/admin/files`):
```
My Files (5)
┌──────────────────────────────────┐
│ document.pdf     [Share Button]  │
│ → Share to "Techshu" group       │
│ ✅ Share created!                 │
└──────────────────────────────────┘
```

**Group Member View** (`/admin/files` → "Shared with Me"):
```
Shared with Me (1)
┌─────────────────────────────────────────────────┐
│ document.pdf  |  2.5 MB  |  Shared by Admin   │
│ Shared on Oct 16, 2025  |  [View] [Download] │
└─────────────────────────────────────────────────┘
```

## API Endpoints

### ✅ POST `/api/shares`
Creates a share with `client_group_id`

**Request:**
```json
{
  "fileId": "file-uuid",
  "clientGroupId": "group-uuid",
  "expiresAt": null,
  "watermarkEnabled": false,
  "viewOnly": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "share-uuid",
    "shareUrl": "http://localhost:3000/share/xxx",
    ...
  }
}
```

### ✅ GET `/api/files/shared`
Fetches files shared with user (directly or through groups)

**Query Logic:**
1. Get user's group memberships
2. Find shares where:
   - `shared_with = user.id` OR
   - `client_group_id` in user's groups
3. Return file details + share info

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "file-uuid",
      "original_name": "document.pdf",
      "size": 2500000,
      "shareInfo": {
        "sharedBy": {
          "email": "admin@example.com"
        },
        "clientGroup": {
          "name": "Techshu"
        },
        "createdAt": "2025-10-16..."
      }
    }
  ]
}
```

## Console Logging

Check your terminal for helpful logs:
```
User groups: ['group-uuid-1', 'group-uuid-2']
Shared files found: 1
```

## Database Tables

### `document_shares`
```sql
- id
- file_id (references files)
- shared_by (user who shared)
- shared_with (specific user, nullable)
- client_group_id (group it was shared to, nullable)
- access_token (for shareable link)
- is_active (true/false)
- created_at
```

### `group_members`
```sql
- id
- user_id (member)
- group_id (group)
- role (member/admin)
- joined_at
```

## Troubleshooting

### Issue 1: Shared Files Not Showing
**Check:**
1. Is user actually in the group? (`/api/user/groups`)
2. Was file shared to that specific group?
3. Is `is_active = true` in `document_shares`?

**Debug:**
```sql
-- Check user's groups
SELECT * FROM group_members WHERE user_id = 'your-user-id';

-- Check shares to those groups
SELECT * FROM document_shares 
WHERE client_group_id IN (
  SELECT group_id FROM group_members WHERE user_id = 'your-user-id'
);
```

### Issue 2: "Unknown" Sharer
**Cause**: Service client not fetching user details

**Solution**: Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Issue 3: RLS Policy Blocking
**Solution**: Run this SQL:
```sql
-- Allow users to see shares to their groups
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

## Summary

### ✅ What's Fixed:
1. **Files shared to groups** now visible to all group members
2. **"Shared with Me" tab** shows group-shared files
3. **Better query logic** - no more failed nested queries
4. **Proper group filtering** - only shows files from user's groups

### 🎯 How to Use:
1. **Share file** to "Techshu" group
2. **All "Techshu" members** see it in "Shared with Me"
3. **View/Download** directly from dashboard
4. **Share link** also works (optional)

### 📝 Both Methods Work:
- **Dashboard access**: Files appear in "Shared with Me" automatically
- **Share link**: `http://localhost:3000/share/xxx` still works

**Refresh your browser and test sharing a file to the Techshu group!** 🚀
