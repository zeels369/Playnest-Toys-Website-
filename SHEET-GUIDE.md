# Editing the Playnest catalogue

The website reads its products from **one Google Sheet**. Edit the sheet, and the
site updates itself. You never need to touch code to change a product.

---

## The one-time setup (do this once)

1. Open the sheet → **File → Share → Publish to web**
2. Select the **Products** tab, and format **Comma-separated values (.csv)**
3. Click **Publish**, copy the URL it gives you
4. Paste that URL into `js/data.js`, into the line that reads:
   ```js
   PRODUCTS_CSV_URL: "",
   ```

Until that URL is filled in, the site runs from a copy of the sheet bundled with
the website (`data/products.csv`). Everything works — it just won't pick up your
sheet edits.

> **Publishing makes the sheet readable by anyone with the link.** It has no
> password. Your full price list is effectively public. That is unavoidable for a
> website with no server, but it is worth deciding deliberately.

---

## The columns

One row per product. **Column order does not matter** — the site matches on the
heading text, so you can drag columns around safely. Do not rename the headings.

| Column | What it controls | Notes |
|---|---|---|
| **Id** | Internal reference | Must be unique. Never reuse an id. If left blank the site invents one, but a stable id is better. |
| **Name** | The product title on the card and in the popup | |
| **Category** | Which filter tab the product appears under | Must be **exactly** one of the four values below. |
| **Price** | The price shown on the card | **Digits only** — `6200`, not `₹6,200`. The site adds the ₹ and the commas. |
| **AgeRange** | The age chip on the card | Free text, e.g. `2–5 yrs`. |
| **WeightCapacity** | The weight chip on the card | Free text, e.g. `30Kg Max`. |
| **Battery** | The battery chip on the card | Free text, e.g. `12V`. |
| **Braking** | The "Braking" row in the popup | e.g. `Foot Race`, `Hand Race & Foot Break`, `4x4 Motor Wheel`. |
| **Description** | The paragraph in the popup | Free text. **Leave blank and the paragraph is hidden** — no empty space. |
| **ImageURL** | The product photo | Either `images/products/name.jpg` (a file in the site) or a full `https://…` link. |
| **Badge** | The small coloured label on the card | Leave blank for no badge. See the badge rules below. |
| **Featured** | Promotes the product | `TRUE` lifts it to the top of the grid under the default sort and gives it a gold outline. `FALSE` or blank for normal. |
| **InStock** | Whether it can be bought | `TRUE` = normal. `FALSE` = see below. |

---

## Category — the exact values

This is the easiest thing to get wrong. The site matches on the **id**, not the
label you see on screen.

| Type this in the Category column | Appears on the site as |
|---|---|
| `cars` | Ride-On Cars |
| `bikes` | Bikes & Trikes |
| `jeeps` | Jeeps & UTVs / "Jeeps & 4x4" |
| `scooters` | Scooters |

**Type `jeeps`, not `Jeeps & 4x4`.** If you type the on-screen label the product
will not appear under any filter and the category counter will read 0 Models.

Capitals are fine (`Bikes` works) — anything else is not.

---

## Out of stock

Set **InStock** to `FALSE` and the product:

- **stays visible** in the grid (it is not hidden)
- gets an **"Out of Stock"** label
- has its photo **greyed back**
- swaps **Add to Cart** for **Notify Me**, which opens WhatsApp with a message
  asking you to let them know when it returns

Set it back to `TRUE` and everything reverts.

---

## Badge rules

Badges are **catalogue-wide**. The grid shows every category together by default,
so two products wearing the same badge sit side by side and look like a mistake.

1. **One product per badge.** Never two "Best Value".
2. **Superlatives must be true across the whole catalogue** — not just within a
   category. "Best Value" belongs to the cheapest product you sell, full stop.
3. **If two products tie, leave both blank.** Do not pick one. A tie means the
   criterion does not separate them, and a badge that could equally belong to
   another product is not informative. Decide on a real tiebreak first.
4. Keep it to **3–5 badges** across the whole catalogue. A badge on everything is
   a badge on nothing.

Prefer badges that state a **fact you can check** — "Twin Seat", "Smoke Effect",
"Biggest 4×4" — over opinions like "Top Seller", which nobody can verify.

**The site checks this for you.** Open the site, press F12, and look at the
Console tab. If a badge is duplicated or a superlative is contradicted by the
prices, it prints a warning naming the products involved.

---

## If something looks wrong

**My edit hasn't appeared.** Google caches the published sheet — see the delay
note the developer gave you. Wait, then hard-refresh (Ctrl+F5).

**A product vanished.** Check the Category spelling against the four values above.

**The price shows as ₹0.** The Price cell has something other than digits in it.

**The whole catalogue is missing.** The site falls back to its bundled copy
automatically, so this should be rare. If you see "Catalogue temporarily
unavailable", the sheet and the backup both failed to load — check the published
URL is still valid.

---

## What is *not* in the sheet

These still need a developer:

- The hero image and the headline text
- The four category tiles and their names
- Page copy: "Why Playnest", the footer, delivery terms
- The WhatsApp number (one line in `js/data.js`)
