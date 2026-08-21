/**
 * ============================================================================
 * PLAYNEST TOYS — CONFIGURATION & PRODUCT DATA CATALOG
 * ============================================================================
 * 
 * ⚠️ DEVELOPER NOTICE / IMPORTANT:
 * All product records below contain SAMPLE / PLACEHOLDER data derived for 
 * structure and design preview purposes. All sample items are prefixed with 
 * "SAMPLE — " in their name field. 
 * 
 * 🔴 BEFORE SITE LAUNCH:
 * 1. ✅ DONE — `PLAYNEST_CONFIG.whatsappNumber` is set to the live business number.
 * 2. Replace the sample items in `PLAYNEST_PRODUCTS` with your approved product inventory,
 *    final retail prices, and approved specs.
 * 3. Place actual product photos into `/images/products/` and reference their file names here.
 * ============================================================================
 */

const PLAYNEST_CONFIG = {
  brandName: "Playnest Toys",
  tagline: "Little Wheels, Big Smiles",
  subtext: "TOYS · RIDE · FUN",
  
  // 🟢 SINGLE SOURCE OF TRUTH FOR WHATSAPP ORDERING:
  // Digits with country code, no '+', spaces, or hyphens.
  // Live business number: +91 98179 23818
  // Every WhatsApp CTA on the site (floating Chat pill, footer button, cart
  // checkout, and both Quick View modal links) reads from this one property.
  whatsappNumber: "919817923818",
  
  // Consolidated Cart WhatsApp Message Builder
  buildCartWhatsAppUrl: function(cartItems, grandTotal) {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    
    let msg = `Hi Playnest Toys! 🚗✨\nI would like to place an order for the following ride-on toys:\n\n`;
    
    cartItems.forEach((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      msg += `${index + 1}. *${item.product.name}*\n   • Qty: ${item.quantity} × ₹${item.product.price.toLocaleString('en-IN')}\n   • Subtotal: ₹${itemTotal.toLocaleString('en-IN')}\n`;
      if (item.product.sku) {
        msg += `   • SKU: ${item.product.sku}\n`;
      }
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
  buildWhatsAppUrl: function(productName, price, sku) {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    let msg = `Hi Playnest Toys! 🚗✨\nI would like to inquire about:\n\n*Product:* ${productName}\n*Price:* ₹${price.toLocaleString('en-IN')}`;
    if (sku) {
      msg += `\n*SKU:* ${sku}`;
    }
    msg += `\n\nPlease let me know availability and delivery details to my location. Thank you!`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  },

  // General WhatsApp Inquiry Link
  buildGeneralInquiryUrl: function() {
    const cleanNumber = this.whatsappNumber.replace(/[^0-9]/g, '');
    const msg = `Hi Playnest Toys! 👋 I'm looking for a battery-operated ride-on toy for my child. Could you share your latest recommendations and availability?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  }
};

const PLAYNEST_CATEGORIES = [
  {
    id: "all",
    name: "All Ride-Ons",
    shortName: "All",
    icon: "grid",
    description: "Explore our entire electric ride-on toy collection"
  },
  {
    id: "cars",
    name: "Ride-On Cars",
    shortName: "Cars",
    icon: "car",
    description: "Sporty supercars, luxury sedans & vintage roadsters"
  },
  {
    id: "bikes",
    name: "Bikes & Trikes",
    shortName: "Bikes",
    icon: "bike",
    description: "Cruisers, racing superbikes & stable training trikes"
  },
  {
    id: "jeeps",
    name: "Jeeps & UTVs",
    shortName: "Jeeps",
    icon: "jeep",
    description: "4x4 Monster off-roaders, patrol jeeps & big wheels"
  },
  {
    id: "scooters",
    name: "Scooters & Scooties",
    shortName: "Scooters",
    icon: "scooter",
    description: "Classic Italian Vespa styling, single & duo-seaters"
  }
];

const PLAYNEST_PRODUCTS = [
  {
    id: "pn-car-01",
    name: "SAMPLE — DL1000 Dream Sports Car",
    category: "cars",
    price: 6700,
    mrp: 11200,
    sku: "DL-1000",
    image: "images/products/car-ferrari-f8.svg",
    badge: "Popular Choice",
    inStock: true,
    ageRange: "2–6 Yrs",
    battery: "12V Rechargeable",
    weightCapacity: "40 kg",
    motors: "2x2 Dual Motor",
    features: [
      "Openable Butterfly Doors",
      "2.4G Parental Remote Control",
      "LED Headlights & Taillights",
      "USB/AUX MP3 Music Dashboard",
      "Soft Spring Suspension"
    ],
    description: "A show-stopping sports car for young speedsters. Features realistic push-button start, working headlights, openable doors, and both manual pedal drive and full parental remote override."
  },
  {
    id: "pn-jeep-01",
    name: "SAMPLE — Rubicon Extreme 4x4 Off-Roader",
    category: "jeeps",
    price: 10500,
    mrp: 16500,
    sku: "RUBI-4X4",
    image: "images/products/jeep-rubicon-4x4.svg",
    badge: "Top Seller",
    inStock: true,
    ageRange: "2–12 Yrs",
    battery: "12V Heavy-Duty",
    weightCapacity: "60 kg",
    motors: "4x4 Quad Motors",
    features: [
      "High-Clearance All-Terrain Wheels",
      "Heavy-Duty Roll Bar & Spotlights",
      "Parental Long-Range Remote",
      "Dual Shock Absorbers",
      "Spacious Wide Double-Seater"
    ],
    description: "Built for true adventure with quad 4x4 motors capable of grass, gravel, and pavement. Includes high-torque climbing power, working light bars, and safety seatbelt harness."
  },
  {
    id: "pn-bike-01",
    name: "SAMPLE — Royal Enfield Style Classic Cruiser",
    category: "bikes",
    price: 8000,
    mrp: 15000,
    sku: "RE-500",
    image: "images/products/bike-royal-enfield.svg",
    badge: "Parent Favorite",
    inStock: true,
    ageRange: "2–7 Yrs",
    battery: "12V Rechargeable",
    weightCapacity: "50 kg",
    motors: "High Torque Single Motor",
    features: [
      "Realistic Hand Accelerator Throttle",
      "Foot Brake for Safety",
      "Removable Auxiliary Training Wheels",
      "Vintage Headlight & Engine Sound",
      "Leather-Look Ergonomic Seat"
    ],
    description: "Iconic retro motorbike styling tailored for kids. Comes with sturdy side stabilizer wheels for early learners and smooth twist-throttle hand race control."
  },
  {
    id: "pn-scooter-01",
    name: "SAMPLE — Vespa Italian Classic Scooty",
    category: "scooters",
    price: 4300,
    mrp: 7000,
    sku: "VSP-42",
    image: "images/products/scooter-vespa-red.svg",
    badge: "Best for Toddlers",
    inStock: true,
    ageRange: "2–8 Yrs",
    battery: "12V Rechargeable",
    weightCapacity: "50 kg",
    motors: "Smooth Dual Drive",
    features: [
      "Classic Retro Curved Body",
      "Dual Training Balance Wheels",
      "Hand Throttle & Foot Brake",
      "Built-in Rhymes & Horn",
      "Low Step-Through Comfort Deck"
    ],
    description: "Charming European styling with gentle acceleration curve ideal for toddlers. Safe low center of gravity with built-in music and bright chrome-look trims."
  },
  {
    id: "pn-car-02",
    name: "SAMPLE — BMW GT Sport Roadster",
    category: "cars",
    price: 4500,
    mrp: 8000,
    sku: "BMW-GT",
    image: "images/products/car-bmw-gt.svg",
    badge: "Value Pick",
    inStock: true,
    ageRange: "2–5 Yrs",
    battery: "6V / 12V Compatible",
    weightCapacity: "30 kg",
    motors: "2x2 Dual Motor",
    features: [
      "Kid-Friendly Steering Wheel",
      "Forward & Reverse Gear Switch",
      "Parental Remote Access",
      "Illuminated Grill Lights",
      "Anti-Slip Tread Tyres"
    ],
    description: "Sleek and compact roadster with responsive steering, illuminated kidneys grill, and safety seatbelt. Perfect for apartment driveways and living room tracks."
  },
  {
    id: "pn-bike-02",
    name: "SAMPLE — BMW RR 018 Smoke Edition Superbike",
    category: "bikes",
    price: 8000,
    mrp: 10500,
    sku: "RR-018",
    image: "images/products/bike-bmw-rr.svg",
    badge: "Special Effects",
    inStock: true,
    ageRange: "2–6 Yrs",
    battery: "12V Fast-Charge",
    weightCapacity: "40 kg",
    motors: "High-RPM Dual Motor",
    features: [
      "Real Water Mist Exhaust Smoke Effect",
      "Aerodynamic Racing Bodywork",
      "Hand Throttle & Foot Brake",
      "Dynamic LED Wheel Lighting",
      "Stabilizing Trike Wheel Base"
    ],
    description: "The crowd favorite with cool harmless cold-mist exhaust smoke! Features aggressive racing contours, LED light-up wheels, and authentic starting motor rev sounds."
  },
  {
    id: "pn-jeep-02",
    name: "SAMPLE — Defender Heavy Duty UTV",
    category: "jeeps",
    price: 6200,
    mrp: 9500,
    sku: "DEF-1555",
    image: "images/products/jeep-defender.svg",
    badge: "Tough Build",
    inStock: true,
    ageRange: "2–5 Yrs",
    battery: "12V Long-Life",
    weightCapacity: "35 kg",
    motors: "4x4 Multi-Wheel Drive",
    features: [
      "Roof LED Light Bar",
      "Heavy-Duty Front Bumper",
      "Parental Wireless Remote",
      "Multi-Function Steering Controls",
      "Deep Lug Tread Wheels"
    ],
    description: "Rugged and capable mini-SUV with high road clearance, working roof beam lights, and parent wireless override for total peace of mind."
  },
  {
    id: "pn-jeep-03",
    name: "SAMPLE — Police Interceptor Patrol 911",
    category: "jeeps",
    price: 4000,
    mrp: 6500,
    sku: "POL-911",
    image: "images/products/jeep-police-888.svg",
    badge: "Kids Favorite",
    inStock: true,
    ageRange: "2–5 Yrs",
    battery: "6V / 12V Battery",
    weightCapacity: "30 kg",
    motors: "4x4 Motor Wheels",
    features: [
      "Flashing Red & Blue Police Sirens",
      "Working Megaphone / PA Speaker",
      "Parent Remote Control",
      "Sturdy Black Guard Frame",
      "Easy Foot Pedal Drive"
    ],
    description: "Let your little officer save the day! Features flashing red and blue strobe lights, realistic police siren sounds, and a fun roleplay design."
  },
  {
    id: "pn-scooter-02",
    name: "SAMPLE — Vespa Duo Double Seater",
    category: "scooters",
    price: 6000,
    mrp: 10400,
    sku: "VSP-D41",
    image: "images/products/scooter-vespa-double.svg",
    badge: "2-Seater",
    inStock: true,
    ageRange: "2–8 Yrs",
    battery: "12V High-Capacity",
    weightCapacity: "50 kg",
    motors: "Dual Rear Drive",
    features: [
      "Twin Tandem Cushioned Seats",
      "Passenger Backrest Support",
      "Parental Remote Function",
      "Front Chrome Luggage Rack",
      "Tri-Wheel Solid Stability"
    ],
    description: "Special double-seater edition with twin backrest supports so siblings or friends can cruise together in vintage style and comfort."
  },
  {
    id: "pn-car-03",
    name: "SAMPLE — Mercedes 300SL Vintage Roadster",
    category: "cars",
    price: 9500,
    mrp: 16500,
    sku: "MB-VIN15",
    image: "images/products/car-mercedes-vintage.svg",
    badge: "Collector Edition",
    inStock: false, // Sample demo of out-of-stock state for client toggle
    ageRange: "2–7 Yrs",
    battery: "12V Rechargeable",
    weightCapacity: "50 kg",
    motors: "2x2 High-Efficiency",
    features: [
      "Classic Retro Curved Fenders",
      "Dual Round Chrome Headlamps",
      "Tufted Leatherette Seats",
      "Bluetooth & FM Audio Console",
      "Parent Remote with Emergency Stop"
    ],
    description: "Timeless automotive beauty with glistening chrome rims, vintage horn sounds, comfortable upholstery, and gentle start throttle."
  },
  {
    id: "pn-bike-03",
    name: "SAMPLE — Harley Chopper with Cargo Trunk",
    category: "bikes",
    price: 2800,
    mrp: 5000,
    sku: "HRLY-DIG",
    image: "images/products/bike-harley-diggi.svg",
    badge: "Budget Friendly",
    inStock: true,
    ageRange: "2–4 Yrs",
    battery: "6V Rechargeable",
    weightCapacity: "30 kg",
    motors: "Single Rear Drive",
    features: [
      "High Ape-Hanger Handlebars",
      "Dual Storage Trunks for Toys",
      "Foot Accelerator Pedal",
      "Stable 3-Wheel Trike Frame",
      "Safety Speed Limiter"
    ],
    description: "Super stable 3-wheeler motorcycle with rear side trunks so kids can carry snacks and smaller toys along on their driveway adventures."
  },
  {
    id: "pn-jeep-04",
    name: "SAMPLE — Polaris Monster UTV 2488",
    category: "jeeps",
    price: 8500,
    mrp: 14000,
    sku: "POL-2488",
    image: "images/products/jeep-polaris-utv.svg",
    badge: "Off-Road Ready",
    inStock: true,
    ageRange: "2–11 Yrs",
    battery: "12V High-Output",
    weightCapacity: "60 kg",
    motors: "4x4 All-Wheel Drive",
    features: [
      "Extreme High Ground Clearance",
      "Dazzling Roof Matrix LED Lights",
      "Heavy-Duty Independent Springs",
      "Keyless Start Button",
      "Parent Remote Control"
    ],
    description: "High-power off-road monster with eye-catching matrix light array, giant high-grip tyres, and ample power for backyard terrain."
  }
];
