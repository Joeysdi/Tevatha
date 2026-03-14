// components/watchtower/collapse-matrix-row.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { CollapseClass, SevCode } from "@/lib/watchtower/data";

const SEV_LABELS: Record<SevCode, string> = {
  EX: "EXISTENTIAL",
  CR: "CRITICAL",
  HI: "HIGH",
  EL: "ELEVATED",
  ME: "MEDIUM",
};

const SEV_STYLES: Record<SevCode, string> = {
  EX: "bg-[rgba(255,0,85,0.18)] text-[#ff0055] border border-[rgba(255,0,85,0.3)]",
  CR: "bg-red-dim text-red-bright border border-red-protocol/28",
  HI: "bg-amber-dim text-amber-protocol border border-amber-DEFAULT/26",
  EL: "bg-blue-dim text-blue-DEFAULT border border-blue-DEFAULT/22",
  ME: "bg-[rgba(168,85,247,0.12)] text-purple-DEFAULT border border-purple-DEFAULT/22",
};

interface MatrixRowProps {
  row: CollapseClass;
}

export function CollapseMatrixRow({ row }: MatrixRowProps) {
  const [barWidth, setBarWidth] = useState(0);
  const ref = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBarWidth(row.prob); },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [row.prob]);

  const barColor = row.prob >= 60 ? "#e84040" : row.prob >= 40 ? "#f0a500" : "#38bdf8";

  return (
    <tr ref={ref} className="border-b border-white/[0.04] hover:bg-white/[0.018] transition-colors">
      <td className="px-3.5 py-2.5">
        <span className="font-mono text-gold-protocol font-bold">{row.cls}</span>
      </td>
      <td className="px-3.5 py-2.5 font-medium text-text-base text-[12.5px]">
        {row.name}
      </td>
      <td className="px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-[80px] h-[4px] rounded-sm bg-white/[0.07] overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-sm"
              style={{
                width: `${barWidth}%`,
                background: barColor,
                transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
          <span
            className="font-mono text-[12px] font-bold tabular-nums"
            style={{ color: barColor }}
          >
            {row.prob}%
          </span>
        </div>
      </td>
      <td className="px-3.5 py-2.5">
        <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9.5px] font-bold tracking-[.06em] ${SEV_STYLES[row.sev]}`}>
          {SEV_LABELS[row.sev]}
        </span>
      </td>
      <td className="px-3.5 py-2.5">
        <span className="font-mono text-text-mute2 text-[11px]">{row.n}</span>
      </td>
    </tr>
  );
}
