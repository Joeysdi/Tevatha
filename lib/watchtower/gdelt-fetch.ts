// lib/watchtower/gdelt-fetch.ts
import type { NewsFeedPin } from "./news-feed-pins";

export const GDELT_ANCHORS = [
  // ── War ───────────────────────────────────────────────────────────────────
  { query: "ukraine russia war",                       lat: 49.8,  lng:  36.2,  category: "war",      tier: "t4", region: "Ukraine"     },
  { query: "gaza israel war ceasefire",                lat: 31.5,  lng:  34.5,  category: "war",      tier: "t4", region: "Gaza"         },
  { query: "taiwan china military strait",             lat: 24.0,  lng: 122.0,  category: "war",      tier: "t4", region: "Taiwan"       },
  { query: "russia nato military threat",              lat: 55.7,  lng:  37.6,  category: "war",      tier: "t4", region: "Russia"       },
  // ── Nuclear ───────────────────────────────────────────────────────────────
  { query: "iran nuclear sanctions",                   lat: 35.7,  lng:  51.4,  category: "nuclear",  tier: "t4", region: "Iran"         },
  { query: "north korea nuclear missile",              lat: 39.0,  lng: 125.75, category: "nuclear",  tier: "t4", region: "North Korea"  },
  // ── Cyber ─────────────────────────────────────────────────────────────────
  { query: "cyberattack hacking ransomware",           lat: 38.9,  lng: -77.0,  category: "cyber",    tier: "t3", region: "Global"       },
  // ── Health ────────────────────────────────────────────────────────────────
  { query: "H5N1 bird flu human infection outbreak",   lat: 13.7,  lng: 100.5,  category: "health",   tier: "t4", region: "SE Asia"      },
  { query: "WHO pandemic outbreak public health emergency", lat: 46.23, lng: 6.10, category: "health", tier: "t3", region: "Geneva"      },
  { query: "mpox monkeypox outbreak epidemic",         lat:  0.0,  lng:  25.0,  category: "health",   tier: "t3", region: "Africa"       },
  // ── Economic ──────────────────────────────────────────────────────────────
  { query: "bank failure financial crisis systemic",   lat: 40.71, lng: -74.01, category: "economic", tier: "t3", region: "USA"          },
  { query: "IMF debt crisis recession market crash",   lat: 38.9,  lng: -77.0,  category: "economic", tier: "t3", region: "Global"       },
  { query: "CBDC digital currency central bank",       lat: 47.55, lng:   7.59, category: "economic", tier: "t2", region: "Global"       },
  // ── Political ─────────────────────────────────────────────────────────────
  { query: "NATO alliance Article 5 collective defense", lat: 50.88, lng: 4.43, category: "political", tier: "t3", region: "NATO"        },
  { query: "coup protest government collapse",         lat: 15.0,  lng:  25.0,  category: "political", tier: "t3", region: "Global"      },
] as const;

const CYBER_KEYWORDS = [
  "cyber", "hacking", "hack", "ransomware", "malware", "phishing",
  "data breach", "zero-day", "zero day", "vulnerability", "exploit",
  "salt typhoon", "volt typhoon", "midnight blizzard", "apt",
];

function detectCyberCategory(title: string): boolean {
  const lower = title.toLowerCase();
  return CYBER_KEYWORDS.some((kw) => lower.includes(kw));
}

function parseSeen(s: string): string {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return new Date().toISOString();
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
}

/** Fetch all GDELT anchors directly from the browser. Returns [] on total failure. */
export async function fetchGdeltPins(): Promise<NewsFeedPin[]> {
  const results = await Promise.allSettled(
    GDELT_ANCHORS.map((anchor) =>
      fetch(
        `https://api.gdeltproject.org/api/v2/doc/doc` +
          `?query=${encodeURIComponent(anchor.query)}` +
          `&mode=artlist&maxrecords=3&format=json&timespan=48h&sort=date`,
        { signal: AbortSignal.timeout(25000) },
      ).then((r) => {
        if (!r.ok) throw new Error(`GDELT HTTP ${r.status}`);
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
      const anchor = GDELT_ANCHORS[i];
      const category = detectCyberCategory(article.title) ? "cyber" : anchor.category;
      pins.push({
        id:        `L${i}_${j}`,
        lat:       anchor.lat,
        lng:       anchor.lng,
        category,
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

  return pins;
}
