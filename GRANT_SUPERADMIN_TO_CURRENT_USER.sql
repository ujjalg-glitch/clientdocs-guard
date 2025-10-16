-- GRANT SUPER ADMIN TO YOUR CURRENT LOGGED-IN USER
-- Run this in Supabase SQL Editor to give your current user super admin access

-- Step 1: Check what user email you're logged in as
-- Replace 'YOUR_EMAIL_HERE' with your actual logged-in email
-- For example: 'superadmin@clientdocs.com' or the email you used to login

-- IMPORTANT: Replace YOUR_EMAIL_HERE with your actual email!
DO $$
DECLARE
  v_user_email TEXT := 'superadmin@clientdocs.com'; -- ⬅️ CHANGE THIS TO YOUR EMAIL
  v_user_id TEXT;
  v_super_admin_role_id TEXT;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users', v_user_email;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found user: % with ID: %', v_user_email, v_user_id;
  
  -- Update or insert User record (handle both id and email conflicts)
  -- First, try to update existing user by email
  UPDATE "User" 
  SET id = v_user_id, role = 'super_admin', "isActive" = true, name = 'Super Admin'
  WHERE email = v_user_email;
  
  -- If no row was updated, insert new user
  IF NOT FOUND THEN
    INSERT INTO "User" (id, email, name, role, "isActive")
    VALUES (v_user_id, v_user_email, 'Super Admin', 'super_admin', true)
    ON CONFLICT (id) DO UPDATE
    SET email = v_user_email, role = 'super_admin', "isActive" = true, name = 'Super Admin';
  END IF;
  
  RAISE NOTICE 'Updated User table with super_admin role';
  
  -- Get or create super_admin role
  SELECT id INTO v_super_admin_role_id
  FROM roles
  WHERE name = 'super_admin';
  
  IF v_super_admin_role_id IS NULL THEN
    INSERT INTO roles (id, name, description, is_active)
    VALUES ('super-admin-role', 'super_admin', 'Super Administrator with full system access', true)
    RETURNING id INTO v_super_admin_role_id;
    RAISE NOTICE 'Created super_admin role';
  END IF;
  
  -- Assign super_admin role to user
  INSERT INTO user_roles (id, user_id, role_id)
  VALUES (gen_random_uuid(), v_user_id, v_super_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RAISE NOTICE 'Assigned super_admin role to user';
  
  -- Grant all permissions to user (if permissions exist)
  INSERT INTO user_permissions (id, user_id, permission_id, granted)
  SELECT gen_random_uuid(), v_user_id, p.id, true
  FROM permissions p
  ON CONFLICT (user_id, permission_id) DO UPDATE
  SET granted = true;
  
  RAISE NOTICE 'Granted all permissions to user';
  
  RAISE NOTICE '✅ SUCCESS! User % now has super_admin access', v_user_email;
END $$;

-- Verify the setup
SELECT 
  u.email,
  u.role as user_table_role,
  r.name as assigned_role,
  COUNT(DISTINCT up.permission_id) as direct_permissions,
  COUNT(DISTINCT rp.permission_id) as role_permissions
FROM "User" u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN user_permissions up ON up.user_id = u.id
LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
WHERE u.email = 'superadmin@clientdocs.com' -- ⬅️ CHANGE THIS TO YOUR EMAIL
GROUP BY u.email, u.role, r.name;

