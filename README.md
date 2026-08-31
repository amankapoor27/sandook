# Sandook Studio

Artist portfolio and online gallery for original paintings, prints, and commission inquiries.

Built with Next.js — public gallery, admin panel, WhatsApp inquiries, and multi-photo listings.

## Features

- **Public gallery** — browse work with filters by category, availability, and collection; artworks are grouped by collection in admin-defined order
- **Artwork detail pages** — photo carousel with next/previous navigation and thumbnails
- **Multi-photo items** — upload multiple images per piece (like a product gallery)
- **Admin panel** — password-protected uploads, metadata editing, inquiry inbox, analytics, and vocabulary lists
- **WhatsApp integration** — floating chat button and pre-filled inquiry links
- **Contact form** — general, purchase, and commission inquiries (saved to admin even when email is not configured)
- **First-party analytics** — page views, traffic sources, and artwork engagement (no third-party trackers)
- **Local or cloud storage** — works locally without setup; Cloudflare R2 for production

## Quick start

```bash
git clone git@github.com:amankapoor27/sandook.git
cd sandook
npm install
cp .env.example .env.local   # optional — dev defaults work without this
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/gallery` | Full gallery with filters |
| `/gallery/[slug]` | Artwork detail with photo carousel |
| `/about` | About the studio |
| `/commissions` | Commission info |
| `/contact` | Inquiry form |
| `/admin` | Upload and edit gallery (local password: `dev`) |
| `/admin/vocabulary` | Categories, mediums, dimensions, years, collections |
| `/admin/inquiries` | Inquiry inbox and archive |
| `/admin/analytics` | Traffic and artwork stats |

## Admin workflow

1. Sign in at `/admin/login` (password: `dev` locally)
2. Choose a **category** — or add a new one under **Lists**
3. Drop one or more images — multiple files become one listing with multiple photos
4. Click **Edit** to set title, price, medium, dimensions, collection, homepage hero, etc.
5. Use **Add photos** on an existing item to attach more angles or detail shots
6. Under **Lists**, manage dropdown options and **reorder collections** to control gallery grouping
7. Review inquiries under **Inquiries** and traffic under **Analytics**

## Image uploads

For best results in the gallery grid (3:2 crop on desktop, 4:3 on mobile), upload at **3:2** — e.g. **2400×1600** or **3000×2000**. Images are resized to a max of 2000px on the long edge. The detail page shows the full artwork without cropping.

## Environment variables

Copy `.env.example` to `.env.local` for local development.

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Production | Admin login password |
| `SESSION_SECRET` | Production | 32+ char random string for session cookies |
| `SANDOOK_ENFORCE_SECRETS` | Production | Set to `true` on Vercel to reject weak default secrets |
| `NEXT_PUBLIC_SITE_URL` | Production | Public site URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | WhatsApp number in international format (e.g. `919876543210`) |
| `R2_ACCOUNT_ID` | Production | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Production | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Production | R2 secret key |
| `R2_BUCKET_NAME` | Production | R2 bucket name |
| `R2_PUBLIC_URL` | Production | Public URL for R2 media |
| `INQUIRY_EMAIL` | Optional | Where inquiry notifications are sent |
| `CONTACT_EMAIL` | Optional | Reply-to on inquiry emails |
| `SMTP_HOST` | Optional | SMTP host (default `smtp.gmail.com`) |
| `SMTP_PORT` | Optional | SMTP port (default `587`) |
| `SMTP_SECURE` | Optional | `true` for port 465 |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password (Gmail: use an [App Password](https://support.google.com/accounts/answer/185833)) |
| `SMTP_FROM` | Optional | From address for inquiry emails |
| `RESEND_API_KEY` | Optional | Fallback email via Resend if SMTP is not set |
| `RESEND_FROM` | Optional | From address when using Resend |

Inquiries are always saved to `storage/inquiries.json` (or R2 in production). Email is sent when SMTP or Resend is configured.

Without R2 credentials, images are stored in `./storage/` locally and served via `/api/media/...`.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Sharp](https://sharp.pixelplumbing.com) — image resize, WebP conversion, watermarking
- [Jose](https://github.com/panva/jose) — session auth
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) — production storage (optional)

## Project structure

```
app/
  (site)/           Public pages
  admin/            Gallery, lists, inquiries, analytics
  api/              Gallery, upload, inquiry, auth, media, analytics
components/
  gallery/          Grid, carousel, filters
  admin/            Upload UI, admin shell
  site/             Header, footer, theme
lib/                Storage, auth, manifest, gallery, analytics
data/               Seed manifest for local dev
storage/            Local uploads and JSON stores (gitignored)
```

## Contributing

1. Ask the repo owner for a **Write** collaborator invite on GitHub
2. Clone the repo and create a branch: `git checkout -b feature/your-change`
3. Make changes, commit, and push: `git push -u origin feature/your-change`
4. Open a Pull Request on GitHub

Do not commit `.env.local`, `storage/`, or production secrets.

## Deployment

Recommended host: [Vercel](https://vercel.com). Set production env vars in the Vercel dashboard, connect R2 for media storage, configure SMTP or Resend for inquiry email, and point your custom domain to the deployment.

## License

Private project — all rights reserved unless otherwise specified by the owner.
