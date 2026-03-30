// app/api/watchtower/news/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";

const ANCHORS = [
  { query: "ukraine russia war",            lat: 49.8,  lng:  36.2,   category: "war",       tier: "t4", region: "Ukraine" },
  { query: "gaza israel war ceasefire",     lat: 31.5,  lng:  34.5,   category: "war",       tier: "t4", region: "Gaza" },
  { query: "north korea nuclear missile",   lat: 39.0,  lng: 125.75,  category: "nuclear",   tier: "t4", region: "North Korea" },
  { query: "taiwan china military strait",  lat: 24.0,  lng: 122.0,   category: "war",       tier: "t4", region: "Taiwan" },
  { query: "iran nuclear sanctions",        lat: 35.7,  lng:  51.4,   category: "nuclear",   tier: "t4", region: "Iran" },
  { query: "sudan civil war famine",        lat: 15.5,  lng:  32.5,   category: "war",       tier: "t3", region: "Sudan" },
  { query: "global financial crisis debt",  lat: 40.7,  lng: -74.0,   category: "economic",  tier: "t3", region: "Global Markets" },
  { query: "climate disaster flood drought",lat: 20.0,  lng:   0.0,   category: "climate",   tier: "t2", region: "Global" },
  { query: "pandemic disease outbreak",     lat: 22.3,  lng: 114.2,   category: "health",    tier: "t3", region: "Asia-Pacific" },
  { query: "russia nato military threat",   lat: 55.7,  lng:  37.6,   category: "war",       tier: "t4", region: "Russia" },
  { query: "venezuela economic collapse",   lat: 10.5,  lng: -66.9,   category: "economic",  tier: "t3", region: "Venezuela" },
  { query: "afghanistan crisis Taliban",    lat: 34.5,  lng:  69.2,   category: "political", tier: "t3", region: "Afghanistan" },
] as const;

function parseSeen(s: string): string {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return new Date().toISOString();
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
}

export async function GET() {
  const results = await Promise.allSettled(
    ANCHORS.map((anchor) =>
      fetch(
        `https://api.gdeltproject.org/api/v2/doc/doc` +
          `?query=${encodeURIComponent(anchor.query)}` +
          `&mode=artlist&maxrecords=3&format=json&timespan=48h&sort=date&sourcelang=english`,
        { signal: AbortSignal.timeout(8000) },
      ).then((r) => {
        if (!r.ok) throw new Error(`GDELT ${r.status}`);
        return r.json();
      }),
    ),
  );

  const pins: NewsFeedPin[] = [];
  const seenUrls = new Set<string>();

  results.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const articles: Array<{ title: string; url: string; domain: string; seendate: string }> =
      result.value?.articles ?? [];
    articles.forEach((article, j) => {
      if (seenUrls.has(article.url)) return;
      seenUrls.add(article.url);
      const anchor = ANCHORS[i];
      pins.push({
        id:        `L${i}_${j}`,
        lat:       anchor.lat,
        lng:       anchor.lng,
        category:  anchor.category,
        tier:      anchor.tier,
        region:    anchor.region,
        headline:  article.title,
        source:    article.domain,
        sourceUrl: article.url,
        summary:   `Live via ${article.domain} — click source to read full story`,
        date:      parseSeen(article.seendate),
      } as NewsFeedPin);
    });
  });

  const capped = pins.slice(0, 25);

  if (capped.length === 0) {
    return Response.json({ pins: [], error: "gdelt_unavailable" }, { status: 503 });
  }

  return Response.json({ pins: capped, fetchedAt: new Date().toISOString() });
}
