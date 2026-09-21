# RentalCheck.co.nz

Public record of rental property defects and safety issues at a specific New Zealand address, after they have been reported to the owner or manager.

## What it does now

- Public feed grouped by address
- Issue pages with photos
- Log an issue (no account; secret code to edit, resolve, or delete)
- Search by street / suburb and filter by category
- About, guidelines, and contact
- Password-protected `/admin`
- Supabase database + `issue-photos` storage

Browser localStorage is only a fallback when the database is not configured.

## Run locally

```cmd
cd tenancy-log
npm install
npx next dev --webpack
```

Open http://localhost:3000

Put `.env.local` in this folder (do not commit it):

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

## Deploy

Host the Next.js app on Vercel. Add the same three environment variables in the Vercel project. Point rentalcheck.co.nz at Vercel when the domain is ready.

Do not upload `.env.local` or `node_modules`.
