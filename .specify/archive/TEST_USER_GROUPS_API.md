# Test User Groups API

## Current Error
When visiting `http://localhost:3000/api/user/groups`, you get:
```json
{"error":"Failed to fetch user groups"}
```

## What I Just Fixed

### 1. Better Error Logging
Added detailed error messages that will show:
- Error message
- Error stack trace (in development)
- Specific details about what failed

### 2. Fixed Dynamic Import Issue
Moved the service client import to the top of the file instead of using dynamic imports, which can cause issues.

## How to Test

### Step 1: Restart Your Dev Server
The API route changes require a restart:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Try the API Again
Visit in browser or use curl:
```bash
curl http://localhost:3000/api/user/groups
```

### Step 3: Check the Terminal/Console
Look at your terminal where `npm run dev` is running. You should now see detailed error logs like:
```
Error in user groups API: [detailed error message]
Error details: { message: '...', stack: '...' }
```

### Step 4: Check the Response
The API will now return more details:
```json
{
  "error": "Failed to fetch user groups",
  "details": "Actual error message here",
  "stack": "Error stack if in development"
}
```

## Common Errors & Solutions

### Error 1: "Cannot find module '@/lib/supabase/service'"
**Solution**: Check if `lib/supabase/service.ts` exists

### Error 2: "SUPABASE_SERVICE_ROLE_KEY is not defined"
**Solution**: Add to `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Error 3: "relation 'group_members' does not exist"
**Solution**: Run the database migration SQL script

### Error 4: "permission denied for table group_members"
**Solution**: Fix RLS policies with `FIX_USER_GROUPS_RLS.sql`

## Debugging Steps

1. **Restart dev server** - `npm run dev`
2. **Visit API** - `http://localhost:3000/api/user/groups`
3. **Check terminal** - Look for console.error logs
4. **Check browser** - Look at Network tab for full response
5. **Share error details** - Copy the exact error message

## After Restart

You should see one of these outcomes:

### Success:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Techshu",
      "role": "member",
      "joinedAt": "2025-10-16T...",
      ...
    }
  ]
}
```

### Detailed Error:
```json
{
  "error": "Failed to fetch user groups",
  "details": "Cannot find module '@/lib/supabase/service'",
  "stack": "Error: Cannot find module..."
}
```

## Next Steps

1. ✅ Restart your dev server
2. ✅ Visit the API endpoint again
3. ✅ Share the new error message (which will be more detailed)
4. ✅ I'll fix the specific issue

The detailed error message will help identify exactly what's wrong!
