// components/watchtower/prices-ticker.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchLivePrices, type LivePrices } from "@/lib/watchtower/prices-fetch";

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function ChangeTag({ change, ok }: { change: number; ok: boolean }) {
  if (!ok) return <span className="text-text-mute2/40">--</span>;
  if (change === 0) return <span className="text-text-mute2">0.00%</span>;
  const up  = change > 0;
  const col = up ? "#1ae8a0" : "#e84040";
  return (
    <span style={{ color: col }}>
      {up ? "▲" : "▼"}{Math.abs(change).toFixed(2)}%
    </span>
  );
}

function Cell({
  symbol, price, change, ok, decimals = 2,
}: {
  symbol: string; price: number; change: number; ok: boolean; decimals?: number;
}) {
  return (
    <>
      <span className="text-text-mute2/60">|</span>
      <span className="flex items-center gap-1">
        <span className="text-text-mute2/70 tracking-[.1em]">{symbol}</span>
        <span className={`font-bold tabular-nums ${ok ? "text-text-base" : "text-text-mute2/40"}`}>
          {ok ? (symbol === "BTC" ? `$${fmt(price, 0)}` : `$${fmt(price, decimals)}`) : "--"}
        </span>
        <ChangeTag change={change} ok={ok} />
      </span>
    </>
  );
}

function RubCell({ price, ok }: { price: number; ok: boolean }) {
  return (
    <>
      <span className="text-text-mute2/60">|</span>
      <span className="flex items-center gap-1">
        <span className="text-text-mute2/70 tracking-[.1em]">USD/RUB</span>
        <span className={`font-bold tabular-nums ${ok ? "text-text-base" : "text-text-mute2/40"}`}>
          {ok ? fmt(price, 2) : "--"}
        </span>
      </span>
    </>
  );
}

export function PricesTicker() {
  const [prices, setPrices]       = useState<LivePrices | null>(null);
  const [status, setStatus]       = useState<"loading" | "ok" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const p = await fetchLivePrices();
        if (cancelled) return;
        setPrices(p);
        setStatus("ok");
        setLastUpdate(new Date());
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString("en-US", { hour12: false })
    : null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2
                 px-3 border-t border-border-protocol font-mono text-[9px]"
      style={{
        height: 36,
        background: "rgba(5,8,10,0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Live dot */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            status === "ok" ? "bg-[#1ae8a0] animate-pulse" : "bg-text-mute2/30"
          }`}
        />
        <span className={status === "ok" ? "text-[#1ae8a0]/80" : "text-text-mute2/40"}>
          LIVE
        </span>
      </span>

      {/* Price cells */}
      {prices ? (
        <>
          <Cell symbol="XAU"  price={prices.xau.price}  change={prices.xau.change}  ok={prices.xau.ok}  decimals={2} />
          <Cell symbol="WTI"  price={prices.wti.price}  change={prices.wti.change}  ok={prices.wti.ok}  decimals={2} />
          <Cell symbol="BTC"  price={prices.btc.price}  change={prices.btc.change}  ok={prices.btc.ok}  decimals={0} />
          <RubCell price={prices.usdRub.price} ok={prices.usdRub.ok} />
        </>
      ) : (
        // Skeleton placeholders
        <>
          {["XAU", "WTI", "BTC", "USD/RUB"].map(s => (
            <span key={s} className="flex items-center gap-1">
              <span className="text-text-mute2/60">|</span>
              <span className="text-text-mute2/40 tracking-[.1em]">{s}</span>
              <span className="text-text-mute2/25">--</span>
            </span>
          ))}
        </>
      )}

      {/* Timestamp — pushed to right */}
      <span className="ml-auto flex-shrink-0 text-text-mute2/50">
        {timeStr ? `Updated ${timeStr}` : "Fetching…"}
      </span>
    </div>
  );
}
