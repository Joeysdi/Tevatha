// lib/watchtower/gate-pins.ts
export interface GatePin {
  gateId: string;
  lat:    number;
  lng:    number;
  label:  string;
}

export const GATE_PINS: GatePin[] = [
  { gateId:"G1", lat:  38.7,  lng: -104.8, label:"G1 · NUCLEAR"  }, // Cheyenne Mtn
  { gateId:"G2", lat:  36.00, lng:  -80.00, label:"G2 · DEFCON"   }, // Pentagon (spread south)
  { gateId:"G3", lat:  50.88, lng:    4.43, label:"G3 · NATO A5"  }, // Brussels
  { gateId:"G4", lat:  40.71, lng:  -74.01, label:"G4 · BAIL-IN"  }, // Wall Street
  { gateId:"G5", lat:  41.87, lng:  -87.62, label:"G5 · CLOCK75"  }, // Chicago (BAS)
  { gateId:"G6", lat:  46.23, lng:    6.10, label:"G6 · WHO PHEIC"}, // Geneva
  { gateId:"G7", lat:  45.50, lng:  -73.57, label:"G7 · REPO"     }, // NY Fed (spread to Montreal)
  { gateId:"G8", lat:  54.50, lng:   18.00, label:"G8 · CBDC"     }, // Strasbourg (spread to Gdansk)
];
