// lib/store/normalize/shared.ts
// Shared utilities for all product normalizers.

/**
 * Convert a string to a URL-safe slug.
 * Lowercases, strips non-alphanumeric chars, collapses spaces/hyphens to a single dash.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

/**
 * Build a deterministic slug from a title and external source ID.
 * Uses first 12 chars of sourceId to reduce collision probability.
 * Never uses Date.now() — must be stable across re-syncs.
 */
export function makeSlug(title: string, sourceId: string): string {
  return slugify(title) + "-" + sourceId.slice(0, 12);
}

/**
 * Parse a boolean string from CSV columns.
 * Accepts "true", "1", "yes" (case-insensitive) as true.
 */
export function parseBool(value: string | undefined | null): boolean {
  if (!value) return false;
  return ["true", "1", "yes"].includes(value.trim().toLowerCase());
}

/**
 * Parse a float from a string; returns null if invalid or empty.
 */
export function parseFloatOrNull(value: string | undefined | null): number | null {
  if (!value || !value.trim()) return null;
  const n = parseFloat(value.trim());
  return isNaN(n) ? null : n;
}

/**
 * Parse an integer from a string; returns null if invalid or empty.
 */
export function parseIntOrNull(value: string | undefined | null): number | null {
  if (!value || !value.trim()) return null;
  const n = parseInt(value.trim(), 10);
  return isNaN(n) ? null : n;
}

/**
 * Split a pipe-separated string into a trimmed array.
 * Returns [] if value is empty.
 */
export function splitPipe(value: string | undefined | null): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}
