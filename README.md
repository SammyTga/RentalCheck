# RentalCheck.co.nz

Public record of rental property defects and safety issues at a specific New Zealand address, after they have been reported to the owner or manager.

Live site: https://rentalcheck.co.nz

## What it does

- Public feed, grouped by address
- Issue pages with up to four photos
- Log an issue with no account
- Secret code to edit a post or mark it resolved
- Search by street or suburb, filter by category
- About, guidelines, and contact
- Password-protected `/admin` to hide or delete posts and read contact messages
- Supabase for posts, contact messages, and photo storage

## Run locally

```cmd
cd tenancy-log
npm install
npm run dev
```

Open http://localhost:3000

Phone on the same Wi-Fi: use the Network address printed in the terminal.

## Environment

Create `.env.local` in this folder. Do not commit it.

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

`SUPABASE_URL` is the project URL only. Do not add `/rest/v1`.

The same three values go in the Vercel project under Environment Variables.

## Database

Supabase project, then run `supabase/schema.sql` in the SQL editor.

Photos use the public Storage bucket `issue-photos`.

## Deploy

The app is a Next.js project on Vercel, connected to this GitHub repo.

Do not upload:

- `.env.local`
- `node_modules`
- `.next`

Vercel installs dependencies and builds from this repo. Push a change to `main` to redeploy.
