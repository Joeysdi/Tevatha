// lib/watchtower/domain-score.ts
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import type { LivePrices } from "@/lib/watchtower/prices-fetch";

export interface DomainScore  { live: number; base: number; delta: number; }
export interface DomainScores { geopolitical: DomainScore; economic: DomainScore; environmental: DomainScore; }

const TIER_W = { t4: 1.0, t3: 0.6, t2: 0.3 } as const;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function pinWeight(pin: NewsFeedPin): number {
  return TIER_W[pin.tier] ?? 0;
}

export function calcDomainScores(pins: NewsFeedPin[], prices: LivePrices): DomainScores {
  const { xau, wti, btc, usdRub, vix } = prices;

  // ── Geopolitical (base 74) ────────────────────────────────────────────────
  const geoCategories = new Set<NewsFeedPin["category"]>(["war", "nuclear", "cyber", "political"]);
  const geoSignal =
    pins
      .filter(p => geoCategories.has(p.category))
      .reduce((sum, p) => sum + pinWeight(p) * 0.25, 0)
    + (xau.ok    ? xau.change                * 0.4  : 0)
    + (wti.ok    ? wti.change                * 0.35 : 0)
    + (usdRub.ok ? (usdRub.price - 85)       * 0.08 : 0);

  const geoBase = 74;
  const geoLive = clamp(Math.round(geoBase + geoSignal), 1, 99);

  // ── Economic (base 67) ────────────────────────────────────────────────────
  const ecoSignal =
    pins
      .filter(p => p.category === "economic")
      .reduce((sum, p) => sum + pinWeight(p) * 0.4, 0)
    + (xau.ok ? xau.change                * 0.5  : 0)
    + (wti.ok ? wti.change                * 0.45 : 0)
    + (btc.ok ? Math.abs(btc.change)      * 0.2  : 0)
    + (vix.ok ? (vix.price - 18)          * 0.35 : 0);

  const ecoBase = 67;
  const ecoLive = clamp(Math.round(ecoBase + ecoSignal), 1, 99);

  // ── Environmental (base 61) ───────────────────────────────────────────────
  const envSignal =
    pins
      .filter(p => p.category === "health")
      .reduce((sum, p) => sum + pinWeight(p) * 1.2, 0)
    + pins
      .filter(p => p.category === "climate")
      .reduce((sum, p) => sum + pinWeight(p) * 0.8, 0)
    + (wti.ok ? wti.change * 0.15 : 0);

  const envBase = 61;
  const envLive = clamp(Math.round(envBase + envSignal), 1, 99);

  return {
    geopolitical:  { live: geoLive, base: geoBase, delta: geoLive - geoBase },
    economic:      { live: ecoLive, base: ecoBase, delta: ecoLive - ecoBase },
    environmental: { live: envLive, base: envBase, delta: envLive - envBase },
  };
}
