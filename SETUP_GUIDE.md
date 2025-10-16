# ClientDocs Guard - Setup Guide

## ✅ Completed Steps

1. ✅ Cloned repository
2. ✅ Installed dependencies (`npm install`)
3. ✅ Created `.env` file from `.env.example`
4. ✅ Configured Supabase URL and ANON_KEY

## 🔧 Next Steps Required

### Step 1: Configure Database Connection Strings

You need to update the following in your `.env` file:

#### Get your database credentials from Supabase:
1. Go to your Supabase project: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq
2. Click on **Settings** (gear icon) → **Database**
3. Scroll down to **Connection string** section
4. Copy the **Connection pooling** string (for `DATABASE_URL`)
5. Copy the **Direct connection** string (for `DIRECT_URL`)

#### Update your `.env` file:

Replace these lines in your `.env`:

```env
# Current (placeholder):
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres"

# Should look like:
DATABASE_URL="postgresql://postgres.rlsdiyunttbhqdiesaeq:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rlsdiyunttbhqdiesaeq:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

**Note:** Replace `[YOUR-PASSWORD]` with your actual database password from Supabase.

### Step 2: Generate Prisma Client

Once database URLs are configured, run:

```bash
npx prisma generate
```

### Step 3: Run Database Migrations

Create the database tables:

```bash
npx prisma migrate dev --name init
```

Or if migrations already exist:

```bash
npx prisma migrate deploy
```

### Step 4: (Optional) Seed the Database

If you want to populate initial data:

```bash
npx prisma db seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## 📚 Additional Configuration

### Email Setup (Optional)
Update the EMAIL_* variables in `.env` if you want to send emails.

### OAuth Providers (Optional)
Configure AUTH_GOOGLE_*, AUTH_GITHUB_*, etc. for social login.

### Supabase Configuration

1. **URL Configuration** (in Supabase Dashboard):
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

2. **Email Templates** (Optional):
   - Customize in `supabase/templates/`
   - Configure in `supabase/config.toml`

## 🔍 Useful Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📖 Documentation

- [DEPENDENCIES](./docs/DEPENDENCIES.md)
- [GIT](./docs/GIT.md)
- [PRISMA](./docs/PRISMA.md)
- [SUPABASE](./docs/SUPABASE.md)

## 🐛 Troubleshooting

### Prisma Connection Issues
See `docs/PRISMA.md` for common database connection issues and solutions.

### Supabase Type Generation
```bash
npm run update-types
```

### Clear and Rebuild
```bash
rm -rf node_modules .next
npm install
npx prisma generate
npm run dev
```

