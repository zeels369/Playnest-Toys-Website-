/**
 * ============================================================================
 * PLAYNEST TOYS — CONFIGURATION & PRODUCT DATA SOURCE
 * ============================================================================
 *
 * Products are NOT defined in this file. They are fetched at runtime from a
 * published Google Sheet (CSV), so the catalogue can be edited in the sheet
 * without touching any code.
 *
 * 🔴 TO POINT THE SITE AT YOUR SHEET:
 *   1. In the sheet: File → Share → Publish to web
 *   2. Choose the "Products" tab, format "Comma-separated values (.csv)"
 *   3. Publish, copy the URL, paste it into PRODUCTS_CSV_URL below.
 *
 * Expected columns (order does not matter — they are matched by header name):
 *   Id, Name, Category, OriginalPrice, Price, AgeRange, WeightCapacity,
 *   Battery, Braking, Description, ImageURL, Badge, Featured, InStock
 *
 *   Category  must be one of: cars | bikes | jeeps | scooters
 *   Price     digits only, no currency symbol or separators (e.g. 6200).
 *             This is always the price actually charged.
 *   OriginalPrice  optional. The pre-discount price. Shown struck through
 *             beside Price, with the saving as a "% OFF" tag. Ignored unless
 *             it is a number GREATER than Price, so a blank, equal or lower
 *             value simply shows the plain price and no product can display
 *             a discount it does not have.
 *   InStock   TRUE or FALSE
 *   Badge     leave blank for no badge. Accepts SEVERAL badges separated by
 *             commas ("Bestseller, New Arrival"); each renders as its own
 *             tag. A "Badges" heading works identically.
 *   Featured  TRUE lifts the product to the top under the default sort
 *   Description  free text shown in the Quick View modal; blank hides the block
 *   ImageURL  a path relative to the site root (images/products/…) or a full URL
 * ============================================================================
 */

const PLAYNEST_CONFIG = {
  brandName: "Playnest Toys",
  tagline: "Little Wheels, Big Smiles",
  subtext: "TOYS · RIDE · FUN",

  // 🟢 SINGLE SOURCE OF TRUTH FOR WHATSAPP ORDERING:
  // Digits with country code, no '+', spaces, or hyphens.
  // Live business number: +91 98179 23818
  whatsappNumber: "919817923818",

  // 🔴 PUBLISHED SHEET CSV URL — paste yours here.
  // Leave empty to fall back to data/products.csv bundled with the site.
  PRODUCTS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFkc5ocvmSEmmeTm26XnyGK7Ig9Ur53cUcvVbvhmotteytfbXivc6ZWkiikqHSu1eQBYp0p1WEz4Y/pub?output=csv",

  // Local fallback, used when the sheet URL is unset or unreachable, so the
  // catalogue never renders empty.
  PRODUCTS_CSV_FALLBACK: "data/products.csv",

  // Consolidated Cart WhatsApp Message Builder
  buildCartWhatsAppUrl: function (cartItems, grandTotal) {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');

    let msg = `Hi Playnest Toys! 🚗✨\nI would like to place an order for the following ride-on toys:\n\n`;

    cartItems.forEach((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      msg += `${index + 1}. *${item.product.name}*\n   • Qty: ${item.quantity} × ₹${item.product.price.toLocaleString('en-IN')}\n   • Subtotal: ₹${itemTotal.toLocaleString('en-IN')}\n`;
      msg += `\n`;
    });

    msg += `--------------------------\n`;
    msg += `*Total Order Value:* ₹${grandTotal.toLocaleString('en-IN')}\n\n`;
    msg += `*Delivery Terms Acknowledged:* (Delhi: 20% advance / Outside Delhi: 100% advance)\n`;
    msg += `*My Delivery City / Pincode:* [Please enter your city]\n\n`;
    msg += `Please confirm availability and dispatch schedule. Thank you!`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  },

  // Single product direct inquiry WhatsApp Link
  buildWhatsAppUrl: function (productName, price) {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    let msg = `Hi Playnest Toys! 🚗✨\nI would like to inquire about:\n\n*Product:* ${productName}\n*Price:* ₹${price.toLocaleString('en-IN')}`;
    msg += `\n\nPlease let me know availability and delivery details to my location. Thank you!`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  },

  // Restock notification request, used in place of Add to Cart when InStock is FALSE
  buildNotifyMeUrl: function (productName) {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    const msg = `Hi Playnest Toys! 👋 Please notify me when *${productName}* is back in stock. Thank you!`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  },

  // General WhatsApp Inquiry Link
  buildGeneralInquiryUrl: function () {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    const msg = `Hi Playnest Toys! 👋 I'm looking for a battery-operated ride-on toy for my child. Could you share your latest recommendations and availability?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  }
};

const PLAYNEST_CATEGORIES = [
  { id: "all", name: "All Ride-Ons", shortName: "All" },
  { id: "cars", name: "Ride-On Cars", shortName: "Cars" },
  { id: "bikes", name: "Bikes & Trikes", shortName: "Bikes" },
  { id: "jeeps", name: "Jeeps & UTVs", shortName: "Jeeps" },
  { id: "scooters", name: "Scooters & Scooties", shortName: "Scooters" }
];

/**
 * Populated by loadProducts() before the catalogue renders. Kept as a mutable
 * binding rather than a const so the fetch layer can swap it in wholesale.
 */
let PLAYNEST_PRODUCTS = [];

/* ==========================================================================
   CSV PARSING

   A hand-rolled parser rather than a dependency: the site ships zero runtime
   dependencies, and Google's CSV export is well-formed. Handles quoted fields,
   escaped quotes ("") and embedded commas and newlines, which matter because
   product names contain commas and braking descriptions contain "&".
   ========================================================================== */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  // Normalise line endings so CRLF from Sheets does not leak into values.
  const src = text.replace(/\r\n?/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }   // escaped quote
        else inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') { inQuotes = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }

  // Trailing field / row with no terminating newline.
  if (field.length || row.length) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/**
 * Turn CSV rows into product objects, matching columns by HEADER NAME so the
 * sheet's column order can change without breaking the site.
 */
function rowsToProducts(rows) {
  if (!rows.length) return [];

  // Header matching drops spaces as well as case, so "OriginalPrice" and a
  // sheet owner's "Original Price" resolve to the same column instead of the
  // second one silently reading as missing.
  const normalize = (h) => h.trim().toLowerCase().replace(/\s+/g, '');
  const headers = rows[0].map(normalize);
  const col = (row, name) => {
    const idx = headers.indexOf(normalize(name));
    return idx === -1 ? '' : (row[idx] || '').trim();
  };

  return rows.slice(1).map((row, i) => {
    const name = col(row, 'Name');
    if (!name) return null;

    // Strip anything that is not a digit so "₹6,200" and "6200" both work.
    const num = (v) => parseInt(v.replace(/[^0-9]/g, ''), 10);
    const price = num(col(row, 'Price'));
    const wasPrice = num(col(row, 'OriginalPrice'));

    // A strikethrough is a savings claim, so it is honoured only when the
    // sheet proves one: a real number strictly above the selling price.
    // Blank, equal, lower or malformed all fall back to the plain price.
    const originalPrice =
      Number.isFinite(wasPrice) && Number.isFinite(price) && wasPrice > price
        ? wasPrice
        : null;

    // One cell, any number of badges. "Twin Seat, New Arrival" becomes two
    // tags; a single value still becomes one, so every existing row keeps
    // working untouched. Empty segments left by a stray comma are dropped
    // rather than rendered as an empty tag.
    const badges = (col(row, 'Badges') || col(row, 'Badge'))
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const stockRaw = col(row, 'InStock').toUpperCase();
    // Anything other than an explicit FALSE/NO/0 counts as in stock, so a blank
    // cell never silently hides a product's buy button.
    const inStock = !['FALSE', 'NO', '0'].includes(stockRaw);

    return {
      id: col(row, 'Id') || 'row-' + (i + 1),
      name,
      category: (col(row, 'Category') || 'bikes').toLowerCase(),
      price: Number.isFinite(price) ? price : 0,
      originalPrice,
      // Whole-number percentage saved. Null when there is no discount.
      discountPercent: originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null,
      ageRange: col(row, 'AgeRange'),
      weightCapacity: col(row, 'WeightCapacity'),
      battery: col(row, 'Battery'),
      braking: col(row, 'Braking'),
      description: col(row, 'Description'),
      image: col(row, 'ImageURL'),
      badges,
      // Same permissive rule as InStock: only an explicit TRUE promotes a
      // product, so a blank cell never silently features something.
      featured: ['TRUE', 'YES', '1'].includes(col(row, 'Featured').toUpperCase()),
      inStock
    };
  }).filter(Boolean);
}

/**
 * Fetch the catalogue. Tries the published sheet first, then the bundled
 * fallback CSV, so a sheet outage or an unset URL degrades to the last known
 * catalogue instead of an empty grid.
 *
 * @returns {Promise<{products: Array, source: string}>}
 */
const FETCH_TIMEOUT_MS = 4000;

async function loadProducts() {
  const sources = [
    PLAYNEST_CONFIG.PRODUCTS_CSV_URL,
    PLAYNEST_CONFIG.PRODUCTS_CSV_FALLBACK
  ].filter(Boolean);

  for (const url of sources) {
    try {
      // A dead sheet URL can hang on DNS for ~10s, leaving the grid empty that
      // whole time. Give up quickly and fall through to the bundled copy —
      // stale-but-instant beats correct-but-blank.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      let res;
      try {
        // cache: 'no-store' asks the browser not to add its own caching on top
        // of Google's edge cache, so any delay is Google's alone.
        res = await fetch(url, { cache: 'no-store', signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const products = rowsToProducts(parseCSV(await res.text()));
      if (!products.length) throw new Error('no rows parsed');

      PLAYNEST_PRODUCTS = products;
      return { products, source: url };
    } catch (err) {
      console.warn('[playnest] product source failed:', url, '—', err.message);
    }
  }

  PLAYNEST_PRODUCTS = [];
  return { products: [], source: null };
}

/* ==========================================================================
   BADGE AUDIT

   Badges are catalogue-wide: the grid shows every category together by
   default, so the same badge on two products reads as a bug, and a superlative
   badge is simply wrong if another product beats it on that measure.

   This never rewrites the sheet. It reports to the console, so a bad badge is
   caught the first time the page is opened rather than by a customer.

   Where a criterion TIES, the rule is to leave both blank and raise it — never
   to pick a winner silently.
   ========================================================================== */
/** How many badges one card can carry before it stops reading as a highlight. */
const MAX_BADGES_PER_PRODUCT = 2;

function auditBadges(products) {
  const issues = [];
  const badged = products.filter((p) => p.badges && p.badges.length);

  // Every (product, badge) pair, so a product wearing two badges is checked
  // once per badge rather than once per product.
  const pairs = [];
  badged.forEach((p) => p.badges.forEach((b) => pairs.push({ product: p, badge: b })));

  // 1. The same badge text on more than one product.
  const byBadge = {};
  pairs.forEach(({ product, badge }) => {
    const key = badge.toLowerCase();
    (byBadge[key] = byBadge[key] || { label: badge, names: [] }).names.push(product.name);
  });
  Object.values(byBadge).forEach(({ label, names }) => {
    const unique = [...new Set(names)];
    if (unique.length > 1) {
      issues.push('Badge "' + label + '" is on ' + unique.length + ' products (' +
        unique.join(', ') + '). Badges are catalogue-wide — keep one.');
    }
  });

  // 2. The same badge twice on ONE product, and overloaded cards. Only
  //    possible now that a single cell can hold a list.
  badged.forEach((p) => {
    const seen = p.badges.map((b) => b.toLowerCase());
    if (new Set(seen).size !== seen.length) {
      issues.push('"' + p.name + '" repeats a badge (' + p.badges.join(', ') +
        '). Remove the duplicate.');
    }
    if (p.badges.length > MAX_BADGES_PER_PRODUCT) {
      issues.push('"' + p.name + '" carries ' + p.badges.length + ' badges (' +
        p.badges.join(', ') + '). Keep it to ' + MAX_BADGES_PER_PRODUCT +
        ' — more than that and none of them stand out.');
    }
  });

  if (products.length) {
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const cheapest = products.filter((p) => p.price === min);
    const priciest = products.filter((p) => p.price === max);

    const isValue = (b) => /best value|value pick/i.test(b);
    const isTop = (b) => /premium|top of range|flagship/i.test(b);

    // 3. Superlative badges the numbers contradict — checked per badge, so a
    //    product tagged "Twin Seat, Premium" is still caught on the Premium.
    pairs.forEach(({ product, badge }) => {
      if (isValue(badge) && product.price !== min) {
        issues.push('"' + product.name + '" carries "' + badge + '" at ' + product.price +
          ', but ' + min + ' (' + cheapest.map((c) => c.name).join(', ') + ') is cheaper.');
      }
      if (isTop(badge) && product.price !== max) {
        issues.push('"' + product.name + '" carries "' + badge + '" at ' + product.price +
          ', but ' + max + ' (' + priciest.map((c) => c.name).join(', ') + ') is higher.');
      }
    });

    // 4. Ties on a superlative criterion — flag, never guess a winner.
    const anyValue = pairs.some(({ badge }) => isValue(badge));
    const anyTop = pairs.some(({ badge }) => isTop(badge));
    if (cheapest.length > 1 && anyValue) {
      issues.push(cheapest.length + ' products tie at the lowest price (' +
        cheapest.map((c) => c.name).join(', ') +
        '). A value badge cannot be assigned without a tiebreak — leave blank and decide deliberately.');
    }
    if (priciest.length > 1 && anyTop) {
      issues.push(priciest.length + ' products tie at the highest price (' +
        priciest.map((c) => c.name).join(', ') +
        '). A top-of-range badge cannot be assigned without a tiebreak — leave blank and decide deliberately.');
    }

    // 5. A discount badge on a product with no discount in the sheet.
    pairs.forEach(({ product, badge }) => {
      if (/sale|off|deal|discount/i.test(badge) && !product.originalPrice) {
        issues.push('"' + product.name + '" carries "' + badge +
          '" but has no OriginalPrice, so no saving is shown. Fill OriginalPrice or drop the badge.');
      }
    });
  }

  if (issues.length) {
    console.warn('[playnest] badge audit — ' + issues.length + ' issue(s):');
    issues.forEach((i) => console.warn('  - ' + i));
  }
  return issues;
}
