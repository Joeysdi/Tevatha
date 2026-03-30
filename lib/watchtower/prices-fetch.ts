// lib/watchtower/prices-fetch.ts

export interface AssetPrice {
  price:  number;
  change: number; // % vs previous close/24h; positive = up
  ok:     boolean;
}

export interface LivePrices {
  xau:    AssetPrice;
  wti:    AssetPrice;
  btc:    AssetPrice;
  usdRub: AssetPrice;
}

const FAIL: AssetPrice = { price: 0, change: 0, ok: false };

async function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(10_000) });
}

export async function fetchLivePrices(): Promise<LivePrices> {
  const [serverResult, btcResult, fxResult] = await Promise.allSettled([
    fetchWithTimeout("/api/watchtower/prices").then(r => r.json()),
    fetchWithTimeout(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
    ).then(r => r.json()),
    fetchWithTimeout("https://open.er-api.com/v6/latest/USD").then(r => r.json()),
  ]);

  // ── Gold + Oil ────────────────────────────────────────────────────────────
  let xau: AssetPrice = FAIL;
  let wti: AssetPrice = FAIL;
  if (serverResult.status === "fulfilled") {
    const data = serverResult.value as {
      gold: { price: number; change: number } | null;
      oil:  { price: number; change: number } | null;
    };
    if (data.gold) xau = { price: data.gold.price, change: data.gold.change, ok: true };
    if (data.oil)  wti = { price: data.oil.price,  change: data.oil.change,  ok: true };
  }

  // ── BTC/USD ───────────────────────────────────────────────────────────────
  let btc: AssetPrice = FAIL;
  if (btcResult.status === "fulfilled") {
    const data = btcResult.value as {
      bitcoin?: { usd?: number; usd_24h_change?: number };
    };
    const b = data.bitcoin;
    if (b?.usd !== undefined) {
      btc = { price: b.usd, change: b.usd_24h_change ?? 0, ok: true };
    }
  }

  // ── USD/RUB ───────────────────────────────────────────────────────────────
  let usdRub: AssetPrice = FAIL;
  if (fxResult.status === "fulfilled") {
    const data = fxResult.value as { rates?: { RUB?: number } };
    const rub = data.rates?.RUB;
    if (rub !== undefined) {
      usdRub = { price: rub, change: 0, ok: true }; // change N/A for FX spot
    }
  }

  return { xau, wti, btc, usdRub };
}
