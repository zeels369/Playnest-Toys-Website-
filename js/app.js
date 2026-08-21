/**
 * ============================================================================
 * PLAYNEST TOYS — CLIENT APP JAVASCRIPT
 * Handles scroll-driven cinematic hero, dynamic catalog rendering,
 * in-memory WhatsApp cart system, category filters, search/sort, and modal.
 * ============================================================================
 */

// In-Memory Cart State (Array of { productId, quantity })
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  // 0. Wire up the dark mode toggle (theme itself is already applied by the
  //    inline bootstrap in index.html, before first paint)
  initThemeToggle();

  // 1. Initialize Header, Footer, and Floating WhatsApp Action Links
  initWhatsAppLinks();

  // 2. Initialize Category Counts
  initCategoryCounts();

  // 3. Initialize Catalog Filter & Grid
  initCatalog();

  // 4. Initialize Scroll-Driven Hero Sequence
  initScrollHero();

  // 5. Initialize Quick View Modal
  initProductModal();

  // 6. Initialize Cart Drawer & Controls
  initCartDrawer();

  // 7. Header Scroll Shadow
  initHeaderScroll();
});

/* ==========================================================================
   0. DARK MODE
   Resolution order: saved manual choice → system preference.
   The initial data-theme is stamped by the inline script in index.html so
   there is no flash; this module only handles toggling and persistence.
   ========================================================================== */
const THEME_STORAGE_KEY = 'playnest-theme';

/** Browser-chrome color per theme, kept in step with --surface-page. */
const THEME_META_COLOR = {
  light: '#FAFAF7',
  dark: '#12141C'
};

function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return (v === 'dark' || v === 'light') ? v : null;
  } catch (e) {
    return null; // storage blocked (private mode / disabled cookies)
  }
}

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Apply a theme.
 * @param {'light'|'dark'} theme
 * @param {boolean} animate  Cross-fade the color change (skipped on first paint
 *                           and when the user prefers reduced motion).
 */
function applyTheme(theme, animate) {
  const root = document.documentElement;

  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 260);
  }

  root.setAttribute('data-theme', theme);

  // Keep mobile browser chrome in sync so the notch/status bar matches.
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.setAttribute('content', THEME_META_COLOR[theme]);

  syncThemeToggle(theme);
}

function syncThemeToggle(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const goingTo = theme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${goingTo} mode`;

  btn.setAttribute('aria-pressed', String(theme === 'dark'));
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');

  // Reflect whatever the bootstrap resolved, without animating.
  syncThemeToggle(getCurrentTheme());

  if (btn) {
    btn.addEventListener('click', () => {
      const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {
        // Storage blocked — the choice still applies for this page view.
      }
    });
  }

  // Follow the OS in real time, but only while the user has made no manual
  // choice. Once they've picked, their choice wins until they clear storage.
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = (e) => {
    if (getStoredTheme() === null) {
      applyTheme(e.matches ? 'dark' : 'light', true);
    }
  };

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onSystemChange);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onSystemChange); // Safari < 14
  }
}

/* ==========================================================================
   1. WHATSAPP LINK INITIALIZATION (Single Source from data.js)
   ========================================================================== */
function initWhatsAppLinks() {
  const generalUrl = PLAYNEST_CONFIG.buildGeneralInquiryUrl();

  const headerBtn = document.getElementById('headerWaBtn');
  if (headerBtn) headerBtn.href = generalUrl;

  const footerBtn = document.getElementById('footerWaBtn');
  if (footerBtn) footerBtn.href = generalUrl;

  const floatingBtn = document.getElementById('floatingWaBtn');
  if (floatingBtn) floatingBtn.href = generalUrl;
}

/* ==========================================================================
   2. CATEGORY COUNTS
   ========================================================================== */
function initCategoryCounts() {
  const counts = {
    cars: 0,
    bikes: 0,
    jeeps: 0,
    scooters: 0
  };

  PLAYNEST_PRODUCTS.forEach(p => {
    if (counts[p.category] !== undefined) {
      counts[p.category]++;
    }
  });

  const carCountEl = document.getElementById('count-cars');
  if (carCountEl) carCountEl.textContent = `${counts.cars} Models`;

  const bikeCountEl = document.getElementById('count-bikes');
  if (bikeCountEl) bikeCountEl.textContent = `${counts.bikes} Models`;

  const jeepCountEl = document.getElementById('count-jeeps');
  if (jeepCountEl) jeepCountEl.textContent = `${counts.jeeps} Models`;

  const scooterCountEl = document.getElementById('count-scooters');
  if (scooterCountEl) scooterCountEl.textContent = `${counts.scooters} Models`;

  // Attach click listener to category strip cards
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-category');
      setActiveCategory(catId);
      scrollToCatalog();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const catId = card.getAttribute('data-category');
        setActiveCategory(catId);
        scrollToCatalog();
      }
    });
  });
}

function scrollToCatalog() {
  const catalogEl = document.getElementById('catalog');
  if (catalogEl) {
    const yOffset = -80;
    const y = catalogEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

// Global hook for footer links
window.filterCategoryFromNav = function(catId) {
  setActiveCategory(catId);
  scrollToCatalog();
};

/* ==========================================================================
   3. CATALOG RENDERING & FILTERING
   ========================================================================== */
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'featured';

function initCatalog() {
  const searchInput = document.getElementById('catalogSearch');
  const sortSelect = document.getElementById('sortSelect');
  const filterPillBtns = document.querySelectorAll('.filter-pill-btn');

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Filter pill buttons
  filterPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setActiveCategory(filter);
    });
  });

  renderProducts();
}

function setActiveCategory(catId) {
  activeCategory = catId;

  // Update filter pill UI
  const filterPillBtns = document.querySelectorAll('.filter-pill-btn');
  filterPillBtns.forEach(btn => {
    if (btn.getAttribute('data-filter') === catId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update category strip card active UI
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    if (card.getAttribute('data-category') === catId) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('catalogCount');
  if (!grid) return;

  // 1. Filter
  let filtered = PLAYNEST_PRODUCTS.filter(p => {
    const matchesCat = (activeCategory === 'all' || p.category === activeCategory);
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery) ||
      p.ageRange.toLowerCase().includes(searchQuery) ||
      p.motors.toLowerCase().includes(searchQuery) ||
      (p.features && p.features.some(f => f.toLowerCase().includes(searchQuery)));
    return matchesCat && matchesSearch;
  });

  // 2. Sort
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 3. Update counter
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'toy' : 'toys'}`;
  }

  // 4. Render cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 class="empty-state-title">No Ride-Ons Found</h3>
        <p class="empty-state-text">Try adjusting your search terms or clearing your category filter.</p>
        <button onclick="setActiveCategory('all'); document.getElementById('catalogSearch').value='';" class="btn-primary btn-primary--sm">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isAvailable = p.inStock !== false;

    return `
      <article class="product-card" data-id="${p.id}">
        
        <!-- Media Container -->
        <div class="card-media" onclick="openProductModal('${p.id}')" role="button" tabindex="0" aria-label="View specifications for ${escapeHtml(p.name)}">
          ${!isAvailable ? `<span class="badge-out-of-stock">Out of Stock</span>` : (p.badge ? `<span class="card-badge">${p.badge}</span>` : '')}
          <img src="${p.image}" alt="${escapeHtml(p.name)}" class="card-img${!isAvailable ? ' card-img--dimmed' : ''}" loading="lazy">
          <button class="quick-view-trigger" aria-label="Quick view specifications">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Specs
          </button>
        </div>

        <!-- Body -->
        <div class="card-body">
          <h3 class="card-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
          
          <!-- Spec Badges -->
          <div class="card-spec-chips">
            <span class="spec-chip" title="Recommended Age">
              <svg class="spec-chip-icon" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"/></svg>
              ${p.ageRange}
            </span>
            <span class="spec-chip" title="Battery Power">
              <svg class="spec-chip-icon" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
              ${p.battery.split(' ')[0]}
            </span>
            <span class="spec-chip" title="Weight Capacity">
              <svg class="spec-chip-icon" viewBox="0 0 24 24"><path d="M19 13h-6V7h-2v6H5v2h6v6h2v-6h6z"/></svg>
              ${p.weightCapacity}
            </span>
          </div>

          <!-- Price -->
          <div class="card-price-row">
            <span class="card-price">₹${p.price.toLocaleString('en-IN')}</span>
            ${p.mrp ? `<span class="card-mrp">₹${p.mrp.toLocaleString('en-IN')}</span>` : ''}
          </div>

          <!-- Action Button: Add to Cart or Out of Stock -->
          ${isAvailable ? `
            <button onclick="addToCart('${p.id}')" class="btn-add-cart" aria-label="Add ${escapeHtml(p.name)} to cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>Add to Cart</span>
            </button>
          ` : `
            <button class="btn-out-of-stock" disabled aria-disabled="true">
              <span>Out of Stock</span>
            </button>
          `}
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

/* ==========================================================================
   4. IN-MEMORY WHATSAPP CART SYSTEM
   ========================================================================== */
function initCartDrawer() {
  const backdrop = document.getElementById('cartBackdrop');
  const headerCartBtn = document.getElementById('headerCartBtn');
  const floatingCartBtn = document.getElementById('floatingCartBtn');
  const closeBtn = document.getElementById('cartCloseBtn');

  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', openCartDrawer);
  }
  if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', openCartDrawer);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeCartDrawer();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) {
      closeCartDrawer();
    }
  });

  renderCartDrawer();
}

window.addToCart = function(productId, quantity = 1) {
  const product = PLAYNEST_PRODUCTS.find(p => p.id === productId);
  if (!product || product.inStock === false) return;

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  // Update UI and trigger bounce animation
  updateCartBadges();
  renderCartDrawer();
  openCartDrawer();
};

window.updateCartQty = function(productId, delta) {
  const itemIndex = cart.findIndex(item => item.productId === productId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
  }
  updateCartBadges();
  renderCartDrawer();
};

window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.productId !== productId);
  updateCartBadges();
  renderCartDrawer();
};

function updateCartBadges() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const floatingBadge = document.getElementById('floatingCartBadge');

  if (floatingBadge) {
    floatingBadge.textContent = totalCount;
    floatingBadge.classList.add('bump');
    setTimeout(() => floatingBadge.classList.remove('bump'), 220);
  }
}

function renderCartDrawer() {
  const listEl = document.getElementById('cartItemsList');
  const totalValueEl = document.getElementById('cartTotalValue');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-message">
        <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <p class="cart-empty-title">Your cart is empty</p>
        <p class="cart-empty-text">Browse our ride-on cars, bikes, and jeeps to select your toys!</p>
      </div>
    `;

    if (totalValueEl) totalValueEl.textContent = '₹0';
    if (checkoutBtn) {
      checkoutBtn.classList.add('disabled');
      checkoutBtn.href = '#';
    }
    return;
  }

  let grandTotal = 0;
  const itemsWithData = [];

  listEl.innerHTML = cart.map(item => {
    const product = PLAYNEST_PRODUCTS.find(p => p.id === item.productId);
    if (!product) return '';

    const itemTotal = product.price * item.quantity;
    grandTotal += itemTotal;
    itemsWithData.push({ product, quantity: item.quantity });

    return `
      <div class="cart-item-card">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</div>
          <div class="cart-item-price">₹${product.price.toLocaleString('en-IN')}</div>
          
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQty('${product.id}', -1)" aria-label="Decrease quantity">−</button>
              <span class="qty-number">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQty('${product.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${product.id}')" aria-label="Remove item">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (totalValueEl) {
    totalValueEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  }

  if (checkoutBtn) {
    checkoutBtn.classList.remove('disabled');
    checkoutBtn.href = PLAYNEST_CONFIG.buildCartWhatsAppUrl(itemsWithData, grandTotal);
  }
}

function openCartDrawer() {
  const backdrop = document.getElementById('cartBackdrop');
  if (backdrop) {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cartBackdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    // Only restore scroll if modal is not also open
    const modal = document.getElementById('productModal');
    if (!modal || !modal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }
}

/* ==========================================================================
   5. CINEMATIC SCROLL-DRIVEN HERO SEQUENCE (4-BEAT)

   Steps a 22-frame still sequence (extracted from videos/hero-source.mp4)
   across a <canvas> as the hero section scrolls.

   Format      WebP when the browser supports it (~442 KB for all 22 frames),
               JPEG otherwise (~583 KB). Detected once, synchronously.
   Loading     Lazy and progressive. Nothing is fetched until the hero is
               about to enter the viewport, and the kick-off is deferred to
               idle time so frames never compete with the critical render.
               Frame 1 is fetched first and painted as soon as it decodes;
               the rest stream in behind it. Scrubbing works throughout —
               if the exact frame for the current scroll position has not
               arrived, the nearest loaded frame is drawn instead, so the
               hero never goes blank or blocks.
   A11y        Under prefers-reduced-motion a single frame is drawn and no
               scroll listener is ever attached.
   ========================================================================== */
function initScrollHero() {
  const TOTAL_FRAMES = 22;
  const REDUCED_MOTION_FRAME = 12;   // mid-sequence: subject centred, well lit

  const heroContainer = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');
  const loader = document.getElementById('heroLoader');
  const textZone = document.getElementById('heroTextZone');
  const actionBox = document.getElementById('heroActionBox');

  const dots = [
    document.getElementById('beatDot0'),
    document.getElementById('beatDot1'),
    document.getElementById('beatDot2'),
    document.getElementById('beatDot3')
  ];

  if (!heroContainer || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const frames = new Array(TOTAL_FRAMES);
  let currentFrameIndex = -1;
  let firstPaintDone = false;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Format selection (synchronous, one-off) ---------------------------
  function supportsWebp() {
    try {
      const c = document.createElement('canvas');
      return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  }

  const useWebp = supportsWebp();
  // Alpha WebP is ~97% supported. Rather than ship a 15 MB transparent PNG
  // sequence for the remainder, those browsers get one static poster frame.
  const FRAME_DIR = 'images/hero-frames-webp/';
  const POSTER = 'images/hero-poster.png';

  function frameSrc(num) {
    if (!useWebp) return POSTER;
    return FRAME_DIR + 'frame-' + String(num).padStart(3, '0') + '.webp';
  }

  // --- Canvas sizing -----------------------------------------------------
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);   // cap at 2x for perf
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Draw one frame, fitted to the hero's subject stage ---
  // NOT object-fit:cover. Cover scales a 16:9 plate to fill the viewport, which
  // blows the child + jeep up until they swallow the tagline and the CTA.
  // Instead the subject is fitted to a share of the viewport and anchored above
  // the CTA lane, so the composition holds at any window size.
  // The camera pushes in until the vehicle exceeds the source frame, so the
  // late frames are edge-to-edge by construction. Rather than fight that, the
  // subject is allowed to grow and bleed off the viewport — which IS the push-in
  // — while the headline fades out and hands the frame over to it.
  const SUBJECT_WIDTH = 0.94;    // of viewport width
  const SUBJECT_MAX_H = 0.66;    // of viewport height
  const SUBJECT_BOTTOM = 0.09;   // gap from viewport bottom to the tyres

  function drawFrame(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return;

    let dw = cw * SUBJECT_WIDTH;
    let dh = dw * (img.naturalHeight / img.naturalWidth);
    const maxH = ch * SUBJECT_MAX_H;
    if (dh > maxH) { dh = maxH; dw = dh * (img.naturalWidth / img.naturalHeight); }

    const dx = (cw - dw) / 2;
    const dy = ch - ch * SUBJECT_BOTTOM - dh;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

    if (!firstPaintDone) {
      firstPaintDone = true;
      canvas.classList.add('ready');
      if (loader) loader.classList.add('hidden');
    }
  }

  /** Nearest already-decoded frame to `index`, or null if none have arrived. */
  function nearestLoaded(index) {
    if (frames[index]) return frames[index];
    for (let d = 1; d < TOTAL_FRAMES; d++) {
      if (frames[index - d]) return frames[index - d];
      if (frames[index + d]) return frames[index + d];
    }
    return null;
  }

  function paint(index) {
    const img = nearestLoaded(index);
    if (img) drawFrame(img);
  }

  // --- Progressive loading -----------------------------------------------
  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { frames[i] = img; resolve(true); };
      img.onerror = () => {
        console.warn('Hero frame failed to load:', frameSrc(i + 1));
        resolve(false);
      };
      img.src = frameSrc(i + 1);
    });
  }

  let loadStarted = false;

  async function startLoading() {
    if (loadStarted) return;
    loadStarted = true;

    sizeCanvas();

    // Paint the priority frame first so there is something on screen fast.
    const priority = prefersReduced ? REDUCED_MOTION_FRAME - 1 : 0;
    await loadFrame(priority);
    paint(priority);
    currentFrameIndex = priority;

    // Reduced motion, or no WebP support: one frame, no sequence, no scroll work.
    if (prefersReduced || !useWebp) return;

    // Stream the rest in order, repainting if the user has already scrolled
    // past the frames that have arrived.
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (i === priority) continue;
      await loadFrame(i);
      if (i === currentFrameIndex) paint(i);
    }
  }

  /** Defer to idle so frame fetching never competes with the critical render. */
  function scheduleLoad() {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(startLoading, { timeout: 1500 });
    } else {
      window.setTimeout(startLoading, 200);
    }
  }

  // Only begin once the hero is at (or near) the viewport.
  if (typeof window.IntersectionObserver === 'function') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          io.disconnect();
          scheduleLoad();
        }
      });
    }, { rootMargin: '200px' });
    io.observe(heroContainer);
  } else {
    scheduleLoad();
  }

  // --- Reduced motion: static composition, no scroll listeners ------------
  if (prefersReduced) {
    window.addEventListener('resize', () => {
      sizeCanvas();
      paint(REDUCED_MOTION_FRAME - 1);
    }, { passive: true });
    return;
  }

  // --- Scroll scrubbing ---------------------------------------------------
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 2);
  let ticking = false;

  function updateHeroScroll() {
    const rect = heroContainer.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;

    if (totalScrollable <= 0) {
      ticking = false;
      return;
    }

    const progress = clamp01(-rect.top / totalScrollable);

    // --- Beat indicators ---
    let activeBeat = 0;
    if (progress < 0.30) {
      activeBeat = (progress > 0.05) ? 1 : 0;
    } else if (progress < 0.65) {
      activeBeat = 2;
    } else {
      activeBeat = 3;
    }

    dots.forEach((dot, index) => {
      if (dot) dot.classList.toggle('active', index === activeBeat);
    });

    // --- Frame stepping ---
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(progress * TOTAL_FRAMES)
    );

    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      paint(frameIndex);
    }

    // --- Overlay text drifts up and softens as the camera pushes in ---
    // Beats 0–1 the wordmark leads; by Beat 2 it has handed off to the footage.
    // The subject grows as the camera pushes in, so without this handoff the
    // vehicle and the copy end up competing for the same band of pixels.
    if (textZone) {
      const fade = easeOut(clamp01((progress - 0.04) / 0.26));
      textZone.style.transform = `translateY(${(-26 * fade).toFixed(2)}px)`;
      textZone.style.opacity = (1 - fade).toFixed(3);
      textZone.style.pointerEvents = fade > 0.9 ? 'none' : '';
    }

    // --- Beat 3: the CTA resolves into place ---
    if (actionBox) {
      const t = easeOut(clamp01((progress - 0.65) / 0.35));
      actionBox.style.transform = `translateY(${(5 * (1 - t)).toFixed(2)}px)`;
    }

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeroScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => {
    sizeCanvas();
    paint(currentFrameIndex < 0 ? 0 : currentFrameIndex);
    requestUpdate();
  }, { passive: true });

  sizeCanvas();
  updateHeroScroll();
}

/* ==========================================================================
   6. QUICK VIEW PRODUCT DETAIL MODAL
   ========================================================================== */
function initProductModal() {
  const modal = document.getElementById('productModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProductModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeProductModal();
    }
  });
}

window.openProductModal = function(productId) {
  const product = PLAYNEST_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('productModal');
  const imgEl = document.getElementById('modalImg');
  const catEl = document.getElementById('modalCategory');
  const titleEl = document.getElementById('modalTitle');
  const priceEl = document.getElementById('modalPrice');
  const mrpEl = document.getElementById('modalMrp');
  const descEl = document.getElementById('modalDesc');
  const ageEl = document.getElementById('modalSpecAge');
  const weightEl = document.getElementById('modalSpecWeight');
  const batteryEl = document.getElementById('modalSpecBattery');
  const motorsEl = document.getElementById('modalSpecMotors');
  const skuEl = document.getElementById('modalSpecSku');
  const featuresEl = document.getElementById('modalFeatures');
  const addCartBtn = document.getElementById('modalAddCartBtn');
  const waBtn = document.getElementById('modalWaBtn');

  if (imgEl) {
    imgEl.src = product.image;
    imgEl.alt = product.name;
  }
  if (catEl) catEl.textContent = product.category;
  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `₹${product.price.toLocaleString('en-IN')}`;
  if (mrpEl) mrpEl.textContent = product.mrp ? `₹${product.mrp.toLocaleString('en-IN')}` : '';
  if (descEl) descEl.textContent = product.description || '';
  if (ageEl) ageEl.textContent = product.ageRange;
  if (weightEl) weightEl.textContent = product.weightCapacity;
  if (batteryEl) batteryEl.textContent = product.battery;
  if (motorsEl) motorsEl.textContent = product.motors;
  if (skuEl) skuEl.textContent = product.sku || 'N/A';

  if (featuresEl) {
    featuresEl.innerHTML = (product.features || []).map(f => `
      <li class="modal-feature-item">
        <span class="feature-check">✓</span>
        <span>${escapeHtml(f)}</span>
      </li>
    `).join('');
  }

  const stockBadgeEl = document.getElementById('modalStockBadge');
  const actionWrapperEl = document.getElementById('modalActionWrapper');
  const secondaryLinkEl = document.getElementById('modalSecondaryLink');

  const waUrl = PLAYNEST_CONFIG.buildWhatsAppUrl(product.name, product.price, product.sku);

  if (product.inStock !== false) {
    // IN STOCK STATE: Subtle stock pill + Add to Cart primary button + WhatsApp question link
    if (stockBadgeEl) {
      stockBadgeEl.className = 'modal-stock-badge in-stock';
      stockBadgeEl.innerHTML = '<span class="stock-dot"></span><span>In Stock · Ready for Dispatch</span>';
    }

    if (actionWrapperEl) {
      actionWrapperEl.innerHTML = `
        <button onclick="addToCart('${product.id}'); closeProductModal();" class="modal-primary-btn btn-in-stock" aria-label="Add ${escapeHtml(product.name)} to cart">
          <svg class="modal-btn-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Add to Cart</span>
        </button>
      `;
    }

    if (secondaryLinkEl) {
      secondaryLinkEl.style.display = 'inline-flex';
      secondaryLinkEl.href = waUrl;
    }
  } else {
    // OUT OF STOCK STATE: Subtle out-of-stock pill + ONE clean WhatsApp inquiry button
    if (stockBadgeEl) {
      stockBadgeEl.className = 'modal-stock-badge out-of-stock';
      stockBadgeEl.innerHTML = '<span class="stock-dot"></span><span>Currently Out of Stock</span>';
    }

    if (actionWrapperEl) {
      actionWrapperEl.innerHTML = `
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="modal-primary-btn btn-wa-inquire" aria-label="Inquire about ${escapeHtml(product.name)} on WhatsApp">
          <svg class="modal-btn-icon" viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
            <path d="M12.04 2c-5.5 0-9.98 4.48-9.98 9.98 0 1.76.46 3.47 1.33 4.98L2 22l5.25-1.38c1.47.8 3.12 1.23 4.79 1.23 5.5 0 9.98-4.48 9.98-9.98 0-2.67-1.04-5.18-2.93-7.07C17.2 2.91 14.7 2 12.04 2zm0 1.83c2.18 0 4.23.85 5.77 2.39 1.54 1.54 2.39 3.59 2.39 5.77 0 4.5-3.66 8.17-8.16 8.17-1.42 0-2.81-.37-4.04-1.08l-.29-.17-3 .79.8-2.93-.18-.29c-.78-1.24-1.19-2.67-1.19-4.49 0-4.5 3.66-8.16 8.16-8.16zm-3.52 4.09c-.19 0-.44.07-.67.33-.23.26-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.13.17 1.75 2.77 4.3 3.83.61.25 1.08.4 1.45.52.61.19 1.17.17 1.61.1.49-.07 1.52-.62 1.73-1.22.21-.6.21-1.11.15-1.22-.06-.11-.23-.17-.49-.3-.26-.13-1.52-.75-1.75-.83-.23-.09-.4-.13-.58.13-.17.26-.66.83-.81 1-.15.17-.3.19-.56.06-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.28-1.52-1.43-1.78-.15-.26-.02-.4.11-.52.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.08-.17.04-.32-.02-.45-.06-.13-.58-1.39-.79-1.9-.21-.5-.42-.43-.58-.44l-.49-.01z"/>
          </svg>
          <span>Ask Availability on WhatsApp</span>
        </a>
      `;
    }

    if (secondaryLinkEl) {
      secondaryLinkEl.style.display = 'none';
    }
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  
  // Only restore scroll if cart drawer is not open
  const cartBackdrop = document.getElementById('cartBackdrop');
  if (!cartBackdrop || !cartBackdrop.classList.contains('open')) {
    document.body.style.overflow = '';
  }
};

/* ==========================================================================
   7. HEADER SCROLL SHADOW
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}
