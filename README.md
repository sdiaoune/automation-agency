# EMC2Ops Site

Astro-powered EMC2Ops landing page and property-management automation blog, plus API routes for workflow audit bookings.

## Local Preview

```bash
npm run dev
```

Then open `http://localhost:3000` for the landing page or `http://localhost:3000/blog/` for the blog.

Public site source lives in `src/`:

- `src/pages/index.astro` for the landing page
- `src/pages/blog/index.astro` and `src/pages/blog/[slug].astro` for blog routes
- `src/content/blog/*.md` for blog content
- `public/` for static files and image assets

The separate React acquisition dashboard remains in `acquisition-dashboard/` and is not part of the root Astro build.

## Verification

```bash
npm run blog:validate
npm run test:api
npm run test:public
npm run test
```

`npm run test:public` starts the Astro dev server automatically through Playwright. API tests mock Supabase and notification providers, so they do not require production credentials.

## Blog Automation

Blog posts now live as Astro Markdown content in `src/content/blog/*.md`. Use:

```bash
npm run blog:list
npm run blog:validate
npm run generate:blog
npm run post:blog:social -- --slug missed-call-text-back-property-management --dry-run
```

`npm run generate:blog` is kept as a compatibility alias for the old static generator workflow; it now runs the Astro build. The X promotion script validates the Markdown content and runs an Astro build before checking the public URL and Twitter card metadata, unless you pass `--skip-build`.

`npm run post:blog:social` posts the selected blog to X and to LinkedIn through Buffer by default. Use `--x-only`, `--linkedin-only`, `--no-x`, `--no-linkedin`, or `--channels x,linkedin` to control the destination channels. LinkedIn posting uses `BUFFER_API_KEY` plus optional `BUFFER_ORGANIZATION_ID`, `BUFFER_LINKEDIN_CHANNEL_ID`, and `BUFFER_POST_MODE` from `.env.local` or `acquisition-dashboard/.env.local`.

When `--image` is provided, the X publisher attempts an image-led thread first. If X media upload is forbidden for the current app/account, the script now records that in `.x-publisher-capabilities.json` and falls back to a direct link post instead of failing the whole automation. Future runs skip the known-bad media path automatically unless you pass `--force-media-thread`.

## X Growth Post Endpoint

The root Vercel deployment includes `/api/x-growth-post`, protected by
`CRON_SECRET`. It can be called manually for queued posting tests, but it is no
longer scheduled by `vercel.json`.

Set these production environment variables in Vercel:

```bash
CRON_SECRET="..."
X_CONSUMER_KEY="..."
X_CONSUMER_SECRET="..."
X_ACCESS_TOKEN="..."
X_ACCESS_TOKEN_SECRET="..."
```

You can override the built-in growth copy queue with
`X_GROWTH_POSTS_JSON='["post one", "post two"]'`. Test the route without
posting by calling `/api/x-growth-post?dryRun=1&slot=0` with the same bearer
token.

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
