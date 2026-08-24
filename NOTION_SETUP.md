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

## 3. Create private deck storage

In the same Vercel project:

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
BLOB_READ_WRITE_TOKEN=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
RESEND_API_KEY=...
APPLICATION_EMAIL_FROM="Silkroad Angels <applications@your-domain.com>"
```

`NOTION_PARENT_PAGE_ID` is only needed by the one-time setup script.

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
send founder emails. Use a sender address that receives replies.

After a founder application is saved, Claude checks the submitted information
against the investment-review rubric. If material information is missing, the
founder receives a short bilingual follow-up asking them to reply with those
details. Complete applications receive no email. Delivery failure is logged
but never changes the successful application response.

The website only shows a success state after Notion confirms page creation. If
AI screening fails, the founder application is still saved and its page is
marked for manual review. If Notion fails, the visitor's form remains populated
and offers a retry.
