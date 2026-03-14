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
    <span className="font-mono text-[11px] text-text-mute2 tabular-nums">
      {utc} UTC
    </span>
  );
}
