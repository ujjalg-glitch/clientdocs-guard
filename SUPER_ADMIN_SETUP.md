# Super Admin Setup Guide

## 🎯 Quick Setup

### Step 1: Run Database Setup SQL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rlsdiyunttbhqdiesaeq`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `basic_setup.sql`
6. Click **Run** or press `Ctrl+Enter`

### Step 2: Create Super Admin User in Supabase Auth

You have **two options**:

#### Option A: Manual Creation (Recommended)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: `superadmin@clientdocs.com`
   - **Password**: `SuperAdmin123!`
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create user**

#### Option B: Using Script

1. Get your Service Role Key from Supabase:
   - Go to **Settings** → **API**
   - Copy the `service_role` key (⚠️ Keep this secret!)

2. Add to your `.env` file:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Run the setup script:
   ```bash
   npx tsx scripts/setup-super-admin.ts
   ```

### Step 3: Test Login

1. Go to: http://localhost:3001/auth/login
2. Login with:
   - **Email**: `superadmin@clientdocs.com`
   - **Password**: `SuperAdmin123!`
3. You should be redirected to the dashboard

### Step 4: Access Admin Panel

1. After logging in, go to: http://localhost:3001/admin
2. You should see the admin dashboard with:
   - User Management
   - File Management
   - Roles & Permissions
   - Analytics
   - Settings

## 🔐 Super Admin Credentials

```
Email: superadmin@clientdocs.com
Password: SuperAdmin123!
```

⚠️ **IMPORTANT**: Change this password after first login!

## 🧪 Testing the Setup

### Test Authentication
Visit: http://localhost:3001/test-auth

This page will show:
- ✅ If you're authenticated
- ❌ If you need to login

### Test Pages
- **Login**: http://localhost:3001/auth/login
- **Register**: http://localhost:3001/auth/register
- **Dashboard**: http://localhost:3001/dashboard
- **Admin**: http://localhost:3001/admin
- **Admin Users**: http://localhost:3001/admin/users
- **Admin Upload**: http://localhost:3001/admin/upload

## 📊 Database Structure

The `basic_setup.sql` creates:

### Tables
- `roles` - System roles (super_admin, admin, user)
- `permissions` - System permissions (users.create, files.read, etc.)
- `user_roles` - User-to-role assignments
- `role_permissions` - Role-to-permission assignments
- `files` - File metadata and storage

### Initial Data
- 3 Roles: `super_admin`, `admin`, `user`
- 9 Permissions: user management, file management, admin access
- Super admin user with all permissions

## 🔧 Troubleshooting

### Issue: Can't login
- Make sure you created the user in Supabase Auth (Step 2)
- Make sure you checked "Auto Confirm User"
- Check the browser console for errors

### Issue: Database errors
- Run `basic_setup.sql` in Supabase SQL Editor
- Make sure all tables were created successfully
- Check for any SQL errors in the output

### Issue: Admin page shows error
- Make sure you're logged in
- The user must exist in both Supabase Auth AND the database
- Check that the `user_roles` table has the super admin assignment

### Issue: Service role key not working
- Make sure you copied the `service_role` key, not the `anon` key
- The key should start with `eyJ...`
- Check that it's properly set in `.env`

## 📝 Next Steps

After setting up the super admin:

1. ✅ Test login with super admin credentials
2. ✅ Access the admin panel
3. ✅ Create additional users via the admin interface
4. ✅ Assign roles and permissions
5. ✅ Start uploading files
6. ✅ Implement PDF features

## 🎉 Success!

If you can:
- ✅ Login with super admin credentials
- ✅ See the dashboard
- ✅ Access the admin panel
- ✅ See the user management page

Then your setup is complete! 🎊

