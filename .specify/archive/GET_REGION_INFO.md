# Get Your Database Region

## Quick Method

1. Go to: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq/settings/database
2. Scroll to **Connection string** section
3. Look for the **URI** or **Connection pooling** option
4. You'll see something like:

```
postgresql://postgres.rlsdiyunttbhqdiesaeq:cATCH@123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

The region is the part before `.pooler.supabase.com`, for example:
- `aws-0-us-east-1`
- `aws-0-us-west-1`
- `aws-0-eu-central-1`
- `aws-0-ap-southeast-1`

## Or Check Project Settings

Go to: https://supabase.com/dashboard/project/rlsdiyunttbhqdiesaeq/settings/general

Look for **Region** - it will show something like "US East (Ohio)" which corresponds to `aws-0-us-east-1`

## Common Regions

- **US East (N. Virginia)** → `aws-0-us-east-1`
- **US West (Oregon)** → `aws-0-us-west-1`
- **Europe (Frankfurt)** → `aws-0-eu-central-1`
- **Asia Pacific (Singapore)** → `aws-0-ap-southeast-1`
- **Asia Pacific (Mumbai)** → `aws-0-ap-south-1`

## Tell Me Your Region

Once you find it, just tell me the region code (e.g., "aws-0-us-east-1") and I'll update your .env file!

