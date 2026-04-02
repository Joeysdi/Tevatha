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
    spec:"Sends and receives text messages via satellite from anywhere on Earth — no cell signal required. Includes one-button SOS that contacts emergency services, live GPS tracking, and weather forecasts.",
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
    spec:"Two-way radio that works on dual VHF/UHF bands with 5 watts of output power. Can access 400+ frequencies. Rechargeable lithium battery included.",
    buildNote:"Pre-program channels before any crisis. A ham radio license is recommended.",
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
    spec:"Portable satellite internet dish (1 kg) delivering 100+ Mbps internet speed from anywhere on Earth. Enables full community communications when all other infrastructure is down.",
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
    spec:"Military-grade individual trauma kit. Includes a SOF-T Wide tourniquet (to stop limb bleeding), a HyFin chest seal (for chest wounds), compressed gauze, and trauma dressing. Built to US military TCCC (combat casualty care) standards.",
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
    spec:"150+ piece first aid kit covering trauma, wound care, and medications. A complete first-tier household medical kit for handling injuries and illness when a hospital is not accessible.",
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
    spec:"Special gauze containing a clotting agent that stops life-threatening bleeding in 3–5 minutes. Stays effective for 3 years on the shelf.",
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
    spec:"Portable battery (1,264 watt-hours / LFP chemistry). Can power a refrigerator for 4 hours, a CPAP medical device for 14 hours, or charge a phone 100+ times. Fully recharges in 2 hours. Rated for 2,000 full charge cycles.",
    buildNote:"Tier 1 go-bag power station. Add a Nomad 100 solar panel for solar charging input.",
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
    spec:"Large portable battery (3,600 watt-hours / LFP chemistry) with a 2,400W AC output. Can run most household appliances. Expandable to 25 kWh total storage with add-on batteries. Rated for 3,500 charge cycles.",
    buildNote:"Tier 2 sanctuary essential. Pair with a Renogy 400W solar panel array.",
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
    spec:"Four 100-watt monocrystalline solar panels and a 40-amp MPPT charge controller. In average sunlight, generates about 1.6 kWh of electricity per day. Can be expanded to a 2 kW array.",
    buildNote:"Starting point for off-grid solar power. Scales to a 2 kW array.",
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
    spec:"UN-certified steel fuel containers, 5 gallons each. Airtight seal prevents leaks and vapor. Will not crack, leak, or fail under normal conditions. Built to NATO military standards.",
    buildNote:"Keep all cans full at all times. Rotate fuel every quarter using PRI-G fuel stabilizer.",
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
    spec:"Compact lithium jump starter that delivers 1,000 peak amps — enough to start vehicles with engines up to 6L gas or 3L diesel. Includes USB charging for phones.",
    buildNote:"Keep one in every vehicle. Recharge the unit every quarter.",
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
    spec:"Gravity-fed ceramic water filter (no power needed) that processes 8.5 liters per hour. Removes viruses, bacteria, and heavy metals from untreated water.",
    buildNote:"Primary household water filter. Replace filter elements per manufacturer specifications.",
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
    spec:"Hollow-fiber water filter with a lifetime capacity of 100,000 gallons. Filters particles down to 0.1 microns at no power cost. Can be backflushed to restore flow.",
    buildNote:"1 per go-bag. Does not remove viruses — pair with a SteriPen UV purifier in areas with biological contamination.",
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
    spec:"Emergency radio that receives AM/FM stations and NOAA weather alerts. Can be powered by hand-cranking, a built-in solar panel, or USB-C. Includes an SOS flashlight and a 2,000 mAh backup battery.",
    buildNote:"One per location. Needs no subscription. Hand-cranking powers the radio during a complete communications blackout.",
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
    spec:"License-free FRS (Family Radio Service) two-way radios with 22 channels. Range up to 35 miles in open terrain. NOAA weather alert reception. Rechargeable lithium battery.",
    buildNote:"No license required. Pre-program household communication channels before any crisis.",
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
    spec:"6-inch emergency pressure bandage that can be applied one-handed to control serious bleeding. Sterile. 5-year shelf life.",
    buildNote:"2 per go-bag minimum. Standard combat dressing for penetrating wounds (TCCC).",
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
    spec:"Chitosan-based clotting granules that stop serious bleeding in 30 seconds. Works even in cold conditions where body temperature is low. 3-year shelf life.",
    buildNote:"Complements QuikClot gauze. Use for wounds where packing with gauze is not practical.",
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
    spec:"Small portable battery (187 watt-hours / LFP chemistry) with a 200W AC inverter, USB-A, and USB-C ports. Solar-compatible input. Weighs 2 kg. Recharges from the wall in 2 hours.",
    buildNote:"Go-bag power station for phones, radios, and CPAP machines. Pairs with the Nomad 20 solar panel.",
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
    spec:"Multi-system GPS unit (works with GPS, GLONASS, and other satellite networks) with a 16-hour battery life. Pre-loaded topographic maps. IPX7 waterproof (survives submersion). Works without cell service.",
    buildNote:"Primary navigation tool when cell phone infrastructure is unavailable. Pre-load offline topographic maps for your region.",
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
    spec:"Food-grade plastic bladder (100 gallons capacity) that fits inside a standard bathtub. Fills from the tap in 20 minutes. BPA-free.",
    buildNote:"Fill immediately at the first sign of water disruption. 100 gallons = a 50-day supply for one adult.",
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
    spec:"Iodine water purification tablets. Each 50-tablet pack treats 25 liters of water. A neutralizer tablet is included to remove the iodine taste. 4-year shelf life.",
    buildNote:"Backup to your primary water filter. Effective against bacteria and viruses. Does not remove heavy metals.",
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
    spec:"4K resolution IP security camera with 30-meter night vision. Powered over ethernet (PoE) cable. Stores footage locally to a network video recorder (NVR) — no cloud account required.",
    buildNote:"Minimum 4-camera perimeter setup. Pair with a local NVR recorder (no cloud dependency).",
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
    spec:"Shielding bag designed to block EMP (electromagnetic pulse), HEMP (high-altitude EMP), and solar flare radiation. Fits a tablet, radio, and storage drives. Laboratory tested.",
    buildNote:"Grade C: effective for electromagnetic shielding only. Not suitable for long-term electronics storage.",
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
    spec:"Tactical LED flashlight with 800-lumen maximum output and a low-power 15-lumen setting. Nitrolon polymer body is lightweight and shockproof. Uses CR123A lithium batteries. IPX7 waterproof.",
    buildNote:"1 per household member. Store with go-bag. Keep spare batteries in a Faraday bag.",
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
    spec:"Reflective mylar sleeping bag that retains 90% of your body heat. Waterproof. Weighs 3.8 oz each. Reusable.",
    buildNote:"1 per go-bag. Packs to the size of a fist. Viable in freezing temperatures even without a sleeping bag.",
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
    spec:"600-fill-power down sleeping bag rated to 20°F (-7°C). Weighs 3 lbs. Comes with a compression sack. DWR (water-resistant) outer shell.",
    buildNote:"One per adult for cold-weather shelter when the power grid is down. Pair with a SOL bivvy as an outer vapor barrier.",
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
    spec:"Heavy-duty tarp (12×8 ft) that can serve as a rain fly, ground cloth, heat reflector, or shade shelter. Weighs 1.9 lbs.",
    buildNote:"Pack 2 per group. The reflective silver side doubles as an emergency signaling panel.",
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
    spec:"40+ acres of farmable land with an artesian well included in the title. Off-grid solar and diesel backup already installed. 90 minutes from Christchurch. No nearby seismic fault lines. Active sheep-grazing generates income.",
    buildNote:"New Zealand ranks #1 on the Global Peace Index. The remote Southern Alps location provides a natural buffer. NZ residency is available through an investment pathway.",
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
    spec:"6-hectare Alpine property with spring-fed water rights. Bunker-grade cellar for storage. 1,400 meters elevation. Connected to the national grid plus an independent hydro micro-turbine. 45 minutes from Chur.",
    buildNote:"Switzerland has the world's most developed civil defense infrastructure and a mandatory underground shelter law. It has the highest political neutrality score in the world.",
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
    spec:"8-hectare coastal fjord property with geothermal heating (no fuel cost ever). River access for fresh water and a micro-hydro generator. Arctic growing season viable with a greenhouse. Ferry-only access provides natural isolation.",
    buildNote:"Iceland has zero nuclear targets. Geothermal energy eliminates all heating and energy dependency. Total national population is under 340,000. Iceland has ranked #1 on the Global Peace Index for 15 consecutive years.",
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
    spec:"120-hectare working cattle farm with an artesian bore well and dam. Off-grid solar array already installed. 2,200 meters from the Brazilian border. Permaculture food production zones established.",
    buildNote:"Uruguay is ranked the most stable democracy in South America, with low corruption and no history of military aggression. It is in the Southern Hemisphere, outside the primary zones of any nuclear exchange scenario.",
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
    spec:"25-hectare mixed farm with 400-year-old cork oak trees that generate harvest income. Bore well and river water rights. Stone farmhouse. 1.5 hours from Lisbon airport. Solar panel infrastructure ready to install.",
    buildNote:"Portugal is a NATO member but has no nuclear weapons and a low strategic threat profile. EU residency is available through the Non-Habitual Resident (NHR) tax program. The Alentejo interior has very low population density and strong agricultural self-sufficiency.",
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
    spec:"12-hectare boreal forest property with lake frontage providing fresh water. Log construction. Wood stove plus solar hybrid power. 60 km from the nearest town. Reindeer grazing rights included.",
    buildNote:"Finland ranks in the top 5 on the Global Peace Index. Remote Lapland has roughly 2 people per km². Finland is NATO-aligned but has no strategic targets. Lake water is accessible year-round, including through ice drilling in winter.",
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
    spec:"18-hectare fruit orchard with 150,000-liter rainwater storage capacity. 3-bedroom stone farmhouse. Standalone solar and battery power system. 40 minutes from Hobart airport. Island state geography provides natural quarantine.",
    buildNote:"Tasmania's island geography naturally separates it from mainland disruption events. Australia ranks in the Global Peace Index top 10. Low seismic risk. Temperate climate with 1,200 mm of annual rainfall.",
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
    spec:"80-hectare mixed ranch with creek water rights. Detached workshop and solar panel array. Timber harvesting generates income. 2 hours from Kamloops. Outside flood zones. Deer and elk hunting access on property.",
    buildNote:"The British Columbia interior has vast wilderness acting as a buffer from population centers. Canada ranks in the Global Peace Index top 10. The Okanagan/Thompson region has minimal seismic risk and reliable snowmelt water supply.",
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
    spec:"30-hectare highland farm with a small hydroelectric stream generating 2 kW of power. Timber barn and main house. Root cellar for cold storage. 90 minutes from Oslo. Elk and trout on the property.",
    buildNote:"Norway ranks in the Global Peace Index top 5. Innlandet county has sparse population, mountain terrain, and the micro-hydro stream eliminates any dependency on the power grid. Norwegian residency is available through investment.",
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
    spec:"12-hectare tropical farm with a natural spring water source. 2-bedroom house and guest cabin. Solar panels installed. 500+ meter elevation (above the malaria zone). 45 minutes from Liberia airport.",
    buildNote:"Costa Rica has had no standing army since 1948 and ranks in the Global Peace Index top 40. The Guanacaste highlands have low seismic activity, abundant water, and a sub-tropical growing season year-round.",
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
    spec:"200-hectare Patagonian farm with river frontage. Working sheep and cattle operation already running. Diesel generator plus solar hybrid power. Almost zero light pollution. 2 hours from Puerto Montt.",
    buildNote:"Chilean Patagonia is extremely remote — fewer than 1 person per km² — with no strategic military value. It is in the Southern Hemisphere, outside the primary corridors of any nuclear exchange. Water source is glacier-fed river.",
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
    spec:"5-hectare highland coffee farm with a natural spring water source. 1,200-meter elevation keeps the climate cool and malaria-free. 2-bedroom farmhouse. Grid-connected plus solar backup. 30 minutes from David city. Economy uses US dollars — no currency risk.",
    buildNote:"Boquete has a well-established international community, strong infrastructure, and a USD-based economy. Panama's Friendly Nations Visa program makes residency straightforward. The highland elevation eliminates tropical disease risk.",
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
