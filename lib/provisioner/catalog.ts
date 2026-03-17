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
    stripePriceId:"price_1TBxuw1Y6BosZk4JGumTOguu",
    imageSlug:"garmin-inreach-mini2",
  },
  {
    id:"baofeng-uv5r-5pk", sku:"COM-002", name:"Baofeng UV-5R ×5 Pack",
    brand:"Baofeng", category:"communications", grade:"B", gradeComposite:81,
    tier:"T1", priceUsd:13999, priceUsdc:139.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"Dual-band VHF/UHF. 5W output. 400+ frequencies. Li-ion rechargeable.",
    buildNote:"Pre-program channels before crisis. HAM licence recommended.",
    stripePriceId:"price_1TBxv11Y6BosZk4JhDo2Pto6",
    imageSlug:"baofeng-uv5r",
  },
  {
    id:"starlink-mini", sku:"COM-005", name:"Starlink Mini Portable",
    brand:"SpaceX", category:"communications", grade:"A", gradeComposite:94,
    tier:"T2", priceUsd:59900, priceUsdc:599.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"100Mbps+. 1kg portable dish. Powers Ark coordination from anywhere.",
    buildNote:"Tier 2 community backbone. Requires active Starlink subscription.",
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
    stripePriceId:"price_1TBxv41Y6BosZk4J5LV8cuIz",
    imageSlug:"nar-ifak",
  },
  {
    id:"myfak-advanced", sku:"MED-002", name:"MyMedic MYFAK Advanced Kit",
    brand:"MyMedic", category:"medical", grade:"A", gradeComposite:97,
    tier:"T1", priceUsd:15999, priceUsdc:159.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"150+ piece trauma + wound care + medication kit. First-tier household medical.",
    buildNote:"1 per household minimum.",
    stripePriceId:"price_1TBxv91Y6BosZk4JFpY6iXQF",
    imageSlug:"myfak-advanced",
  },
  {
    id:"quikclot-3pk", sku:"MED-003", name:"QuikClot Combat Gauze ×3",
    brand:"Z-Medica", category:"medical", grade:"A", gradeComposite:99,
    tier:"T1", priceUsd:7499, priceUsdc:74.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"Hemostatic gauze. Controls life-threatening bleeding in 3–5 min. 3yr shelf.",
    buildNote:"Keep 6+ units total. Replace at 80% of shelf life.",
    stripePriceId:"price_1TBxvD1Y6BosZk4JX2otuTq1",
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
    imageSlug:"jackery-1000plus",
  },
  {
    id:"ecoflow-delta-pro", sku:"ENE-002", name:"EcoFlow DELTA Pro",
    brand:"EcoFlow", category:"energy", grade:"A", gradeComposite:95,
    tier:"T2", priceUsd:220000, priceUsdc:2200.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"3,600Wh LFP. 2,400W AC output. Expandable to 25kWh. 3,500-cycle life.",
    buildNote:"Tier 2 sanctuary essential. Pair with Renogy 400W array.",
    imageSlug:"ecoflow-delta-pro",
  },
  {
    id:"renogy-400w-kit", sku:"ENE-003", name:"Renogy 400W Solar Kit",
    brand:"Renogy", category:"energy", grade:"B", gradeComposite:87,
    tier:"T2", priceUsd:58000, priceUsdc:580.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"4×100W mono panels + 40A MPPT controller. 1.6kWh/day moderate sun.",
    buildNote:"Starting point for off-grid solar. Scales to 2kW array.",
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
    stripePriceId:"price_1TBxvH1Y6BosZk4JLxgfXAFZ",
    imageSlug:"wavian-jerry",
  },
  {
    id:"noco-gb40-2pk", sku:"MOB-002", name:"NOCO Boost Plus GB40 ×2",
    brand:"NOCO", category:"mobility", grade:"A", gradeComposite:96,
    tier:"T1", priceUsd:19999, priceUsdc:199.99, highTicket:false, inStock:true,
    criticalFlag:true,
    spec:"1,000A peak. Up to 6L gas / 3L diesel. Compact lithium. USB charge.",
    buildNote:"Keep in every vehicle. Charge quarterly.",
    stripePriceId:"price_1TBxvL1Y6BosZk4J586qrwyG",
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
    stripePriceId:"price_1TBxvP1Y6BosZk4JiHFVNsp7",
    imageSlug:"berkey-big",
  },
  {
    id:"sawyer-squeeze", sku:"WAT-002", name:"Sawyer Squeeze Filter",
    brand:"Sawyer", category:"water", grade:"B", gradeComposite:84,
    tier:"T1", priceUsd:3499, priceUsdc:34.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"Hollow fiber. 100,000-gal lifetime. 0.1 micron. No power. Backflushable.",
    buildNote:"1 per go-bag. Does not remove viruses — pair with Steripen in bio zones.",
    stripePriceId:"price_1TBxvU1Y6BosZk4J3IC0FILo",
    imageSlug:"sawyer-squeeze",
  },

  // ── SECURITY ────────────────────────────────────────────────────────
  {
    id:"reolink-rlc810a-4pk", sku:"SEC-001", name:"Reolink RLC-810A ×4",
    brand:"Reolink", category:"security", grade:"B", gradeComposite:86,
    tier:"T2", priceUsd:31999, priceUsdc:319.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"4K PoE IP camera. 30m night vision. Local NVR — no cloud dependency.",
    buildNote:"4-camera perimeter minimum. Pair with local NVR (no cloud).",
    stripePriceId:"price_1TBxvY1Y6BosZk4JjcqG3FYl",
    imageSlug:"reolink-810a",
  },
  {
    id:"faraday-bag-xl", sku:"SEC-003", name:"Mission Darkness Faraday Bag XL",
    brand:"Mission Darkness", category:"security", grade:"C", gradeComposite:72,
    tier:"T1", priceUsd:5999, priceUsdc:59.99, highTicket:false, inStock:true,
    criticalFlag:false,
    spec:"EMP/HEMP/solar flare shielding. Fits tablet + radio + drives. Lab tested.",
    buildNote:"Grade C: effective for shielding only. Not a long-term storage solution.",
    stripePriceId:"price_1TBxvb1Y6BosZk4JnB7u8kp0",
    imageSlug:"faraday-xl",
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
