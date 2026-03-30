// lib/watchtower/signal-pins.ts
// Geographic anchors for SIGNALS — each pin matches by index into the SIGNALS array.

export interface SignalPin {
  sigIndex: number;   // index into SIGNALS array
  lat:      number;
  lng:      number;
  label:    string;   // short globe label
  colKey:   "red" | "warn" | "info";
  domainId: string;
}

export const SIGNAL_PINS: SignalPin[] = [
  { sigIndex:  0, lat: 38.9,  lng: -77.0,  label: "DOOMSDAY 85s",      colKey: "red",  domainId: "nuclear"  }, // Washington DC — Doomsday Clock
  { sigIndex:  1, lat: 55.75, lng: 37.62,  label: "NEW START ✕",       colKey: "red",  domainId: "nuclear"  }, // Moscow — New START expiry
  { sigIndex:  2, lat: 39.9,  lng: 116.4,  label: "SALT TYPHOON",      colKey: "red",  domainId: "cyber"    }, // Beijing — Salt Typhoon
  { sigIndex:  3, lat: 38.9,  lng: -77.0,  label: "VOLT TYPHOON",      colKey: "red",  domainId: "cyber"    }, // Washington DC — Volt Typhoon target
  { sigIndex:  4, lat: 38.9,  lng: -77.0,  label: "$38.4T DEBT",       colKey: "warn", domainId: "economic" }, // Washington DC — US debt
  { sigIndex:  5, lat: 43.0,  lng: 87.0,   label: "CHINA SILOS",       colKey: "red",  domainId: "nuclear"  }, // Xinjiang — ICBM silo construction
  { sigIndex:  6, lat: 24.0,  lng: 120.0,  label: "TAIWAN BLOCKADE",   colKey: "red",  domainId: "civil"    }, // Taiwan Strait
  { sigIndex:  7, lat: 55.75, lng: 37.62,  label: "RUSSIA DOCTRINE",   colKey: "warn", domainId: "nuclear"  }, // Moscow — nuclear doctrine
  { sigIndex:  8, lat: 38.9,  lng: -77.0,  label: "CBO 120% GDP",      colKey: "warn", domainId: "economic" }, // Washington DC — CBO forecast
  { sigIndex:  9, lat: 42.0,  lng: -93.0,  label: "H5N1 DAIRY BELT",   colKey: "warn", domainId: "bio"      }, // Iowa — H5N1 dairy herds
  { sigIndex: 10, lat: 32.1,  lng: 34.8,   label: "AI KILL-CHAIN",     colKey: "warn", domainId: "cyber"    }, // Tel Aviv — Lavender/Habsora
  { sigIndex: 11, lat: 48.0,  lng: 37.8,   label: "UKRAINE FRONT",     colKey: "red",  domainId: "civil"    }, // Donbas
  { sigIndex: 12, lat: 28.6,  lng: 77.2,   label: "MPXV INDIA",        colKey: "warn", domainId: "bio"      }, // New Delhi — recombinant MPXV
  { sigIndex: 13, lat: 80.0,  lng: 0.0,    label: "ARCTIC ICE LOW",    colKey: "info", domainId: "climate"  }, // Arctic
  { sigIndex: 14, lat: 39.9,  lng: 116.4,  label: "e-CNY $986B",       colKey: "info", domainId: "economic" }, // Beijing — CBDC
  { sigIndex: 15, lat: 10.0,  lng: 20.0,   label: "96M HUNGRY",        colKey: "warn", domainId: "climate"  }, // Sahel/Chad
];
