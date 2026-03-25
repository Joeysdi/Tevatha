// lib/watchtower/gate-pins.ts
export interface GatePin {
  gateId: string;
  lat:    number;
  lng:    number;
  label:  string;
}

export const GATE_PINS: GatePin[] = [
  { gateId:"G1", lat:  38.7,  lng: -104.8, label:"G1 · NUCLEAR"  }, // Cheyenne Mtn
  { gateId:"G2", lat:  38.87, lng:  -77.06, label:"G2 · DEFCON"   }, // Pentagon
  { gateId:"G3", lat:  50.88, lng:    4.43, label:"G3 · NATO A5"  }, // Brussels
  { gateId:"G4", lat:  40.71, lng:  -74.01, label:"G4 · BAIL-IN"  }, // Wall Street
  { gateId:"G5", lat:  41.87, lng:  -87.62, label:"G5 · CLOCK75"  }, // Chicago (BAS)
  { gateId:"G6", lat:  46.23, lng:    6.10, label:"G6 · WHO PHEIC"}, // Geneva
  { gateId:"G7", lat:  40.75, lng:  -73.98, label:"G7 · REPO"     }, // NY Fed
  { gateId:"G8", lat:  48.60, lng:    7.77, label:"G8 · CBDC"     }, // Strasbourg
];
