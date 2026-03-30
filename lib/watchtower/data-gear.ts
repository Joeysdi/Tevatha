// lib/watchtower/data-gear.ts
// Gear catalog — only loaded by /watchtower/gear subroute and gear-panel.tsx.
// ~20 KB of data not needed in the main watchtower globe bundle.

import type { GearCategory } from "@/lib/watchtower/data";

export const SCENARIO_GEAR_MAP: Record<string, { skus: string[]; domain: string }> = {
  S01: { domain: "economic",  skus: ["WAT-001", "ENE-001", "MOB-001"] }, // Hyperinflation
  S03: { domain: "economic",  skus: ["WAT-001", "WAT-002", "ENE-001"] }, // CBDC displacement
  S05: { domain: "nuclear",   skus: ["COM-001", "ENE-001", "SEC-003"] }, // Grid-Down EMP / Cyber
  S07: { domain: "civil",     skus: ["COM-001", "COM-002", "MOB-001"] }, // US Constitutional Crisis
  S09: { domain: "nuclear",   skus: ["COM-001", "ENE-002", "SEC-003"] }, // Taiwan Strait
  S10: { domain: "bio",       skus: ["MED-001", "WAT-001", "COM-001"] }, // H5N1 Pandemic
};

export const GEAR: GearCategory[] = [
  {
    cat:"Communications",
    items:[
      { name:"Garmin inReach Mini 2",      brand:"Garmin",  price:"$350",        tier:"T1", rating:5, critical:true,  spec:"Two-way satellite messaging anywhere on Earth. SOS, tracking, weather. No cell required.",              note:"1 per adult + satellite plan"      },
      { name:"Baofeng UV-5R Dual Band",    brand:"Baofeng", price:"$28",         tier:"T1", rating:4, critical:false, spec:"Dual-band VHF/UHF. 400+ frequencies. HAM/FRS/GMRS compatible. 5W output.",                           note:"Buy 5–10. Pre-program channels."   },
      { name:"Midland ER310 Emergency",    brand:"Midland", price:"$60",         tier:"T1", rating:5, critical:true,  spec:"AM/FM/NOAA alerts. Hand-crank + solar + battery. USB charge port.",                                   note:"Core kit item. 1 per household."   },
      { name:"Starlink Mini Portable",     brand:"SpaceX",  price:"$599+$150/mo",tier:"T2", rating:5, critical:false, spec:"100Mbps+ anywhere. 1kg dish. Powers Ark coordination. Tier 2 comms backbone.",                        note:"Tier 2+ community only"            },
      { name:"Faraday Bag (SLNT)",         brand:"SLNT",    price:"$30",         tier:"T1", rating:4, critical:false, spec:"EMP/solar flare protection. Blocks all signals. Fits phones, radios, drives.",                         note:"Store electronics permanently"     },
    ],
  },
  {
    cat:"Medical",
    items:[
      { name:"NAR IFAK Trauma Kit",        brand:"NAR",     price:"$75",  tier:"T1", rating:5, critical:true,  spec:"SOF-T Wide tourniquet, HyFin chest seal, trauma dressing, compressed gauze. Military TCCC.", note:"1 per adult go-bag"              },
      { name:"MyMedic MYFAK Advanced",     brand:"MyMedic", price:"$160", tier:"T1", rating:5, critical:true,  spec:"150+ piece kit. Trauma supplies, wound care, medications. First-tier home medical.",         note:"1 per household minimum"         },
      { name:"QuikClot Combat Gauze (3pk)",brand:"Z-Medica",price:"$75",  tier:"T1", rating:5, critical:true,  spec:"Hemostatic gauze. Controls life-threatening bleeding in 3–5 min. US military standard.",    note:"Keep 6+ units in stock"          },
      { name:"Merck Manual 19th Ed. Print",brand:"Merck",   price:"$50",  tier:"T2", rating:5, critical:false, spec:"3,500+ pages. Diagnosis, treatment, medications. The offline medical bible.",               note:"Print only — no power needed"    },
      { name:"Pulse Ox + Digital BP Kit",  brand:"Contec",  price:"$60",  tier:"T1", rating:4, critical:false, spec:"Continuous vital monitoring. Battery operated. Critical for chronic disease off-grid.",     note:"With spare batteries"            },
    ],
  },
  {
    cat:"Energy",
    items:[
      { name:"EcoFlow DELTA Pro",          brand:"EcoFlow", price:"$2,200", tier:"T2", rating:5, critical:false, spec:"3,600Wh. 2,400W AC output. Solar/grid/car charge. Expandable to 25kWh.",  note:"Tier 2 sanctuary essential"          },
      { name:"Jackery Explorer 1000 Plus", brand:"Jackery", price:"$999",   tier:"T1", rating:5, critical:false, spec:"1,264Wh. Powers fridge 4h, CPAP 14h, phone 100+ charges. 2-hour recharge.",note:"Tier 1 go-bag power station"         },
      { name:"Renogy 400W Solar Kit",      brand:"Renogy",  price:"$580",   tier:"T2", rating:5, critical:false, spec:"4×100W mono panels + 40A controller. 1.6kWh/day moderate sun.",            note:"Starting point for off-grid solar"   },
      { name:"Champion 3500W Dual-Fuel",   brand:"Champion",price:"$580",   tier:"T2", rating:4, critical:false, spec:"Gasoline or propane. 3,500W running / 4,000W surge. 7.5-hour runtime.",   note:"Bridge power. Stock 6+ propane tanks."},
      { name:"Goal Zero Nomad 100",        brand:"Goal Zero",price:"$250",  tier:"T1", rating:4, critical:false, spec:"Foldable 100W. Direct-charge or battery compatible. Go-bag deployable.",   note:"Pair with Jackery 1000+"             },
    ],
  },
  {
    cat:"Mobility",
    items:[
      { name:"Wavian 5-Gal NATO Jerry Can",brand:"Wavian",  price:"$40",  tier:"T1", rating:5, critical:true,  spec:"UN-certified steel. Airtight. Will not crack, leak, or explode. Always kept full.", note:"Buy 4–6. Rotate fuel quarterly." },
      { name:"NOCO Boost Plus GB40",       brand:"NOCO",    price:"$100", tier:"T1", rating:5, critical:true,  spec:"1,000A peak. Up to 6L gas / 3L diesel. Compact lithium. Phone charging included.",  note:"Keep in every vehicle"           },
      { name:"NOCO Genius Pro 50 Charger", brand:"NOCO",    price:"$190", tier:"T1", rating:5, critical:false, spec:"Maintains, desulfates, recovers 12V/24V batteries. Prevents failure.",              note:"Keeps all stored batteries healthy"},
      { name:"Slime Flat Tire Repair Kit", brand:"Slime",   price:"$30",  tier:"T1", rating:4, critical:false, spec:"Sealant + inflator. Repairs and inflates in <15 min. No spare required.",           note:"1 per vehicle"                   },
    ],
  },
];
