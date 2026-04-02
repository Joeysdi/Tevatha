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
      { name:"Garmin inReach Mini 2",      brand:"Garmin",  price:"$350",        tier:"T1", rating:5, critical:true,  spec:"Sends and receives text messages via satellite from anywhere on Earth — no cell phone signal needed. Includes a one-button SOS alert that contacts emergency services, GPS tracking, and weather updates.",              note:"1 per adult + satellite plan"      },
      { name:"Baofeng UV-5R Dual Band",    brand:"Baofeng", price:"$28",         tier:"T1", rating:4, critical:false, spec:"Affordable two-way radio that works on 400+ frequencies. Can reach other radios up to several miles away without any cell or internet infrastructure. Compatible with ham, FRS, and GMRS frequency bands.",                           note:"Buy 5–10. Pre-program channels before any crisis."   },
      { name:"Midland ER310 Emergency",    brand:"Midland", price:"$60",         tier:"T1", rating:5, critical:true,  spec:"Emergency radio that receives AM/FM stations, NOAA weather alerts, and can be powered by hand-cranking, a built-in solar panel, or batteries. Includes a USB port to charge other devices.",                                   note:"Core kit item. 1 per household."   },
      { name:"Starlink Mini Portable",     brand:"SpaceX",  price:"$599+$150/mo",tier:"T2", rating:5, critical:false, spec:"Portable satellite internet dish (1 kg) that delivers 100+ Mbps internet speed from anywhere. Enables full communications coordination when all other infrastructure is down.",                        note:"Tier 2+ community only"            },
      { name:"Faraday Bag (SLNT)",         brand:"SLNT",    price:"$30",         tier:"T1", rating:4, critical:false, spec:"A bag that blocks all electromagnetic signals, protecting electronics from an EMP (electromagnetic pulse) or a strong solar storm. Fits phones, radios, and drives.",                         note:"Store important electronics in this permanently"     },
    ],
  },
  {
    cat:"Medical",
    items:[
      { name:"NAR IFAK Trauma Kit",        brand:"NAR",     price:"$75",  tier:"T1", rating:5, critical:true,  spec:"Military-grade individual trauma kit. Includes a SOF-T Wide tourniquet (stops limb bleeding), a HyFin chest seal (treats chest wounds), trauma dressing, and compressed gauze. Built to US military TCCC (Tactical Combat Casualty Care) standards.", note:"1 per adult go-bag"              },
      { name:"MyMedic MYFAK Advanced",     brand:"MyMedic", price:"$160", tier:"T1", rating:5, critical:true,  spec:"150+ piece first aid kit covering trauma, wound care, and medication. This is a complete first-tier household medical kit for dealing with injuries and illness without access to a hospital.",         note:"1 per household minimum"         },
      { name:"QuikClot Combat Gauze (3pk)",brand:"Z-Medica",price:"$75",  tier:"T1", rating:5, critical:true,  spec:"Special gauze that contains a clotting agent to stop life-threatening bleeding in 3–5 minutes. Used as the US military standard for serious wounds.",    note:"Keep 6+ units in stock"          },
      { name:"Merck Manual 19th Ed. Print",brand:"Merck",   price:"$50",  tier:"T2", rating:5, critical:false, spec:"3,500+ pages covering how to diagnose and treat medical conditions and use medications — no internet required. The most comprehensive offline medical reference available.",               note:"Print only — works without power"    },
      { name:"Pulse Ox + Digital BP Kit",  brand:"Contec",  price:"$60",  tier:"T1", rating:4, critical:false, spec:"Battery-operated device to continuously monitor oxygen levels (pulse oximeter) and blood pressure. Critical for monitoring people with chronic medical conditions when there is no access to a hospital.",     note:"Buy with spare batteries"            },
    ],
  },
  {
    cat:"Energy",
    items:[
      { name:"EcoFlow DELTA Pro",          brand:"EcoFlow", price:"$2,200", tier:"T2", rating:5, critical:false, spec:"Large portable battery (3,600 watt-hours) with a 2,400W AC output — enough to run most household appliances. Can be charged from solar panels, the grid, or a car. Expandable to 25 kWh of total storage. Rated for 3,500 full charge cycles.",  note:"Tier 2 sanctuary essential"          },
      { name:"Jackery Explorer 1000 Plus", brand:"Jackery", price:"$999",   tier:"T1", rating:5, critical:false, spec:"Portable battery (1,264 watt-hours) that can power a refrigerator for 4 hours, a CPAP medical device for 14 hours, or charge a phone 100+ times. Fully recharges in 2 hours.",note:"Tier 1 go-bag power station"         },
      { name:"Renogy 400W Solar Kit",      brand:"Renogy",  price:"$580",   tier:"T2", rating:5, critical:false, spec:"Four 100-watt solar panels and a 40-amp charge controller. In average sunlight, generates about 1.6 kWh of electricity per day — enough to keep phones, radios, and basic lighting powered indefinitely.",            note:"Starting point for off-grid solar"   },
      { name:"Champion 3500W Dual-Fuel",   brand:"Champion",price:"$580",   tier:"T2", rating:4, critical:false, spec:"Generator that runs on either gasoline or propane. Produces 3,500 watts continuously (4,000W surge). Runs for 7.5 hours on a full tank.",   note:"Bridge power. Stock 6+ propane tanks."},
      { name:"Goal Zero Nomad 100",        brand:"Goal Zero",price:"$250",  tier:"T1", rating:4, critical:false, spec:"Foldable 100-watt solar panel for go-bag use. Can directly charge compatible batteries or devices. Folds flat for transport.",   note:"Pair with Jackery 1000+"             },
    ],
  },
  {
    cat:"Mobility",
    items:[
      { name:"Wavian 5-Gal NATO Jerry Can",brand:"Wavian",  price:"$40",  tier:"T1", rating:5, critical:true,  spec:"UN-certified steel fuel container (5 gallons each). Airtight seal prevents leaks and vapor. Will not crack, rust, or fail under normal conditions. Designed to NATO military standards.", note:"Buy 4–6. Rotate fuel every quarter." },
      { name:"NOCO Boost Plus GB40",       brand:"NOCO",    price:"$100", tier:"T1", rating:5, critical:true,  spec:"Compact lithium jump starter that delivers 1,000 amps — enough to start cars with engines up to 6L gas or 3L diesel. Also charges phones via USB.",  note:"Keep one in every vehicle"           },
      { name:"NOCO Genius Pro 50 Charger", brand:"NOCO",    price:"$190", tier:"T1", rating:5, critical:false, spec:"Battery maintainer that keeps stored 12V and 24V batteries healthy, prevents sulfation (a common battery failure mode), and can recover deeply discharged batteries.",              note:"Keeps all stored batteries healthy"},
      { name:"Slime Flat Tire Repair Kit", brand:"Slime",   price:"$30",  tier:"T1", rating:4, critical:false, spec:"Tire sealant and inflator that repairs most flat tires and re-inflates them in under 15 minutes. No need for a spare tire or jack.",           note:"1 per vehicle"                   },
    ],
  },
];
