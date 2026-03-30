// app/api/watchtower/news/route.ts
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ANCHORS = [
  { query: "ukraine russia war",           lat: 49.8,  lng:  36.2,  category: "war",      tier: "t4", region: "Ukraine" },
  { query: "gaza israel war ceasefire",    lat: 31.5,  lng:  34.5,  category: "war",      tier: "t4", region: "Gaza" },
  { query: "taiwan china military strait", lat: 24.0,  lng: 122.0,  category: "war",      tier: "t4", region: "Taiwan" },
  { query: "iran nuclear sanctions",       lat: 35.7,  lng:  51.4,  category: "nuclear",  tier: "t4", region: "Iran" },
  { query: "north korea nuclear missile",  lat: 39.0,  lng: 125.75, category: "nuclear",  tier: "t4", region: "North Korea" },
  { query: "russia nato military threat",  lat: 55.7,  lng:  37.6,  category: "war",      tier: "t4", region: "Russia" },
] as const;

const GDELT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Tevatha/1.0; +https://tevatha.com)",
  "Accept": "application/json",
};

function parseSeen(s: string): string {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return new Date().toISOString();
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
}

function fetchAnchor(query: string) {
  return fetch(
    `https://api.gdeltproject.org/api/v2/doc/doc` +
      `?query=${encodeURIComponent(query)}` +
      `&mode=artlist&maxrecords=3&format=json&timespan=48h&sort=date`,
    { headers: GDELT_HEADERS, signal: AbortSignal.timeout(6000) },
  ).then((r) => {
    if (!r.ok) throw new Error(`GDELT HTTP ${r.status}`);
    return r.json();
  });
}

export async function GET() {
  // Global deadline — always respond within 8 s regardless of GDELT latency
  const deadline = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));

  const raceResults = await Promise.race([
    Promise.allSettled(ANCHORS.map((a) => fetchAnchor(a.query))),
    deadline,
  ]);

  // deadline fired — return what we have (nothing yet → fallback on client)
  if (raceResults === null) {
    console.error("[news] GDELT deadline exceeded — returning empty");
    return Response.json({ pins: [], error: "gdelt_timeout" }, { status: 503 });
  }

  const pins: NewsFeedPin[] = [];
  const seenUrls = new Set<string>();

  raceResults.forEach((result, i) => {
    if (result.status !== "fulfilled") {
      console.error(`[news] anchor ${i} failed:`, result.reason);
      return;
    }
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

  console.log(`[news] returning ${pins.length} pins`);

  if (pins.length === 0) {
    return Response.json({ pins: [], error: "gdelt_unavailable" }, { status: 503 });
  }

  return Response.json({ pins, fetchedAt: new Date().toISOString() });
}
