// components/watchtower/gate-table.tsx
"use client";

import { useState } from "react";
import type { DecisionGate, TierClass } from "@/lib/watchtower/data";

const TIER_STYLES: Record<TierClass, string> = {
  t4: "bg-red-protocol/20 text-red-bright",
  t3: "bg-amber-dim text-amber-protocol",
  t2: "bg-blue-dim text-blue-DEFAULT",
  t1: "bg-green-dim text-green-bright",
};

interface GateTableProps {
  gates: DecisionGate[];
}

export function GateTable({ gates }: GateTableProps) {
  const [visible, setVisible] = useState(true);

  return (
    <section className="bg-void-1 border border-border-protocol rounded-[10px] p-4.5 mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-syne font-bold text-base text-text-base">
          Ark Decision Gates
        </h3>
        <button
          onClick={() => setVisible((v) => !v)}
          className="font-mono text-[11px] text-text-mute2 px-2.5 py-1
                     rounded-md bg-void-2 border border-border-protocol
                     hover:text-text-base hover:border-border-hover
                     transition-colors duration-150"
        >
          {visible ? "Hide" : "Show"} All
        </button>
      </div>

      <p className="font-mono text-[11px] text-text-mute2 leading-relaxed mb-4">
        Pre-decided triggers. Do not reason under pressure. When the condition
        is met, execute the action — no deliberation required.
      </p>

      {visible && (
        <div className="overflow-x-auto animate-[fadeUp_0.2s_ease_both]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Gate","Trigger Condition","Window","Tier","Required Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono text-[9.5px] tracking-[.12em]
                               uppercase text-text-mute2 px-3.5 py-2.5
                               border-b border-border-bright whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gates.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.018]
                             transition-colors"
                >
                  <td className="px-3.5 py-2.5">
                    <span className="font-mono text-gold-protocol font-bold text-[12px]">
                      {g.id}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-text-base
                                 text-[12.5px] max-w-[220px]">
                    {g.trigger}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className="font-mono text-[11px] text-text-mute2 whitespace-nowrap">
                      {g.window}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded
                                      font-mono text-[9.5px] font-bold
                                      ${TIER_STYLES[g.tier]}`}>
                      {g.tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-[12px] text-text-dim max-w-[260px]">
                    {g.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
