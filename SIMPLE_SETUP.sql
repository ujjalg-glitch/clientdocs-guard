-- SIMPLE SETUP - Just set your user as admin
-- Change the email below to YOUR email address

-- Step 1: Update your user to admin role
UPDATE "User"
SET role = 'admin', "isActive" = true
WHERE email = 'superadmin@clientdocs.com'; -- ⬅️ CHANGE THIS TO YOUR EMAIL

-- Step 2: Verify it worked
SELECT email, role, "isActive"
FROM "User"
WHERE email = 'superadmin@clientdocs.com'; -- ⬅️ CHANGE THIS TOO

-- Should show:
-- email: your@email.com
-- role: admin
-- isActive: true

