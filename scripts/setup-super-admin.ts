import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupSuperAdmin() {
  try {
    console.log('🔧 Setting up super admin user...')
    
    // Create the super admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'superadmin@clientdocs.com',
      password: 'SuperAdmin123!',
      email_confirm: true,
      user_metadata: {
        name: 'Super Administrator',
        role: 'super_admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Super admin user already exists')
      } else {
        throw authError
      }
    } else {
      console.log('✅ Super admin user created successfully')
    }

    // Update the user in our database to match
    const { error: dbError } = await supabase
      .from('User')
      .upsert({
        id: 1,
        email: 'superadmin@clientdocs.com',
        name: 'Super Administrator',
        role: 'super_admin',
        is_active: true
      })

    if (dbError) {
      console.log('⚠️  Database update failed (this is expected if tables don\'t exist yet):', dbError.message)
    } else {
      console.log('✅ Database user record updated')
    }

    console.log('\n🎉 Super Admin Setup Complete!')
    console.log('📧 Email: superadmin@clientdocs.com')
    console.log('🔑 Password: SuperAdmin123!')
    console.log('\n📋 Next Steps:')
    console.log('1. Run the basic_setup.sql in Supabase SQL Editor')
    console.log('2. Test login at http://localhost:3000/auth/login')
    console.log('3. Access admin at http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Error setting up super admin:', error)
    process.exit(1)
  }
}

setupSuperAdmin()
