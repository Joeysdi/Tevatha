// components/watchtower/domain-live-feed-card.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchLivePrices, type LivePrices, type AssetPrice } from "@/lib/watchtower/prices-fetch";
import { filterNewsByDomain, DOMAIN_ASSETS } from "@/lib/watchtower/domain-live-feed";
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import { relativeTime } from "@/lib/watchtower/relative-time";

const TIER_HEX: Record<string, string> = {
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8", t1: "#1ae8a0",
};

const ASSET_LABELS: Record<string, string> = {
  xau:    "XAU",
  wti:    "WTI",
  btc:    "BTC",
  usdRub: "USD/RUB",
};

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function PriceRow({
  assetKey,
  price,
}: {
  assetKey: string;
  price: AssetPrice | undefined;
}) {
  const label = ASSET_LABELS[assetKey] ?? assetKey.toUpperCase();
  const ok    = price?.ok ?? false;
  const val   = price?.price ?? 0;
  const chg   = price?.change ?? 0;

  let displayVal = "--";
  if (ok) {
    if (assetKey === "btc")    displayVal = `$${fmt(val, 0)}`;
    else if (assetKey === "usdRub") displayVal = fmt(val, 2);
    else                       displayVal = `$${fmt(val, 2)}`;
  }

  const up  = chg > 0;
  const col = up ? "#1ae8a0" : "#e84040";

  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="font-mono text-[8.5px] text-text-mute2/70 tracking-[.08em]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className="font-mono text-[9px] tabular-nums font-bold"
          style={{ color: ok ? "#c9c9c9" : "rgba(150,165,180,0.35)" }}
        >
          {displayVal}
        </span>
        {ok && assetKey !== "usdRub" && chg !== 0 && (
          <span className="font-mono text-[8px]" style={{ color: col }}>
            {up ? "▲" : "▼"}{Math.abs(chg).toFixed(2)}%
          </span>
        )}
        {!ok && (
          <span className="font-mono text-[8px] text-text-mute2/30">--</span>
        )}
      </div>
    </div>
  );
}

interface DomainLiveFeedCardProps {
  domainId:     string;
  newsFeedPins: NewsFeedPin[];
  onNewsClick:  (newsId: string) => void;
  col:          string;
  compact?:     boolean;
}

export function DomainLiveFeedCard({
  domainId,
  newsFeedPins,
  onNewsClick,
  col,
  compact = false,
}: DomainLiveFeedCardProps) {
  const [prices, setPrices] = useState<LivePrices | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const p = await fetchLivePrices();
        if (!cancelled) setPrices(p);
      } catch {
        // stay null (skeleton shows)
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const allFiltered = filterNewsByDomain(newsFeedPins, domainId);
  const filtered    = compact ? allFiltered.slice(0, 3) : allFiltered;
  const assetKeys   = DOMAIN_ASSETS[domainId] ?? [];

  return (
    <div
      className="rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        background:  "rgba(6,7,14,0.97)",
        border:      `1px solid ${col}44`,
        borderLeft:  `2px solid ${col}`,
        boxShadow:   `0 8px 40px rgba(0,0,0,0.75), 0 0 24px ${col}08`,
        cursor:      "grab",
        width:       288,
      }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />

      <div className="overflow-y-auto" style={{ maxHeight: "72vh" }}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-3.5 pb-1.5 ${compact ? "pt-2" : "pt-2.5"}`}>
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: col, boxShadow: `0 0 5px ${col}` }}
        />
        <span className="font-mono text-[8px] tracking-[.2em] uppercase font-bold" style={{ color: col }}>
          LIVE FEED
        </span>
      </div>

      {/* Divider */}
      <div className="mx-3.5" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* News items */}
      <div className="px-3.5 py-2 space-y-0">
        {filtered.length === 0 ? (
          <p className="font-mono text-[8.5px] text-text-mute2/40 py-1">No feed yet</p>
        ) : (
          filtered.map((pin) => {
            const tierCol = TIER_HEX[pin.tier] ?? "#c9a84c";
            const time    = typeof pin.date === "string" && pin.date.includes("T")
              ? relativeTime(pin.date)
              : pin.date;
            return (
              <button
                key={pin.id}
                onClick={(e) => { e.stopPropagation(); onNewsClick(pin.id); }}
                className="w-full flex items-start gap-1.5 py-1 text-left rounded transition-colors
                           hover:bg-white/[0.04] group"
              >
                <span className="font-mono text-[8px] flex-shrink-0 mt-0.5" style={{ color: col }}>▸</span>
                <span className="font-mono text-[8.5px] text-text-dim leading-snug flex-1 min-w-0 group-hover:text-text-base transition-colors line-clamp-2">
                  {pin.headline}
                </span>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-1">
                  <span className="font-mono text-[7px] text-text-mute2/50">{time}</span>
                  <span
                    className="font-mono text-[6.5px] px-1 py-0.5 rounded border font-bold leading-none"
                    style={{ color: tierCol, borderColor: `${tierCol}40`, background: `${tierCol}12` }}
                  >
                    {pin.tier.toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Price strip */}
      {!compact && assetKeys.length > 0 && (
        <>
          <div className="mx-3.5 mt-1" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          <div className="px-3.5 py-2">
            {assetKeys.map((key) => (
              <PriceRow
                key={key}
                assetKey={key}
                price={prices ? (prices as unknown as Record<string, AssetPrice>)[key] : undefined}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
