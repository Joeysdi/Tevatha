import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (cfg: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      cfg.resolve = {
        ...cfg.resolve,
        fallback: {
          ...cfg.resolve?.fallback,
          // Node built-ins unavailable in the browser bundle
          fs:     false,
          net:    false,
          tls:    false,
          // Buffer polyfill — required by @solana/web3.js and wallet adapters
          // `buffer` package exposes the Node.js Buffer API for Webpack 5
          buffer: require.resolve("buffer/"),
        },
      };

      // Automatically provide Buffer as a global so libraries that reference
      // `Buffer` without importing it (e.g. @solana/web3.js internals) work
      // without any import changes in application code.
      const webpack = require("webpack");
      cfg.plugins = [
        ...(cfg.plugins ?? []),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      ];
    }

    return cfg;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },

  experimental: { reactCompiler: false },
};

const withSerwist = withSerwistInit({
  swSrc:   "app/sw.ts",
  swDest:  "public/sw.js",
  // Disable in dev — prevents stale SW cache masking hot-reload
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  exclude: [
    /\/api\/webhooks\//,
    /\/api\/stripe\//,
    /\/sign-in/,
    /\/sign-up/,
  ],
});

export default withSerwist(nextConfig);
