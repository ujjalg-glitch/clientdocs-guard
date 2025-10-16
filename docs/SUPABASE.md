# SUPABASE

## Table of Contents

- [SUPABASE](#supabase)
  - [Table of Contents](#table-of-contents)
  - [URL Configuration](#url-configuration)
  - [Email Templates](#email-templates)
  - [Generating TypeScript Types](#generating-typescript-types)

## URL Configuration

- Site URL: `http://localhost`
- Redirect URLs: `http://localhost:3000/**`

[Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

## Email Templates

Configuring templates

```shell
$ vim supabase/config.toml

[auth.email.template.invite]
subject = "You are invited to Acme Inc"
content_path = "./supabase/templates/invite.html"
```

Deploying email templates

```shell
supabase stop && supabase start
```

[Customizing email templates](https://supabase.com/docs/guides/local-development/customizing-email-templates)

## Generating TypeScript Types

Edit `package.json`:

```json
{
  "scripts": {
    "update-types": "npx supabase gen types --lang=typescript --linked > types/supabase.ts"
  }
}
```

Run it

```shell
npm run update-types
```

[Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types)
