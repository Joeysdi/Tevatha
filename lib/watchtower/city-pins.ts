// lib/watchtower/city-pins.ts

export interface CityPin {
  name:        string;
  country:     string;
  flag:        string;
  lat:         number;
  lng:         number;
  pop:         number;
  threatScore: number;
  note:        string;
}

export const CITY_PINS_DATA: CityPin[] = [
  { name: "New York",      country: "USA",          flag: "🇺🇸", lat:  40.71, lng:  -74.01, pop:  8.3, threatScore: 42, note: "Financial hub; persistent cyber targeting by state actors" },
  { name: "London",        country: "UK",           flag: "🇬🇧", lat:  51.51, lng:   -0.13, pop:  9.0, threatScore: 38, note: "Intelligence hub; ongoing espionage operations" },
  { name: "Moscow",        country: "Russia",       flag: "🇷🇺", lat:  55.75, lng:   37.62, pop: 12.4, threatScore: 78, note: "Nuclear command center; hybrid warfare doctrine active" },
  { name: "Beijing",       country: "China",        flag: "🇨🇳", lat:  39.91, lng:  116.39, pop: 21.5, threatScore: 72, note: "PLAN expansion; Taiwan Strait tension elevated" },
  { name: "Washington DC", country: "USA",          flag: "🇺🇸", lat:  38.91, lng:  -77.04, pop:  0.7, threatScore: 65, note: "Primary federal target; critical infrastructure at risk" },
  { name: "Paris",         country: "France",       flag: "🇫🇷", lat:  48.86, lng:    2.35, pop: 11.1, threatScore: 44, note: "Jihadist cell activity; intelligence services on alert" },
  { name: "Tokyo",         country: "Japan",        flag: "🇯🇵", lat:  35.69, lng:  139.69, pop: 13.9, threatScore: 35, note: "NK missile overflight corridor; seismic zone" },
  { name: "Kyiv",          country: "Ukraine",      flag: "🇺🇦", lat:  50.45, lng:   30.52, pop:  2.9, threatScore: 94, note: "Active warzone; drone and missile strikes ongoing" },
  { name: "Tehran",        country: "Iran",         flag: "🇮🇷", lat:  35.69, lng:   51.39, pop:  9.3, threatScore: 88, note: "Proxy network active; nuclear program accelerating" },
  { name: "Pyongyang",     country: "N. Korea",     flag: "🇰🇵", lat:  39.03, lng:  125.75, pop:  3.0, threatScore: 91, note: "ICBM tests continuous; total information blackout" },
  { name: "Tel Aviv",      country: "Israel",       flag: "🇮🇱", lat:  32.08, lng:   34.78, pop:  4.2, threatScore: 82, note: "Multi-front conflict active; Iron Dome engaged" },
  { name: "Delhi",         country: "India",        flag: "🇮🇳", lat:  28.61, lng:   77.21, pop: 32.9, threatScore: 55, note: "Border tensions with China/Pakistan; nuclear doctrine revision" },
  { name: "Islamabad",     country: "Pakistan",     flag: "🇵🇰", lat:  33.72, lng:   73.06, pop:  2.2, threatScore: 74, note: "Nuclear arsenal; Taliban border activity elevated" },
  { name: "Riyadh",        country: "Saudi Arabia", flag: "🇸🇦", lat:  24.69, lng:   46.72, pop:  7.7, threatScore: 60, note: "Houthi missile threat; royal succession risk" },
  { name: "Kabul",         country: "Afghanistan",  flag: "🇦🇫", lat:  34.53, lng:   69.17, pop:  4.6, threatScore: 89, note: "Taliban control; ISKP operations ongoing" },
  { name: "Singapore",     country: "Singapore",    flag: "🇸🇬", lat:   1.35, lng:  103.82, pop:  5.9, threatScore: 22, note: "Malacca chokepoint; stable but geopolitically watched" },
  { name: "Dubai",         country: "UAE",          flag: "🇦🇪", lat:  25.20, lng:   55.27, pop:  3.6, threatScore: 33, note: "Sanctions evasion hub; financial surveillance focal point" },
  { name: "Lagos",         country: "Nigeria",      flag: "🇳🇬", lat:   6.52, lng:    3.38, pop: 15.9, threatScore: 67, note: "ISWAP/Boko Haram; oil facility sabotage risk" },
  { name: "Cairo",         country: "Egypt",        flag: "🇪🇬", lat:  30.06, lng:   31.25, pop: 21.7, threatScore: 58, note: "Sinai insurgency; Nile dam standoff ongoing" },
  { name: "Caracas",       country: "Venezuela",    flag: "🇻🇪", lat:  10.48, lng:  -66.88, pop:  2.8, threatScore: 73, note: "Hybrid authoritarian state; narco-terror networks" },
  { name: "Mogadishu",     country: "Somalia",      flag: "🇸🇴", lat:   2.05, lng:   45.34, pop:  2.6, threatScore: 92, note: "Al-Shabaab active; piracy in Gulf of Aden" },
  { name: "Khartoum",      country: "Sudan",        flag: "🇸🇩", lat:  15.55, lng:   32.53, pop:  6.2, threatScore: 90, note: "SAF vs RSF civil war; humanitarian catastrophe" },
  { name: "Yangon",        country: "Myanmar",      flag: "🇲🇲", lat:  16.87, lng:   96.19, pop:  7.3, threatScore: 77, note: "Military junta; resistance forces advancing" },
  { name: "Sao Paulo",     country: "Brazil",       flag: "🇧🇷", lat: -23.55, lng:  -46.63, pop: 22.4, threatScore: 52, note: "Organized crime; deforestation-linked instability" },
  { name: "Mexico City",   country: "Mexico",       flag: "🇲🇽", lat:  19.43, lng:  -99.13, pop: 21.5, threatScore: 63, note: "Cartel state capture; fentanyl corridor active" },
  { name: "Berlin",        country: "Germany",      flag: "🇩🇪", lat:  52.52, lng:   13.41, pop:  3.7, threatScore: 36, note: "NATO eastern flank lead; Russian sabotage operations" },
  { name: "Sydney",        country: "Australia",    flag: "🇦🇺", lat: -33.87, lng:  151.21, pop:  5.3, threatScore: 25, note: "AUKUS submarine program; South China Sea tension" },
  { name: "Seoul",         country: "S. Korea",     flag: "🇰🇷", lat:  37.57, lng:  126.98, pop:  9.7, threatScore: 71, note: "NK artillery range; chemical weapon threat" },
  { name: "Taipei",        country: "Taiwan",       flag: "🇹🇼", lat:  25.03, lng:  121.56, pop:  2.7, threatScore: 85, note: "PRC military pressure; strait crossing rehearsals" },
  { name: "Istanbul",      country: "Türkiye",      flag: "🇹🇷", lat:  41.01, lng:   28.97, pop: 15.5, threatScore: 62, note: "Bosphorus chokepoint; Kurdish-Turkish conflict" },
];
