// lib/real-estate/normalize.ts
// Maps raw MLS/aggregator payloads → unified Property shape.
// Dedup key: source + source_id
// Only passes through rural/large-acreage/resilience-relevant listings

import type { Property, PropertyType, RawMLSListing, RawAggregatorListing } from "./types";

// MLS types that map to our resilience property types
const MLS_TYPE_MAP: Record<string, PropertyType> = {
  ResidentialProperty: "residential",
  Land:                "land",
  Farm:                "farm",
  Ranch:               "farm",
  RuralResidential:    "cabin",
  Cabin:               "cabin",
  Commercial:          "compound",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

function makeSlug(base: string, sourceId: string): string {
  return `${slugify(base)}-${sourceId.substring(0, 8)}`;
}

// ── Census Geocoder (free, no key required) ───────────────────────────────────
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
    url.searchParams.set("address", address);
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    if (!match) return null;

    return {
      lat: parseFloat(match.coordinates.y),
      lng: parseFloat(match.coordinates.x),
    };
  } catch {
    return null;
  }
}

// ── MLS normalization ─────────────────────────────────────────────────────────
export async function normalizeMLSListing(raw: RawMLSListing): Promise<Property | null> {
  const sourceId = raw.listingId ?? raw.mlsId ?? "";
  if (!sourceId) return null;

  const propType: PropertyType = MLS_TYPE_MAP[raw.property?.type] ?? "residential";
  // Only pass rural/large-acreage listings — at least 1 acre if lot size provided
  const lotAcres = raw.property?.lotSize ? raw.property.lotSize / 43560 : null;
  if (lotAcres !== null && lotAcres < 0.5) return null;

  const address = raw.address?.full ?? "";
  const city    = raw.address?.city ?? "";
  const state   = raw.address?.state ?? "";
  const zip     = raw.address?.postalCode ?? "";

  let lat = raw.geo?.lat ?? null;
  let lng = raw.geo?.lng ?? null;

  if (!lat && !lng && address) {
    const geo = await geocodeAddress(`${address}, ${city}, ${state} ${zip}`);
    if (geo) { lat = geo.lat; lng = geo.lng; }
  }

  const title = `${propType.charAt(0).toUpperCase() + propType.slice(1)} in ${city}, ${state}`;

  const now = new Date().toISOString();
  return {
    id:                 "",  // set by Supabase on insert
    source:             "mls",
    source_id:          sourceId,
    tevatha_certified:  false,
    tevatha_rank:       null,
    title,
    slug:               makeSlug(title, sourceId),
    status:             "active",
    property_type:      propType,
    address,
    city,
    state,
    zip,
    country:            raw.address?.country ?? "US",
    lat,
    lng,
    acres:              lotAcres,
    price_usd:          raw.listPrice ? raw.listPrice * 100 : null,
    price_display:      raw.listPrice ? `$${raw.listPrice.toLocaleString()}` : null,
    accepts_crypto:     false,
    bedrooms:           raw.property?.bedrooms ?? null,
    bathrooms:          raw.property?.bathrooms ?? null,
    sqft:               raw.property?.area ?? null,
    year_built:         raw.property?.yearBuilt ?? null,
    off_grid_capacity:  null,
    resource_autonomy_days: null,
    water_source:       null,
    power_systems:      null,
    food_production:    null,
    defensive_infrastructure: null,
    communications:     null,
    elevation_ft:       null,
    distance_to_city_mi: null,
    natural_hazard_score: null,
    community_type:     null,
    images:             raw.photos ?? null,
    description:        raw.remarks ?? null,
    highlights:         null,
    tags:               ["mls"],
    grade:              null,
    safety_score:       null,
    external_url:       null,
    raw_data:           raw as unknown as Record<string, unknown>,
    last_synced_at:     now,
    created_at:         now,
    updated_at:         now,
    deleted_at:         null,
  };
}

// ── Aggregator normalization ──────────────────────────────────────────────────
export async function normalizeAggregatorListing(raw: RawAggregatorListing): Promise<Property | null> {
  const sourceId = raw.id ?? "";
  if (!sourceId) return null;

  const city  = raw.city  ?? "";
  const state = raw.state ?? "";
  const title = `Property in ${city}, ${state}`;

  const now = new Date().toISOString();
  return {
    id:                 "",
    source:             "aggregator",
    source_id:          sourceId,
    tevatha_certified:  false,
    tevatha_rank:       null,
    title,
    slug:               makeSlug(title, sourceId),
    status:             "active",
    property_type:      "residential",
    address:            raw.formattedAddress ?? null,
    city,
    state,
    zip:                raw.zipCode ?? null,
    country:            "US",
    lat:                raw.latitude ?? null,
    lng:                raw.longitude ?? null,
    acres:              null,
    price_usd:          raw.price ? raw.price * 100 : null,
    price_display:      raw.price ? `$${raw.price.toLocaleString()}` : null,
    accepts_crypto:     false,
    bedrooms:           raw.bedrooms ?? null,
    bathrooms:          raw.bathrooms ?? null,
    sqft:               raw.squareFootage ?? null,
    year_built:         raw.yearBuilt ?? null,
    off_grid_capacity:  null,
    resource_autonomy_days: null,
    water_source:       null,
    power_systems:      null,
    food_production:    null,
    defensive_infrastructure: null,
    communications:     null,
    elevation_ft:       null,
    distance_to_city_mi: null,
    natural_hazard_score: null,
    community_type:     null,
    images:             null,
    description:        null,
    highlights:         null,
    tags:               ["aggregator"],
    grade:              null,
    safety_score:       null,
    external_url:       null,
    raw_data:           raw as unknown as Record<string, unknown>,
    last_synced_at:     now,
    created_at:         now,
    updated_at:         now,
    deleted_at:         null,
  };
}
