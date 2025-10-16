# 📝 How to Create Super Admin User in Supabase Dashboard

## Step-by-Step Guide with Screenshots

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Select your project: **rlsdiyunttbhqdiesaeq**

---

### Step 2: Navigate to Authentication

1. In the left sidebar, click on **"Authentication"** icon (🔐)
2. Click on **"Users"** tab at the top

```
Dashboard
├── Project Settings
├── Table Editor
├── 🔐 Authentication  ← Click here
│   ├── Users          ← Then click here
│   ├── Providers
│   ├── Policies
│   └── Email Templates
└── Storage
```

---

### Step 3: Click "Add User"

1. You'll see a button that says **"Add user"** in the top right
2. Click on it
3. A dropdown will appear
4. Select **"Create new user"**

---

### Step 4: Fill in User Details

You'll see a form with these fields:

#### **Email:** 
```
superadmin@clientdocs.com
```

#### **Password:**
```
SuperAdmin123!
```

#### **Auto Confirm User:**
```
✅ Check this box! (Very important!)
```

#### **User Metadata (Optional):**
```json
{
  "name": "Super Administrator",
  "role": "super_admin"
}
```

---

### Step 5: Create the User

1. Click the **"Create user"** button at the bottom
2. You'll see a success message
3. The user will appear in the users list

---

### Step 6: Verify the User

1. You should now see the user in the users table
2. Look for `superadmin@clientdocs.com`
3. The **"Email Confirmed"** column should show **✅ Confirmed**
4. Copy the **User ID** (you'll need this for the next step)

---

### Step 7: Run the Database Setup SQL

1. Go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the ENTIRE contents of `basic_setup.sql`
4. Click **"Run"** or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

---

### Step 8: Test the Login

1. Go to your app: http://localhost:3000/auth/login
2. Enter:
   - **Email:** `superadmin@clientdocs.com`
   - **Password:** `SuperAdmin123!`
3. Click **"Login"**
4. You should be redirected to the dashboard!

---

## 🎯 Quick Reference

### Super Admin Credentials
```
Email:    superadmin@clientdocs.com
Password: SuperAdmin123!
```

### Important Checkboxes
- ✅ **Auto Confirm User** - MUST be checked!
- This ensures the user can login immediately

---

## 📸 Visual Guide

### What You Should See:

#### 1. Authentication → Users Page
```
┌─────────────────────────────────────────────────┐
│  Authentication                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  Users  Providers  Policies  Templates  │   │
│  │  ────                                    │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [+ Add user ▼]                     [Search]    │
│                                                  │
│  Email                | Confirmed | Created     │
│  ──────────────────────────────────────────     │
│  (empty - no users yet)                         │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### 2. Add User Dropdown
```
┌──────────────────────┐
│  + Add user ▼        │
│  ┌────────────────┐  │
│  │ Create new user│  │ ← Click this
│  │ Invite user    │  │
│  └────────────────┘  │
└──────────────────────┘
```

#### 3. Create User Form
```
┌─────────────────────────────────────────┐
│  Create a new user                       │
│  ──────────────────────────────────────  │
│                                          │
│  Email *                                 │
│  ┌──────────────────────────────────┐  │
│  │ superadmin@clientdocs.com        │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Password *                              │
│  ┌──────────────────────────────────┐  │
│  │ SuperAdmin123!                   │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ✅ Auto Confirm User                   │
│                                          │
│  User Metadata (JSON)                    │
│  ┌──────────────────────────────────┐  │
│  │ {                                │  │
│  │   "name": "Super Administrator",│  │
│  │   "role": "super_admin"          │  │
│  │ }                                │  │
│  └──────────────────────────────────┘  │
│                                          │
│  [Cancel]              [Create user]    │
│                                          │
└─────────────────────────────────────────┘
```

---

## ⚠️ Troubleshooting

### Issue: "Email not confirmed" when trying to login
**Solution:** 
1. Go back to Authentication → Users
2. Find the superadmin user
3. Click on it
4. Manually confirm the email
5. Or recreate the user with "Auto Confirm User" checked

### Issue: User created but can't login
**Solution:**
1. Make sure you ran `basic_setup.sql`
2. Check that the user exists in both Supabase Auth AND the database
3. Verify the password is correct (case-sensitive!)

### Issue: "Permission denied" after login
**Solution:**
1. Make sure `basic_setup.sql` ran successfully
2. Check that the `user_roles` table has the super admin role assigned
3. Verify the roles and permissions tables were created

---

## 🔍 Verify Everything Works

After creating the user, verify:

### 1. User exists in Supabase Auth
- Go to Authentication → Users
- See `superadmin@clientdocs.com`
- Status: Confirmed ✅

### 2. Database tables exist
Run this query in SQL Editor:
```sql
SELECT * FROM roles;
SELECT * FROM permissions;
SELECT * FROM user_roles;
```

You should see:
- 3 roles (super_admin, admin, user)
- 9+ permissions
- 1 user_role assignment

### 3. Can login
- Go to http://localhost:3000/auth/login
- Login with super admin credentials
- Should redirect to dashboard

### 4. Can access admin panel
- Go to http://localhost:3000/admin
- Should see admin dashboard
- Should see user management, files, etc.

---

## 📞 Need Help?

If you're stuck:
1. Check the browser console for errors (F12)
2. Check the terminal for server errors
3. Verify your `.env` file has correct Supabase credentials
4. Make sure port 3000 isn't blocked by another app

---

## ✨ Success Checklist

- [ ] Supabase project opened
- [ ] Navigated to Authentication → Users
- [ ] Clicked "Add user" → "Create new user"
- [ ] Entered email: `superadmin@clientdocs.com`
- [ ] Entered password: `SuperAdmin123!`
- [ ] ✅ Checked "Auto Confirm User"
- [ ] Clicked "Create user"
- [ ] Ran `basic_setup.sql` in SQL Editor
- [ ] Tested login at http://localhost:3000/auth/login
- [ ] Successfully accessed dashboard
- [ ] Successfully accessed admin panel at /admin

---

**Once all checkboxes are done, you're ready to use ClientDocs Guard! 🎉**

