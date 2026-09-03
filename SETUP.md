# Setup — step by step

Everything the site needs, in the order it must be done. Each step ends with a
check: if the check fails, do not move on.

The site works with **only step 1 and 2** done (form → Notion + AI screening).
Steps 4–9 add notifications, emails and reply automation, and each one can be
skipped — the code degrades on purpose (see [What breaks if you skip a
step](#what-breaks-if-you-skip-a-step)).

| Step | Service | Time | Needed for |
| --- | --- | --- | --- |
| 1 | Anthropic | 5 min | Chat assistant + founder AI screening |
| 2 | Notion | 15 min | Saving applications |
| 3 | — | 2 min | Run it locally |
| 4 | Telegram | 10 min | Team notification on each application |
| 5 | Resend (sending) | 20 min | Follow-up email to founders |
| 6 | — | 1 min | Signing secret for reply tracking |
| 7 | Vercel | 15 min | Production deploy |
| 8 | Resend (receiving) | 20 min | Founder replies → Notion (**needs step 7**) |
| 9 | Vercel Blob | 5 min | Pitch-deck file uploads (optional) |

---

## Step 0 — Get the code running

```bash
git clone <repo-url>
cd SilkRoad
npm install
```

Node **24.x** (`package.json` → `engines`). Check with `node -v`.

Create your local secrets file:

```bash
cp .env.example .env.local
```

**`.env.local` is where every secret goes.** It is gitignored (`.gitignore`
blocks `.env` and `.env.*`, with `.env.example` the only exception). Never
commit a real key, and never rename a secret with a `VITE_` prefix — Vite
bundles anything `VITE_*` into the public JavaScript that every visitor
downloads.

---

## Step 1 — Anthropic API key

Powers the chat widget (`api/chat.js`), the founder screening (`api/screen.js`)
and the reply analyzer (`server/founder-replies/analyzer.js`).

1. Go to **https://console.anthropic.com** and sign in.
2. The organization needs credit: **Settings → Billing → Add credits** (start
   with $5–10; screening one application costs fractions of a cent).
3. Go to **Settings → API keys** → **Create key**.
   - Name it `silkroad-site`.
   - Copy it immediately — the console shows it once.
4. Paste into `.env.local`:

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
```

The key must start with `sk-ant-`. Model defaults to `claude-opus-5`; override
per-feature with `ANTHROPIC_MODEL`, `ANTHROPIC_SCREEN_MODEL` or
`ANTHROPIC_REPLY_MODEL` only if you have a reason to.

**Check:** run `npm run dev`, open http://localhost:5173, click the chat bubble
bottom-right and ask something. A streaming reply = the key works. A "sorry"
error = check the terminal for the Anthropic error.

---

## Step 2 — Notion

This is the longest step. Order matters: **create the integration → create a
parent page → share the page with the integration → run the script.** The
script fails with "Could not find page" if you skip the sharing.

### 2.1 Create the integration (this is where the token comes from)

1. Go to **https://www.notion.so/my-integrations** (or: Notion sidebar →
   **Settings** → **Connections** → **Develop or manage integrations**).
2. Click **New integration**.
3. Fill in:
   - **Name:** `Silkroad Website`
   - **Associated workspace:** the Silkroad workspace (pick carefully — this
     cannot be changed later).
   - **Type:** Internal.
4. **Save**, then open the integration → **Configuration** tab.
5. Under **Capabilities**, tick:
   - ✅ Read content
   - ✅ Insert content
   - ✅ Update content
   - No user information needed.
6. Under **Internal Integration Secret**, click **Show** → **Copy**. It starts
   with `ntn_` (older integrations show `secret_` — both work).

```dotenv
NOTION_TOKEN=ntn_...
```

### 2.2 Create the parent page and get its ID

The script creates the two databases *inside* a page you own.

1. In Notion, create a new page — call it `Silkroad Applications`. Anywhere in
   the workspace is fine; a top-level page is cleanest.
2. Open the page → **•••** (top right) → **Copy link**.
3. The link looks like:

   ```
   https://www.notion.so/Silkroad-Applications-3aeb1c9d4f8e42a1b7c60d5e9f2a8b41?pvs=4
   ```

   The page ID is the **32 hex characters** at the end of the path, right after
   the last dash and before any `?`. Copy just that:

```dotenv
NOTION_PARENT_PAGE_ID=3aeb1c9d4f8e42a1b7c60d5e9f2a8b41
```

Dashes are fine too (`3aeb1c9d-4f8e-...`) — the API accepts both.

### 2.3 Share the page with the integration ← the step everyone forgets

1. Still on that page: **•••** → **Connections** (in some versions: **Add
   connections**).
2. Search for `Silkroad Website` → select it → **Confirm**.
3. The page now shows the integration under Connections. Child pages inherit
   this, which is why the databases the script creates are reachable too.

### 2.4 Create both databases

```bash
npm run notion:setup -- --confirm
```

The `-- --confirm` is required — the script refuses to run without it, because
it creates real databases. It reads `.env.local` first, then `.env`.

It creates `Silkroad — Investor Applications` and `Silkroad — Founder
Applications` with the full schema (statuses, AI Score, AI Verdict, Deck File…
see `server/notion-schema.js`) and prints:

```
Add these values to .env.local and Vercel:
NOTION_INVESTORS_DATA_SOURCE_ID=26e5...
NOTION_FOUNDERS_DATA_SOURCE_ID=b118...
```

Paste both into `.env.local`.

> **Data source ID ≠ database ID.** Notion now separates a database container
> from its data source, and this app (API version `2026-03-11`, pinned in
> `server/notion-schema.js`) writes to the **data source**. The ID in the
> database's browser URL is the *database* ID and will not work. Only use the
> IDs the script printed.

Lost the output? Retrieve them with the database IDs the script also printed:

```bash
curl -s https://api.notion.com/v1/databases/<database-id> \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2026-03-11" | grep -o '"data_sources".*'
```

Run the script **once**. Running it again creates a second pair of databases.

**Check:** both databases exist in your Notion page, and `.env.local` now has
`NOTION_TOKEN`, `NOTION_INVESTORS_DATA_SOURCE_ID`,
`NOTION_FOUNDERS_DATA_SOURCE_ID`.

---

## Step 3 — Run it and submit a test application

```bash
npm run dev      # http://localhost:5173
```

In dev, `vite.config.ts` mounts the real serverless handlers as middleware —
`/api/chat`, `/api/screen`, `/api/submissions`, `/api/deck-upload`,
`/api/blob-cleanup`, `/api/resend-inbound` — so local behaviour matches
production.

Go to **http://localhost:5173/apply/founder**, fill it in with junk data and a
**real email you control** (you'll need it in step 5), and submit.

**Check:** a new row appears in `Silkroad — Founder Applications`. Open the page
— the full AI screening report (summary, stage, sectors, strengths, risks,
thesis matches) is in the page body; the table shows only AI Score and AI
Verdict.

If the browser shows a retry instead: the terminal prints the Notion error.
`object_not_found` = step 2.3 wasn't done; `validation_error` on the ID =
you used a database ID instead of a data source ID.

Run the server tests too:

```bash
npm test         # 17 tests, all should pass
```

---

## Step 4 — Telegram notifications

A message to your team group each time an application is saved.

### 4.1 Create the bot

1. Open Telegram, search for **@BotFather**, press **Start**.
2. Send `/newbot`.
3. Give it a display name: `Silkroad Applications`.
4. Give it a username ending in `bot`: `silkroad_applications_bot`.
5. BotFather replies with the token — a long `123456789:AAE...` string.

```dotenv
TELEGRAM_BOT_TOKEN=123456789:AAE...
```

### 4.2 Add the bot to the team group and find the chat ID

1. Open your team group → **Add members** → search the bot's username → add it.
2. The bot needs permission to send messages (default in most groups; in
   restricted groups make it an admin).
3. Send any message in the group, e.g. `/start@silkroad_applications_bot`.
4. Open this URL in a browser, with your token pasted in:

   ```
   https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
   ```

   (Note: `bot` immediately before the token, no slash between them.)
5. Find `"chat":{"id":-1001234567890,...}` in the JSON. That number, **minus
   sign included**, is the chat ID.

```dotenv
TELEGRAM_CHAT_ID=-1001234567890
```

Empty `result: []`? Send another message in the group and reload — `getUpdates`
only returns recent, unconsumed updates.

> If the group is later converted to a supergroup, the chat ID changes and
> notifications silently stop. Re-run `getUpdates` and update the variable.

**Check:** restart `npm run dev`, submit another test application. The group gets
a message with an **Open in Notion** button. Both variables must be set — if
only one is, the code raises (logged, application still saved); if **neither**
is set, notifications are skipped silently.

---

## Step 5 — Resend: sending the follow-up email

When AI screening decides material information is missing, the founder gets a
short bilingual email asking for exactly the missing items.

1. Sign up at **https://resend.com**.
2. **Domains** → **Add Domain** → enter your sending domain, e.g.
   `silkroadinnovationhub.com` (a subdomain like `mail.your-domain.com` is
   cleaner if the root already sends mail elsewhere).
3. Resend shows DNS records — typically an MX + TXT for receiving-side SPF, a
   `resend._domainkey` TXT for DKIM, and an optional DMARC TXT. Add them at
   your DNS provider exactly as shown.
4. Click **Verify**. Propagation is usually minutes, occasionally hours.
   Status must read **Verified**.
5. **API Keys** → **Create API Key**:
   - Name: `silkroad-site`
   - Permission: **Full access** — required, because step 8's inbound
     processing reads received email bodies and attachments. Sending-only will
     work now and fail later.
6. Set both variables. The `from` address must be on the domain you just
   verified:

```dotenv
RESEND_API_KEY=re_...
APPLICATION_EMAIL_FROM="Silkroad Angels <applications@your-domain.com>"
```

**Check:** submit a deliberately thin founder application (no metrics, no
traction, vague description) with your own email. Screening flags it, and the
follow-up email arrives. A complete application gets **no** email — that is
correct behaviour, not a bug.

---

## Step 6 — Reply signing secret

The follow-up email's `Reply-To` carries a signed token identifying the Notion
page, so a reply can be matched back without a database.

```bash
openssl rand -hex 32
```

```dotenv
FOUNDER_REPLY_SIGNING_SECRET=<the 64-character output>
```

Rules:

- Minimum 32 characters (the code rejects shorter).
- **The same value in every environment.** Local, preview and production must
  match, or a reply to an email sent from one won't verify in another.
- Changing it invalidates every reply address already in a founder's inbox.
  Rotate only when you must.

---

## Step 7 — Deploy to Vercel

Step 8 needs a public URL, so deploy before configuring inbound email.

1. Go to **https://vercel.com** → **Add New** → **Project** → import the Git
   repository.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist` —
   Vercel detects both. `vercel.json` handles the rest: SPA rewrites for
   non-`/api` routes, and a 120s `maxDuration` for `api/resend-inbound.js`.
3. **Settings → Environment Variables** — add each of these to **Production,
   Preview and Development**:

   ```dotenv
   ANTHROPIC_API_KEY
   NOTION_TOKEN
   NOTION_INVESTORS_DATA_SOURCE_ID
   NOTION_FOUNDERS_DATA_SOURCE_ID
   TELEGRAM_BOT_TOKEN
   TELEGRAM_CHAT_ID
   RESEND_API_KEY
   APPLICATION_EMAIL_FROM
   FOUNDER_REPLY_SIGNING_SECRET
   ```

   `NOTION_PARENT_PAGE_ID` is **not** needed in production — only the one-time
   setup script uses it. `FOUNDER_REPLY_EMAIL` and `RESEND_WEBHOOK_SECRET` come
   in step 8.

4. **Deploy.** Then attach your domain under **Settings → Domains**.

**Check:** open the production URL, use the chat widget, submit a test
application, confirm the Notion row and the Telegram message.

> Env vars are read at function start — after changing any variable in Vercel,
> **redeploy**. Editing a variable alone does not update running functions.

---

## Step 8 — Resend: receiving founder replies

Verified replies get appended to a dated **Founder follow-up** section inside
the founder's existing Notion page. No new database, no changed properties.

### 8.1 Set up a receiving domain

1. In Resend, open **Receiving** (Inbound).
2. Either use the provided `*.resend.app` address (fastest, good for testing)
   or add a dedicated subdomain such as `inbound.your-domain.com`.
3. For a custom subdomain, add the **MX record Resend shows** — on the
   *subdomain*. Do not touch the root domain's existing MX records or you will
   break your normal company email.
4. Wait for **Verified**.

### 8.2 Pick the reply mailbox

```dotenv
FOUNDER_REPLY_EMAIL="replies@inbound.your-domain.com"
```

Two hard constraints, both enforced in `server/founder-replies/correlation.js`:

- **No plus addressing** in this value — the code adds the `+token` itself.
- **The part before `@` must be at most 12 characters.** The signed token is 51
  characters and the full local part cannot exceed 64. `replies` (7) ✅,
  `founder-replies` (15) ❌ — the address would be rejected and follow-up
  emails would go out with no reply tracking.

### 8.3 Add the webhook

1. Resend → **Webhooks** → **Add Webhook**.
2. Endpoint URL — your deployed domain:

   ```
   https://your-production-domain.com/api/resend-inbound
   ```

3. Event: **`email.received`** only.
4. Save, then copy the webhook's **Signing Secret** (`whsec_...`):

```dotenv
RESEND_WEBHOOK_SECRET=whsec_...
```

5. Add `FOUNDER_REPLY_EMAIL` and `RESEND_WEBHOOK_SECRET` to Vercel (all three
   environments) and **redeploy**.

Every request is signature-verified before any payload is read, and content is
accepted only from the founder email recorded on that application.

**Check:** reply to a follow-up email you received in step 5 — with text, and
optionally a PDF or PPTX (≤ 15 MB). Within a minute the founder's Notion page
gains a dated entry under **Founder follow-up**, and Telegram says
`<Company>: Notion updated`. Telegram only claims success *after* Notion
confirms the append.

> Reply tracking only works for emails sent **after** steps 6 and 8 were
> deployed. Older emails carry no correlation token and land as
> "reply needs review" in Telegram.
>
> To test inbound locally, expose port 5173 with a tunnel and register a
> **second** webhook pointing at it — each webhook has its own signing secret.

---

## Step 9 — Vercel Blob (optional — pitch-deck file uploads)

Skip this if founders will paste deck links. Without it, `/api/deck-upload`
returns 503 and the form's file upload is unavailable; everything else works.

1. Vercel → your project → **Storage** → **Create** → **Blob**.
2. Access: **Private**.
3. Connect it to **every** environment used by the site.
4. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically. For local use, run
   `vercel env pull` or copy the token into `.env.local`.

The browser uploads the deck straight to private Blob storage; the submission
function then transfers it into Notion and deletes the temporary blob — also
after a failed submission. PDF and PPTX, up to 15 MB. Founder *replies* do not
use Blob at all.

---

## What breaks if you skip a step

Nothing crashes the visitor's submission except Notion. That is deliberate.

| Missing | Effect |
| --- | --- |
| `ANTHROPIC_API_KEY` | Chat widget errors; founder screening fails — the application is still saved and its Notion page is marked for manual review |
| `NOTION_TOKEN` / data source IDs | Submission fails, the visitor's form stays filled and offers a retry. **This is the only blocking dependency.** |
| Both `TELEGRAM_*` | Notifications skipped silently |
| Only one `TELEGRAM_*` | Raises internally, logged as a warning; application still saved |
| Both `RESEND_*` | No follow-up emails |
| Only one `RESEND_*` | Raises internally, logged; application still saved |
| `FOUNDER_REPLY_SIGNING_SECRET` or `FOUNDER_REPLY_EMAIL` | Follow-up email still sends, but without a tracked `Reply-To` — replies can't be matched |
| `RESEND_WEBHOOK_SECRET` | Inbound webhook rejected — replies never reach Notion |
| `BLOB_READ_WRITE_TOKEN` | Deck file uploads return 503; deck links still work |

---

## Full variable reference

| Variable | Where it comes from | Prod | Step |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | console.anthropic.com → Settings → API keys | ✅ | 1 |
| `ANTHROPIC_MODEL` | optional override, defaults `claude-opus-5` | — | 1 |
| `ANTHROPIC_SCREEN_MODEL` | optional, screening only | — | 1 |
| `ANTHROPIC_REPLY_MODEL` | optional, reply analysis only | — | 1 |
| `NOTION_TOKEN` | Integration → Internal Integration Secret | ✅ | 2.1 |
| `NOTION_PARENT_PAGE_ID` | 32 hex chars in the page URL | setup only | 2.2 |
| `NOTION_INVESTORS_DATA_SOURCE_ID` | printed by `npm run notion:setup` | ✅ | 2.4 |
| `NOTION_FOUNDERS_DATA_SOURCE_ID` | printed by `npm run notion:setup` | ✅ | 2.4 |
| `TELEGRAM_BOT_TOKEN` | @BotFather → `/newbot` | ✅ | 4.1 |
| `TELEGRAM_CHAT_ID` | `getUpdates` → `chat.id` (negative) | ✅ | 4.2 |
| `RESEND_API_KEY` | Resend → API Keys (full access) | ✅ | 5 |
| `APPLICATION_EMAIL_FROM` | any address on the verified domain | ✅ | 5 |
| `FOUNDER_REPLY_SIGNING_SECRET` | `openssl rand -hex 32` | ✅ | 6 |
| `FOUNDER_REPLY_EMAIL` | mailbox on the receiving domain, ≤12 chars before `@` | ✅ | 8.2 |
| `RESEND_WEBHOOK_SECRET` | Resend webhook → Signing Secret | ✅ | 8.3 |
| `BLOB_READ_WRITE_TOKEN` | injected by Vercel Blob | optional | 9 |

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Could not find page` from the setup script | Parent page not shared with the integration | Step 2.3 |
| Setup script prints "Re-run with --confirm" | Missing the guard flag | `npm run notion:setup -- --confirm` |
| `validation_error` writing to Notion | Using a database ID from the browser URL | Use the printed **data source** IDs (2.4) |
| Chat replies with an error | Bad or unfunded Anthropic key | Check `sk-ant-` prefix and account credit |
| No Telegram message | Bot not in the group, or stale chat ID | Re-run `getUpdates`; check both vars are set |
| Follow-up email never arrives | Domain unverified, or the application was complete | Check Resend → Domains; complete applications get no email |
| Reply lands as "needs review" | Sent from a different address than the application, or the email predates step 8 | Reply from the address on the application |
| Webhook rejected (400) | `RESEND_WEBHOOK_SECRET` mismatched | Copy the secret from that exact webhook, redeploy |
| Env change had no effect in prod | Functions read env at start | Redeploy after editing variables |

---

## Housekeeping

The repo's existing `.env` still carries `GEMINI_API_KEY` and `GEMINI_MODEL`
from before the switch to Claude (commit `c18ef6b`). Nothing reads them — delete
those two lines. Keeping all secrets in a single `.env.local` avoids confusion;
the setup script and Vite both read `.env.local` first, then `.env`.
