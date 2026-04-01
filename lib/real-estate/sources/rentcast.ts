// lib/real-estate/sources/rentcast.ts
// RentCast / Realty Mole via RapidAPI free tier (500 req/month)
// Env: RAPIDAPI_KEY

import type { RawAggregatorListing } from "../types";

const RAPIDAPI_HOST = "realty-mole-property-api.p.rapidapi.com";
const BASE_URL      = `https://${RAPIDAPI_HOST}`;

export async function fetchRentcast(limit = 10): Promise<RawAggregatorListing[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn("[rentcast] RAPIDAPI_KEY not set — skipping");
    return [];
  }

  const url = new URL(`${BASE_URL}/randomProperties`);
  url.searchParams.set("limit", String(limit));

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key":  apiKey,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[rentcast] network error:", err);
    return [];
  }

  if (res.status === 429 || res.status >= 500) {
    console.warn(`[rentcast] upstream ${res.status} — skipping this source`);
    return [];
  }

  if (!res.ok) {
    console.error(`[rentcast] unexpected ${res.status}`);
    return [];
  }

  const data = await res.json();
  const listings: unknown[] = Array.isArray(data) ? data : (data?.properties ?? []);
  return listings as RawAggregatorListing[];
}
