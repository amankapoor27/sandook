# Sandook Studio

Artist portfolio and online gallery for original paintings, DIY projects, and commission inquiries.

Built with Next.js — public gallery, admin upload panel, WhatsApp inquiries, and multi-photo listings.

## Features

- **Public gallery** — browse paintings and DIY work with filters by type, status, and collection
- **Artwork detail pages** — photo carousel with next/previous navigation and thumbnails
- **Multi-photo items** — upload multiple images per piece (like a product gallery)
- **Admin panel** — password-protected upload and metadata editing at `/admin`
- **WhatsApp integration** — floating chat button and pre-filled inquiry links
- **Contact form** — general, purchase, and commission inquiries
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
| `/admin` | Upload panel (local password: `dev`) |

## Admin workflow

1. Sign in at `/admin/login` (password: `dev` locally)
2. Choose category — **Painting** or **DIY**
3. Drop one or more images — multiple files become one listing with multiple photos
4. Click **Edit** to set title, price, medium, dimensions, collection, etc.
5. Use **Add photos** on an existing item to attach more angles or detail shots

## Environment variables

Copy `.env.example` to `.env.local` for local development.

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Production | Admin login password |
| `SESSION_SECRET` | Production | 32+ char random string for session cookies |
| `NEXT_PUBLIC_SITE_URL` | Production | Public site URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | WhatsApp number in international format (e.g. `919876543210`) |
| `R2_ACCOUNT_ID` | Production | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Production | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Production | R2 secret key |
| `R2_BUCKET_NAME` | Production | R2 bucket name |
| `R2_PUBLIC_URL` | Production | Public URL for R2 media |
| `RESEND_API_KEY` | Optional | Send inquiry emails via Resend |
| `INQUIRY_EMAIL` | Optional | Email address for inquiry notifications |

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
- [Sharp](https://sharp.pixelplumbing.com) — image resize and WebP conversion
- [Jose](https://github.com/panva/jose) — session auth
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) — production storage (optional)

## Project structure

```
app/
  (site)/           Public pages
  admin/            Upload panel
  api/              Gallery, upload, inquiry, auth, media
components/
  gallery/          Grid, carousel, lightbox
  admin/            Upload UI
  site/             Header, footer, layout
lib/                Storage, auth, manifest, gallery helpers
data/               Seed manifest for local dev
storage/            Local uploads (gitignored)
```

## Contributing

1. Ask the repo owner for a **Write** collaborator invite on GitHub
2. Clone the repo and create a branch: `git checkout -b feature/your-change`
3. Make changes, commit, and push: `git push -u origin feature/your-change`
4. Open a Pull Request on GitHub

Do not commit `.env.local`, `storage/`, or production secrets.

## Deployment

Recommended host: [Vercel](https://vercel.com). Set production env vars in the Vercel dashboard, connect R2 for media storage, and point your custom domain to the deployment.

## License

Private project — all rights reserved unless otherwise specified by the owner.
