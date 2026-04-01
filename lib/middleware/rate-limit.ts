// lib/middleware/rate-limit.ts
//
// Upstash Redis-backed rate limiters for API routes.
// Reads from env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//
// Limiters:
//   publicApiLimiter — /api/store/products*, /api/properties*: 30 req/10s per IP
//   envoyLimiter     — /api/envoy/validate: 20 req/60s per IP

import { Ratelimit } from "@upstash/ratelimit";
import { Redis }     from "@upstash/redis";
import type { NextRequest } from "next/server";

const redis = Redis.fromEnv();

// Public product + property APIs: 30 requests per 10 seconds per IP
export const publicApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  prefix:  "rl:public",
});

// Envoy validate endpoint: 20 requests per minute per IP
export const envoyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  prefix:  "rl:envoy",
});

/**
 * Extracts the real client IP from Vercel/proxy forwarded headers.
 * Falls back to 127.0.0.1 if no IP can be determined.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
