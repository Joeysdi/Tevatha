// lib/real-estate/types.ts
// TypeScript interfaces mirroring the properties schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any; // per CLAUDE.md — never import Database generic
export type { AnyDB };

export type PropertySource = "tevatha" | "mls" | "aggregator";

export type PropertyStatus = "active" | "pending" | "sold" | "draft";

export type PropertyType =
  | "land"
  | "residential"
  | "compound"
  | "bunker"
  | "farm"
  | "cabin"
  | "retreat";

export type OffGridCapacity = "full" | "partial" | "grid-tied-backup";

export type CommunityType = "solo" | "small" | "intentional";

export interface Property {
  id: string;
  source: PropertySource;
  source_id: string | null;
  tevatha_certified: boolean;
  tevatha_rank: number | null;

  title: string;
  slug: string;
  status: PropertyStatus;
  property_type: PropertyType;

  // Location
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  acres: number | null;

  // Pricing
  price_usd: number | null;  // cents
  price_display: string | null;
  accepts_crypto: boolean;

  // Specs
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  year_built: number | null;

  // Resilience (null for MLS/aggregator)
  off_grid_capacity: OffGridCapacity | null;
  resource_autonomy_days: number | null;
  water_source: string[] | null;
  power_systems: string[] | null;
  food_production: string | null;
  defensive_infrastructure: string | null;
  communications: string[] | null;
  elevation_ft: number | null;
  distance_to_city_mi: number | null;
  natural_hazard_score: number | null;
  community_type: CommunityType | null;

  // Media + meta
  images: string[] | null;
  description: string | null;
  highlights: string[] | null;
  tags: string[] | null;
  grade: string | null;
  safety_score: number | null;
  external_url: string | null;
  raw_data: Record<string, unknown> | null;

  // Timestamps
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PropertyInquiry {
  id: string;
  property_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  message: string;
  status: "new" | "read" | "responded";
  created_at: string;
}

export interface PropertySyncLog {
  id: string;
  source: string;
  records_fetched: number;
  records_upserted: number;
  errors: Record<string, unknown> | null;
  duration_ms: number | null;
  ran_at: string;
}

export interface SyncResult {
  logs: PropertySyncLog[];
  total_fetched: number;
  total_upserted: number;
  skipped: boolean;
}

// Raw shapes from external sources (before normalization)
export interface RawMLSListing {
  listingId: string;
  address: {
    full: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  geo?: { lat: number; lng: number };
  listPrice: number;
  property: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    lotSize?: number;
    yearBuilt?: number;
  };
  photos?: string[];
  remarks?: string;
  mlsId?: string;
}

export interface RawAggregatorListing {
  id: string;
  formattedAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  price?: number;
  propertyType?: string;
  latitude?: number;
  longitude?: number;
}
