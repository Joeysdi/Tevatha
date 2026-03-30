// lib/watchtower/domain-live-feed.ts
import type { NewsFeedPin } from "./news-feed-pins";

/** Which news categories each domain should surface */
export const DOMAIN_NEWS_CATEGORIES: Record<string, NewsFeedPin["category"][]> = {
  geopolitical:  ["nuclear", "war", "political", "cyber"],
  economic:      ["economic"],
  environmental: ["health", "climate"],
};

/** Which LivePrices keys each domain should display (empty = no price strip) */
export const DOMAIN_ASSETS: Record<string, string[]> = {
  geopolitical:  ["btc", "usdRub"],
  economic:      ["xau", "wti", "btc", "usdRub"],
  environmental: ["wti"],
};

const TIER_ORDER: Record<string, number> = { t4: 4, t3: 3, t2: 2, t1: 1 };

/** Filter pins by domain categories, sort tier desc, return up to 8 */
export function filterNewsByDomain(pins: NewsFeedPin[], domainId: string): NewsFeedPin[] {
  const cats = DOMAIN_NEWS_CATEGORIES[domainId] ?? [];
  return pins
    .filter((p) => cats.includes(p.category))
    .sort((a, b) => (TIER_ORDER[b.tier] ?? 0) - (TIER_ORDER[a.tier] ?? 0))
    .slice(0, 8);
}
