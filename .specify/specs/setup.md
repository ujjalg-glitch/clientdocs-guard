# ClientDocs Guard - Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## Quick Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd clientdocs-guard
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Features (Optional)
OPENROUTER_API_KEY=your_openrouter_key
```

### 3. Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run `docs/database/SETUP.sql`
3. Verify tables are created
4. Set up storage bucket named "documents"

### 4. Run Development Server
```bash
npm run dev
```

Access at: http://localhost:3000

## Detailed Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Database Setup**
   - Run the complete database setup script
   - Verify all tables are created
   - Check RLS policies are enabled

3. **Storage Setup**
   - Create bucket named "documents"
   - Set appropriate permissions
   - Configure public access for shared files

4. **Authentication Setup**
   - Enable email authentication
   - Configure email templates (optional)
   - Set up redirect URLs

### Development Environment

1. **Code Editor Setup**
   - Install recommended extensions
   - Configure TypeScript
   - Set up Prettier and ESLint

2. **Git Configuration**
   - Set up pre-commit hooks
   - Configure branch protection
   - Set up automated testing

### Production Setup

1. **Environment Variables**
   - Set production Supabase credentials
   - Configure production URLs
   - Set up monitoring tools

2. **Deployment**
   - Deploy to Vercel (recommended)
   - Configure custom domain
   - Set up SSL certificates

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check Supabase URL and keys
- Verify network connectivity
- Check firewall settings

**File Upload Not Working**
- Verify storage bucket exists
- Check storage permissions
- Verify file size limits

**Authentication Issues**
- Check Supabase auth configuration
- Verify redirect URLs
- Check email settings

### Getting Help

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review error logs in browser console
3. Check Supabase dashboard for errors
4. Create an issue in the repository

## Next Steps

After setup:
1. Create your first user account
2. Upload a test document
3. Create a client group
4. Test document sharing
5. Explore the admin features

---

**Setup Guide Version**: 1.0  
**Last Updated**: December 2024
