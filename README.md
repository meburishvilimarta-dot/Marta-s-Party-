# 🎃 Marta's Halloween Night

An interactive invitation to **Marta's Halloween Pre-Drinks**: Saturday 31 October 2026, from 20:00, Giorgi Shatberashvili 56, Tbilisi.

- Cinematic opening: night sky, moon, haunted mansion, fog, embers and bats, plus a sealed envelope whose wax seal cracks open.
- Editorial invitation page with a live Tbilisi-time countdown, location and map, WhatsApp contact and a closing scene.
- **The Haunted Guestbook**: a real RSVP system stored in Supabase.
- **`/admin`**: Marta's private dashboard. Login is checked on the server, and Marta can filter, search, edit, delete and export to CSV.

Built with Next.js 15 (App Router), React 19 and plain CSS. The only runtime dependency beyond Next is `@supabase/supabase-js`. Sounds are generated in the browser with the Web Audio API, so there are no audio files, and nothing plays until the visitor turns sound on.

---

## 1. Set up Supabase (about 5 minutes)

1. Create a free project at <https://supabase.com> and pick a region near Tbilisi, such as Frankfurt.
2. Open **SQL Editor → New query**. Paste the whole of
   [`supabase/migrations/20261030000000_create_rsvps.sql`](supabase/migrations/20261030000000_create_rsvps.sql) and click **Run**.
   This creates the `rsvps` and `rate_limit_events` tables with Row Level Security turned on. It is safe to run more than once.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY` (not the `anon` key)

### How the data is protected
- RLS is enabled and there are **no policies** for `anon` or `authenticated`, so Supabase's public API cannot read or write a single row.
- Every read and write goes through this site's server routes (`app/api/*`), which use the service-role key. The key only exists on the server, in a `server-only` module, and is never sent to the browser.
- The public site can only see one number: how many guests said yes (`/api/stats`). Names and notes are never public.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same keys in Vercel.

| Variable | Required | What it is |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase service_role key (server only) |
| `ADMIN_PASSWORD` | yes | The password Marta types at `/admin` |
| `ADMIN_SESSION_SECRET` | yes | 32+ random characters (`openssl rand -base64 48`) that sign the admin cookie |
| `NEXT_PUBLIC_SITE_URL` | optional | Public URL for link previews. Defaults to the Vercel production domain |

If the Supabase keys are missing, the site still works, but the guestbook **refuses** submissions with an honest message pointing guests to WhatsApp. It never pretends an RSVP was saved.

## 3. Run locally

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>. The dashboard is at <http://localhost:3000/admin>.

## 4. Deploy to Vercel

1. Push this repository to GitHub. It already is: `meburishvilimarta-dot/Marta-s-Party-`.
2. Go to <https://vercel.com/new>, choose **Import Git Repository** and select `Marta-s-Party-`. Grant Vercel's GitHub app access if asked.
3. Vercel detects **Next.js** automatically. Leave the build command (`npm run build`), output and install settings at their defaults; `vercel.json` already pins them.
4. Before clicking **Deploy**, open **Environment Variables** and add the four required variables from the table above, for the Production, Preview and Development environments.
5. Click **Deploy**. When it finishes, open the URL, sign the guestbook once, then visit `/admin` to see the entry.
6. Optional: add a custom domain under **Settings → Domains**.

After that, every push to the production branch redeploys automatically. RSVPs live in Supabase, so they survive refreshes and redeploys. If you change an environment variable later, click **Redeploy** for it to take effect.

## Security and anti-spam summary
- **Admin auth**: the password is checked on the server with a constant-time comparison. A signed (HMAC-SHA256), httpOnly, `SameSite=Strict`, `Secure` cookie lasts 12 hours. Every admin API route and the `/admin` page verify it on the server, and admin writes also check the request `Origin`. Login is limited to 8 attempts per 15 minutes per IP.
- **RSVP writes**: input is validated and cleaned (tags, control characters and links in names are stripped; length limits apply). There is a honeypot field, a minimum form-fill time, a same-origin check, and rate limits of 12 per 10 minutes and 60 per day per salted, hashed IP. The limits are stored in the database, so they hold across serverless instances.
- **Duplicates**: the submit button locks while sending, and names are unique (case-insensitive). Guests get a private edit token stored in their browser, so they can **change their answer** later. Marta can edit anything from the dashboard.
- **CSV export**: every cell is protected against spreadsheet formula injection.

## Little surprises 🦇
Click the moon, poke the pumpkins, drop the spider from its web, type `b-o-o` anywhere, or switch to another browser tab and look at the tab title.
