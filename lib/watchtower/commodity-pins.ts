// lib/watchtower/commodity-pins.ts

export interface CommodityPin {
  id:        string;
  lat:       number;
  lng:       number;
  name:      string;
  symbol:    string;
  price:     string;
  unit:      string;
  change:    number;   // % change — positive = up
  exchange:  string;
  note:      string;
  category:  "grain" | "energy" | "metal" | "index";
}

export const COMMODITY_PINS: CommodityPin[] = [
  {
    id:       "wheat",
    lat:      41.88,
    lng:     -87.63,
    name:     "Wheat",
    symbol:   "ZW",
    price:    "584",
    unit:     "¢/bu",
    change:   3.2,
    exchange: "CME · Chicago",
    note:     "Kansas hard red winter wheat. Drought in US Plains cuts yield forecasts 12%. Egypt imports 55% of calories as wheat — acute import risk if price holds above $6/bu.",
    category: "grain",
  },
  {
    id:       "brent",
    lat:      51.51,
    lng:     -0.13,
    name:     "Brent Crude",
    symbol:   "BRN",
    price:    "76.40",
    unit:     "$/bbl",
    change:   -1.8,
    exchange: "ICE · London",
    note:     "North Sea benchmark. OPEC+ output discipline holding but China demand weakness and US shale production at record levels cap upside. Sanctions evasion keeping Russian barrels flowing.",
    category: "energy",
  },
  {
    id:       "gold",
    lat:      40.71,
    lng:     -74.01,
    name:     "Gold",
    symbol:   "GC",
    price:    "2,847",
    unit:     "$/oz",
    change:   0.9,
    exchange: "COMEX · New York",
    note:     "Safe-haven demand elevated. Central bank buying at record pace for 3rd consecutive year. Real yields declining. All-time high $3,124 reached Feb 2025. Classic hard asset in dollar debasement scenario.",
    category: "metal",
  },
  {
    id:       "natgas",
    lat:      30.21,
    lng:     -93.28,
    name:     "Natural Gas",
    symbol:   "NG",
    price:    "3.74",
    unit:     "$/MMBtu",
    change:   5.1,
    exchange: "Henry Hub · Louisiana",
    note:     "Cold snap across US Northeast drives demand spike. LNG export capacity near saturation. European TTF gas up 28% — 8 EU member states declared energy poverty emergencies this winter.",
    category: "energy",
  },
  {
    id:       "food-index",
    lat:      41.90,
    lng:      12.48,
    name:     "Food Price Index",
    symbol:   "FAO-FPI",
    price:    "136.2",
    unit:     "index",
    change:   2.4,
    exchange: "FAO · Rome",
    note:     "UN Food & Agriculture Organization composite (2014–16 = 100). Cereals and vegetable oils driving upward pressure. 282 million people acutely food insecure globally — highest in recorded history.",
    category: "index",
  },
  {
    id:       "water",
    lat:      30.06,
    lng:      31.25,
    name:     "Water Stress Index",
    symbol:   "WSI",
    price:    "68.4",
    unit:     "/100",
    change:   1.2,
    exchange: "WRI · Cairo",
    note:     "WRI Aqueduct composite. Egypt scores 92/100 — extreme stress — following GERD dam dispute with Ethiopia. 25 countries face critical water stress. 4 billion people face severe scarcity at least 1 month per year.",
    category: "index",
  },
  {
    id:       "energy-index",
    lat:      50.85,
    lng:       4.35,
    name:     "Global Energy Index",
    symbol:   "GEI",
    price:    "142.8",
    unit:     "index",
    change:   4.7,
    exchange: "IEA · Brussels",
    note:     "IEA composite tracking electricity, gas, and transport fuel. EU dependency on LNG up 34% since Nord Stream sabotage. Energy poverty now affecting 700M+ globally. Grid fragility elevated in 18 nations.",
    category: "index",
  },
];
