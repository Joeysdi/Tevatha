// lib/provisioner/catalog.ts
import type { TierRequirement, GradeLevel } from "@/types/treasury";
import { REA_EXTENDED } from "./rea-extended";

export type ProductCategory =
  | "communications"
  | "medical"
  | "energy"
  | "mobility"
  | "water"
  | "security"
  | "shelter"
  | "real_estate";

export interface SafetyScore {
  nuclearDistance:    number;  // 0–100: proximity away from likely strike zones
  disasterRisk:       number;  // 0–100: inverse (100 = minimal natural disaster exposure)
  populationDensity:  number;  // 0–100: inverse (100 = extremely low density / rural)
  politicalStability: number;  // 0–100: GPI rank + freedom index composite
}

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
  location?:       string;           // "New Zealand — South Island"
  safetyScore?:    SafetyScore;      // present for real_estate category
  listingNote?:    string;           // replaces buildNote label copy for real estate
  priceDisplay?:   string;           // override price string e.g. "$350,000"
  externalUrl?:    string;           // official brand/manufacturer page — shown as helper link
  gearLayers?: {
    durability:           number;   // 0-100: physical resilience + lifespan
    grid_independence:    number;   // 0-100: functions without grid power
    field_repairability:  number;   // 0-100: fixable without specialized tools
    value_density:        number;   // 0-100: utility per dollar
    supply_chain:         number;   // 0-100: ease of sourcing / replacement
  };
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
    buildNote:"1 per adult. Activate a Garmin satellite plan separately — plans start at $14.95/mo.",
    stripePriceId:"price_1TE8ROAQV21Gk5Rw5Vk2i6r5",
    imageSlug:"garmin-inreach-mini2",
    externalUrl:"https://www.garmin.com/en-US/p/775983",
    gearLayers:{ durability:98, grid_independence:100, field_repairability:85, value_density:92, supply_chain:96 },
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
    externalUrl:"https://www.baofengradio.com/products/uv-5r",
    gearLayers:{ durability:70, grid_independence:95, field_repairability:80, value_density:95, supply_chain:82 },
  },
  {
    id:"starlink-mini", sku:"COM-005", name:"Starlink Mini Portable",
    brand:"SpaceX", category:"communications", grade:"A", gradeComposite:94,
    tier:"T2", priceUsd:59900, priceUsdc:599.00, highTicket:true, inStock:true,
    criticalFlag:false,
    spec:"100Mbps+. 1kg portable dish. Powers Ark coordination from anywhere.",
    buildNote:"Tier 2 community backbone. Activate a Starlink subscription at starlink.com — plans from $50/mo.",
    stripePriceId:"price_1TETh3AQV21Gk5RwbSTJCVzr",
    imageSlug:"starlink-mini",
    externalUrl:"https://www.starlink.com/hardware",
    gearLayers:{ durability:95, grid_independence:98, field_repairability:88, value_density:96, supply_chain:96 },
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
    externalUrl:"https://www.narescue.com/individual-first-aid-kit-ifak",
    gearLayers:{ durability:100, grid_independence:100, field_repairability:98, value_density:98, supply_chain:98 },
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
    externalUrl:"https://mymedic.com/products/the-myfak-pro-kit",
    gearLayers:{ durability:95, grid_independence:100, field_repairability:95, value_density:96, supply_chain:94 },
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
    externalUrl:"https://www.zmedica.com/collections/quikclot",
    gearLayers:{ durability:100, grid_independence:100, field_repairability:98, value_density:99, supply_chain:98 },
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
    externalUrl:"https://www.jackery.com/products/explorer-1000-plus-portable-power-station",
    gearLayers:{ durability:88, grid_independence:96, field_repairability:72, value_density:90, supply_chain:85 },
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
    externalUrl:"https://www.ecoflow.com/us/delta-pro-portable-power-station.html",
    gearLayers:{ durability:95, grid_independence:99, field_repairability:88, value_density:96, supply_chain:90 },
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
    externalUrl:"https://www.renogy.com/400-watt-12-volt-monocrystalline-solar-starter-kit/",
    gearLayers:{ durability:84, grid_independence:98, field_repairability:76, value_density:88, supply_chain:80 },
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
    externalUrl:"https://wavian.us/",
    gearLayers:{ durability:100, grid_independence:100, field_repairability:95, value_density:98, supply_chain:92 },
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
    externalUrl:"https://no-co.com/gb40.html",
    gearLayers:{ durability:95, grid_independence:98, field_repairability:88, value_density:96, supply_chain:95 },
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
    externalUrl:"https://berkeyfilters.com/products/big-berkey",
    gearLayers:{ durability:98, grid_independence:100, field_repairability:95, value_density:94, supply_chain:90 },
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
    externalUrl:"https://sawyer.com/products/sawyer-squeeze-filter-system/",
    gearLayers:{ durability:70, grid_independence:100, field_repairability:80, value_density:92, supply_chain:78 },
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
    externalUrl:"https://www.midlandusa.com/products/er310",
    gearLayers:{ durability:80, grid_independence:98, field_repairability:72, value_density:88, supply_chain:80 },
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
    externalUrl:"https://www.motorolasolutions.com/en_us/consumer/two-way-radios/talkabout/t800.html",
    gearLayers:{ durability:75, grid_independence:88, field_repairability:62, value_density:88, supply_chain:82 },
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
    externalUrl:"https://www.persysmedical.com/products/emergency-bandage",
    gearLayers:{ durability:100, grid_independence:100, field_repairability:96, value_density:98, supply_chain:96 },
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
    externalUrl:"https://www.celox.co.uk/products/celox-granules/",
    gearLayers:{ durability:98, grid_independence:100, field_repairability:94, value_density:96, supply_chain:94 },
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
    externalUrl:"https://www.goalzero.com/products/yeti-200x",
    gearLayers:{ durability:90, grid_independence:96, field_repairability:82, value_density:92, supply_chain:90 },
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
    externalUrl:"https://www.garmin.com/en-US/p/765156",
    gearLayers:{ durability:96, grid_independence:98, field_repairability:85, value_density:90, supply_chain:95 },
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
    externalUrl:"https://waterbob.com/",
    gearLayers:{ durability:72, grid_independence:100, field_repairability:68, value_density:88, supply_chain:80 },
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
    externalUrl:"https://potableaqua.com/",
    gearLayers:{ durability:52, grid_independence:95, field_repairability:60, value_density:78, supply_chain:72 },
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
    externalUrl:"https://reolink.com/us/product/rlc-810a/",
    gearLayers:{ durability:86, grid_independence:84, field_repairability:82, value_density:92, supply_chain:88 },
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
    externalUrl:"https://www.mosequipment.com/products/mission-darkness-non-window-laptop-faraday-bag",
    gearLayers:{ durability:60, grid_independence:100, field_repairability:48, value_density:72, supply_chain:65 },
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
    externalUrl:"https://www.surefire.com/g2x-tactical/",
    gearLayers:{ durability:92, grid_independence:88, field_repairability:82, value_density:86, supply_chain:84 },
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
    externalUrl:"https://www.surviveoutdoorslonger.com/products/escape-bivvy",
    gearLayers:{ durability:90, grid_independence:100, field_repairability:84, value_density:98, supply_chain:90 },
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
    externalUrl:"https://www.kelty.com/cosmic-20/",
    gearLayers:{ durability:88, grid_independence:100, field_repairability:80, value_density:90, supply_chain:86 },
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
    externalUrl:"https://titansurvival.com/products/multi-use-tarp",
    gearLayers:{ durability:68, grid_independence:100, field_repairability:72, value_density:80, supply_chain:68 },
  },

  // ── REAL ESTATE ──────────────────────────────────────────────────────
  {
    id:"rea-nz-south-island", sku:"REA-001",
    name:"Canterbury Station Land — South Island",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"A", gradeComposite:96,
    tier:"T2", priceUsd:35000000, priceUsdc:350000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"New Zealand — South Island (Canterbury)",
    spec:"40+ acres. Artesian well on title. Off-grid solar + diesel backup installed. 90 min from Christchurch. No seismic fault proximity. Sheep-grazing income.",
    buildNote:"NZ tops Global Peace Index. Remote Southern Alps buffer. NZ residency pathway via investment.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$350,000",
    safetyScore:{ nuclearDistance:99, disasterRisk:90, populationDensity:98, politicalStability:96 },
    imageSlug:"rea-nz-south-island",
    externalUrl:"https://www.trademe.co.nz/a/property/rural",
  },
  {
    id:"rea-switzerland-graubunden", sku:"REA-002",
    name:"Alpine Farmstead — Graubünden",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"A", gradeComposite:93,
    tier:"T2", priceUsd:85000000, priceUsdc:850000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Switzerland — Graubünden canton",
    spec:"6-hectare alpine property. Spring-fed water rights. Bunker-grade cellar. 1,400m elevation. Grid + independent hydro micro-turbine. 45 min from Chur.",
    buildNote:"Switzerland's civil defense infrastructure is the world's most mature. Mandatory shelter law. Highest political neutrality score globally.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$850,000",
    safetyScore:{ nuclearDistance:88, disasterRisk:92, populationDensity:94, politicalStability:99 },
    imageSlug:"rea-switzerland-graubunden",
    externalUrl:"https://www.immoscout24.ch/en/real-estate/buy/region-graubuenden",
  },
  {
    id:"rea-iceland-westfjords", sku:"REA-003",
    name:"Geothermal Homestead — Westfjords",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"A", gradeComposite:94,
    tier:"T2", priceUsd:28000000, priceUsdc:280000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Iceland — Westfjords",
    spec:"8-hectare coastal fjord property. Geothermal heating (no fuel cost). River access for water + micro-hydro. Arctic growing season (greenhouse viable). Ferry access only — natural isolation.",
    buildNote:"Iceland has zero nuclear targets. Geothermal eliminates energy dependency entirely. Sub-340k population island. GPI #1 globally for 15 years.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$280,000",
    safetyScore:{ nuclearDistance:99, disasterRisk:86, populationDensity:99, politicalStability:98 },
    imageSlug:"rea-iceland-westfjords",
    externalUrl:"https://www.mbl.is/fasteignir/",
  },
  {
    id:"rea-uruguay-rivera", sku:"REA-004",
    name:"Highland Estancia — Rivera",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"A", gradeComposite:92,
    tier:"T2", priceUsd:18000000, priceUsdc:180000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Uruguay — Rivera highlands",
    spec:"120-hectare working cattle estancia. Artesian bore + dam. Off-grid solar array included. 2,200m from Brazilian border. Permaculture zones established.",
    buildNote:"Uruguay ranked most stable democracy in South America. Low corruption, no military aggression history. Southern hemisphere — outside primary nuclear exchange zones.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$180,000",
    safetyScore:{ nuclearDistance:94, disasterRisk:91, populationDensity:96, politicalStability:88 },
    imageSlug:"rea-uruguay-rivera",
    externalUrl:"https://www.infocasas.com.uy/",
  },
  {
    id:"rea-portugal-alentejo", sku:"REA-005",
    name:"Olive & Cork Farm — Alentejo",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"A", gradeComposite:91,
    tier:"T2", priceUsd:22000000, priceUsdc:220000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Portugal — Alentejo",
    spec:"25-hectare mixed farm. 400-year cork oaks (harvest income). Bore well + river right. Stone farmhouse. 1.5hr from Lisbon airport. Solar ready.",
    buildNote:"Portugal NATO member but non-nuclear, low threat profile. EU residency via NHR tax regime. Alentejo interior: minimal population, agricultural self-sufficiency.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$220,000",
    safetyScore:{ nuclearDistance:86, disasterRisk:88, populationDensity:93, politicalStability:90 },
    imageSlug:"rea-portugal-alentejo",
    externalUrl:"https://www.idealista.pt/comprar-casas/alentejo/",
  },
  {
    id:"rea-finland-lapland", sku:"REA-006",
    name:"Wilderness Lodge — Lapland Interior",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"A", gradeComposite:90,
    tier:"T2", priceUsd:19000000, priceUsdc:190000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Finland — Lapland interior",
    spec:"12-hectare boreal forest property. Lake frontage with freshwater. Log construction. Wood-stove + solar hybrid. 60km from nearest town. Reindeer grazing rights.",
    buildNote:"Finland scores top 5 GPI. Remote Lapland: ~2 people/km². NATO aligned but no strategic targets. Fresh water lake access year-round via ice drilling.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$190,000",
    safetyScore:{ nuclearDistance:82, disasterRisk:93, populationDensity:99, politicalStability:94 },
    imageSlug:"rea-finland-lapland",
    externalUrl:"https://www.oikotie.fi/en/buying/",
  },
  {
    id:"rea-australia-tasmania", sku:"REA-007",
    name:"Orchard Retreat — Tasmania",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"B", gradeComposite:86,
    tier:"T2", priceUsd:29000000, priceUsdc:290000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Australia — Tasmania",
    spec:"18-hectare fruit orchard. Rainwater tanks (150,000L capacity). 3-bedroom stone homestead. Standalone solar/battery array. 40 min from Hobart. Island state — natural quarantine.",
    buildNote:"Tasmania island geography provides natural separation from mainland disruption. Australia GPI top 10. Low seismic risk. Temperate climate with 1,200mm annual rainfall.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$290,000",
    safetyScore:{ nuclearDistance:91, disasterRisk:85, populationDensity:95, politicalStability:87 },
    imageSlug:"rea-australia-tasmania",
    externalUrl:"https://www.realestate.com.au/buy/in-tasmania/",
  },
  {
    id:"rea-canada-bc-interior", sku:"REA-008",
    name:"Ranchland — British Columbia Interior",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"B", gradeComposite:88,
    tier:"T2", priceUsd:32000000, priceUsdc:320000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Canada — British Columbia interior",
    spec:"80-hectare mixed ranch. Creek water rights. Detached workshop + solar array. Timber income. 2hr from Kamloops. No flood zone. Deer/elk hunting access.",
    buildNote:"BC interior: vast wilderness buffer from population centers. Canada GPI top 10. Okanagan/Thompson region has minimal seismic risk and reliable snowmelt water.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$320,000",
    safetyScore:{ nuclearDistance:78, disasterRisk:86, populationDensity:97, politicalStability:92 },
    imageSlug:"rea-canada-bc-interior",
    externalUrl:"https://www.realtor.ca/map#view=list&Sort=6-D&GeoName=British%20Columbia",
  },
  {
    id:"rea-norway-innlandet", sku:"REA-009",
    name:"Mountain Farm — Innlandet",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"B", gradeComposite:87,
    tier:"T2", priceUsd:28000000, priceUsdc:280000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Norway — Innlandet",
    spec:"30-hectare highland farm. Hydroelectric stream (2kW output). Timber barn + main house. Root cellar. 90 min from Oslo. Elk and trout on property.",
    buildNote:"Norway GPI top 5. Innlandet county: sparse population, mountain terrain, micro-hydro eliminates grid dependency. Norwegian residency accessible via investment.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$280,000",
    safetyScore:{ nuclearDistance:80, disasterRisk:90, populationDensity:96, politicalStability:95 },
    imageSlug:"rea-norway-innlandet",
    externalUrl:"https://www.finn.no/eiendom/til-salgs/",
  },
  {
    id:"rea-costa-rica-guanacaste", sku:"REA-010",
    name:"Highlands Finca — Guanacaste",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"B", gradeComposite:85,
    tier:"T2", priceUsd:15000000, priceUsdc:150000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Costa Rica — Guanacaste highlands",
    spec:"12-hectare tropical finca. Spring water. 2BR casita + guest cabin. Solar panels installed. 500m+ elevation (malaria-free). 45 min from Liberia airport.",
    buildNote:"Costa Rica has no standing army (since 1948). GPI top 40. Guanacaste highland: low seismic, abundant water, sub-tropical growing season year-round.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$150,000",
    safetyScore:{ nuclearDistance:95, disasterRisk:76, populationDensity:88, politicalStability:84 },
    imageSlug:"rea-costa-rica-guanacaste",
    externalUrl:"https://www.century21cr.com/",
  },
  {
    id:"rea-chile-patagonia", sku:"REA-011",
    name:"Estancia — Los Lagos Patagonia",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"B", gradeComposite:83,
    tier:"T2", priceUsd:12000000, priceUsdc:120000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Chile — Patagonia (Los Lagos)",
    spec:"200-hectare Patagonian estancia. River frontage. Sheep/cattle operation running. Diesel generator + solar hybrid. Near-zero light pollution. 2hr from Puerto Montt.",
    buildNote:"Chilean Patagonia: extreme remoteness, <1 person/km², no strategic value. Southern hemisphere outside primary exchange corridors. Glacier-fed river water.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$120,000",
    safetyScore:{ nuclearDistance:96, disasterRisk:72, populationDensity:99, politicalStability:78 },
    imageSlug:"rea-chile-patagonia",
    externalUrl:"https://www.portalinmobiliario.com/",
  },
  {
    id:"rea-panama-boquete", sku:"REA-012",
    name:"Coffee Farm — Chiriquí (Boquete)",
    brand:"Tevatha Real Estate", category:"real_estate", grade:"B", gradeComposite:82,
    tier:"T2", priceUsd:13000000, priceUsdc:130000, highTicket:true, inStock:true,
    criticalFlag:false,
    location:"Panama — Chiriquí highlands (Boquete)",
    spec:"5-hectare highland coffee farm. Natural spring. 1,200m elevation (cool climate). 2BR farmhouse. Grid + backup solar. 30 min from David city. USD economy.",
    buildNote:"Boquete: world-class expat infrastructure, USD-based economy (no currency risk), Friendly Nations Visa for residency. Highland elevation eliminates tropical disease risk.",
    listingNote:"Why this Ark node works",
    priceDisplay:"$130,000",
    safetyScore:{ nuclearDistance:93, disasterRisk:74, populationDensity:85, politicalStability:80 },
    imageSlug:"rea-panama-boquete",
    externalUrl:"https://www.boqueterealty.com/",
  },
  ...REA_EXTENDED,
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
