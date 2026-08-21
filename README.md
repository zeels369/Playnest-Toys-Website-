# 🚗 Playnest Toys — "Little Wheels, Big Smiles"

A modern, fast, mobile-first static website for **Playnest Toys**, selling battery-powered electric ride-on toys (cars, bikes, jeeps, scooters) direct-to-customer in India via WhatsApp.

---

## ✅ WHATSAPP NUMBER

> [!IMPORTANT]
> **Single Source of Truth**: The WhatsApp business number is configured in **ONE single location**:
> 
> 👉 [`js/data.js`](js/data.js) at `PLAYNEST_CONFIG.whatsappNumber`
> 
> Current live value: `"919817923818"` (**+91 98179 23818**).
> 
> To change it, edit **only** that property. Store it as digits with the Indian country code `91` and no `+` sign, spaces, or hyphens.
> 
> All CTAs across the entire website (Cart Drawer Checkout, Quick View Modal inquiry links, Floating WhatsApp Chat pill, and the Footer button) dynamically read from this single property — the number is never hardcoded in `index.html` or `js/app.js`.

---

## 🛒 WhatsApp-Based Cart & Ordering Workflow

1. **Add to Cart**: Customers tap "Add to Cart" on any available toy.
2. **Cart Drawer**: The slide-over cart panel displays selected models, allows increasing/decreasing quantities, or removing items.
3. **Consolidated WhatsApp Checkout**: Tapping *"Checkout via WhatsApp"* compiles all items, quantities, SKU codes, and total price into **one consolidated message** sent to your WhatsApp business chat.
4. **Payment Terms**: Automatically noted in the order summary:
   *Delhi orders: 20% advance, 80% on delivery. Outside Delhi: 100% advance before dispatch.*

---

## 📦 How to Update Products, Pricing & Availability

All products are defined in [`js/data.js`](js/data.js) within the `PLAYNEST_PRODUCTS` array.

> [!NOTE]
> All current products are prefixed with `SAMPLE — ` as placeholders. When you receive final approved supplier pricing and inventory, replace them with your real names and values.

### Product Structure Reference:
```javascript
{
  id: "pn-car-01",
  name: "Ferrari F8 Tributo Ride-On",     // Real product name (remove 'SAMPLE — ')
  category: "cars",                         // "cars" | "bikes" | "jeeps" | "scooters"
  price: 8800,                             // Final Selling Price (INR)
  mrp: 14500,                              // MRP / Strike-through Reference Price
  sku: "F8-FERRARI",                       // SKU code for order tracking
  image: "images/products/your-car.png",   // Image path in /images/products/
  badge: "Best Seller",                    // Optional badge: "Top Seller", "New", etc.
  inStock: true,                           // true = Available | false = Shows 'Out of Stock' & disables Add to Cart
  ageRange: "2–6 Yrs",                     // Age specification
  battery: "12V Rechargeable",             // Battery type (12V / 6V)
  weightCapacity: "40 kg",                 // Maximum supported weight
  motors: "2x2 Dual Motor",                // Motor specification
  features: [                              // Key selling features
    "Openable Butterfly Doors",
    "2.4G Parental Remote",
    "Water Mist Smoke Effect",
    "LED Headlights & Taillights"
  ],
  description: "Detailed description for the Quick View specifications modal."
}
```

### Adding New Product Photos:
1. Place clean `.png`, `.jpg`, or `.webp` product photos in the `images/products/` folder.
2. Update the `image` path in `js/data.js` to point to the file (e.g. `images/products/my-new-car.jpg`).

---

## 🎨 Brand Design System Tokens

| Element | Color / Value | Usage |
| :--- | :--- | :--- |
| **Brand Navy** | `#1B2A5E` | Headers, logo, dark accents, active filters |
| **Action Coral** | `#E63950` | Primary buttons, price tags, badges |
| **WhatsApp Green** | `#25D366` | Checkout button & direct WhatsApp chat |
| **Warm Yellow** | `#FFC93C` | Badges, star accents, interactive highlights |
| **Sand / Cream** | `#F0EDE4` | Card media backdrops, section breaks |
| **Warm Off-White** | `#FAFAF7` | Page body background |
| **Display Font** | `Fredoka (Google Fonts)` | Hero headline & main section titles |
| **Body Font** | `Inter / Plus Jakarta Sans` | Body text, specs, prices, buttons |

---

## 🌗 Dark Mode

The site ships a full dark theme driven entirely by CSS custom properties.

- **Toggle**: sun/moon switch in the header nav (right side, beside the primary links).
- **Default**: follows the OS via `prefers-color-scheme` on first visit.
- **Manual override**: persisted to `localStorage` under `playnest-theme`, and it wins over the system setting in **both** directions until cleared.
- **No flash**: an inline script in `<head>` stamps `data-theme` on `<html>` before first paint.
- **Live OS changes** are followed automatically, but only while the visitor hasn't made a manual choice.

Colors live in two token layers (see [`DESIGN.md`](DESIGN.md)): a fixed **brand**
layer and a **semantic** layer (`--surface-*`, `--text-*`, `--border-*`, `--hero-*`).
Every rule consumes the semantic layer, so the dark theme is a pure token swap —
no colors are hardcoded in markup, stylesheet rules, or JS template strings.

To retune the dark palette, edit the two dark blocks near the top of
[`css/style.css`](css/style.css) (the `prefers-color-scheme` block and the
matching `:root[data-theme="dark"]` block — keep the two in step).

---

## 🚀 Cinematic Scroll-Driven Hero (video frame scrubber)

A **22-frame still sequence** extracted from `videos/hero-source.mp4`, drawn to a
`<canvas>` and stepped by scroll position via `requestAnimationFrame`.

### Frame assets

| | Path | Size |
| :--- | :--- | :--- |
| Primary | `images/hero-frames-webp/frame-001…022.webp` | **442 KB** total (~20 KB/frame) |
| Fallback | `images/hero-frames/frame-001…022.jpg` | 583 KB total (~27 KB/frame) |

Both are 1280px wide at quality ~78. WebP support is detected once, synchronously,
via a `canvas.toDataURL('image/webp')` probe; browsers without it get the JPEGs.

**To re-extract** (e.g. after swapping the source video), run the extractor with
`ffmpeg` from `node_modules/@ffmpeg-installer` — 22 evenly-spaced timestamps
across the clip duration, `scale=1280:-2`, written to both folders.

> [!IMPORTANT]
> `server.js` must map `.webp` → `image/webp`. Without it the frames are served
> as `application/octet-stream` and decoding is left to browser sniffing.

### Loading strategy

Lazy and progressive — frames never block the initial render:
1. An `IntersectionObserver` (200px rootMargin) waits until the hero is near the viewport.
2. Kick-off is deferred to `requestIdleCallback` (1500ms timeout), so frames don't compete with critical resources. **Measured: first frame requested at ~1001ms, after DOMContentLoaded at ~799ms.**
3. Frame 1 is fetched and painted first; the other 21 stream in behind it.
4. Scrubbing works throughout — if the exact frame for the current scroll position hasn't arrived, the **nearest loaded frame** is drawn, so the hero never blanks or stalls.

### 4-beat choreography

1. **Beat 0 (0–5%)** — wide shot, tagline reads.
2. **Beat 1 (5–30%)** — camera pushes in.
3. **Beat 2 (30–65%)** — mid sequence.
4. **Beat 3 (65–100%)** — close-up, *"Browse Collection"* CTA resolves into the category grid.

### Text readability

The footage is backlit and bright (measured mean luma ~122/255 in the text bands,
with local highlights near 255), so the copy sits on a **measured gradient scrim**
rather than a guessed one. Against a blown 255 highlight, a black overlay at
opacity *a* leaves `255*(1-a)`; WCAG AA vs white needs ≤119 for body text (4.5:1)
and ≤149 for large display text (3:1) — so *a* ≥ 0.53 and ≥ 0.42 respectively.

The `--hero-scrim-0…5` stops hold **≥0.56 through the whole text block** and
**≥0.50 through the CTA band**, while clearing the middle of the frame so the
subject stays visible. Dark mode runs the scrim heavier (0.84/0.68/…) to cut glare.

Verified by sampling the actual rendered backdrop with the text hidden, at 0/25/50/75/100%
scroll in both themes: **all 30 bands pass**, worst case 5.4:1 against a 4.5 requirement.

### Other hero notes

- The tagline emblem is **inline SVG**, not a raster image — crisp at any size, and
  always light (`--tagline-ink: #FFFFFF`) since it sits on the dark scrim in both themes.
- The hero reserves a `--floating-bar-clearance` lane so the CTA can never collide
  with the fixed Cart/Chat pills. Verified at every scroll depth: CTA bottom 747, pills top 830.
- `prefers-reduced-motion`: **one** frame is fetched (`frame-012`, mid-sequence), the
  320vh scroll track collapses to a single screen, and no scroll listener is attached.

---

## 🛠️ Static Deployment

This website is a zero-dependency, ultra-lightweight static project. You can host it instantly on:
- **Netlify**: Drag & drop the `website dev` folder to Netlify Drop.
- **Vercel**: Run `vercel deploy` or connect your GitHub repository.
- **GitHub Pages**: Push the repository and set GitHub Pages to the `main` branch.
- **Cloudflare Pages / AWS S3**: Deploy directly as static HTML.

---

## 📁 File Structure

```
website dev/
├── index.html                 # Semantic HTML5 markup
├── README.md                  # Project documentation & configuration guide
├── server.js                  # Lightweight local preview server
├── css/
│   └── style.css              # Responsive styles, design tokens, cart drawer, scroll hero
├── js/
│   ├── data.js                # SINGLE SOURCE OF TRUTH (WhatsApp phone, config, sample products, inStock)
│   └── app.js                 # Cart state, scroll hero, live filtering, modal, WhatsApp builder
└── images/
    ├── logo.jpeg              # Exact Playnest wordmark logo
    ├── hero/                  # Vector hero assets (hero-car, hero-jeep, hero-bike, hero-scooter)
    └── products/              # Vector & photo product assets
```
