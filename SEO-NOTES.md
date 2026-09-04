# SEO — what's done, and what's waiting on a domain

Based on the September 2026 static audit of the site archive.

---

## Do this first, the day the domain is decided

Four items are blocked purely on not knowing the hostname. Each needs an
**absolute** URL, and a guessed or placeholder one is worse than leaving it
out — it points crawlers and social scrapers at a page that does not exist.

Assume the domain is `https://playnesttoys.com` and substitute the real one.

**1. Canonical tag** — add to `<head>` in `index.html`:

```html
<link rel="canonical" href="https://playnesttoys.com/">
```

Without it, the same page reachable as `www.` and non-`www.`, or with `?utm=`
tags from WhatsApp and ad traffic, is treated as several competing copies.

**2. Absolute `og:image`** — currently relative, which is the single highest-value
fix for this business:

```html
<meta property="og:image" content="https://playnesttoys.com/images/logo.jpeg">
```

WhatsApp, Facebook and X frequently fail to resolve a relative OG image. Since
sales run through WhatsApp link shares, a link that previews without a picture
is a direct commercial loss, not just an SEO nit. Also add `og:url`.

**3. `sitemap.xml`** — a single-URL sitemap is valid and worth having:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://playnesttoys.com/</loc>
    <lastmod>2026-09-05</lastmod>
  </url>
</urlset>
```

**4. Uncomment the `Sitemap:` line in `robots.txt`** and point it at the above.

**5. Fill in the URL fields in the structured data** — two places:
- `index.html`, the `Store` block: add `url`, `logo` and `image`.
- `js/app.js`, `emitProductSchema()`: add `image` (absolute product photo URL)
  and `url` per product. Both are deliberately omitted today.

Then submit to Google Search Console and re-run a live audit, which also
unlocks the things a static review cannot measure: Core Web Vitals, indexation,
real PageSpeed numbers.

---

## Already done

- **`robots.txt`** — permissive, with the sitemap line ready to uncomment.
- **`Store` structured data** in `<head>` — static, so it does not depend on JS.
- **`Product` / `Offer` structured data for all 48 SKUs** — generated in
  `emitProductSchema()` from the loaded catalogue, so it cannot drift from the
  visible prices. Verified: 0 mismatches. `InStock` maps to schema.org
  availability; blank sheet fields are omitted rather than emitted empty.
- **`apple-touch-icon` + `manifest.json`** — home-screen installs get real
  branding instead of a screenshot.
- **Category tile `alt` text** — these shipped permanently `alt=""`: the code
  swapped `src` without ever setting `alt`. Now reads e.g. "Ride-On Cars —
  Innova".
- **Section headings** — the page had exactly one `<h2>`; the catalogue and
  trust sections had none, and trust items jumped straight to `<h4>`. Added
  two visually-hidden `<h2>`s.

---

## Known limits, stated plainly

**Product schema depends on JavaScript.** `emitProductSchema()` runs after the
sheet fetch, so a crawler that does not execute JS — or that drops the page
from its render queue — sees the `Store` block but no products. This is the
same weakness the audit called its number one issue, and emitting schema
client-side does not fix it. It is better than nothing (Google does render JS)
but it is not equivalent to markup present in the initial HTML response.

**The real fix conflicts with how Vishu works.** Pre-rendering product HTML at
build time is the correct answer for crawlers, but the site was deliberately
built so the Google Sheet is the single source of truth and edits go live with
no code change. A build step means a rebuild and redeploy before any sheet edit
appears. The workable compromise is to pre-render at deploy time *and* keep the
runtime fetch: crawlers get static markup that may lag the sheet slightly,
visitors always get live prices. That needs a deploy pipeline, which does not
exist yet. It is a deliberate trade to make with the client, not a bug to fix
quietly.

---

## Still open, needing a decision or content

- **42 of 48 products have a blank `Description`.** Only the 6 cars have one.
  These should be written from real supplier information — age fit, terrain,
  standout feature. They are deliberately not invented here: a fabricated
  product claim on a children's vehicle is a safety and trading-standards
  problem, not just bad copy.
- **Product photos are JPEG (~4.4 MB total).** WebP would cut 40–60%. Needs a
  `<picture>` element with a JPEG fallback, so it is a real change rather than
  a file swap.
- **One page, one URL, 48 products.** Every category and product is a filter
  state, so the site can only ever rank one URL for one title. Real per-category
  routes are the biggest available structural win, and the largest job.
- **The meta description says "kids aged 6–10".** The catalogue actually spans
  2–12 years. This is the same conflict already flagged in the hero copy and is
  left untouched by instruction — but it is worth fixing in both places at once,
  since it currently under-sells the range to search users.

---

## Audit corrections

Three findings in the September audit were wrong or already handled:

- It reported a **"13-SKU catalog"**. There are **48**. This understates its own
  argument for per-product URLs and schema.
- It reported **"every sampled row"** has a blank description. It is 42 of 48;
  the 6 cars have one.
- It flagged possible **CLS from missing `width`/`height`**. Space is already
  reserved in CSS — `.card-img` has a fixed `height: 140px`, `.card-media` a
  `min-height: 170px`, and `.category-photo` is `position:absolute; inset:0`.
  It searched for `aspect-ratio` and found none, but the reservation is done
  with explicit heights. No work needed.
