# EMC2Ops Site

Static EMC2Ops landing page plus an outbound sprint dashboard for the 30-day property-management client acquisition plan.

## Local Preview

```bash
npm run dev
```

Then open `http://localhost:3000` for the landing page or `http://localhost:3000/dashboard.html` for the dashboard.

## Verification

```bash
npm run test:api
npm run test:dashboard
npm run test
```

`npm run test:dashboard` starts the local static server automatically through Playwright. API tests mock Supabase and notification providers, so they do not require production credentials.

## Dashboard Data

The dashboard works in local browser storage by default. To enable Supabase sync:

1. Apply `supabase/migrations/20260522120000_outbound_dashboard.sql` to the Supabase project.
2. Put the project URL and publishable key in `dashboard-config.js`.
3. Set the Supabase Auth site URL or redirect URL to the deployed dashboard origin when email confirmation is enabled.
4. Create an account from `/dashboard` and sign in after email confirmation if the Supabase project requires it.

## Audit Booking Form

The landing page posts audit requests to `/api/book-audit`. The API stores each request in Supabase and can notify you by email or webhook.

1. Apply `supabase/migrations/20260523120000_create_audit_bookings.sql` to the Supabase project.
2. Set these environment variables in Vercel:

```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
AUDIT_NOTIFICATION_EMAIL="hello@emc2ops.com"
```

3. Configure one notification path:

```bash
# Email through Resend
RESEND_API_KEY="re_..."
AUDIT_NOTIFICATION_FROM="EMC2Ops <bookings@emc2ops.com>"

# Or a Zapier/Make/Slack-style webhook
AUDIT_NOTIFICATION_WEBHOOK_URL="https://..."

# Or Telegram
TELEGRAM_BOT_TOKEN="123456:..."
TELEGRAM_CHAT_ID="@yourusername"
```

Use the Supabase service role key only in server-side environment variables. Do not put it in `dashboard-config.js` or any browser-facing file.
