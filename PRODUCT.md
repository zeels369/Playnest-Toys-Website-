# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML5, CSS3 Custom Properties, Vanilla JavaScript (ES6+), Node.js dev server. No external framework overhead; instant page loads.

## Users

Indian parents and gift-givers purchasing premium electric ride-on toys (battery cars, bikes, jeeps, scooters) for children aged 6–10. They prioritize build quality, child safety, battery longevity, warranty clarity, and ease of ordering directly via WhatsApp.

## Product Purpose

An interactive e-commerce showcase catalogue that highlights Playnest Toys' range of battery-powered ride-on toys with high visual fidelity, rich vehicle specifications (voltage, motor count, carrying capacity, remote controls), dynamic filtering, an in-memory cart, and single-tap consolidated ordering via WhatsApp.

## Positioning

Direct-to-consumer curated ride-on toy specialist in India with transparent local pricing in Indian Rupees (₹), authentic vehicle styling, and personal direct-order support via WhatsApp rather than detached multi-step credit card checkout.

## Operating Context

- **Geographic Focus**: Pan-India delivery (Delhi NCR: 20% advance / 80% on delivery; Outside Delhi: 100% advance before dispatch).
- **Communication & Checkout Channel**: WhatsApp chat & cart compilation.
- **Ordering Flow**: Browse catalogue → inspect specs in Quick View modal → Add to Cart → 1-tap WhatsApp consolidated order message generator.

## Capabilities and Constraints

- **Live In-Memory Cart Drawer**: Client-side cart state with instant quantity adjustment and dynamic total calculation.
- **Dynamic Catalog Filter & Live Search**: Category pills (Cars, Bikes, Jeeps, Scooters), search by model name, and price sorting.
- **Cinematic 4-Beat Scroll-Driven Hero**: A 22-frame video still sequence (WebP, 442 KB, with JPEG fallback) scrubbed to scroll position on a canvas, lazy-loaded so it never blocks first paint.
- **Full Dark Mode**: Header sun/moon toggle, `prefers-color-scheme` default, and a persisted manual override (`localStorage`). Implemented as a semantic CSS token swap across every section.
- **Stock Management (inStock)**: Real-time availability badges and disabled cart buttons for out-of-stock items.
- **Single Source of Truth (js/data.js)**: All phone numbers and catalogue items configured in one place.

## Brand Commitments

- **Name**: Playnest Toys
- **Tagline**: * Little Wheels Big Smiles*
- **Subtext**: *TOYS · RIDE · FUN*
- **Brand Colors**:
  - Primary Navy: #1B2A5E
  - Action Coral-Red: #E63950
  - Accent Warm Yellow: #FFC93C
  - Background Sand / Off-White: #FAFAF7 / #F0EDE4
  - Deep Ink: #2D2D2D
- **Typography**: Google Fonts Fredoka (Display headlines), Inter (Body & vehicle specs), and authentic script wordmark tagline.
- **Brand Tone**: Warm, joyful, and trustworthy — approachable for parents buying for toddlers, yet professional and premium.

## Product Principles

1. **Safety & Clarity First**: Every vehicle card presents key parental decision criteria upfront (battery voltage, motor count, recommended age, weight capacity).
2. **Frictionless Ordering**: Zero payment gateway hurdles or mandatory accounts — streamlined WhatsApp compilation.
3. **Tactile Craft & Visual Delight**: Smooth, responsive micro-interactions with physical feedback and fluid spring animations.
4. **Honest Availability**: Instant visual feedback for in-stock vs out-of-stock models.

## Accessibility & Inclusion

- Responsive layout adapting gracefully from 320px mobile screens to 4K displays.
- High-contrast typography exceeding WCAG AA minimum ratios in both light and dark themes.
- Full keyboard navigability (Escape to dismiss drawer/modal, Enter/Space for category selection).
- Support for prefers-reduced-motion across all animated elements, including the theme swap (instant cut rather than cross-fade).
- Respects prefers-color-scheme on first visit, with a persisted manual override.
