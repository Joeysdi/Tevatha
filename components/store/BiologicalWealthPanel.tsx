// components/store/BiologicalWealthPanel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BiologicalWealth, FoodBW, WaterBW, EnergyBW } from "@/lib/store/types";

// ── Shared badge ─────────────────────────────────────────────────────────────

function Badge({
  label,
  color = "text-text-mute2 border-border-protocol",
}: {
  label: string;
  color?: string;
}) {
  return (
    <span
      className={`font-mono text-[9px] px-2 py-0.5 rounded border ${color}`}
    >
      {label}
    </span>
  );
}

// ── Food panel ───────────────────────────────────────────────────────────────

function ShelfLifeBar({ years }: { years: number }) {
  const pct = Math.min(100, (years / 25) * 100);
  const color =
    years >= 20 ? "#1ae8a0" : years >= 10 ? "#c9a84c" : "#f0a500";
  const label =
    years >= 20 ? "LONG-TERM" : years >= 10 ? "MID-TERM" : "SHORT-TERM";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.08em]">
          Shelf Life
        </span>
        <span className="font-mono text-[9px]" style={{ color }}>
          {years}yr · {label}
        </span>
      </div>
      <div className="h-1.5 bg-void-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function FoodPanel({ bw }: { bw: FoodBW }) {
  return (
    <div className="space-y-3">
      {bw.shelf_life_years !== null && (
        <ShelfLifeBar years={bw.shelf_life_years} />
      )}

      <div className="flex flex-wrap gap-1.5">
        {bw.seed_reproducible && (
          <Badge
            label="SEED REPRODUCIBLE"
            color="text-green-bright border-green-bright/30"
          />
        )}
        {bw.preparation && (
          <Badge
            label={bw.preparation.replace(/_/g, " ").toUpperCase()}
            color="text-text-dim border-border-protocol"
          />
        )}
        {bw.dietary_restrictions.map((r) => (
          <Badge key={r} label={r.toUpperCase()} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {bw.calories_per_dollar !== null && (
          <Stat label="Cal / $" value={bw.calories_per_dollar.toFixed(0)} />
        )}
        {bw.calories_per_serving !== null && (
          <Stat label="Cal / Serving" value={bw.calories_per_serving.toFixed(0)} />
        )}
        {bw.protein_g_per_serving !== null && (
          <Stat label="Protein g" value={bw.protein_g_per_serving.toFixed(1)} />
        )}
        {bw.servings_total !== null && (
          <Stat label="Total Servings" value={String(bw.servings_total)} />
        )}
      </div>
    </div>
  );
}

// ── Water panel ──────────────────────────────────────────────────────────────

function WaterPanel({ bw }: { bw: WaterBW }) {
  const micronLabel =
    bw.micron_filtration === null
      ? null
      : bw.micron_filtration <= 0.02
      ? { text: "ABSOLUTE", color: "text-green-bright border-green-bright/30" }
      : bw.micron_filtration <= 0.1
      ? { text: "GENERAL", color: "text-gold-protocol border-gold-protocol/30" }
      : { text: "BASIC", color: "text-text-dim border-border-protocol" };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {micronLabel && (
          <Badge
            label={`${bw.micron_filtration}μm · ${micronLabel.text}`}
            color={micronLabel.color}
          />
        )}
        {bw.removes_viruses && (
          <Badge label="REMOVES VIRUSES" color="text-green-bright border-green-bright/30" />
        )}
        {bw.removes_bacteria && (
          <Badge label="REMOVES BACTERIA" color="text-green-bright border-green-bright/30" />
        )}
        {bw.removes_chemicals && (
          <Badge label="REMOVES CHEMICALS" color="text-cyan-DEFAULT border-cyan-border" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {bw.gpd_purification !== null && (
          <Stat label="GPD" value={String(bw.gpd_purification)} />
        )}
        {bw.total_gallons_lifetime !== null && (
          <Stat label="Lifetime Gal" value={bw.total_gallons_lifetime.toLocaleString()} />
        )}
        {bw.maintenance_interval_days !== null && (
          <Stat label="Maint. (days)" value={String(bw.maintenance_interval_days)} />
        )}
      </div>
    </div>
  );
}

// ── Energy panel ─────────────────────────────────────────────────────────────

function EnergyPanel({ bw }: { bw: EnergyBW }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {bw.emp_shielded && (
          <Badge label="EMP SHIELDED" color="text-[#f0a500] border-[#f0a500]/30" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {bw.watt_hours !== null && (
          <Stat label="Watt Hours" value={bw.watt_hours.toLocaleString()} />
        )}
        {bw.lifecycle_cycles !== null && (
          <Stat label="Cycles" value={bw.lifecycle_cycles.toLocaleString()} />
        )}
        {bw.continuous_watts !== null && (
          <Stat label="Cont. Watts" value={String(bw.continuous_watts)} />
        )}
        {bw.peak_watts !== null && (
          <Stat label="Peak Watts" value={String(bw.peak_watts)} />
        )}
        {bw.charge_time_hours !== null && (
          <Stat label="Charge (hr)" value={String(bw.charge_time_hours)} />
        )}
      </div>
    </div>
  );
}

// ── Shared stat row ───────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[8px] text-text-mute2 uppercase tracking-[.08em]">
        {label}
      </div>
      <div className="font-mono text-[12px] text-text-base tabular-nums font-bold">
        {value}
      </div>
    </div>
  );
}

// ── Main collapsible panel ────────────────────────────────────────────────────

interface BiologicalWealthPanelProps {
  bw: BiologicalWealth;
  defaultOpen?: boolean;
}

export function BiologicalWealthPanel({ bw, defaultOpen = false }: BiologicalWealthPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  const categoryLabel =
    bw.category === "food"
      ? "Food Stats"
      : bw.category === "water"
      ? "Water Stats"
      : "Energy Stats";

  return (
    <div className="border border-border-protocol rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2
                   bg-void-2 hover:bg-void-2/80 transition-colors"
      >
        <span className="font-mono text-[9px] uppercase tracking-[.1em] text-text-mute2">
          Biological Wealth · {categoryLabel}
        </span>
        <span
          className="font-mono text-[10px] text-text-mute2 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-void-1">
              {bw.category === "food"   && <FoodPanel bw={bw} />}
              {bw.category === "water"  && <WaterPanel bw={bw} />}
              {bw.category === "energy" && <EnergyPanel bw={bw} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
