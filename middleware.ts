// proxy.ts  (project root — Next.js 2026+ convention replacing middleware.ts)
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { publicApiLimiter, envoyLimiter, getClientIp } from "@/lib/middleware/rate-limit";

// ── Protected route groups ────────────────────────────────────────────────
const isProtected = createRouteMatcher([
  "/(protocol)(.*)",
  "/api/protected(.*)",
  "/admin(.*)",
]);

// ── Public API routes (webhooks, health checks) ───────────────────────────
const isPublicApi = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/health",
]);

// ── Public UI routes (sign-in/sign-up pages) ──────────────────────────────
const isPublicUi = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// ── Rate-limited public API paths ─────────────────────────────────────────
// Matches /api/store/products* and /api/properties* (excludes sync + admin)
const isPublicApiRateLimited = createRouteMatcher([
  "/api/store/products(.*)",
  "/api/properties(.*)",
]);

// Excludes from rate limiting (sync + admin endpoints)
const isRateLimitExcluded = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/admin/(.*)",
  "/api/store/sync(.*)",
  "/api/properties/sync(.*)",
]);

// ── Envoy validate path ────────────────────────────────────────────────────
const isEnvoyValidate = createRouteMatcher(["/api/envoy/validate(.*)"]);

// ── Clerk Proxy Handler ───────────────────────────────────────────────────
export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    // ── CVE-2025-29927 MITIGATION ─────────────────────────────────────
    // Strip the header that allowed attackers to bypass middleware entirely
    // by faking an internal Next.js subrequest. Always sanitize before auth.
    const sanitized = new Headers(req.headers);
    sanitized.delete("x-middleware-subrequest");
    sanitized.delete("x-middleware-invoke");    // belt-and-suspenders

    // ── CHANGE 2 OF 3 — Capture referral code from URL, set HttpOnly cookie ─
    const ref = req.nextUrl.searchParams.get("ref");
    if (ref?.startsWith("ENV-") && ref.length === 10) {
      const res = NextResponse.next({
        request: new NextRequest(req.url, {
          method:  req.method,
          headers: sanitized,
          body:    req.body,
        }),
      });
      res.cookies.set("tevatha-ref", ref, {
        httpOnly: true,
        sameSite: "lax",
        maxAge:   60 * 60 * 24 * 30,
        path:     "/",
      });
      return res;
    }

    // Rebuild request with sanitized headers for all downstream handlers
    const sanitizedReq = new NextRequest(req.url, {
      method:  req.method,
      headers: sanitized,
      body:    req.body,
    });

    // ── SKIP PUBLIC ROUTES ────────────────────────────────────────────
    if (isPublicApi(req) || isPublicUi(req)) {
      return NextResponse.next({ request: sanitizedReq });
    }

    // ── CHANGE 3 OF 3 — Rate limiting on public product/property APIs ─
    const ip = getClientIp(req);

    if (isEnvoyValidate(req)) {
      const { success, limit, remaining, reset } = await envoyLimiter.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After":          String(Math.ceil((reset - Date.now()) / 1000)),
            "X-RateLimit-Limit":    String(limit),
            "X-RateLimit-Remaining": String(remaining),
          },
        });
      }
    } else if (isPublicApiRateLimited(req) && !isRateLimitExcluded(req)) {
      const { success, limit, remaining, reset } = await publicApiLimiter.limit(ip);
      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After":          String(Math.ceil((reset - Date.now()) / 1000)),
            "X-RateLimit-Limit":    String(limit),
            "X-RateLimit-Remaining": String(remaining),
          },
        });
      }
    }

    // ── ENFORCE AUTH ON PROTECTED GROUPS ─────────────────────────────
    if (isProtected(req)) {
      await auth.protect();

      // ── CHANGE 1 OF 3 — RBAC gate for /admin/* ───────────────────
      // Belt-and-suspenders: middleware redirects + server routes throw 403.
      if (req.nextUrl.pathname.startsWith("/admin")) {
        const claims = (await auth()).sessionClaims;
        const role = (claims?.publicMetadata as { role?: string } | undefined)?.role;
        if (role !== "admin") {
          return NextResponse.redirect(new URL("/sign-in", req.url));
        }
      }
    }

    return NextResponse.next({ request: sanitizedReq });
  },
  {
    // Clerk debug only in development
    debug: process.env.NODE_ENV === "development",
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and known assets
    "/((?!_next|_static|_vercel|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API/tRPC routes
    "/(api|trpc)(.*)",
  ],
};
