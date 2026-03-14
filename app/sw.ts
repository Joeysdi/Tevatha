import { defaultCache }                    from "@serwist/next/worker";
import type { PrecacheEntry }              from "serwist";
import { Serwist, NetworkFirst, CacheFirst } from "serwist";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: Window & typeof globalThis & { __SW_MANIFEST: (PrecacheEntry | string)[] };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting:     true,
  clientsClaim:    true,
  navigationPreload: true,

  runtimeCaching: [
    // ── Protocol pillar pages (ledger, envoy) — offline-capable ─────────
    {
      matcher: /^\/(protocol|ledger|envoy)/,
      handler: new NetworkFirst({
        cacheName: "tevatha-protocol-pages",
        networkTimeoutSeconds: 5,
        plugins: [
          {
            // 24-hour TTL, 32 entries max
            cacheKeyWillBeUsed: async ({ request }) => request.url,
          },
        ],
      }),
    },
    // ── Supabase REST — NetworkFirst, never cache writes ─────────────────
    {
      matcher: ({ url, request }) =>
        url.hostname.includes("supabase.co") &&
        request.method === "GET",
      handler: new NetworkFirst({
        cacheName: "supabase-reads",
        networkTimeoutSeconds: 8,
      }),
    },
    // ── Static assets (fonts, images) — CacheFirst ───────────────────────
    {
      matcher: /\.(woff2?|ttf|otf|png|jpg|webp|svg|ico|css)$/,
      handler: new CacheFirst({
        cacheName: "tevatha-static-v1",
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
