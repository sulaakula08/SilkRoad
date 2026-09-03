# Notion application intake setup

SilkRoad writes applications directly from its Vercel serverless functions. The
separate `project_NOTION_AUTOMATION` FastAPI service is not used or changed.

## 1. Create the Notion integration

Create an internal Notion integration with **Read content**, **Insert content**,
and **Update content** capabilities. Create or choose a parent Notion page and
share that page with the integration.

Put these values in `.env`:

```dotenv
NOTION_TOKEN=ntn_...
NOTION_PARENT_PAGE_ID=...
```

The parent page ID is the 32-character identifier in its Notion URL.

## 2. Create both databases

Run the guarded one-time setup command:

```bash
npm run notion:setup -- --confirm
```

It creates:

- `Silkroad — Investor Applications`
- `Silkroad — Founder Applications`

The command prints two data-source IDs. Add them to `.env` and the Vercel
project environment:

```dotenv
NOTION_INVESTORS_DATA_SOURCE_ID=...
NOTION_FOUNDERS_DATA_SOURCE_ID=...
```

Notion now distinguishes a database container from its data source. The API
needs the **data-source IDs** printed by the setup command, not the database IDs
visible in the page URL.

### Investor workflow

The `Status` select contains:

`New`, `Reviewing`, `Contacted`, `Qualified`, `Joined`, `On Hold`, `Rejected`,
and `Archived`.

### Founder workflow

The `Status` select contains:

`New`, `Reviewing`, `Contacted`, `Due Diligence`, `On Hold`, `Waitlisted`,
`Working Together`, `Rejected`, and `Archived`.

The founder table exposes only `AI Score` and `AI Verdict`. The complete AI
screening report—summary, estimated stage, sectors, strengths, risks, and thesis
matches—is formatted inside the founder's Notion page.

## 3. Optional pitch-deck file uploads

Skip this section if founders will share pitch-deck links. To accept direct PDF
or PPTX uploads, configure private temporary storage in the same Vercel project:

1. Open **Storage**.
2. Create a **Blob** store with **Private** access.
3. Connect it to every environment used by the site.

Vercel adds `BLOB_READ_WRITE_TOKEN` automatically. For local testing, pull the
project environment or copy that token into `.env`.

Decks are uploaded directly from the browser to private Blob storage, then the
serverless submission function transfers them to Notion. The temporary Blob is
deleted after the Notion page is created, and cleanup is also attempted after a
failed submission. Accepted formats are PDF and PPTX, up to 15 MB.

## 4. Deploy variables

Production needs:

```dotenv
ANTHROPIC_API_KEY=...
NOTION_TOKEN=...
NOTION_INVESTORS_DATA_SOURCE_ID=...
NOTION_FOUNDERS_DATA_SOURCE_ID=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
RESEND_API_KEY=...
APPLICATION_EMAIL_FROM="Silkroad Angels <applications@your-domain.com>"
FOUNDER_REPLY_EMAIL="replies@inbound.your-domain.com"
FOUNDER_REPLY_SIGNING_SECRET=...
RESEND_WEBHOOK_SECRET=whsec_...
```

`NOTION_PARENT_PAGE_ID` is only needed by the one-time setup script.
`BLOB_READ_WRITE_TOKEN` is only needed when founders upload pitch-deck files
instead of sharing links. Reply processing does not use Blob.

## 5. Enable Telegram submission notifications

Create a Telegram bot, add it to the team group, and give it permission to send
messages. Set `TELEGRAM_BOT_TOKEN` to the token issued for the bot and
`TELEGRAM_CHAT_ID` to the destination group ID.

Set both variables in every environment that should send notifications,
including local and Vercel preview environments used for testing. If either is
missing, application storage continues without Telegram. A Telegram failure is
logged but never changes the successful response shown to the applicant.

Notifications are emitted only by successful website submissions. Manual
Notion edits do not trigger them.

## 6. Enable founder follow-up emails

Create a Resend account, verify the sending domain, and configure
`RESEND_API_KEY` and `APPLICATION_EMAIL_FROM` in every environment that should
send founder emails. The API key must have full access because the inbound
processor retrieves received email bodies and attachments.

After a founder application is saved, Claude checks the submitted information
against the investment-review rubric. If material information is missing, the
founder receives a short bilingual follow-up asking them to reply with those
details. Complete applications receive no email. Delivery failure is logged
but never changes the successful application response.

The website only shows a success state after Notion confirms page creation. If
AI screening fails, the founder application is still saved and its page is
marked for manual review. If Notion fails, the visitor's form remains populated
and offers a retry.

## 7. Enable founder reply processing

Reply processing only applies to follow-up emails sent after this feature is
deployed. Earlier emails do not contain a safe application correlation token.

1. In Resend, open **Receiving** and choose either the provided `*.resend.app`
   domain or a dedicated custom subdomain. A custom receiving subdomain needs
   the MX record shown by Resend. Do not replace the root domain's existing mail
   MX records.
2. Set `FOUNDER_REPLY_EMAIL` to any mailbox on that receiving domain, such as
   `replies@inbound.your-domain.com`.
3. Generate an independent signing secret and set it in every environment:

   ```bash
   openssl rand -hex 32
   ```

4. Deploy the site, then add a Resend webhook for the `email.received` event:

   ```text
   https://your-production-domain.com/api/resend-inbound
   ```

5. Copy the webhook's `whsec_...` signing secret into
   `RESEND_WEBHOOK_SECRET`.

The outbound email uses a signed plus-address as `Reply-To`. Its compact token
contains the Notion page ID and rejects tampering. The inbound function verifies
the Resend signature before it reads any payload data and accepts content only
from the founder email recorded on the application.

For each accepted reply, the function:

- retrieves the plain-text or HTML email body from Resend;
- ignores quoted history, email signatures, and inline signature images;
- accepts PDF and PPTX attachments up to 15 MB each;
- asks Claude to map only supplied facts to the original missing-information
  requests;
- appends a dated entry under **Founder follow-up** in the Notion page body;
- sends `<Company>: Notion updated` to Telegram after Notion confirms the
  append.

No separate reply database is required. The signed reply address points to the
Notion page, and the page body holds the requested items, previous answers, and
stable source references. Those references prevent duplicate Notion entries
when Resend retries a webhook. Transient failures are returned to Resend for
retry; permanent failures send a Telegram alert instead of claiming that Notion
was updated.
