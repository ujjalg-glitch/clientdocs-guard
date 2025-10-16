-- SIMPLE FIX: Update Existing User to Super Admin
-- Use this if user already exists in database

-- STEP 1: Replace YOUR_EMAIL_HERE with your actual email
-- Example: 'superadmin@clientdocs.com' or 'yourname@example.com'

DO $$
DECLARE
  v_user_email TEXT := 'superadmin@clientdocs.com'; -- ⬅️ CHANGE THIS!
  v_user_id TEXT;
  v_super_admin_role_id TEXT;
BEGIN
  -- Get user ID from auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in auth.users. Please login first!', v_user_email;
  END IF;
  
  RAISE NOTICE 'Found user in auth: %', v_user_id;
  
  -- Update existing user in User table
  UPDATE "User"
  SET 
    id = v_user_id,
    role = 'super_admin',
    "isActive" = true,
    name = COALESCE(name, 'Super Admin')
  WHERE email = v_user_email;
  
  -- If user doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO "User" (id, email, name, role, "isActive")
    VALUES (v_user_id, v_user_email, 'Super Admin', 'super_admin', true);
    RAISE NOTICE 'Created new user in User table';
  ELSE
    RAISE NOTICE 'Updated existing user in User table';
  END IF;
  
  -- Ensure super_admin role exists
  INSERT INTO roles (id, name, description, is_active)
  VALUES ('super-admin-role', 'super_admin', 'Super Administrator', true)
  ON CONFLICT (name) DO UPDATE SET is_active = true
  RETURNING id INTO v_super_admin_role_id;
  
  -- Assign role to user
  INSERT INTO user_roles (id, user_id, role_id)
  VALUES (gen_random_uuid(), v_user_id, v_super_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RAISE NOTICE 'Assigned super_admin role';
  
  -- Grant all existing permissions
  INSERT INTO user_permissions (id, user_id, permission_id, granted)
  SELECT gen_random_uuid(), v_user_id, id, true
  FROM permissions
  ON CONFLICT (user_id, permission_id) DO UPDATE SET granted = true;
  
  RAISE NOTICE '✅ SUCCESS! % is now a super admin', v_user_email;
END $$;

-- Verify the result
SELECT 
  'Verification:' as status,
  u.email,
  u.role as user_role,
  u."isActive" as active,
  (SELECT COUNT(*) FROM user_roles ur WHERE ur.user_id = u.id) as role_count,
  (SELECT COUNT(*) FROM user_permissions up WHERE up.user_id = u.id) as permission_count
FROM "User" u
WHERE u.email = 'superadmin@clientdocs.com'; -- ⬅️ CHANGE THIS TOO!

