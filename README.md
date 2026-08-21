# Sandook Studio

Artist portfolio and gallery for original paintings, DIY projects, and commission inquiries.

## Quick start (local testing)

```bash
npm install
cp .env.example .env.local   # optional — dev defaults work without this
npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Homepage — featured work, DIY teaser, about |
| http://localhost:3000/gallery | Paintings & DIY — filter by type, status, collection |
| http://localhost:3000/gallery/[slug] | Piece detail with inquire CTA |
| http://localhost:3000/about | About the studio |
| http://localhost:3000/commissions | Commission info & process |
| http://localhost:3000/contact | Inquiry form |
| http://localhost:3000/admin | Upload panel (password: `dev`) |
| http://localhost:3000/admin/login | Admin login |

## How it works

- **No R2 credentials?** Images save to `./storage/` on disk. Served via `/api/media/...`.
- **R2 configured?** Images upload to Cloudflare R2. Served via `R2_PUBLIC_URL`.
- **Inquiries** save to `storage/inquiries.json` (local) or R2. Optional email via Resend.
- **WhatsApp** — set `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g. `919876543210`) to enable floating chat button, footer link, and pre-filled inquiry links on artwork pages.

## WhatsApp setup

Add your number to `.env.local`:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

Use international format: country code + number, no `+` or spaces. India example: `91` + 10-digit mobile.

When set, visitors get:
- Floating green WhatsApp button on all public pages
- "Chat on WhatsApp" on available artwork pages (pre-filled with piece title + link)
- WhatsApp option on Contact and Commissions pages

No WhatsApp API keys required — uses standard `wa.me` links.

## Stack

- Next.js 16 (App Router) — public site, admin UI, API routes
- Sharp — resize + WebP conversion on upload
- Cloudflare R2 — production object storage (optional locally)
- Jose — signed session cookies for admin auth
- Resend — optional inquiry email notifications

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

## Admin upload flow

1. Open `/admin/login` and sign in with `dev`
2. Choose category (Painting or DIY)
3. For paintings: fill title, medium, dimensions, year, price, status, collection, featured
4. Drag images onto the upload zone
5. View on the public site — pieces link to `/gallery/[slug]`

## Production env vars

Set in Vercel (or your host):

```
ADMIN_PASSWORD=<strong random password>
SESSION_SECRET=<32+ char random string>
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=sandook-media
R2_PUBLIC_URL=https://media.yourdomain.com
RESEND_API_KEY=re_...          # optional
INQUIRY_EMAIL=you@example.com  # optional
CONTACT_EMAIL=you@example.com  # optional fallback
```

## Project structure

```
app/
  (site)/           Public pages with Header/Footer shell
  admin/            Password-protected upload panel
  api/              Gallery, upload, inquiry, auth, media
components/
  site/             Header, Footer, PageShell
  home/             Homepage sections
  gallery/          Grid, filters, lightbox
  work/             Artwork detail
  contact/          Inquiry form
  admin/            Upload UI
lib/                Storage, auth, manifest, gallery, inquiry, site config
data/               Seed manifest for local dev
storage/            Local uploads & inquiries (gitignored)
```

## Backwards compatibility

Existing uploads without new metadata fields are normalized automatically:

- **Title** from caption, or "Untitled"
- **Slug** from image id
- **Status** defaults to available
