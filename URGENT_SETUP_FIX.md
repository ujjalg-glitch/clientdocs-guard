# 🚨 URGENT: Database Setup Required

## ❗ **Current Issues**
1. **Database tables don't exist** - The `User` table with `role` column doesn't exist
2. **Schema mismatch** - App is trying to query non-existent columns
3. **No data** - No roles, permissions, or user data

---

## 🔧 **IMMEDIATE FIX (3 Steps)**

### **Step 1: Check What Actually Exists**
1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq
   - Click **SQL Editor** → **New Query**

2. **Run Schema Check**
   - Copy and paste **entire** content of `CHECK_ACTUAL_SCHEMA.sql`
   - Click **Run**
   - This will show what tables/columns actually exist

### **Step 2: Run Complete Database Setup**
1. **Open New Query in SQL Editor**

2. **Run Complete Setup**
   - Copy and paste **ENTIRE** content of `COMPLETE_SETUP.sql`
   - Click **Run**
   - Wait for "Success" message

3. **Verify Setup**
   - Run `CHECK_ACTUAL_SCHEMA.sql` again
   - Should show all tables exist with proper columns

### **Step 3: Assign Your Super Admin Role**
1. **Get Your User ID**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'superadmin@clientdocs.com';
   ```

2. **Assign Super Admin Role** (replace `YOUR_UUID` with the ID from step 1)
   ```sql
   INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
   ('ur-super-admin', 'YOUR_UUID', 'super-admin-role')
   ON CONFLICT ("user_id", "role_id") DO NOTHING;
   ```

---

## 🎯 **What COMPLETE_SETUP.sql Will Create**

### **Tables Created:**
- ✅ `User` - User accounts (with `role` column)
- ✅ `roles` - User roles (super_admin, admin, user)
- ✅ `permissions` - System permissions
- ✅ `user_roles` - User-role assignments
- ✅ `user_permissions` - Direct user permissions
- ✅ `role_permissions` - Role-based permissions
- ✅ `files` - File metadata

### **Data Inserted:**
- ✅ 3 roles (super_admin, admin, user)
- ✅ 9 permissions (users.*, files.*, admin.access)
- ✅ Role-permission assignments
- ✅ RLS disabled for development

---

## 🧪 **Test After Setup**

### **1. Test Admin Pages**
- **http://localhost:3000/admin/users** - Should show users
- **http://localhost:3000/admin/files** - Should show files
- **http://localhost:3000/admin** - Should show statistics

### **2. Test File Upload**
- **http://localhost:3000/admin/upload** - Upload a test file
- Should work without RLS errors

### **3. Test User Creation**
- **http://localhost:3000/admin/users/create** - Create a new user
- Should work with proper role assignment

---

## 🐛 **If Still Having Issues**

### **Check 1: Database Connection**
```sql
SELECT current_database(), current_user;
```

### **Check 2: Table Structure**
```sql
\d "User"
\d "roles"
\d "files"
```

### **Check 3: Data Verification**
```sql
SELECT * FROM "roles";
SELECT * FROM "permissions";
SELECT * FROM "user_roles";
```

### **Check 4: User Query Test**
```sql
SELECT id, email, role, isActive, createdAt FROM "User" LIMIT 5;
```

---

## 📞 **Quick Commands Summary**

```sql
-- 1. Check current schema
-- Run CHECK_ACTUAL_SCHEMA.sql

-- 2. Complete setup
-- Run COMPLETE_SETUP.sql

-- 3. Get your user ID
SELECT id FROM auth.users WHERE email = 'superadmin@clientdocs.com';

-- 4. Assign role (replace UUID)
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'YOUR_UUID_HERE', 'super-admin-role');

-- 5. Verify everything works
SELECT * FROM "User";
SELECT * FROM "roles";
SELECT * FROM "files";
```

---

## ✅ **Success Indicators**

After running the setup:

- ✅ No more "column does not exist" errors
- ✅ Users page shows your user account
- ✅ Files page shows uploaded files
- ✅ Admin dashboard shows statistics
- ✅ File uploads work without RLS errors
- ✅ All admin pages load without errors
- ✅ User creation works properly

**The issue is that the database hasn't been set up yet. Run `COMPLETE_SETUP.sql` and everything will work!** 🚀
