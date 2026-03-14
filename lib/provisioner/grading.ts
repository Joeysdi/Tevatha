// lib/provisioner/grading.ts
import type { GradeLevel } from "@/types/treasury";

// ── Five grading layers (mirrors Sanctuary Five-Layer Doctrine) ─────────

export type GradingLayer =
  | "durability"
  | "grid_independence"
  | "field_repairability"
  | "value_density"
  | "supply_chain_resilience";

export interface LayerScore {
  layer:  GradingLayer;
  score:  number;   // 0–100
  weight: number;   // decimal, sum = 1.0
  note:   string;
}

export interface AssetGrade {
  productId:    string;
  grade:        GradeLevel;
  composite:    number;      // 0–100 weighted composite
  layers:       LayerScore[];
  certifiedAt:  string;      // ISO date
  failureFlags: string[];    // any zero-tolerance failures
}

// Layer weights — NEVER change without board sign-off
const WEIGHTS: Record<GradingLayer, number> = {
  durability:                0.30,
  grid_independence:         0.30,
  field_repairability:       0.20,
  value_density:             0.10,
  supply_chain_resilience:   0.10,
};

// Zero-tolerance failure conditions
const ZERO_TOLERANCE: Record<GradingLayer, (score: number) => boolean> = {
  durability:              (s) => s < 40,
  grid_independence:       (s) => s < 50,   // grid-dep items cannot pass
  field_repairability:     (s) => s < 20,
  value_density:           (_) => false,
  supply_chain_resilience: (_) => false,
};

export function computeAssetGrade(
  productId: string,
  layerInputs: Record<GradingLayer, { score: number; note: string }>
): AssetGrade {
  const layers: LayerScore[] = (
    Object.keys(WEIGHTS) as GradingLayer[]
  ).map((layer) => ({
    layer,
    score:  layerInputs[layer].score,
    weight: WEIGHTS[layer],
    note:   layerInputs[layer].note,
  }));

  const composite = Math.round(
    layers.reduce((sum, l) => sum + l.score * l.weight, 0)
  );

  const failureFlags: string[] = layers
    .filter((l) => ZERO_TOLERANCE[l.layer](l.score))
    .map((l) => `${l.layer} score ${l.score} fails zero-tolerance threshold`);

  // Grade assignment — F if any zero-tolerance flag fires
  const grade: GradeLevel =
    failureFlags.length > 0 ? "F"
    : composite >= 90       ? "A"
    : composite >= 75       ? "B"
    : composite >= 60       ? "C"
    : composite >= 45       ? "D"
    :                         "F";

  return {
    productId,
    grade,
    composite,
    layers,
    certifiedAt: new Date().toISOString().slice(0, 10),
    failureFlags,
  };
}

// Grade display metadata
export const GRADE_META: Record<GradeLevel, {
  label:      string;
  color:      string;
  bg:         string;
  border:     string;
  verdict:    string;
}> = {
  A: { label:"A — ARK ESSENTIAL",  color:"#1ae8a0", bg:"rgba(26,232,160,0.1)",  border:"rgba(26,232,160,0.25)", verdict:"Mission-critical. Deploy immediately."                       },
  B: { label:"B — CERTIFIED",      color:"#c9a84c", bg:"rgba(201,168,76,0.1)",  border:"rgba(201,168,76,0.25)", verdict:"Approved. Deploy in context of need."                        },
  C: { label:"C — CONDITIONAL",    color:"#f0a500", bg:"rgba(240,165,0,0.1)",   border:"rgba(240,165,0,0.25)",  verdict:"Use only when A/B equivalent unavailable."                  },
  D: { label:"D — CONTINGENCY",    color:"#e84040", bg:"rgba(232,64,64,0.1)",   border:"rgba(232,64,64,0.25)",  verdict:"Last resort only. Known failure modes documented."           },
  F: { label:"F — REJECTED",       color:"#ff0055", bg:"rgba(255,0,85,0.1)",    border:"rgba(255,0,85,0.25)",   verdict:"Does not meet Tevatha minimum. Not stocked."                 },
};
