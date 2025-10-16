# 🗄️ Database Setup Steps

## ❗ **Current Issue**
The admin pages are showing errors because the database tables haven't been created yet.

---

## 🔧 **Step-by-Step Fix**

### **Step 1: Check Current Database Status**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Run Database Check**
   - Copy and paste the content of `QUICK_DATABASE_CHECK.sql`
   - Click **Run**
   - This will show you what tables exist and what's missing

---

### **Step 2: Run Complete Database Setup**

1. **Open New Query in SQL Editor**

2. **Run Complete Setup**
   - Copy and paste the **ENTIRE** content of `COMPLETE_SETUP.sql`
   - Click **Run**
   - Wait for "Success" message

3. **Verify Setup**
   - Run `QUICK_DATABASE_CHECK.sql` again
   - Should show all tables exist with data

---

### **Step 3: Assign Super Admin Role**

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

### **Step 4: Test the Application**

1. **Test File Upload**
   - Go to: http://localhost:3000/admin/upload
   - Upload a test file
   - Should work without errors

2. **Test Admin Pages**
   - Go to: http://localhost:3000/admin/users
   - Should show users (including yourself)
   - Go to: http://localhost:3000/admin/files
   - Should show uploaded files

3. **Test Dashboard**
   - Go to: http://localhost:3000/admin
   - Should show statistics and system status

---

## 🎯 **Expected Results After Setup**

### **Database Tables Created:**
- ✅ `User` - User accounts
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
- ✅ Your super admin user role

### **RLS Status:**
- ✅ RLS disabled for development (easier testing)
- ✅ Storage policies configured

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

### **Check 4: Storage Bucket**
- Go to Storage in Supabase Dashboard
- Make sure "documents" bucket exists
- Check if it's public or has proper policies

---

## 📞 **Quick Commands Summary**

```sql
-- 1. Check status
-- Run QUICK_DATABASE_CHECK.sql

-- 2. Complete setup
-- Run COMPLETE_SETUP.sql

-- 3. Get your user ID
SELECT id FROM auth.users WHERE email = 'superadmin@clientdocs.com';

-- 4. Assign role (replace UUID)
INSERT INTO "user_roles" ("id", "user_id", "role_id") VALUES 
('ur-super-admin', 'YOUR_UUID_HERE', 'super-admin-role');

-- 5. Verify
SELECT * FROM "user_roles";
```

---

## ✅ **Success Indicators**

After running the setup:

- ✅ No more "database not set up" errors
- ✅ Users page shows your user account
- ✅ Files page shows uploaded files
- ✅ Admin dashboard shows statistics
- ✅ File uploads work without RLS errors
- ✅ All admin pages load without errors

**Run `COMPLETE_SETUP.sql` now and your system will be fully functional!** 🚀
