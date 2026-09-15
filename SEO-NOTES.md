# SEO — what's done, what's live, and what's still open

Based on the September 2026 static audit of the site archive. The site went
live on **playnesttoys.in** on 2026-09-15, which unblocked everything that
only needed a real hostname.

---

## Now that the domain is live — do this next

Submit to Google Search Console and re-run a live audit (`/seo audit
https://playnesttoys.in`) — this unlocks everything a static file review
can't measure: real Core Web Vitals, indexation status, actual PageSpeed
numbers, and whether the JS-dependent product schema (see Known limits below)
is actually being picked up by Google's renderer in practice rather than in
theory.

---

## Already done

- **Canonical tag**, pinned to `https://playnesttoys.in/` — so `www.`, `http://`,
  and `?utm=`-tagged links from WhatsApp/ad traffic are treated as one page,
  not several competing copies. (Confirmed both `playnesttoys.in` and
  `www.playnesttoys.in` currently serve 200; `http://` redirects to the
  canonical `https://playnesttoys.in/`.)
- **Absolute `og:image` and `og:url`** — this was the single highest-value fix
  for this business specifically: WhatsApp/Facebook/X frequently fail to
  resolve a relative OG image, and sales run through WhatsApp link shares. A
  shared link previewing with no picture was a direct commercial loss, not
  just an SEO nit.
- **`sitemap.xml`** — single URL, matching the site's actual single-page
  structure honestly rather than padding it out. Linked from `robots.txt`.
- **Structured data URL fields** — `Store.url`, `Store.logo`, `Store.image` in
  `index.html`, and `image` per product in `emitProductSchema()` (`js/app.js`),
  built from `location.origin` so it's correct on any host, not hardcoded.
  Verified live: 48/48 products carry a valid absolute image URL, 0 malformed.
  **`url` per product stays intentionally absent** — see Still open, below;
  that one was never a domain problem.
- **`robots.txt`** — permissive, sitemap linked.
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
  trust sections had none, and trust items jumped straight to `<h4>`. Fixed to
  a clean h1 → h2 → h3 outline, zero skipped levels across all 64 headings.

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
  routes are the biggest available structural win, and the largest job. This is
  also why per-product `url` in the structured data stays empty: there's no
  page that identifies one product to point it at yet.
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
