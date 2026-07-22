# Lazy Stoner Donator

[![Status: Production](https://img.shields.io/badge/status-production-13890e)](https://github.com/chooomedia/lazy-stoner-donator)
[![Stack: HTML/CSS/Vanilla JS](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-111111)](https://github.com/chooomedia/lazy-stoner-donator)
[![Content: JSON Driven](https://img.shields.io/badge/content-JSON%20driven-2f6f3e)](https://github.com/chooomedia/lazy-stoner-donator/blob/lazy-stoner-donator/wishlist-products.json)
[![Site: cannachris.de](https://img.shields.io/badge/site-cannachris.de%2Flazy--stoner--donator-4b8f5a)](https://cannachris.de/lazy-stoner-donator/)

**Static wishlist frontend for `cannachris.de`.** Presents curated gift ideas with affiliate links, share actions, gifted/open states, and JSON-LD structured data on top of a plain HTML, CSS, and vanilla JavaScript stack.

Live site: [cannachris.de/lazy-stoner-donator](https://cannachris.de/lazy-stoner-donator/)  
Default branch: `lazy-stoner-donator`  
Primary data sources: `wishlist-products.json`, `wishlist-content.json`

## At a Glance

- Production-oriented static frontend with no build step.
- JSON-first content model with JavaScript fallback mirrors.
- Affiliate-safe product URLs and provenance-aware product records.
- Responsive card grid with progressive rendering and keyboard-safe share menus.
- Search-friendly structured data maintained directly in `index.html`.

## Status

- Runtime model: static site
- Delivery model: deployable as plain files
- Maintenance state: active
- Repository role: project-specific branch line extracted from the former `gridCards` history

## Scope

- Static delivery: no framework, no bundler, no server-side rendering.
- Content-led frontend: visible copy and product data are maintained in JSON files.
- Runtime output: a responsive landing page with progressive card rendering, share actions, and wishlist state filters.
- Commercial detail: affiliate URLs must stay intact where they are part of the verified source data.

## Stack

- HTML: `index.html`
- CSS: `styles/main.css`
- JavaScript: `js/*.js`
- Product data source: `wishlist-products.json`
- Copy source: `wishlist-content.json`
- Runtime fallback data: `js/wishlistProductsData.js`, `js/wishlistContentData.js`

There is no build step and no package manager in this project.

## Quick Start

```bash
git clone https://github.com/chooomedia/lazy-stoner-donator.git
cd lazy-stoner-donator
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Architecture

The site is intentionally simple:

- `index.html` defines page structure, loads CSS and JavaScript, and contains JSON-LD structured data.
- `styles/main.css` owns layout, typography, responsive behavior, card states, toolbar docking, and share menu presentation.
- `js/card.js`, `js/cardStack.js`, `js/widget.js` provide the base UI primitives.
- `js/adCard.js` renders wishlist cards, gifted state, audience labels, and share menu behavior.
- `js/http.js` is a minimal fetch wrapper used by legacy-style components.
- `wishlist-products.json` is the canonical live product dataset.
- `wishlist-content.json` is the canonical visible copy dataset.
- `js/wishlistProductsData.js` and `js/wishlistContentData.js` are fallback mirrors for cases where JSON fetches fail.

## Data Model Rules

### Product data

`wishlist-products.json` is the source of truth for product cards.

Each item may include:

- product identity: `adId`, `title`, `host`, `url`
- media: `image`, `imageFallback`
- affiliate context: `partner`
- evidence and provenance: `priceSource`, `priceStatus`, `priceEvidence`, `priceCheckedAt`
- editorial display fields: `displayTier`, `featureReason`, `audienceLabel`
- replacement traceability: `replaces`

Rules:

- Do not invent product facts.
- Keep verified marketplace URLs unchanged.
- Use the canonical Amazon.de partner format when the item is actually on Amazon.de.
- Do not show prices in the visible UI.
- If a price is synthetic and only used for layout/editorial logic, keep explicit provenance fields.

### Content data

`wishlist-content.json` contains the visible copy used by the page:

- hero text
- CTA labels
- wishlist status labels
- filter labels
- share labels
- footer labels

Do not hardcode user-facing copy in HTML or JavaScript unless it is a deliberate fallback.

## Synchronization Requirements

Whenever product data changes, keep these files synchronized:

- `wishlist-products.json`
- `js/wishlistProductsData.js`
- JSON-LD item count and item list in `index.html`

Whenever visible copy changes, keep these files synchronized:

- `wishlist-content.json`
- `js/wishlistContentData.js`

If synchronization is skipped, the runtime page, fallback mode, and structured data will drift.

## Local Development

Use a static file server. Example:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Do not test this page from a `file://` URL if you expect JSON fetches to work reliably.

## Deployment

This project is built for plain file deployment.

- No build artifact is required.
- No package install is required.
- Deploy `index.html`, `styles/`, `js/`, `assets/`, and the JSON data files together.
- Do not deploy partial data changes without synchronizing fallback JavaScript and JSON-LD.

## Working Model

This is the expected maintenance workflow.

### 1. Inspect before changing

- Identify whether the change affects copy, product data, layout, behavior, or structured data.
- Check whether the same fact exists in JSON, fallback JavaScript, and JSON-LD.
- Preserve the static architecture unless there is a clear technical reason to change it.

### 2. Change the canonical source first

- Copy changes start in `wishlist-content.json`.
- Product changes start in `wishlist-products.json`.
- Layout changes start in `styles/main.css`.
- Card behavior and sharing changes start in `js/adCard.js`.

### 3. Sync dependent files

- Update fallback JavaScript mirrors after JSON changes.
- Update `index.html` JSON-LD after product count or ordering changes.
- Keep affiliate URLs, fallback images, and provenance fields intact.

### 4. Run a focused smoke test

Check the actual user-facing behavior:

- content JSON is applied
- product count is correct
- progressive rendering still works
- featured cards remain aligned
- gifted and open states remain visually distinct
- share menus open, close, and stay keyboard-safe
- the fixed toolbar does not cover footer actions
- no prices appear in the visible UI

### 5. Ship small, reviewable changes

- Keep commits narrow in scope.
- Separate content work, product data work, and UI refactors when possible.
- Document non-obvious product replacements with provenance in the data itself.

## Accessibility and UX Requirements

- Maintain keyboard access for interactive elements.
- Closed share menus must not expose hidden actions to keyboard navigation.
- Keep focus styles visible.
- Preserve sufficient color contrast.
- Test footer and toolbar behavior on mobile, not only at the top of the page.

## SEO and Structured Data

`index.html` includes JSON-LD for the page and wishlist items.

When products are added, removed, or reordered:

- update `numberOfItems`
- update the `itemListElement` sequence
- keep product URLs and availability aligned with the live dataset

Structured data must describe the current frontend state, not an outdated export.

## External Dependencies

The frontend currently relies on:

- Google Fonts
- Font Awesome CDN assets
- remote product images
- external marketplace product URLs

If any of these fail, the page must remain usable.

## Git Workflow

- Main branch for this project line: `lazy-stoner-donator`
- Base history: `gridCards` repository history
- Preferred workflow: branch -> focused commit set -> pull request

Avoid mixing unrelated cleanup with product or UI changes unless the cleanup is required to keep the branch consistent.

## Troubleshooting

### JSON content does not load

- Verify local testing runs through `http://localhost` or another static server.
- Check that `wishlist-products.json` and `wishlist-content.json` are valid JSON.
- Confirm fallback files still mirror the same structure: `js/wishlistProductsData.js`, `js/wishlistContentData.js`.

### Product count is wrong

- Recount items in `wishlist-products.json`.
- Update JSON-LD `numberOfItems` in `index.html`.
- Verify ordering and count match the rendered grid.

### Share menu behavior is broken

- Check `js/adCard.js` for menu toggle logic, `aria-hidden`, and `tabIndex` handling.
- Re-test outside click and `Escape` close behavior.

### Layout looks wrong on featured cards

- Inspect `displayTier` and `featureReason` fields in product data.
- Re-test card alignment in `styles/main.css` on desktop and mobile widths.

## File Map

```text
.
├── index.html
├── styles/
│   └── main.css
├── js/
│   ├── adCard.js
│   ├── card.js
│   ├── cardStack.js
│   ├── http.js
│   ├── menu.js
│   ├── smoothScroll.js
│   ├── videoCard.js
│   ├── widget.js
│   ├── wishlistContentData.js
│   └── wishlistProductsData.js
├── assets/
├── data/
├── wishlist-content.json
└── wishlist-products.json
```

## Definition of Done

A change is ready when:

- the canonical source file was updated
- all required mirrors are synchronized
- no visible price leaked into the UI
- share actions still work
- footer/toolbar overlap was checked
- structured data matches the live product set
- the page was tested through a local static server

## Maintainer

- Christopher Matt / Cannachris
