# Deployment guide (Cloudflare Workers + R2)

Sandook runs on **Cloudflare Workers** (via [Vinext](https://github.com/cloudflare/vinext)) with **R2** for images and JSON data. Local development still uses `npm run dev` (standard Next.js).

## Accounts you need

| Service | Why |
|---------|-----|
| [Cloudflare](https://dash.cloudflare.com) | Workers hosting, R2 storage, DNS |
| [GitHub](https://github.com) | Source repo (`amankapoor27/sandook`) |

No Vercel account required.

---

## Architecture

```
Visitors → Cloudflare Worker (Vinext/Next.js) → R2 (manifest, images, inquiries, analytics)
```

Image uploads use **@cf-wasm/photon** (WASM) — works on Workers and in local `npm run dev`.

---

## One-time setup

### 1. Install & log in

```bash
npm install
npx wrangler login
```

### 2. R2 bucket

1. Cloudflare dashboard → **R2** → create bucket (e.g. `sandook-media`).
2. **Manage R2 API tokens** → create token with **Object Read & Write**.
3. Enable **public access** on the bucket (`r2.dev` subdomain or custom domain like `media.yourdomain.com`).
4. Note: Account ID, Access Key ID, Secret Access Key, public URL.

### 3. KV namespace (Vinext cache)

```bash
npx wrangler kv namespace create VINEXT_KV_CACHE
```

Copy the namespace **id** into `wrangler.jsonc` → replace `REPLACE_WITH_KV_NAMESPACE_ID`.

After `npm run build:vinext`, the same id must be in `dist/server/wrangler.json` if Vinext generates a copy — update both if needed.

### 4. Worker secrets

Always use the **generated** Wrangler config (same as deploy). Run **after** a successful `npm run deploy:vinext`:

```bash
CFG=dist/server/wrangler.json

npx wrangler secret put ADMIN_PASSWORD --config $CFG
npx wrangler secret put SESSION_SECRET --config $CFG
npx wrangler secret put R2_ACCOUNT_ID --config $CFG
npx wrangler secret put R2_ACCESS_KEY_ID --config $CFG
npx wrangler secret put R2_SECRET_ACCESS_KEY --config $CFG
npx wrangler secret put R2_BUCKET_NAME --config $CFG
```

Optional:

```bash
npx wrangler secret put NEXT_PUBLIC_WHATSAPP_NUMBER --config $CFG
npx wrangler secret put INQUIRY_EMAIL --config $CFG
npx wrangler secret put NEXT_PUBLIC_SITE_URL --config $CFG
npx wrangler secret put R2_PUBLIC_URL --config $CFG
npx wrangler secret put RESEND_API_KEY --config $CFG
npx wrangler secret put RESEND_FROM --config $CFG
```

`SANDOOK_RUNTIME=cloudflare` is set in `wrangler.jsonc` vars (disables SMTP on Workers; use Resend later).

Also add the same values to `.env.local` for local testing and `npm run sync:r2`.

| Variable | Required | Notes |
|----------|----------|--------|
| `ADMIN_PASSWORD` | Yes | Strong password (not `dev`) |
| `SESSION_SECRET` | Yes | 32+ random chars |
| `SANDOOK_ENFORCE_SECRETS` | Recommended locally | `true` in `.env.local` to match production checks |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://yourdomain.com` or workers.dev URL |
| `R2_*` | Yes | All five R2 variables |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | e.g. `917054126916` |
| `INQUIRY_EMAIL` | Optional | Inquiries always saved to R2 |
| `RESEND_API_KEY` | Optional | Preferred over SMTP on Workers |

Generate secrets:

```bash
openssl rand -base64 32   # SESSION_SECRET
```

---

## Upload local gallery to R2

```bash
# .env.local must have R2_* set
npm run sync:r2
```

Uploads `manifest.json`, `vocabulary.json`, `inquiries.json`, `analytics.json`, and all `images/`.

---

## Build & deploy

```bash
npm run build:vinext
npm run deploy:vinext
```

`deploy:vinext` deploys the Worker to **100% traffic** immediately. Do **not** use CDN warmup until you have a stable production URL (`NEXT_PUBLIC_SITE_URL` or custom domain). When ready:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com npm run deploy:vinext:warm
```

### Troubleshooting: secrets fail after deploy

If `wrangler secret put` reports *"the latest version of your Worker isn't currently deployed"*, a previous deploy left a version **staged at 0%** (CDN warmup without a production URL). Fix:

```bash
npm run build:vinext
npm run deploy:vinext
```

Then set secrets with `--config dist/server/wrangler.json` as above.

Preview locally against R2:

```bash
npm run build:vinext
npm run start:vinext
```

Standard local dev (filesystem `storage/`, no Workers):

```bash
npm run dev
```

---

## Custom domain

1. Cloudflare dashboard → **Workers & Pages** → your worker → **Settings** → **Domains & Routes**.
2. Add `yourdomain.com` / `www`.
3. Update `NEXT_PUBLIC_SITE_URL` secret and redeploy.

---

## Smoke test

- [ ] Homepage + gallery (R2 images via `R2_PUBLIC_URL`)
- [ ] Artwork detail + prev/next
- [ ] Admin login
- [ ] **Upload new artwork** (multi-photo)
- [ ] Edit metadata / collections
- [ ] Contact form → Admin → Inquiries
- [ ] Admin → Analytics

---

## Known limitations

- **Image optimization** on Workers uses direct `/api/media/` URLs (`next/image` unoptimized). `/_next/image` cannot proxy internal API routes.
- **SMTP email** does not run on Workers; use **Resend** when you enable email.
- **Rate limits** (`lib/rate-limit.ts`) are per-isolate, not global — acceptable for launch.
- **Vinext** is beta — report issues if a route fails only on Workers.

---

## Alternative: Vercel + R2

You can still deploy with Vercel for hosting and Cloudflare R2 only for storage. Use `npm run build` / Vercel import. Image processing uses the same Photon WASM path.

---

## Checklist

- [ ] Cloudflare account + `wrangler login`
- [ ] R2 bucket + API token + public URL
- [ ] KV namespace id in `wrangler.jsonc`
- [ ] Wrangler secrets set
- [ ] `npm run sync:r2`
- [ ] `npm run build:vinext` && `npm run deploy:vinext`
- [ ] Custom domain (optional)
- [ ] Smoke test
