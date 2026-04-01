// lib/real-estate/sources/simplyrets.ts
// SimplyRETS demo RESO feed
// Demo creds: simplyrets:simplyrets
// Swap SIMPLYRETS_USER / SIMPLYRETS_PASS env vars for production IDX provider

import type { RawMLSListing } from "../types";

const BASE_URL = process.env.SIMPLYRETS_BASE_URL ?? "https://api.simplyrets.com";
const USER     = process.env.SIMPLYRETS_USER     ?? "simplyrets";
const PASS     = process.env.SIMPLYRETS_PASS     ?? "simplyrets";

export async function fetchSimplyRets(limit = 25): Promise<RawMLSListing[]> {
  const auth = Buffer.from(`${USER}:${PASS}`).toString("base64");

  const url = new URL(`${BASE_URL}/properties`);
  url.searchParams.set("type", "ResidentialProperty");
  url.searchParams.set("limit", String(limit));
  // Filter for rural / larger lots when supported by provider
  url.searchParams.set("minlotsize", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
    // No-store: always fetch fresh — caller manages caching via cron schedule
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SimplyRETS ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  // SimplyRETS wraps results in array directly or { data: [] }
  const listings: unknown[] = Array.isArray(data) ? data : (data?.data ?? []);
  return listings as RawMLSListing[];
}
