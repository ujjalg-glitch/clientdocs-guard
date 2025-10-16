# Configuration Instructions

## 🔐 Get Your Supabase Database Password

You need to get your database password from Supabase to complete the setup.

### Step 1: Get Database Connection Details

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq
2. Click on **Settings** (⚙️ gear icon in left sidebar)
3. Click on **Database** in the settings menu
4. Scroll down to **Connection string** section
5. Select **URI** tab
6. You'll see something like:

```
postgresql://postgres.rlsdiyunttbhqdiesaeq:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

The format will be:
- **Region**: The part before `.pooler.supabase.com` (e.g., `aws-0-us-west-1`)
- **Password**: The part after `rlsdiyunttbhqdiesaeq:` and before `@`

### Step 2: Connection String Formats You Need

Based on your project ref `rlsdiyunttbhqdiesaeq`, your connection strings should look like:

**For DATABASE_URL (Connection Pooling):**
```
postgresql://postgres.rlsdiyunttbhqdiesaeq:[YOUR-PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**For DIRECT_URL (Direct Connection):**
```
postgresql://postgres.rlsdiyunttbhqdiesaeq:[YOUR-PASSWORD]@[REGION].pooler.supabase.com:5432/postgres
```

### Step 3: Common Regions

Your region is typically something like:
- `aws-0-us-west-1`
- `aws-0-us-east-1`
- `aws-0-eu-west-1`
- `aws-0-ap-southeast-1`

Check your Supabase Dashboard → Settings → General → Project Region

## 📋 Quick Action

Copy the connection string from Supabase and I'll help you format it correctly!

