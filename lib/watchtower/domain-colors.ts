// lib/watchtower/domain-colors.ts
// Single source of truth for domain → hex color mapping.
// Keys are lowercase domain ids (matching ThreatDomain.id).

export const DOMAIN_COLORS: Record<string, string> = {
  geopolitical:  "#e84040",
  economic:      "#c9a84c",
  environmental: "#1ae8a0",
};
