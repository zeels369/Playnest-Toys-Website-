# Design System

<!-- impeccable:design-schema 1 -->

## Design Read

- **Domain**: Premium Kids' Electric Ride-On Toys & E-Commerce Showcase.
- **Audience**: Modern parents in India looking for safe, high-quality, durable ride-on toys for kids aged 2–8.
- **Tone & Mood**: Warm, joyful, trustworthy, and premium — avoiding cheap plastic or noisy cartoon aesthetics.

## Color Tokens

Tokens are defined in **two layers** in `css/style.css`. Rules only ever consume
the semantic layer, which is what makes dark mode a clean token swap.

### Layer 1 — Brand (identical in both themes)

- --color-navy: #1B2A5E (Primary brand color, deep trust)
- --color-navy-dark: #101B3E
- --color-coral: #E63950 (Primary action accent, warm high-energy CTA)
- --color-coral-hover: #D1253C
- --color-coral-light: #FFF0F2
- --color-yellow: #FFC93C (Playful accent, warmth, star rating)
- --color-yellow-light: #FFF8E7
- --color-offwhite: #FAFAF7 (Clean page canvas)
- --color-sand: #F0EDE4 (Warm secondary background)
- --color-sand-dark: #E2DDD0 (Borders, card strokes)
- --color-ink: #2D2D2D (Primary body text)
- --color-ink-muted: #5E636E (Secondary spec labels)
- --color-whatsapp: #25D366 (Official WhatsApp brand green)

In **dark mode** the two accents are eased back slightly so they don't glare
against a dark ground, while staying unmistakably Playnest:
`--color-coral: #F25266`, `--color-yellow: #F5C860`.

### Layer 2 — Semantic (what a color is *for*)

| Token | Light | Dark |
| :--- | :--- | :--- |
| `--surface-page` | #FAFAF7 | **#12141C** (deep navy-black, not pure black) |
| `--surface-card` | #FFFFFF | #1B1E29 |
| `--surface-sunken` | #F0EDE4 | #171A24 |
| `--surface-media` (product image well) | #F0EDE4 | #262B3A (elevated, so cards still float) |
| `--surface-raised` | #FFFFFF | #262A38 |
| `--surface-footer` | #101B3E | #0D0F16 |
| `--text-heading` | #1B2A5E | #E7E9F0 (off-white, not #FFF) |
| `--text-body` | #2D2D2D | #D7DAE4 |
| `--text-muted` | #5E636E | #9AA1B4 |
| `--border-subtle` / `-default` / `-strong` | navy @ 8/12/15% | white @ 8/13/20% |

Plus scoped sets for stock-status pills, disabled states, and the `--hero-*`
video scrim. Shadows also swap: navy-tinted in light, true black pools in dark.

### Hero scrim tokens

The hero background is a scroll-scrubbed video frame sequence, so the copy sits
on a gradient scrim whose opacity stops are **derived from measured frame
luminance**, not chosen by eye (working shown in `README.md` and in the
`.hero-scrim` rule):

| Token | Light | Dark | Covers |
| :--- | :--- | :--- | :--- |
| `--hero-scrim-0` | 0.74 | 0.84 | top edge |
| `--hero-scrim-1` | 0.56 | 0.68 | tagline + subtitle + quote |
| `--hero-scrim-2/3` | 0.16 / 0.14 | 0.30 / 0.28 | clears for the subject |
| `--hero-scrim-4` | 0.50 | 0.62 | CTA band |
| `--hero-scrim-5` | 0.74 | 0.86 | bottom edge |

Hero copy uses `--hero-text-body` / `--hero-text-muted` (light-on-dark in **both**
themes) and `--tagline-ink: #FFFFFF`, because it always sits on this dark scrim —
not on the page surface.

## Theming

- **Resolution order**: saved manual choice (`localStorage['playnest-theme']`) → `prefers-color-scheme`.
- `:root` holds the light values; `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and `:root[data-theme="dark"]` hold the dark set, so a manual choice wins in **both** directions.
- An inline bootstrap script in `<head>` stamps `data-theme` **before first paint** — no flash of the wrong theme.
- The header toggle shows the *destination* (moon = go dark, sun = go light) and keeps `aria-pressed` / `aria-label` in sync.
- Theme changes cross-fade via a short-lived `.theme-transition` class so ordinary hover/press feedback is never slowed, and users with `prefers-reduced-motion` get an instant cut instead.

## Typography

- **Display & Headings**: Fredoka, cursive, system-ui, sans-serif (Warm rounded sans, confident and friendly)
- **Body & Specs**: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif (Crisp, high-legibility)
- **Brand Tagline**: Authentic script wordmark emblem from official brand logo.

## Motion & Tactile Principles

- **Easing**: Smooth cubic-beziers (cubic-bezier(0.16, 1, 0.3, 1) and cubic-bezier(0.23, 1, 0.32, 1)).
- **Tactile Response**: Buttons scale scale(0.97) on :active with instant 150ms feedback.
- **Reduced Motion**: Mandatory @media (prefers-reduced-motion: reduce) fallbacks disabling coordinate translation while preserving opacity clarity.
