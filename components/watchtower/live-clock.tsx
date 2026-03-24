// components/watchtower/live-clock.tsx
"use client";

import { useState, useEffect } from "react";

export function LiveClock() {
  const [utc, setUtc] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Date().toUTCString().slice(17, 25); // "HH:MM:SS"

    setUtc(fmt());
    const id = setInterval(() => setUtc(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!utc) return null; // Avoid hydration mismatch on first render

  return (
    <div
      className="absolute top-3 right-3 z-20 pointer-events-none
                 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-sm"
      style={{
        background: "rgba(11,13,24,0.80)",
        border:     "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span className="font-mono text-[8px] tracking-[.14em] uppercase text-text-mute2/60">UTC</span>
      <span className="font-mono text-[11px] tabular-nums text-text-dim tracking-[.08em]">{utc}</span>
    </div>
  );
}
