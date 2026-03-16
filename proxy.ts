// proxy.ts  (project root — Next.js 2026+ convention replacing middleware.ts)
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// ── Protected route groups ────────────────────────────────────────────────
const isProtected = createRouteMatcher([
  "/(watchtower)(.*)",
  "/(provisioner)(.*)",
  "/(protocol)(.*)",
  "/api/protected(.*)",
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

// ── Clerk Proxy Handler ───────────────────────────────────────────────────
export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    // ── CVE-2025-29927 MITIGATION ─────────────────────────────────────
    // Strip the header that allowed attackers to bypass middleware entirely
    // by faking an internal Next.js subrequest. Always sanitize before auth.
    const sanitized = new Headers(req.headers);
    sanitized.delete("x-middleware-subrequest");
    sanitized.delete("x-middleware-invoke");    // belt-and-suspenders

    // Rebuild request with sanitized headers for all downstream handlers
    const sanitizedReq = new NextRequest(req.url, {
      method: req.method,
      headers: sanitized,
      body: req.body,
    });

    // ── SKIP PUBLIC ROUTES ────────────────────────────────────────────
    if (isPublicApi(req) || isPublicUi(req)) {
      return NextResponse.next({ request: sanitizedReq });
    }

    // ── ENFORCE AUTH ON PROTECTED GROUPS ─────────────────────────────
    if (isProtected(req)) {
      await auth.protect();
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
