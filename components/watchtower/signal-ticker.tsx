// components/watchtower/signal-ticker.tsx
"use client";

interface SignalTickerProps {
  text: string;
}

export function SignalTicker({ text }: SignalTickerProps) {
  // Duplicate string for seamless CSS loop
  const doubled = `${text}     ${text}`;

  return (
    <div
      className="flex-shrink-0 overflow-hidden h-7 flex items-center
                 border-b border-red-protocol/15"
      style={{ background: "rgba(232,64,64,0.05)" }}
    >
      <div
        className="inline-flex whitespace-nowrap font-mono text-[10.5px]
                   text-red-bright tracking-[.04em] opacity-80"
        style={{ animation: "ticker 40s linear infinite" }}
        aria-hidden="true"
      >
        {doubled}
      </div>
      {/* Accessible static text for screen readers */}
      <span className="sr-only">
        Doomsday Clock: 85 seconds to midnight — all-time closest.
        Tevatha Watchtower active threat monitoring.
      </span>
    </div>
  );
}
