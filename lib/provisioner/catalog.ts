// lib/provisioner/catalog.ts
import type { TierRequirement, GradeLevel } from "@/types/treasury";

export type ProductCategory =
  | "communications"
  | "medical"
  | "energy"
  | "mobility"
  | "water"
  | "security"
  | "shelter";

export interface Product {
  id:              string;
  sku:             string;
  name:            string;
  brand:           string;
  category:        ProductCategory;
  grade:           GradeLevel;
  gradeComposite:  number;
  tier:            TierRequirement;
  priceUsd:        number;           // USD cents
  priceUsdc:       number;           // USDC (6 decimal places as float)
  highTicket:      boolean;          // true → Solana USDC rail
  inStock:         boolean;
  criticalFlag:    boolean;
  spec:            string;
  buildNote:       string;
  stripePriceId?:  string;           // Stripe Price ID (low-ticket)
  imageSlug:       string;
}

// ── Catalog ─────────────────────────────────────────────────────────────
// priceUsd is in cents. All Solana-rail items have highTicket: true.
// The Stripe Price IDs are placeholders — replace with live Stripe dashboard IDs.

export const CATALOG: Product[] = [
  // ── COMMUNICATIONS ─────────────────────────────────────────────────
  {
    id:"garmin-inreach-mini2", sku:"COM-001", name:"Garmin inReach Mini 2",
    brand:"Garmin", category:"communications", grade:"A", gradeComposite:96,
    tier:"T1", priceUsd:34999, priceUsdc:349.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Two-way satellite messaging. Global SOS. No cell required. Rechargeable.",
    buildNote:"1 per adult. Monthly satellite plan required.",
    stripePriceId:"price_1TE8ROAQV21Gk5Rw5Vk2i6r5",
    imageSlug:"garmin-inreach-mini2",
  },
  {
    id:"baofeng-uv5r-5pk", sku:"COM-002", name:"Baofeng UV-5R ×5 Pack",
    brand:"Baofeng", category:"communications", grade:"B", gradeComposite:81,
    tier:"T1", priceUsd:13999, priceUsdc:139.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"Dual-band VHF/UHF. 5W output. 400+ frequencies. Li-ion rechargeable.",
    buildNote:"Pre-program channels before crisis. HAM licence recommended.",
    stripePriceId:"price_1TE8RPAQV21Gk5Rw5f9LZOZh",
    imageSlug:"baofeng-uv5r",
  },
  {
    id:"starlink-mini", sku:"COM-005", name:"Starlink Mini Portable",
    brand:"SpaceX", category:"communications", grade:"A", gradeComposite:94,
    tier:"T2", priceUsd:59900, priceUsdc:599.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"100Mbps+. 1kg portable dish. Powers Ark coordination from anywhere.",
    buildNote:"Tier 2 community backbone. Requires active Starlink subscription.",
    stripePriceId:"price_1TETh3AQV21Gk5RwbSTJCVzr",
    imageSlug:"starlink-mini",
  },

  // ── MEDICAL ────────────────────────────────────────────────────────
  {
    id:"nar-ifak", sku:"MED-001", name:"NAR IFAK Trauma Kit",
    brand:"North American Rescue", category:"medical", grade:"A", gradeComposite:99,
    tier:"T1", priceUsd:7499, priceUsdc:74.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"SOF-T Wide tourniquet, HyFin chest seal, compressed gauze. Military TCCC aligned.",
    buildNote:"1 per adult go-bag. Non-negotiable.",
    stripePriceId:"price_1TE8RQAQV21Gk5RwD4EMtRVJ",
    imageSlug:"nar-ifak",
  },
  {
    id:"myfak-advanced", sku:"MED-002", name:"MyMedic MYFAK Advanced Kit",
    brand:"MyMedic", category:"medical", grade:"A", gradeComposite:97,
    tier:"T1", priceUsd:15999, priceUsdc:159.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"150+ piece trauma + wound care + medication kit. First-tier household medical.",
    buildNote:"1 per household minimum.",
    stripePriceId:"price_1TE8RSAQV21Gk5Rwpn4aFKf2",
    imageSlug:"myfak-advanced",
  },
  {
    id:"quikclot-3pk", sku:"MED-003", name:"QuikClot Combat Gauze ×3",
    brand:"Z-Medica", category:"medical", grade:"A", gradeComposite:99,
    tier:"T1", priceUsd:7499, priceUsdc:74.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Hemostatic gauze. Controls life-threatening bleeding in 3–5 min. 3yr shelf.",
    buildNote:"Keep 6+ units total. Replace at 80% of shelf life.",
    stripePriceId:"price_1TE8RTAQV21Gk5RwjHqpR9kF",
    imageSlug:"quikclot",
  },

  // ── ENERGY ─────────────────────────────────────────────────────────
  {
    id:"jackery-1000plus", sku:"ENE-001", name:"Jackery Explorer 1000 Plus",
    brand:"Jackery", category:"energy", grade:"B", gradeComposite:88,
    tier:"T1", priceUsd:99900, priceUsdc:999.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"1,264Wh LFP. Powers fridge 4h, CPAP 14h. 2-hour recharge. 2,000-cycle life.",
    buildNote:"Tier 1 go-bag power station. Add Nomad 100 for solar input.",
    stripePriceId:"price_1TEUHCAQV21Gk5RwrTg0OO0i",
    imageSlug:"jackery-1000plus",
  },
  {
    id:"ecoflow-delta-pro", sku:"ENE-002", name:"EcoFlow DELTA Pro",
    brand:"EcoFlow", category:"energy", grade:"A", gradeComposite:95,
    tier:"T2", priceUsd:220000, priceUsdc:2200.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"3,600Wh LFP. 2,400W AC output. Expandable to 25kWh. 3,500-cycle life.",
    buildNote:"Tier 2 sanctuary essential. Pair with Renogy 400W array.",
    stripePriceId:"price_1TEUHEAQV21Gk5RwQ7lnNsGR",
    imageSlug:"ecoflow-delta-pro",
  },
  {
    id:"renogy-400w-kit", sku:"ENE-003", name:"Renogy 400W Solar Kit",
    brand:"Renogy", category:"energy", grade:"B", gradeComposite:87,
    tier:"T2", priceUsd:58000, priceUsdc:580.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"4×100W mono panels + 40A MPPT controller. 1.6kWh/day moderate sun.",
    buildNote:"Starting point for off-grid solar. Scales to 2kW array.",
    stripePriceId:"price_1TEUHGAQV21Gk5RwU6Kj9KXD",
    imageSlug:"renogy-400w",
  },

  // ── MOBILITY ────────────────────────────────────────────────────────
  {
    id:"wavian-jerry-4pk", sku:"MOB-001", name:"Wavian NATO Jerry Can ×4",
    brand:"Wavian", category:"mobility", grade:"A", gradeComposite:98,
    tier:"T1", priceUsd:15999, priceUsdc:159.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"UN-certified steel. Airtight. 5 gal each. Will not crack, leak, or explode.",
    buildNote:"Always kept full. Rotate fuel quarterly with PRI-G stabiliser.",
    stripePriceId:"price_1TE8RUAQV21Gk5RwwZCWF6PZ",
    imageSlug:"wavian-jerry",
  },
  {
    id:"noco-gb40-2pk", sku:"MOB-002", name:"NOCO Boost Plus GB40 ×2",
    brand:"NOCO", category:"mobility", grade:"A", gradeComposite:96,
    tier:"T1", priceUsd:19999, priceUsdc:199.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"1,000A peak. Up to 6L gas / 3L diesel. Compact lithium. USB charge.",
    buildNote:"Keep in every vehicle. Charge quarterly.",
    stripePriceId:"price_1TE8RWAQV21Gk5RwXsoQMDtM",
    imageSlug:"noco-gb40",
  },

  // ── WATER ───────────────────────────────────────────────────────────
  {
    id:"berkey-big-berkey", sku:"WAT-001", name:"Berkey Big Berkey",
    brand:"Berkey", category:"water", grade:"A", gradeComposite:97,
    tier:"T1", priceUsd:27999, priceUsdc:279.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Gravity ceramic. 8.5L/hr. Removes viruses, bacteria, heavy metals. No power.",
    buildNote:"Primary household filter. Replace elements per manufacturer spec.",
    stripePriceId:"price_1TE8RXAQV21Gk5RwO8LlZhQi",
    imageSlug:"berkey-big",
  },
  {
    id:"sawyer-squeeze", sku:"WAT-002", name:"Sawyer Squeeze Filter",
    brand:"Sawyer", category:"water", grade:"B", gradeComposite:84,
    tier:"T1", priceUsd:3499, priceUsdc:34.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"Hollow fiber. 100,000-gal lifetime. 0.1 micron. No power. Backflushable.",
    buildNote:"1 per go-bag. Does not remove viruses — pair with Steripen in bio zones.",
    stripePriceId:"price_1TE8RZAQV21Gk5RwkOTw1WTa",
    imageSlug:"sawyer-squeeze",
  },

  // ── COMMUNICATIONS (continued) ─────────────────────────────────────
  {
    id:"midland-er310", sku:"COM-003", name:"Midland ER310 Emergency Radio",
    brand:"Midland", category:"communications", grade:"B", gradeComposite:85,
    tier:"T1", priceUsd:7999, priceUsdc:79.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"AM/FM/NOAA weather. Hand crank + solar + USB-C. SOS flashlight. 2,000mAh pack.",
    buildNote:"One per location. No subscription. Crank powers radio in full comms blackout.",
    stripePriceId:"price_placeholder_COM003",
    imageSlug:"midland-er310",
  },
  {
    id:"motorola-t800-6pk", sku:"COM-004", name:"Motorola T800 FRS Radio ×6",
    brand:"Motorola", category:"communications", grade:"B", gradeComposite:79,
    tier:"T1", priceUsd:12999, priceUsdc:129.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"22 FRS channels. 35mi open-terrain range. NOAA weather alerts. Li-ion rechargeable.",
    buildNote:"License-free FRS. Pre-program household node channels before crisis.",
    stripePriceId:"price_placeholder_COM004",
    imageSlug:"motorola-t800",
  },

  // ── MEDICAL (continued) ─────────────────────────────────────────────
  {
    id:"israeli-bandage-10pk", sku:"MED-004", name:"Israeli Emergency Bandage ×10",
    brand:"PerSys Medical", category:"medical", grade:"A", gradeComposite:98,
    tier:"T1", priceUsd:4499, priceUsdc:44.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"6-inch pressure bandage. One-handed application. Sterile. 5-year shelf life.",
    buildNote:"2 per go-bag minimum. Standard TCCC dressing for penetrating wounds.",
    stripePriceId:"price_placeholder_MED004",
    imageSlug:"israeli-bandage",
  },
  {
    id:"celox-granules-5pk", sku:"MED-005", name:"Celox Hemostatic Granules ×5",
    brand:"Celox", category:"medical", grade:"A", gradeComposite:97,
    tier:"T1", priceUsd:5999, priceUsdc:59.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Chitosan granules. Clots in 30 seconds. Works without body heat. 3-year shelf.",
    buildNote:"Complements QuikClot gauze. Use for wounds where packing is not feasible.",
    stripePriceId:"price_placeholder_MED005",
    imageSlug:"celox-granules",
  },

  // ── ENERGY (continued) ──────────────────────────────────────────────
  {
    id:"goal-zero-yeti-200x", sku:"ENE-004", name:"Goal Zero Yeti 200X",
    brand:"Goal Zero", category:"energy", grade:"A", gradeComposite:91,
    tier:"T1", priceUsd:29900, priceUsdc:299.00, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"187Wh LFP. 200W AC inverter. USB-A/C. Solar input. 2kg. 2hr wall charge.",
    buildNote:"Go-bag power station for phones, radios, and CPAP. Pairs with Nomad 20 panel.",
    stripePriceId:"price_placeholder_ENE004",
    imageSlug:"goal-zero-yeti-200x",
  },

  // ── MOBILITY (continued) ────────────────────────────────────────────
  {
    id:"garmin-gpsmap-67", sku:"MOB-003", name:"Garmin GPSMAP 67 Handheld",
    brand:"Garmin", category:"mobility", grade:"A", gradeComposite:95,
    tier:"T1", priceUsd:39900, priceUsdc:399.00, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Multi-GNSS. 16hr battery. Topographic maps preloaded. IPX7 waterproof. No cell.",
    buildNote:"Primary nav when cell infrastructure is down. Pre-load offline topo maps.",
    stripePriceId:"price_placeholder_MOB003",
    imageSlug:"garmin-gpsmap-67",
  },

  // ── WATER (continued) ───────────────────────────────────────────────
  {
    id:"waterbob-2pk", sku:"WAT-003", name:"WaterBOB Emergency Bladder ×2",
    brand:"WaterBOB", category:"water", grade:"B", gradeComposite:83,
    tier:"T1", priceUsd:6999, priceUsdc:69.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"100-gal food-grade bladder fits standard bathtub. Fills in 20min. BPA-free.",
    buildNote:"Fill at first sign of disruption. 100gal = 50-day supply per adult.",
    stripePriceId:"price_placeholder_WAT003",
    imageSlug:"waterbob",
  },
  {
    id:"potable-aqua-6pk", sku:"WAT-004", name:"Potable Aqua Iodine Tabs ×6",
    brand:"Potable Aqua", category:"water", grade:"C", gradeComposite:71,
    tier:"T1", priceUsd:2999, priceUsdc:29.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"50 tabs/pack. Treats 25L per pack. Neutralizer included. 4-year shelf.",
    buildNote:"Backup to primary filter. Effective vs bacteria and viruses. Not heavy metals.",
    stripePriceId:"price_placeholder_WAT004",
    imageSlug:"potable-aqua",
  },

  // ── SECURITY ────────────────────────────────────────────────────────
  {
    id:"reolink-rlc810a-4pk", sku:"SEC-001", name:"Reolink RLC-810A ×4",
    brand:"Reolink", category:"security", grade:"B", gradeComposite:86,
    tier:"T2", priceUsd:31999, priceUsdc:319.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"4K PoE IP camera. 30m night vision. Local NVR — no cloud dependency.",
    buildNote:"4-camera perimeter minimum. Pair with local NVR (no cloud).",
    stripePriceId:"price_1TE8RaAQV21Gk5RwuYAccWXC",
    imageSlug:"reolink-810a",
  },
  {
    id:"faraday-bag-xl", sku:"SEC-003", name:"Mission Darkness Faraday Bag XL",
    brand:"Mission Darkness", category:"security", grade:"C", gradeComposite:72,
    tier:"T1", priceUsd:5999, priceUsdc:59.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"EMP/HEMP/solar flare shielding. Fits tablet + radio + drives. Lab tested.",
    buildNote:"Grade C: effective for shielding only. Not a long-term storage solution.",
    stripePriceId:"price_1TE8RbAQV21Gk5RwcQUclk8w",
    imageSlug:"faraday-xl",
  },
  {
    id:"surefire-g2x-3pk", sku:"SEC-002", name:"SureFire G2X Tactical LED ×3",
    brand:"SureFire", category:"security", grade:"B", gradeComposite:88,
    tier:"T1", priceUsd:15999, priceUsdc:159.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"800-lumen max. Dual output (15/800lm). Nitrolon body. CR123A lithium. IPX7.",
    buildNote:"1 per household member. Stored with go-bag. Spare batteries in Faraday bag.",
    stripePriceId:"price_placeholder_SEC002",
    imageSlug:"surefire-g2x",
  },

  // ── SHELTER ─────────────────────────────────────────────────────────
  {
    id:"sol-bivvy-4pk", sku:"SHE-001", name:"SOL Emergency Bivvy ×4",
    brand:"SOL", category:"shelter", grade:"A", gradeComposite:93,
    tier:"T1", priceUsd:8499, priceUsdc:84.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Reflective mylar bag. Retains 90% body heat. Waterproof. 3.8oz each. Reusable.",
    buildNote:"1 per go-bag. Packs to fist-size. Viable below freezing without sleeping bag.",
    stripePriceId:"price_placeholder_SHE001",
    imageSlug:"sol-bivvy",
  },
  {
    id:"kelty-cosmic-20", sku:"SHE-002", name:"Kelty Cosmic 20° Down Sleeping Bag",
    brand:"Kelty", category:"shelter", grade:"A", gradeComposite:90,
    tier:"T1", priceUsd:19900, priceUsdc:199.00, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"600-fill down. Rated 20°F. 3lb. Compression sack included. DWR shell.",
    buildNote:"One per adult for cold-weather grid-down shelter. Pair with SOL bivvy as vapor barrier.",
    stripePriceId:"price_placeholder_SHE002",
    imageSlug:"kelty-cosmic-20",
  },
  {
    id:"titan-survival-tarp", sku:"SHE-003", name:"Titan Multi-Use Survival Tarp",
    brand:"Titan", category:"shelter", grade:"B", gradeComposite:80,
    tier:"T1", priceUsd:4999, priceUsdc:49.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"12×8ft heavy-duty. Rain fly, ground cloth, heat reflector, shade. 1.9lb.",
    buildNote:"Pack 2 per group. Reflective silver side doubles as signaling panel.",
    stripePriceId:"price_placeholder_SHE003",
    imageSlug:"titan-tarp",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

export function getProductById(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}

export function getProductsBySku(skus: string[]): Product[] {
  return CATALOG.filter((p) => skus.includes(p.sku));
}

export function getProductsByCategory(cat: ProductCategory): Product[] {
  return CATALOG.filter((p) => p.category === cat);
}

export function getHighTicketProducts(): Product[] {
  return CATALOG.filter((p) => p.highTicket && p.inStock);
}

export function getCriticalProducts(): Product[] {
  return CATALOG.filter((p) => p.criticalFlag && p.inStock);
}

// Catalog stats for Server Component render
export const CATALOG_STATS = {
  total:       CATALOG.length,
  gradeA:      CATALOG.filter((p) => p.grade === "A").length,
  gradeB:      CATALOG.filter((p) => p.grade === "B").length,
  critical:    CATALOG.filter((p) => p.criticalFlag).length,
  highTicket:  CATALOG.filter((p) => p.highTicket).length,
  categories:  [...new Set(CATALOG.map((p) => p.category))].length,
} as const;
