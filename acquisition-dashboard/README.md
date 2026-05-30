# EMC2Ops Acquisition Dashboard

Manual dashboard for the 30-day property-management client acquisition sprint.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Run `npm install`.
4. Run `npm run dev`.

The app uses Supabase Auth and row-level policies so each signed-in user can only
read and edit their own prospects, outreach activity, and sprint tasks.

The local dashboard runs on `http://localhost:9876` so social OAuth callbacks can
return to the app.

## Dashboard agent

The local Python agent signs in as the same dashboard user and operates on the
existing Supabase records through the dashboard's row-level policies. Fill these
local `.env.local` values before running it:

```bash
OPENAI_API_KEY=
DASHBOARD_EMAIL=
DASHBOARD_PASSWORD=
```

The Vite `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values above
are reused by the agent. With Python 3.10 or newer, install the Python
dependencies locally with:

```bash
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
```

Run a metrics and task brief with:

```bash
.venv/bin/python main.py --daily-brief
```

Run the founder handoff view used by the acquisition autopilot with:

```bash
.venv/bin/python main.py --autopilot-checkin
```

Give it a concrete dashboard job when records should change:

```bash
.venv/bin/python main.py "Mark the proposal task I finished as done and show today's metrics."
```

The agent can read metrics, add researched prospects and sprint tasks, log
outreach that already happened, update prospect stages and follow-up dates, and
move sprint task statuses. It does not send outreach, publish content, alter the
calendar, or claim delivery work happened on its own.

## Office 365 approval sending

Office 365 sends use a dashboard approval queue. The agent can queue email copy
for review, but only rows approved in the dashboard can be sent by the sender.
The sender records the cold email or follow-up activity after Microsoft Graph
accepts the message.

Create a Microsoft Entra app registration for the founder mailbox first:

1. Add the delegated Microsoft Graph `Mail.Send` permission.
2. Enable public client flows for device-code login.
3. Put the app client ID in `.env.local` as `OFFICE365_CLIENT_ID`.
4. Set `OFFICE365_TENANT_ID` to the tenant ID or tenant domain when the default
   `organizations` authority is too broad for the tenant policy.

Complete the one-time Office 365 login from this directory:

```bash
.venv/bin/python office365_mail.py auth
```

After an email draft is reviewed and approved in the dashboard, send approved
rows with:

```bash
.venv/bin/python office365_mail.py send-approved
```

The sender requests only `Mail.Send`; it does not read the mailbox or create
Outlook drafts. Its refreshable MSAL token cache defaults outside the repo at
`~/.cache/emc2ops/office365-msal-cache.json`.

The scheduled Codex acquisition autopilot uses
[`docs/autopilot.md`](docs/autopilot.md) as its runbook. It may research public
prospects, prepare assets and drafts, and keep the dashboard honest. Founder
approval stays required for external contact and founder-voice work unless a
channel is explicitly authorized later.

## Verification

Run these before deploying or after touching dashboard code:

```bash
npm run lint
npm run build
.venv/bin/python -m pytest -q
```

## X posting

Fill the X values in `.env.local`, then restart `npm run dev`. The Social Media
Marketing tab can post text or link posts to X using either the OAuth 1.0a user
access token pair or an OAuth 2.0 connection started from **Connect X**.

In the X Developer Portal, keep the callback URI set to:

```text
http://localhost:9876/auth/callback
```

The app stores OAuth 2.0 connection data in `.x-social-connections.json`, which
is ignored by git.

## Separate Vercel deployment

Deploy this dashboard as its own Vercel project with:

- Project root: `acquisition-dashboard`
- Build command: `npm run build`
- Output directory: `dist`

The local Vite middleware routes are mirrored by `vercel.json` for the deployed
app. Configure production callback URLs to the dashboard domain:

```bash
X_OAUTH_REDIRECT_URI="https://your-dashboard-domain.com/auth/callback"
META_OAUTH_REDIRECT_URI="https://your-dashboard-domain.com/api/meta/auth/callback"
```

Keep the root EMC2Ops marketing site deployment separate from this dashboard
project.
