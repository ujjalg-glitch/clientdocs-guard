# 🧪 ClientDocs Guard - Complete Testing Guide

## 📋 Pre-Testing Checklist

Before you start testing, make sure:
- [ ] Dev server is running (`npm run dev`)
- [ ] Supabase project is configured
- [ ] `basic_setup.sql` has been run
- [ ] Super admin user created in Supabase
- [ ] `.env` file is properly configured

---

## 🎯 Testing Process

### Phase 1: Setup Verification

#### Test 1.1: Check Dev Server
```bash
# Should be running on port 3000
Visit: http://localhost:3000
```

**Expected Result:**
- ✅ Page loads without errors
- ✅ You see the home page

---

### Phase 2: Authentication Testing

#### Test 2.1: Register New User
1. Go to: http://localhost:3000/auth/register
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123456!`
   - Confirm Password: `Test123456!`
3. Click "Create account"

**Expected Result:**
- ✅ Success toast message appears
- ✅ Redirected to `/dashboard`
- ✅ You see dashboard page

**If Failed:**
- ❌ "Email not confirmed" → Disable email confirmation in Supabase
- ❌ Network error → Check Supabase credentials in `.env`

---

#### Test 2.2: Logout
1. Click on user avatar (top right)
2. Click "Log out"

**Expected Result:**
- ✅ Redirected to login page
- ✅ Can't access dashboard anymore

---

#### Test 2.3: Login with Regular User
1. Go to: http://localhost:3000/auth/login
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123456!`
3. Click "Login"

**Expected Result:**
- ✅ Success message
- ✅ Redirected to dashboard
- ✅ Can see user dashboard

---

#### Test 2.4: Login with Super Admin
1. Logout current user
2. Go to: http://localhost:3000/auth/login
3. Enter:
   - Email: `superadmin@clientdocs.com`
   - Password: `SuperAdmin123!`
4. Click "Login"

**Expected Result:**
- ✅ Success message
- ✅ Redirected to dashboard
- ✅ Has admin access

---

### Phase 3: Dashboard Testing

#### Test 3.1: User Dashboard
1. Login as regular user
2. Go to: http://localhost:3000/dashboard

**Expected Result:**
- ✅ See welcome message
- ✅ See user email displayed
- ✅ See statistics cards
- ✅ Navigation works

**Check:**
- User name displayed correctly
- No error messages
- Page loads smoothly

---

### Phase 4: Admin Panel Testing

#### Test 4.1: Admin Access (Super Admin)
1. Login as super admin
2. Go to: http://localhost:3000/admin

**Expected Result:**
- ✅ Admin dashboard loads
- ✅ See overview cards (Users, Documents, Analytics, etc.)
- ✅ All navigation links visible
- ✅ Statistics displayed

---

#### Test 4.2: User Management
1. Go to: http://localhost:3000/admin/users

**Expected Result:**
- ✅ See list of users
- ✅ See super admin user
- ✅ See test user (if created)
- ✅ User details displayed (email, role, status)
- ✅ Actions dropdown works

**Check:**
- Role badges display correctly
- Status shows "Active"
- Created date shows

---

#### Test 4.3: File Management
1. Go to: http://localhost:3000/admin/files

**Expected Result:**
- ✅ Page loads without errors
- ✅ If no files: "No files uploaded yet" message
- ✅ "Upload File" button visible
- ✅ Can click to upload page

---

### Phase 5: File Upload Testing

#### Test 5.1: Upload Page Access
1. Go to: http://localhost:3000/admin/upload

**Expected Result:**
- ✅ Upload form displayed
- ✅ File input visible
- ✅ Instructions shown
- ✅ Setup warning about storage bucket

---

#### Test 5.2: File Validation
1. Try to upload a `.txt` file

**Expected Result:**
- ❌ Error: "Please select a PDF or image file"

2. Try to upload a very large file (>10MB)

**Expected Result:**
- ❌ Error: "File size must be less than 10MB"

---

#### Test 5.3: Upload PDF File
**Setup First:**
1. Go to Supabase Dashboard
2. Storage → Create bucket named "documents"
3. Set as public or private

**Test:**
1. Select a PDF file (<10MB)
2. Click "Upload File"

**Expected Result:**
- ✅ Progress bar shows
- ✅ Upload completes
- ✅ Success message appears
- ✅ File preview shows

**If Failed:**
- ❌ "Bucket not found" → Create "documents" bucket in Supabase
- ❌ "Permission denied" → Check bucket permissions

---

#### Test 5.4: Upload Image File
1. Select a PNG/JPG file (<10MB)
2. Click "Upload File"

**Expected Result:**
- ✅ Image preview shows
- ✅ Upload completes
- ✅ Success message

---

### Phase 6: PDF Tools Testing

#### Test 6.1: PDF Tools Page
1. Go to: http://localhost:3000/admin/pdf-tools
2. Select a PDF file

**Expected Result:**
- ✅ Page loads
- ✅ File selector works
- ✅ PDF info displayed
- ✅ Tabs visible (Watermark, Extract, Rotate, Metadata)

---

#### Test 6.2: Add Watermark
1. Select PDF
2. Go to "Watermark" tab
3. Enter text: "CONFIDENTIAL"
4. Click "Add Watermark"

**Expected Result:**
- ✅ Processing message
- ✅ PDF downloads
- ✅ Open PDF → watermark visible on pages
- ✅ Success toast

---

#### Test 6.3: Extract Pages
1. Select PDF
2. Go to "Extract" tab
3. Enter page numbers: `1,2`
4. Click "Extract Pages"

**Expected Result:**
- ✅ Processing message
- ✅ New PDF downloads
- ✅ Open PDF → only pages 1 and 2
- ✅ Success toast

---

#### Test 6.4: Rotate Pages
1. Select PDF
2. Go to "Rotate" tab
3. Select rotation: 90°
4. Click "Rotate Pages"

**Expected Result:**
- ✅ Processing message
- ✅ PDF downloads
- ✅ Open PDF → pages rotated
- ✅ Success toast

---

#### Test 6.5: Get Metadata
1. Select PDF
2. Go to "Metadata" tab
3. Click "Get Metadata"

**Expected Result:**
- ✅ Processing message
- ✅ Metadata displayed:
  - Page count
  - Title (if available)
  - Author (if available)
  - Creator (if available)
- ✅ Success toast

---

### Phase 7: Navigation Testing

#### Test 7.1: Main Navigation
**Test all navigation links:**

1. **Dashboard Link**
   - Go to: http://localhost:3000/dashboard
   - ✅ Loads correctly

2. **Admin Link**
   - Go to: http://localhost:3000/admin
   - ✅ Loads correctly

3. **User Avatar Dropdown**
   - Click avatar
   - ✅ Dropdown appears
   - ✅ Profile, Settings, Logout visible

---

#### Test 7.2: Admin Sidebar Navigation
**Click each link in admin sidebar:**

1. Overview → `/admin`
2. Users → `/admin/users`
3. Files → `/admin/files`
4. Upload → `/admin/upload`
5. PDF Tools → `/admin/pdf-tools`

**Expected Result:**
- ✅ All pages load
- ✅ No errors
- ✅ Active link highlighted

---

### Phase 8: Database Testing

#### Test 8.1: Verify Database Tables
Run in Supabase SQL Editor:

```sql
-- Check roles
SELECT * FROM roles;
-- Should return 3 roles

-- Check permissions
SELECT * FROM permissions;
-- Should return 9+ permissions

-- Check user roles
SELECT * FROM user_roles;
-- Should have super admin assignment

-- Check files (if uploaded)
SELECT * FROM files;
-- Should show uploaded files
```

**Expected Result:**
- ✅ All tables exist
- ✅ Data is present
- ✅ No errors

---

#### Test 8.2: Check User in Auth
1. Supabase Dashboard → Authentication → Users

**Expected Result:**
- ✅ See super admin user
- ✅ See test user (if created)
- ✅ Email confirmed ✅
- ✅ Last sign in time updated

---

### Phase 9: Permission Testing (Optional)

#### Test 9.1: Regular User Access
1. Login as regular user (`test@example.com`)
2. Try to access: http://localhost:3000/admin

**Expected Result:**
- ✅ Can access (for now)
- **Note:** Full permission check will work after you assign roles

#### Test 9.2: Check Permission API
1. Login as any user
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/auth/check-permission', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resource: 'users', action: 'read' })
})
.then(r => r.json())
.then(console.log)
```

**Expected Result:**
- ✅ Returns `{hasPermission: true/false}`

---

### Phase 10: Error Handling Testing

#### Test 10.1: Invalid Login
1. Go to login page
2. Enter wrong password
3. Click login

**Expected Result:**
- ❌ Error message displayed
- ❌ Not logged in

---

#### Test 10.2: Access Protected Routes While Logged Out
1. Logout
2. Try to access: http://localhost:3000/dashboard

**Expected Result:**
- ✅ Redirected to login page
- ✅ Cannot access dashboard

---

#### Test 10.3: Browser Console Check
1. Open browser console (F12)
2. Navigate through app

**Expected Result:**
- ✅ No red errors
- ⚠️ Warnings are okay
- ✅ No CORS errors

---

## 📊 Testing Checklist Summary

### Authentication ✅
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Super admin login works
- [ ] Protected routes redirect

### Dashboard ✅
- [ ] User dashboard loads
- [ ] User info displayed
- [ ] Navigation works

### Admin Panel ✅
- [ ] Admin overview loads
- [ ] User management works
- [ ] File management works
- [ ] Statistics display

### File Upload ✅
- [ ] Upload page loads
- [ ] File validation works
- [ ] PDF upload works
- [ ] Image upload works
- [ ] Storage bucket configured

### PDF Tools ✅
- [ ] PDF tools page loads
- [ ] Watermark works
- [ ] Page extraction works
- [ ] Page rotation works
- [ ] Metadata extraction works

### Database ✅
- [ ] All tables created
- [ ] Roles present
- [ ] Permissions present
- [ ] User roles assigned

### Navigation ✅
- [ ] All links work
- [ ] Breadcrumbs work
- [ ] Active states work

---

## 🐛 Common Issues & Solutions

### Issue 1: "Email not confirmed"
**Solution:**
```
1. Supabase Dashboard → Authentication → Providers
2. Email → Turn OFF "Confirm email"
3. Save
```

### Issue 2: "Storage bucket not found"
**Solution:**
```
1. Supabase Dashboard → Storage
2. Create new bucket: "documents"
3. Set public/private as needed
```

### Issue 3: "zod module not found"
**Solution:**
```bash
npm install zod
# Or
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Can't access admin panel
**Solution:**
```
1. Make sure you're logged in
2. Run basic_setup.sql if not done
3. Check user has admin role
```

### Issue 5: PDF tools not working
**Solution:**
```
1. Make sure PDF is selected
2. Check file size < 10MB
3. Check browser console for errors
```

---

## 📈 Performance Testing

### Test Load Time
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page

**Expected:**
- Initial load: < 3 seconds
- Dashboard load: < 2 seconds
- PDF processing: Varies by file size

---

## 🎯 Success Criteria

Your app is working correctly if:

1. ✅ Can register and login
2. ✅ Can access dashboard
3. ✅ Super admin can access admin panel
4. ✅ Can upload files
5. ✅ PDF tools work
6. ✅ No console errors
7. ✅ Navigation works
8. ✅ Database has correct data

---

## 📝 Test Report Template

```
Date: [Date]
Tester: [Your Name]
Version: 1.0.0

✅ PASSED:
- Authentication: ✅
- Dashboard: ✅
- Admin Panel: ✅
- File Upload: ✅
- PDF Tools: ✅

❌ FAILED:
- [None / List issues]

🐛 BUGS FOUND:
- [None / List bugs]

📊 OVERALL: PASS / FAIL
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. ✅ Mark setup as complete
2. ✅ Start using the application
3. ✅ (Optional) Add OpenRouter for AI
4. ✅ (Optional) Customize branding
5. ✅ (Optional) Add more features

---

**Happy Testing! 🎉**

