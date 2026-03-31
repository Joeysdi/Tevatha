// app/api/watchtower/prices/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface YahooMeta {
  regularMarketPrice?: number;
  previousClose?: number;
}

interface YahooResponse {
  chart?: { result?: Array<{ meta?: YahooMeta }> };
}

async function fetchYahoo(symbol: string): Promise<{ price: number; change: number } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
      {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Mozilla/5.0" },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as YahooResponse;
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    const price = meta.regularMarketPrice;
    const prev  = meta.previousClose ?? price;
    const change = prev !== 0 ? ((price - prev) / prev) * 100 : 0;
    return { price, change };
  } catch {
    return null;
  }
}

export async function GET() {
  const [gold, oil, vix] = await Promise.all([
    fetchYahoo("GC=F"),
    fetchYahoo("CL=F"),
    fetchYahoo("^VIX"),
  ]);

  return Response.json({
    gold,
    oil,
    vix,
    fetchedAt: new Date().toISOString(),
  });
}
