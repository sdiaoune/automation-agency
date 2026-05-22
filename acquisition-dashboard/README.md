# EMC2Ops Acquisition Dashboard

Manual dashboard for the 30-day property-management client acquisition sprint.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Run `npm install`.
4. Run `npm run dev`.

The app uses Supabase Auth and row-level policies so each signed-in user can only
read and edit their own prospects, outreach activity, and sprint tasks.
