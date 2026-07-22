# Lazy Stoner Donator

[![Status: Production](https://img.shields.io/badge/status-production-13890e)](https://github.com/chooomedia/lazy-stoner-donator)
[![Stack: HTML/CSS/Vanilla JS](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-111111)](https://github.com/chooomedia/lazy-stoner-donator)
[![Content: JSON Driven](https://img.shields.io/badge/content-JSON%20driven-2f6f3e)](https://github.com/chooomedia/lazy-stoner-donator/blob/lazy-stoner-donator/wishlist-products.json)
[![Site: lsd.cannachris.de](https://img.shields.io/badge/site-lsd.cannachris.de-4b8f5a)](https://lsd.cannachris.de/)

Static wishlist frontend for Cannachris. The page presents 86 support cards: product wishes, gifted/open states, social-wish actions, campaign support cards, donation links, share actions, image SEO metadata, and JSON-LD structured data.

Live site: [lsd.cannachris.de](https://lsd.cannachris.de/)
Default branch: `lazy-stoner-donator`
Primary runtime data: `wishlist-products.json`, `wishlist-content.json`

## Current Scope

- Plain static site: no framework, no bundler, no server runtime.
- Runtime-only repository: deployable HTML, CSS, JS, JSON and public assets only.
- Development artifacts are intentionally ignored and removed from the branch: `prompts/`, `scripts/`, `data/`, `db/`, `*.xcf`.
- CI/CD validation and artifact preparation run inline in `.github/workflows/deploy.yml`.
- Production deploy target: `https://lsd.cannachris.de/`.

## Runtime Architecture

- `index.html`: page structure, metadata, canonical URL, Open Graph/Twitter tags, favicons, and JSON-LD.
- `styles/main.css`: layout, responsive card grid, toolbar, buttons, share menu and visual states.
- `js/adCard.js`: renders cards, image alt/title metadata, CTA labels, share menu and gifted state.
- `js/card.js`, `js/cardStack.js`, `js/widget.js`: minimal UI primitives.
- `wishlist-products.json`: canonical card dataset.
- `wishlist-content.json`: canonical visible copy and UI labels.
- `js/wishlistProductsData.js`, `js/wishlistContentData.js`: fallback mirrors for static hosting or failed JSON fetches.
- `assets/`: public runtime images, favicons and social preview assets.

## SEO, AIO and Sharing

The site uses standard SEO foundations rather than hidden AI-only content:

- Canonical URL: `https://lsd.cannachris.de/`.
- Open Graph image: `assets/social/lazy-stoner-donator-og.png` at `1200x630`.
- Favicon stack: `favicon.ico`, `favicon.svg`, PNG sizes, `apple-touch-icon.png` and `site.webmanifest`.
- JSON-LD: `WebPage` with a valid `ItemList` of `Thing` entries. The wishlist overview does not emit incomplete `Product` or `Offer` markup.
- Social/action images include `imageAlt`, `imageTitle`, `imageCaption`, `imageKeywords` and `seoIntent` in `wishlist-products.json`.
- `robots.txt` and `llms.txt` are kept simple and point crawlers to canonical runtime data.

Rules:

- Do not keyword-stuff alt text or metadata.
- Keep structured data consistent with visible content and public runtime files.
- Use absolute HTTPS URLs for share metadata.
- Keep public images crawlable and stable.

## Data Model Rules

`wishlist-products.json` is the source of truth for all cards.

Common fields:

- identity: `host`, `adId`, `title`, `url`
- media: `image`, `imageFallback`, `imageQuality`
- editorial copy: `description`, `audienceLabel`, `ctaLabel`
- provenance: `priceStatus`, `priceEvidence`, `priceCheckedAt`, `availabilityStatus`, `availabilityEvidence`
- social image SEO: `imageAlt`, `imageTitle`, `imageCaption`, `imageKeywords`, `seoIntent`

Product rules:

- Do not invent product facts, prices or availability.
- Preserve verified affiliate URLs and partner IDs.
- Keep replacement history in `replaces` when a product is swapped.
- Do not show prices in the visible UI.

Social/action rules:

- Use normal card layout unless a deliberate `displayTier` is set.
- Keep CTA labels short enough for mobile buttons.
- Use WebP images in `assets/images/social-wishes/`.
- Keep alt text descriptive, natural and useful for accessibility.

## Synchronization Requirements

When card data changes, keep synchronized:

- `wishlist-products.json`
- `js/wishlistProductsData.js`
- JSON-LD item count and item list in `index.html`

When visible copy changes, keep synchronized:

- `wishlist-content.json`
- `js/wishlistContentData.js`

CI validates these relationships before deploy.

## Local Development

Serve the folder as static files:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Avoid `file://` testing when JSON fetch behavior matters.

## Deployment

Every push to `lazy-stoner-donator` runs `.github/workflows/deploy.yml`:

1. Check out the branch.
2. Validate runtime files, JSON fallback sync, JSON-LD sync, social image SEO metadata, OG image and favicon references.
3. Create `deploy-artifact/` from runtime files only.
4. Upload the artifact.
5. Deploy to ALL-INKL via SFTP.
6. Smoke test `https://lsd.cannachris.de/`.

Required GitHub Secrets:

- `ALL_INKL_HOST`
- `ALL_INKL_PORT` optional, defaults to `22`
- `ALL_INKL_USERNAME`
- `ALL_INKL_PRIVATE_KEY`
- `ALL_INKL_PRIVATE_KEY_PASSPHRASE` optional
- `ALL_INKL_HOST_KEY_FINGERPRINT`
- `ALL_INKL_REMOTE_PATH`

## File Map

```text
/
├── .github/workflows/deploy.yml
├── assets/
│   ├── images/social-wishes/*.webp
│   ├── social/lazy-stoner-donator-og.png
│   └── lsd-favicon.png
├── js/
├── styles/
├── favicon.png
├── index.html
├── llms.txt
├── robots.txt
├── sitemap.xml
├── wishlist-content.json
└── wishlist-products.json
```

## Definition of Done

A change is ready when:

- Runtime data and fallback data match.
- JSON-LD item count and positions match `wishlist-products.json`.
- Social/action images are WebP and have alt/title/keyword metadata.
- Open Graph and favicon files exist and are referenced from `index.html`.
- `deploy-artifact/` contains no `prompts/`, `scripts/`, `data/`, `db/` or `.xcf` files.
- GitHub Actions completes successfully.
