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

  // ── NORTH AMERICA ──────────────────────────────────────────────────────────
  { name: "New York",       country: "USA",           flag: "🇺🇸", lat:  40.71, lng:  -74.01, pop:  8.3, threatScore: 42, note: "Financial hub; persistent cyber targeting by state actors" },
  { name: "Washington DC",  country: "USA",           flag: "🇺🇸", lat:  38.91, lng:  -77.04, pop:  0.7, threatScore: 65, note: "Primary federal target; critical infrastructure at risk" },
  { name: "Los Angeles",    country: "USA",           flag: "🇺🇸", lat:  34.05, lng: -118.24, pop:  4.0, threatScore: 32, note: "Port of entry; wildfire and seismic risk compounding" },
  { name: "Chicago",        country: "USA",           flag: "🇺🇸", lat:  41.88, lng:  -87.63, pop:  2.7, threatScore: 30, note: "Midwest logistics hub; infrastructure aging" },
  { name: "Houston",        country: "USA",           flag: "🇺🇸", lat:  29.76, lng:  -95.37, pop:  2.3, threatScore: 28, note: "Energy corridor; petrochemical complex exposure" },
  { name: "Miami",          country: "USA",           flag: "🇺🇸", lat:  25.77, lng:  -80.19, pop:  0.5, threatScore: 30, note: "Climate/sea-level risk; narco-finance nexus" },
  { name: "San Francisco",  country: "USA",           flag: "🇺🇸", lat:  37.77, lng: -122.42, pop:  0.9, threatScore: 31, note: "Tech sector concentration; Hayward fault risk" },
  { name: "Toronto",        country: "Canada",        flag: "🇨🇦", lat:  43.65, lng:  -79.38, pop:  2.9, threatScore: 22, note: "Financial center; Chinese diaspora espionage focus" },
  { name: "Montreal",       country: "Canada",        flag: "🇨🇦", lat:  45.50, lng:  -73.57, pop:  2.1, threatScore: 18, note: "Bilingual capital; aerospace and defense industry" },
  { name: "Vancouver",      country: "Canada",        flag: "🇨🇦", lat:  49.25, lng: -123.12, pop:  0.7, threatScore: 20, note: "Pacific gateway; fentanyl corridor; China influence ops" },
  { name: "Mexico City",    country: "Mexico",        flag: "🇲🇽", lat:  19.43, lng:  -99.13, pop: 21.5, threatScore: 63, note: "Cartel state capture; fentanyl corridor active" },
  { name: "Guadalajara",    country: "Mexico",        flag: "🇲🇽", lat:  20.66, lng: -103.35, pop:  5.3, threatScore: 55, note: "CJNG stronghold; extortion networks" },

  // ── CENTRAL AMERICA & CARIBBEAN ───────────────────────────────────────────
  { name: "Havana",         country: "Cuba",          flag: "🇨🇺", lat:  23.14, lng:  -82.36, pop:  2.1, threatScore: 45, note: "Russian intelligence hub in Western Hemisphere" },
  { name: "Guatemala City", country: "Guatemala",     flag: "🇬🇹", lat:  14.64, lng:  -90.51, pop:  1.1, threatScore: 55, note: "Gang violence; migration pressure valve" },
  { name: "San Salvador",   country: "El Salvador",   flag: "🇸🇻", lat:  13.69, lng:  -89.19, pop:  1.1, threatScore: 48, note: "Gang suppression state; Bitcoin legal tender" },
  { name: "Tegucigalpa",    country: "Honduras",      flag: "🇭🇳", lat:  14.10, lng:  -87.22, pop:  1.4, threatScore: 56, note: "Narco-trafficking corridor; institutional fragility" },
  { name: "Managua",        country: "Nicaragua",     flag: "🇳🇮", lat:  12.13, lng:  -86.28, pop:  1.0, threatScore: 50, note: "Ortega authoritarian consolidation; Russian ties" },
  { name: "Panama City",    country: "Panama",        flag: "🇵🇦", lat:   8.99, lng:  -79.52, pop:  0.9, threatScore: 32, note: "Canal chokepoint; money laundering hub" },
  { name: "Port-au-Prince", country: "Haiti",         flag: "🇭🇹", lat:  18.55, lng:  -72.34, pop:  2.8, threatScore: 88, note: "Gang control ~80% of capital; state collapse ongoing" },
  { name: "Santo Domingo",  country: "Dom. Republic", flag: "🇩🇴", lat:  18.47, lng:  -69.90, pop:  3.3, threatScore: 45, note: "Haiti spillover risk; drug transit" },
  { name: "Kingston",       country: "Jamaica",       flag: "🇯🇲", lat:  17.99, lng:  -76.79, pop:  0.7, threatScore: 52, note: "Gang-police conflict; homicide rate elevated" },

  // ── SOUTH AMERICA ──────────────────────────────────────────────────────────
  { name: "Bogotá",         country: "Colombia",      flag: "🇨🇴", lat:   4.71, lng:  -74.07, pop:  7.4, threatScore: 52, note: "FARC residual; ELN active; coca production record high" },
  { name: "Medellín",       country: "Colombia",      flag: "🇨🇴", lat:   6.25, lng:  -75.56, pop:  2.5, threatScore: 48, note: "Cartel resurgence; urban security fragile" },
  { name: "Lima",           country: "Peru",          flag: "🇵🇪", lat: -12.04, lng:  -77.03, pop: 10.9, threatScore: 42, note: "Political instability cycle; Shining Path remnants" },
  { name: "Quito",          country: "Ecuador",       flag: "🇪🇨", lat:  -0.23, lng:  -78.52, pop:  2.0, threatScore: 48, note: "Cartel violence surge; narco-state risk rising" },
  { name: "Santiago",       country: "Chile",         flag: "🇨🇱", lat: -33.45, lng:  -70.67, pop:  6.3, threatScore: 28, note: "Social unrest cycles; lithium geopolitics" },
  { name: "Buenos Aires",   country: "Argentina",     flag: "🇦🇷", lat: -34.60, lng:  -58.38, pop: 15.2, threatScore: 48, note: "Peso crisis chronic; Milei austerity experiment" },
  { name: "Sao Paulo",      country: "Brazil",        flag: "🇧🇷", lat: -23.55, lng:  -46.63, pop: 22.4, threatScore: 52, note: "Organized crime; deforestation-linked instability" },
  { name: "Rio de Janeiro", country: "Brazil",        flag: "🇧🇷", lat: -22.91, lng:  -43.17, pop:  6.7, threatScore: 55, note: "Militia-gang conflict; favela governance vacuum" },
  { name: "Brasília",       country: "Brazil",        flag: "🇧🇷", lat: -15.78, lng:  -47.93, pop:  3.0, threatScore: 35, note: "Political polarization; Jan 8 insurrection precedent" },
  { name: "Caracas",        country: "Venezuela",     flag: "🇻🇪", lat:  10.48, lng:  -66.88, pop:  2.8, threatScore: 73, note: "Hybrid authoritarian state; narco-terror networks" },
  { name: "Montevideo",     country: "Uruguay",       flag: "🇺🇾", lat: -34.90, lng:  -56.19, pop:  1.4, threatScore: 22, note: "Stable; regional narco-transit hub emerging" },
  { name: "La Paz",         country: "Bolivia",       flag: "🇧🇴", lat: -16.50, lng:  -68.15, pop:  1.8, threatScore: 38, note: "Political instability; lithium nationalization" },
  { name: "Asunción",       country: "Paraguay",      flag: "🇵🇾", lat: -25.28, lng:  -57.64, pop:  0.7, threatScore: 40, note: "Money laundering; Hezbollah financial network presence" },

  // ── WESTERN EUROPE ─────────────────────────────────────────────────────────
  { name: "London",         country: "UK",            flag: "🇬🇧", lat:  51.51, lng:   -0.13, pop:  9.0, threatScore: 38, note: "Intelligence hub; ongoing espionage operations" },
  { name: "Paris",          country: "France",        flag: "🇫🇷", lat:  48.86, lng:    2.35, pop: 11.1, threatScore: 44, note: "Jihadist cell activity; intelligence services on alert" },
  { name: "Berlin",         country: "Germany",       flag: "🇩🇪", lat:  52.52, lng:   13.41, pop:  3.7, threatScore: 36, note: "NATO eastern flank lead; Russian sabotage operations" },
  { name: "Madrid",         country: "Spain",         flag: "🇪🇸", lat:  40.42, lng:   -3.70, pop:  3.3, threatScore: 35, note: "Separatist tension (Catalonia); Islamist threat elevated" },
  { name: "Barcelona",      country: "Spain",         flag: "🇪🇸", lat:  41.39, lng:    2.15, pop:  1.6, threatScore: 32, note: "Catalan independence fault line; tourism soft target" },
  { name: "Rome",           country: "Italy",         flag: "🇮🇹", lat:  41.90, lng:   12.50, pop:  2.9, threatScore: 33, note: "Mafia influence; migration crisis pressure" },
  { name: "Amsterdam",      country: "Netherlands",   flag: "🇳🇱", lat:  52.37, lng:    4.90, pop:  0.9, threatScore: 30, note: "Drug corridor; Moroccan gang warfare ongoing" },
  { name: "Brussels",       country: "Belgium",       flag: "🇧🇪", lat:  50.85, lng:    4.35, pop:  1.2, threatScore: 38, note: "NATO/EU HQ; high-value espionage target" },
  { name: "Vienna",         country: "Austria",       flag: "🇦🇹", lat:  48.21, lng:   16.37, pop:  1.9, threatScore: 28, note: "Neutral intelligence hub; Russian FSB active" },
  { name: "Zurich",         country: "Switzerland",   flag: "🇨🇭", lat:  47.38, lng:    8.54, pop:  0.4, threatScore: 22, note: "Global finance center; ICRC headquarters" },
  { name: "Geneva",         country: "Switzerland",   flag: "🇨🇭", lat:  46.20, lng:    6.15, pop:  0.2, threatScore: 20, note: "UN/WHO HQ; high-value diplomatic target" },
  { name: "Lisbon",         country: "Portugal",      flag: "🇵🇹", lat:  38.72, lng:   -9.14, pop:  0.5, threatScore: 22, note: "Atlantic gateway; NATO southern flank" },
  { name: "Dublin",         country: "Ireland",       flag: "🇮🇪", lat:  53.33, lng:   -6.25, pop:  0.6, threatScore: 20, note: "EU tech hub; US corporate tax base" },

  // ── NORTHERN EUROPE ────────────────────────────────────────────────────────
  { name: "Stockholm",      country: "Sweden",        flag: "🇸🇪", lat:  59.33, lng:   18.07, pop:  1.0, threatScore: 28, note: "NATO new member; Russian Baltic pressure" },
  { name: "Copenhagen",     country: "Denmark",       flag: "🇩🇰", lat:  55.68, lng:   12.57, pop:  0.8, threatScore: 22, note: "Greenland geopolitics; Nordic defense integration" },
  { name: "Oslo",           country: "Norway",        flag: "🇳🇴", lat:  59.91, lng:   10.75, pop:  0.7, threatScore: 20, note: "Energy export hub; Svalbard sovereignty tensions" },
  { name: "Helsinki",       country: "Finland",       flag: "🇫🇮", lat:  60.17, lng:   24.94, pop:  0.7, threatScore: 28, note: "1,340km Russian border; NATO membership 2023" },
  { name: "Reykjavik",      country: "Iceland",       flag: "🇮🇸", lat:  64.13, lng:  -21.82, pop:  0.1, threatScore: 12, note: "Arctic strategic position; NATO air base" },
  { name: "Tallinn",        country: "Estonia",       flag: "🇪🇪", lat:  59.44, lng:   24.75, pop:  0.5, threatScore: 42, note: "NATO frontline; Russian cyber HQ for hybrid ops" },
  { name: "Riga",           country: "Latvia",        flag: "🇱🇻", lat:  56.95, lng:   24.11, pop:  0.6, threatScore: 40, note: "Baltic NATO flank; Russian minority pressure" },
  { name: "Vilnius",        country: "Lithuania",     flag: "🇱🇹", lat:  54.69, lng:   25.28, pop:  0.6, threatScore: 42, note: "Suwalki corridor choke; NATO reinforcement route" },

  // ── EASTERN & CENTRAL EUROPE ───────────────────────────────────────────────
  { name: "Warsaw",         country: "Poland",        flag: "🇵🇱", lat:  52.23, lng:   21.01, pop:  1.8, threatScore: 52, note: "NATO eastern anchor; Ukrainian refugee influx" },
  { name: "Prague",         country: "Czech Rep.",    flag: "🇨🇿", lat:  50.08, lng:   14.44, pop:  1.4, threatScore: 28, note: "Central European hub; Russian disinformation target" },
  { name: "Budapest",       country: "Hungary",       flag: "🇭🇺", lat:  47.50, lng:   19.04, pop:  1.8, threatScore: 32, note: "Orbán-Russia ties; EU democratic backsliding" },
  { name: "Bucharest",      country: "Romania",       flag: "🇷🇴", lat:  44.43, lng:   26.10, pop:  1.8, threatScore: 35, note: "Black Sea NATO anchor; cybercrime hub" },
  { name: "Sofia",          country: "Bulgaria",      flag: "🇧🇬", lat:  42.70, lng:   23.32, pop:  1.2, threatScore: 32, note: "Russian energy dependency; smuggling corridor" },
  { name: "Athens",         country: "Greece",        flag: "🇬🇷", lat:  37.98, lng:   23.73, pop:  3.2, threatScore: 38, note: "Debt dependency; migration crisis frontline" },
  { name: "Belgrade",       country: "Serbia",        flag: "🇷🇸", lat:  44.80, lng:   20.46, pop:  1.7, threatScore: 42, note: "Russia/China alignment; Kosovo fault line" },
  { name: "Zagreb",         country: "Croatia",       flag: "🇭🇷", lat:  45.81, lng:   15.97, pop:  0.8, threatScore: 25, note: "Western Balkans NATO entry; Adriatic gateway" },
  { name: "Sarajevo",       country: "Bosnia",        flag: "🇧🇦", lat:  43.85, lng:   18.36, pop:  0.4, threatScore: 45, note: "Republika Srpska secession risk; Russian influence" },
  { name: "Skopje",         country: "N. Macedonia",  flag: "🇲🇰", lat:  42.00, lng:   21.43, pop:  0.5, threatScore: 32, note: "Balkans stability linchpin; EU accession stalled" },
  { name: "Tirana",         country: "Albania",       flag: "🇦🇱", lat:  41.33, lng:   19.82, pop:  0.9, threatScore: 30, note: "Organized crime; narco-state risk; NATO member" },
  { name: "Kyiv",           country: "Ukraine",       flag: "🇺🇦", lat:  50.45, lng:   30.52, pop:  2.9, threatScore: 94, note: "Active warzone; drone and missile strikes ongoing" },
  { name: "Minsk",          country: "Belarus",       flag: "🇧🇾", lat:  53.90, lng:   27.57, pop:  2.0, threatScore: 68, note: "Lukashenko vassal state; Wagner staging ground" },
  { name: "Chisinau",       country: "Moldova",       flag: "🇲🇩", lat:  47.01, lng:   28.86, pop:  0.7, threatScore: 55, note: "Transnistria frozen conflict; Russian pressure" },

  // ── RUSSIA ─────────────────────────────────────────────────────────────────
  { name: "Moscow",         country: "Russia",        flag: "🇷🇺", lat:  55.75, lng:   37.62, pop: 12.4, threatScore: 78, note: "Nuclear command center; hybrid warfare doctrine active" },
  { name: "St. Petersburg", country: "Russia",        flag: "🇷🇺", lat:  59.95, lng:   30.32, pop:  5.4, threatScore: 62, note: "Baltic Sea strategic port; Wagner/GRU recruitment base" },
  { name: "Novosibirsk",    country: "Russia",        flag: "🇷🇺", lat:  55.01, lng:   82.93, pop:  1.6, threatScore: 42, note: "Siberian industrial hub; military production complex" },
  { name: "Yekaterinburg",  country: "Russia",        flag: "🇷🇺", lat:  56.84, lng:   60.61, pop:  1.4, threatScore: 40, note: "Ural industrial corridor; arms manufacturing" },
  { name: "Vladivostok",    country: "Russia",        flag: "🇷🇺", lat:  43.12, lng:  131.89, pop:  0.6, threatScore: 50, note: "Pacific Fleet HQ; NK-Russia military corridor" },

  // ── CAUCASUS ───────────────────────────────────────────────────────────────
  { name: "Tbilisi",        country: "Georgia",       flag: "🇬🇪", lat:  41.69, lng:   44.83, pop:  1.1, threatScore: 58, note: "Pro-EU uprising 2024; Russian occupation zones" },
  { name: "Yerevan",        country: "Armenia",       flag: "🇦🇲", lat:  40.18, lng:   44.51, pop:  1.1, threatScore: 48, note: "Nagorno-Karabakh lost; Russia-West pivot underway" },
  { name: "Baku",           country: "Azerbaijan",    flag: "🇦🇿", lat:  40.41, lng:   49.87, pop:  2.3, threatScore: 52, note: "Energy corridor; Karabakh expansion; Turkey-Russia nexus" },

  // ── TURKEY ─────────────────────────────────────────────────────────────────
  { name: "Istanbul",       country: "Türkiye",       flag: "🇹🇷", lat:  41.01, lng:   28.97, pop: 15.5, threatScore: 62, note: "Bosphorus chokepoint; Kurdish-Turkish conflict" },
  { name: "Ankara",         country: "Türkiye",       flag: "🇹🇷", lat:  39.93, lng:   32.86, pop:  5.5, threatScore: 55, note: "NATO pivot power; mediates Russia-Ukraine" },

  // ── MIDDLE EAST ────────────────────────────────────────────────────────────
  { name: "Baghdad",        country: "Iraq",          flag: "🇮🇶", lat:  33.34, lng:   44.40, pop:  7.3, threatScore: 80, note: "PMF Iran proxies active; ISIS resurgence risk" },
  { name: "Tehran",         country: "Iran",          flag: "🇮🇷", lat:  35.69, lng:   51.39, pop:  9.3, threatScore: 88, note: "Proxy network active; nuclear program accelerating" },
  { name: "Tel Aviv",       country: "Israel",        flag: "🇮🇱", lat:  32.08, lng:   34.78, pop:  4.2, threatScore: 82, note: "Multi-front conflict active; Iron Dome engaged" },
  { name: "Jerusalem",      country: "Israel",        flag: "🇮🇱", lat:  31.77, lng:   35.22, pop:  0.9, threatScore: 80, note: "Al-Aqsa flashpoint; sovereignty dispute ongoing" },
  { name: "Beirut",         country: "Lebanon",       flag: "🇱🇧", lat:  33.89, lng:   35.50, pop:  2.4, threatScore: 82, note: "Hezbollah state-within-state; post-war reconstruction" },
  { name: "Damascus",       country: "Syria",         flag: "🇸🇾", lat:  33.51, lng:   36.29, pop:  2.5, threatScore: 72, note: "Assad fell Dec 2024; HTS governance; reconstruction chaos" },
  { name: "Amman",          country: "Jordan",        flag: "🇯🇴", lat:  31.96, lng:   35.95, pop:  4.2, threatScore: 45, note: "Stability island; Palestinian refugee burden" },
  { name: "Riyadh",         country: "Saudi Arabia",  flag: "🇸🇦", lat:  24.69, lng:   46.72, pop:  7.7, threatScore: 60, note: "Houthi missile threat; royal succession risk" },
  { name: "Abu Dhabi",      country: "UAE",           flag: "🇦🇪", lat:  24.45, lng:   54.38, pop:  1.5, threatScore: 28, note: "Gulf financial hub; ADNOC strategic asset" },
  { name: "Dubai",          country: "UAE",           flag: "🇦🇪", lat:  25.20, lng:   55.27, pop:  3.6, threatScore: 32, note: "Sanctions evasion hub; financial surveillance focal point" },
  { name: "Doha",           country: "Qatar",         flag: "🇶🇦", lat:  25.29, lng:   51.53, pop:  0.6, threatScore: 30, note: "Al Jazeera; Hamas political office; US CENTCOM base" },
  { name: "Kuwait City",    country: "Kuwait",        flag: "🇰🇼", lat:  29.37, lng:   47.98, pop:  3.1, threatScore: 45, note: "Oil export chokepoint; Iran proximity risk" },
  { name: "Muscat",         country: "Oman",          flag: "🇴🇲", lat:  23.61, lng:   58.59, pop:  1.6, threatScore: 30, note: "Neutral mediator; Hormuz Strait proximity" },
  { name: "Sana'a",         country: "Yemen",         flag: "🇾🇪", lat:  15.35, lng:   44.21, pop:  3.9, threatScore: 88, note: "Houthi control; Red Sea shipping attacks ongoing" },
  { name: "Kabul",          country: "Afghanistan",   flag: "🇦🇫", lat:  34.53, lng:   69.17, pop:  4.6, threatScore: 89, note: "Taliban control; ISKP operations ongoing" },
  { name: "Pyongyang",      country: "N. Korea",      flag: "🇰🇵", lat:  39.03, lng:  125.75, pop:  3.0, threatScore: 91, note: "ICBM tests continuous; total information blackout" },

  // ── CENTRAL ASIA ───────────────────────────────────────────────────────────
  { name: "Almaty",         country: "Kazakhstan",    flag: "🇰🇿", lat:  43.24, lng:   76.89, pop:  2.1, threatScore: 40, note: "2022 uprising suppressed; China-Russia buffer" },
  { name: "Astana",         country: "Kazakhstan",    flag: "🇰🇿", lat:  51.16, lng:   71.45, pop:  1.3, threatScore: 35, note: "SCO/CSTO member; energy transit hub" },
  { name: "Tashkent",       country: "Uzbekistan",    flag: "🇺🇿", lat:  41.30, lng:   69.24, pop:  2.7, threatScore: 40, note: "Central Asia pivot; post-Soviet transition" },
  { name: "Bishkek",        country: "Kyrgyzstan",    flag: "🇰🇬", lat:  42.87, lng:   74.59, pop:  1.1, threatScore: 38, note: "Revolution-prone; Russian military base" },
  { name: "Dushanbe",       country: "Tajikistan",    flag: "🇹🇯", lat:  38.56, lng:   68.77, pop:  0.9, threatScore: 42, note: "Afghan border; drug transit; authoritarian" },
  { name: "Ashgabat",       country: "Turkmenistan",  flag: "🇹🇲", lat:  37.95, lng:   58.38, pop:  0.8, threatScore: 35, note: "Gas wealth; total information isolation" },
  { name: "Ulaanbaatar",    country: "Mongolia",      flag: "🇲🇳", lat:  47.91, lng:  106.88, pop:  1.6, threatScore: 28, note: "China-Russia sandwich state; critical minerals" },

  // ── NORTH AFRICA ───────────────────────────────────────────────────────────
  { name: "Cairo",          country: "Egypt",         flag: "🇪🇬", lat:  30.06, lng:   31.25, pop: 21.7, threatScore: 58, note: "Sinai insurgency; Nile dam standoff ongoing" },
  { name: "Tripoli",        country: "Libya",         flag: "🇱🇾", lat:  32.90, lng:   13.18, pop:  1.2, threatScore: 72, note: "Parallel governments; Wagner/Turkey proxy conflict" },
  { name: "Tunis",          country: "Tunisia",       flag: "🇹🇳", lat:  36.82, lng:   10.18, pop:  2.3, threatScore: 45, note: "Saied autocratization; migration route hub" },
  { name: "Algiers",        country: "Algeria",       flag: "🇩🇿", lat:  36.74, lng:    3.06, pop:  3.4, threatScore: 48, note: "Hirak protest movement; Sahel instability" },
  { name: "Casablanca",     country: "Morocco",       flag: "🇲🇦", lat:  33.59, lng:   -7.62, pop:  3.8, threatScore: 35, note: "Western Sahara dispute; migration pressure" },
  { name: "Rabat",          country: "Morocco",       flag: "🇲🇦", lat:  34.02, lng:   -6.84, pop:  1.9, threatScore: 32, note: "Abraham Accords normalization; Sahel buffer" },

  // ── WEST AFRICA ────────────────────────────────────────────────────────────
  { name: "Lagos",          country: "Nigeria",       flag: "🇳🇬", lat:   6.52, lng:    3.38, pop: 15.9, threatScore: 67, note: "ISWAP/Boko Haram; oil facility sabotage risk" },
  { name: "Abuja",          country: "Nigeria",       flag: "🇳🇬", lat:   9.06, lng:    7.50, pop:  3.6, threatScore: 60, note: "Coup-adjacent; northwest bandit insurgency" },
  { name: "Accra",          country: "Ghana",         flag: "🇬🇭", lat:   5.56, lng:   -0.20, pop:  3.6, threatScore: 35, note: "Sahel spillover risk; oil revenue declining" },
  { name: "Abidjan",        country: "Côte d'Ivoire", flag: "🇨🇮", lat:   5.36, lng:   -4.01, pop:  5.4, threatScore: 45, note: "Coup belt adjacency; cocoa/oil wealth target" },
  { name: "Dakar",          country: "Senegal",       flag: "🇸🇳", lat:  14.69, lng:  -17.44, pop:  3.9, threatScore: 38, note: "West Africa's most stable democracy; Wagner regional" },
  { name: "Bamako",         country: "Mali",          flag: "🇲🇱", lat:  12.65, lng:   -8.00, pop:  2.7, threatScore: 78, note: "Junta; Wagner/Russian forces replacing French" },
  { name: "Ouagadougou",    country: "Burkina Faso",  flag: "🇧🇫", lat:  12.37, lng:   -1.53, pop:  3.2, threatScore: 82, note: "Jihadist control of ~40% territory; two coups 2022" },
  { name: "Niamey",         country: "Niger",         flag: "🇳🇪", lat:  13.51, lng:    2.12, pop:  1.3, threatScore: 78, note: "Military coup 2023; US expelled; uranium at stake" },
  { name: "N'Djamena",      country: "Chad",          flag: "🇹🇩", lat:  12.11, lng:   15.04, pop:  1.6, threatScore: 65, note: "Sahel pivot state; Déby dynasty; Sudan spillover" },
  { name: "Conakry",        country: "Guinea",        flag: "🇬🇳", lat:   9.56, lng:  -13.68, pop:  2.0, threatScore: 55, note: "Military junta 2021; bauxite export risk" },

  // ── EAST AFRICA ────────────────────────────────────────────────────────────
  { name: "Khartoum",       country: "Sudan",         flag: "🇸🇩", lat:  15.55, lng:   32.53, pop:  6.2, threatScore: 90, note: "SAF vs RSF civil war; humanitarian catastrophe" },
  { name: "Addis Ababa",    country: "Ethiopia",      flag: "🇪🇹", lat:   9.03, lng:   38.74, pop:  5.0, threatScore: 62, note: "Tigray post-war fragility; Nile dam tensions" },
  { name: "Nairobi",        country: "Kenya",         flag: "🇰🇪", lat:  -1.29, lng:   36.82, pop:  4.9, threatScore: 52, note: "Al-Shabaab attack risk; regional stability hub" },
  { name: "Mogadishu",      country: "Somalia",       flag: "🇸🇴", lat:   2.05, lng:   45.34, pop:  2.6, threatScore: 92, note: "Al-Shabaab active; piracy in Gulf of Aden" },
  { name: "Kampala",        country: "Uganda",        flag: "🇺🇬", lat:   0.32, lng:   32.58, pop:  3.6, threatScore: 50, note: "ADF insurgency; Museveni authoritarian entrenchment" },
  { name: "Kigali",         country: "Rwanda",        flag: "🇷🇼", lat:  -1.95, lng:   30.06, pop:  1.4, threatScore: 38, note: "M23 proxy conflict in eastern DRC; stable internally" },
  { name: "Dar es Salaam",  country: "Tanzania",      flag: "🇹🇿", lat:  -6.79, lng:   39.21, pop:  7.0, threatScore: 38, note: "Mozambique spillover; port trade hub" },
  { name: "Djibouti City",  country: "Djibouti",      flag: "🇩🇯", lat:  11.59, lng:   43.15, pop:  0.6, threatScore: 48, note: "US/China/French/Japanese bases; Horn chokepoint" },

  // ── CENTRAL AFRICA ─────────────────────────────────────────────────────────
  { name: "Kinshasa",       country: "DR Congo",      flag: "🇨🇩", lat:  -4.32, lng:   15.32, pop: 17.1, threatScore: 75, note: "M23 eastern war; mineral wealth conflicts" },
  { name: "Luanda",         country: "Angola",        flag: "🇦🇴", lat:  -8.84, lng:   13.23, pop:  8.9, threatScore: 48, note: "Post-war oil state; China debt dependency" },
  { name: "Yaoundé",        country: "Cameroon",      flag: "🇨🇲", lat:   3.87, lng:   11.52, pop:  4.5, threatScore: 52, note: "Anglophone crisis; Boko Haram northern threat" },

  // ── SOUTHERN AFRICA ────────────────────────────────────────────────────────
  { name: "Johannesburg",   country: "South Africa",  flag: "🇿🇦", lat: -26.20, lng:   28.04, pop:  5.6, threatScore: 58, note: "Load-shedding collapse; ANC coalition fragility" },
  { name: "Cape Town",      country: "South Africa",  flag: "🇿🇦", lat: -33.93, lng:   18.42, pop:  4.6, threatScore: 45, note: "Water crisis precedent; gang violence endemic" },
  { name: "Harare",         country: "Zimbabwe",      flag: "🇿🇼", lat: -17.83, lng:   31.05, pop:  1.6, threatScore: 58, note: "Currency collapse chronic; Mnangagwa authoritarian" },
  { name: "Lusaka",         country: "Zambia",        flag: "🇿🇲", lat: -15.42, lng:   28.28, pop:  2.7, threatScore: 40, note: "Copper belt; China debt; IMF program active" },
  { name: "Maputo",         country: "Mozambique",    flag: "🇲🇿", lat: -25.97, lng:   32.58, pop:  1.1, threatScore: 52, note: "Cabo Delgado ISIS affiliate; post-election violence" },

  // ── SOUTH ASIA ─────────────────────────────────────────────────────────────
  { name: "Delhi",          country: "India",         flag: "🇮🇳", lat:  28.61, lng:   77.21, pop: 32.9, threatScore: 55, note: "Border tensions with China/Pakistan; nuclear doctrine revision" },
  { name: "Mumbai",         country: "India",         flag: "🇮🇳", lat:  19.08, lng:   72.88, pop: 20.7, threatScore: 48, note: "Financial hub; 26/11 attack legacy; LeT threat" },
  { name: "Bangalore",      country: "India",         flag: "🇮🇳", lat:  12.97, lng:   77.56, pop: 12.8, threatScore: 32, note: "Tech corridor; water crisis 2024 precedent" },
  { name: "Kolkata",        country: "India",         flag: "🇮🇳", lat:  22.57, lng:   88.36, pop: 14.9, threatScore: 38, note: "Bangladesh border; climate flood exposure" },
  { name: "Chennai",        country: "India",         flag: "🇮🇳", lat:  13.08, lng:   80.27, pop:  7.1, threatScore: 32, note: "Semiconductor manufacturing ambition; cyclone risk" },
  { name: "Islamabad",      country: "Pakistan",      flag: "🇵🇰", lat:  33.72, lng:   73.06, pop:  2.2, threatScore: 74, note: "Nuclear arsenal; Taliban border activity elevated" },
  { name: "Karachi",        country: "Pakistan",      flag: "🇵🇰", lat:  24.86, lng:   67.01, pop: 14.9, threatScore: 68, note: "Ethnic violence; TTP attacks; economic fragility" },
  { name: "Lahore",         country: "Pakistan",      flag: "🇵🇰", lat:  31.55, lng:   74.34, pop: 13.1, threatScore: 62, note: "India border; political violence; TTP proximity" },
  { name: "Dhaka",          country: "Bangladesh",    flag: "🇧🇩", lat:  23.74, lng:   90.39, pop: 21.7, threatScore: 55, note: "Political instability; climate flood exposure" },
  { name: "Colombo",        country: "Sri Lanka",     flag: "🇱🇰", lat:   6.93, lng:   79.85, pop:  0.8, threatScore: 35, note: "Post-debt-default recovery; China port influence" },
  { name: "Kathmandu",      country: "Nepal",         flag: "🇳🇵", lat:  27.71, lng:   85.32, pop:  1.4, threatScore: 35, note: "China-India squeeze state; earthquake risk" },

  // ── SOUTHEAST ASIA ─────────────────────────────────────────────────────────
  { name: "Bangkok",        country: "Thailand",      flag: "🇹🇭", lat:  13.75, lng:  100.52, pop: 10.7, threatScore: 40, note: "Military-monarchy stability; Myanmar spillover" },
  { name: "Yangon",         country: "Myanmar",       flag: "🇲🇲", lat:  16.87, lng:   96.19, pop:  7.3, threatScore: 77, note: "Military junta; resistance forces advancing" },
  { name: "Naypyidaw",      country: "Myanmar",       flag: "🇲🇲", lat:  19.76, lng:   96.08, pop:  1.2, threatScore: 75, note: "Junta capital; military losing territorial control" },
  { name: "Phnom Penh",     country: "Cambodia",      flag: "🇰🇭", lat:  11.56, lng:  104.92, pop:  2.3, threatScore: 38, note: "Hun Sen dynasty; China REAM naval base" },
  { name: "Vientiane",      country: "Laos",          flag: "🇱🇦", lat:  17.97, lng:  102.60, pop:  0.8, threatScore: 32, note: "Chinese BRI debt trap; landlocked dependency" },
  { name: "Hanoi",          country: "Vietnam",       flag: "🇻🇳", lat:  21.03, lng:  105.85, pop:  5.2, threatScore: 38, note: "South China Sea disputes; manufacturing FDI surge" },
  { name: "Ho Chi Minh City", country: "Vietnam",     flag: "🇻🇳", lat:  10.78, lng:  106.69, pop:  9.3, threatScore: 35, note: "Economic powerhouse; US-China decoupling beneficiary" },
  { name: "Kuala Lumpur",   country: "Malaysia",      flag: "🇲🇾", lat:   3.14, lng:  101.69, pop:  1.8, threatScore: 30, note: "South China Sea EEZ disputed; political coalition fragile" },
  { name: "Singapore",      country: "Singapore",     flag: "🇸🇬", lat:   1.35, lng:  103.82, pop:  5.9, threatScore: 22, note: "Malacca chokepoint; stable but geopolitically watched" },
  { name: "Jakarta",        country: "Indonesia",     flag: "🇮🇩", lat:  -6.21, lng:  106.85, pop: 10.6, threatScore: 42, note: "Sinking capital (relocating); Islamist extremism" },
  { name: "Manila",         country: "Philippines",   flag: "🇵🇭", lat:  14.59, lng:  120.98, pop: 13.9, threatScore: 55, note: "South China Sea WPS confrontations; Abu Sayyaf active" },

  // ── EAST ASIA ──────────────────────────────────────────────────────────────
  { name: "Beijing",        country: "China",         flag: "🇨🇳", lat:  39.91, lng:  116.39, pop: 21.5, threatScore: 72, note: "PLAN expansion; Taiwan Strait tension elevated" },
  { name: "Shanghai",       country: "China",         flag: "🇨🇳", lat:  31.22, lng:  121.46, pop: 24.9, threatScore: 60, note: "Financial hub; tech decoupling target" },
  { name: "Guangzhou",      country: "China",         flag: "🇨🇳", lat:  23.13, lng:  113.26, pop: 16.1, threatScore: 52, note: "Manufacturing corridor; export dependency" },
  { name: "Shenzhen",       country: "China",         flag: "🇨🇳", lat:  22.54, lng:  114.06, pop: 13.4, threatScore: 50, note: "Tech capital; HK proximity; export control target" },
  { name: "Chengdu",        country: "China",         flag: "🇨🇳", lat:  30.66, lng:  104.07, pop:  9.0, threatScore: 42, note: "PLA Western Theater Command; Tibet/Taiwan logistics" },
  { name: "Wuhan",          country: "China",         flag: "🇨🇳", lat:  30.59, lng:  114.31, pop:  8.3, threatScore: 45, note: "COVID origin; WIV biosafety concern ongoing" },
  { name: "Hong Kong",      country: "China (SAR)",   flag: "🇭🇰", lat:  22.30, lng:  114.18, pop:  7.5, threatScore: 62, note: "NSL post-autonomy; financial hub under pressure" },
  { name: "Tokyo",          country: "Japan",         flag: "🇯🇵", lat:  35.69, lng:  139.69, pop: 13.9, threatScore: 35, note: "NK missile overflight corridor; seismic zone" },
  { name: "Osaka",          country: "Japan",         flag: "🇯🇵", lat:  34.69, lng:  135.50, pop:  2.8, threatScore: 25, note: "Industrial hub; Nankai Trough earthquake risk" },
  { name: "Seoul",          country: "S. Korea",      flag: "🇰🇷", lat:  37.57, lng:  126.98, pop:  9.7, threatScore: 71, note: "NK artillery range; chemical weapon threat" },
  { name: "Taipei",         country: "Taiwan",        flag: "🇹🇼", lat:  25.03, lng:  121.56, pop:  2.7, threatScore: 85, note: "PRC military pressure; strait crossing rehearsals" },

  // ── OCEANIA ────────────────────────────────────────────────────────────────
  { name: "Sydney",         country: "Australia",     flag: "🇦🇺", lat: -33.87, lng:  151.21, pop:  5.3, threatScore: 25, note: "AUKUS submarine program; South China Sea tension" },
  { name: "Melbourne",      country: "Australia",     flag: "🇦🇺", lat: -37.81, lng:  144.96, pop:  5.1, threatScore: 22, note: "Chinese diaspora influence ops; financial hub" },
  { name: "Brisbane",       country: "Australia",     flag: "🇦🇺", lat: -27.47, lng:  153.02, pop:  2.6, threatScore: 18, note: "AUKUS logistics; Pacific island chain proximity" },
  { name: "Perth",          country: "Australia",     flag: "🇦🇺", lat: -31.95, lng:  115.86, pop:  2.1, threatScore: 18, note: "Indian Ocean gateway; critical minerals export" },
  { name: "Auckland",       country: "New Zealand",   flag: "🇳🇿", lat: -36.87, lng:  174.77, pop:  1.7, threatScore: 20, note: "Five Eyes member; Pacific climate displacement" },
  { name: "Wellington",     country: "New Zealand",   flag: "🇳🇿", lat: -41.29, lng:  174.78, pop:  0.4, threatScore: 18, note: "GCSB signals intelligence hub; seismic risk" },
  { name: "Port Moresby",   country: "Papua New Guinea", flag: "🇵🇬", lat:  -9.44, lng:  147.18, pop:  0.4, threatScore: 42, note: "Gang violence; US-China Pacific competition" },
];
