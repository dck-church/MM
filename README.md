<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/563a9f6d-0ac9-44f6-bcbc-7bd9a98e666a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Supabase Postgres connection string. Keep the real connection string private and URL-encode reserved characters in its password.
3. Run the app:
   `npm run dev`

On first startup with `DATABASE_URL`, the server creates the private `public.app_state` table and imports existing records from `data/database.json` if the table is empty. After that, Supabase is the source of truth for application records. Without `DATABASE_URL`, local development continues to use `data/database.json`; production startup requires `DATABASE_URL`.

Uploaded files are still stored in `data/uploads` on the server filesystem; they are not moved to Supabase Storage by this database migration.
