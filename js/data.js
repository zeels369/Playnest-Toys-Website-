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
 *   Id, Name, Category, Price, AgeRange, WeightCapacity,
 *   Battery, Braking, ImageURL, Badge, InStock
 *
 *   Category  must be one of: cars | bikes | jeeps | scooters
 *   Price     digits only, no currency symbol or separators (e.g. 6200)
 *   InStock   TRUE or FALSE
 *   Badge     leave blank for no badge
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
  PRODUCTS_CSV_URL: "",

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

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const col = (row, name) => {
    const idx = headers.indexOf(name.toLowerCase());
    return idx === -1 ? '' : (row[idx] || '').trim();
  };

  return rows.slice(1).map((row, i) => {
    const name = col(row, 'Name');
    if (!name) return null;

    // Strip anything that is not a digit so "₹6,200" and "6200" both work.
    const price = parseInt(col(row, 'Price').replace(/[^0-9]/g, ''), 10);

    const stockRaw = col(row, 'InStock').toUpperCase();
    // Anything other than an explicit FALSE/NO/0 counts as in stock, so a blank
    // cell never silently hides a product's buy button.
    const inStock = !['FALSE', 'NO', '0'].includes(stockRaw);

    return {
      id: col(row, 'Id') || 'row-' + (i + 1),
      name,
      category: (col(row, 'Category') || 'bikes').toLowerCase(),
      price: Number.isFinite(price) ? price : 0,
      ageRange: col(row, 'AgeRange'),
      weightCapacity: col(row, 'WeightCapacity'),
      battery: col(row, 'Battery'),
      braking: col(row, 'Braking'),
      image: col(row, 'ImageURL'),
      badge: col(row, 'Badge'),
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
async function loadProducts() {
  const sources = [
    PLAYNEST_CONFIG.PRODUCTS_CSV_URL,
    PLAYNEST_CONFIG.PRODUCTS_CSV_FALLBACK
  ].filter(Boolean);

  for (const url of sources) {
    try {
      // cache: 'no-store' asks the browser not to add its own caching on top of
      // Google's edge cache, so the delay is Google's alone.
      const res = await fetch(url, { cache: 'no-store' });
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
