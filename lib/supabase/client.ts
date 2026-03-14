// lib/supabase/client.ts
"use client";

import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

// Database type applied when generated via: npx supabase gen types typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Returns a Supabase client instance that authenticates via Clerk's
 * Native Third-Party Auth (OIDC). The `accessToken` callback is called
 * by the Supabase SDK before each request that requires authentication.
 *
 * RLS policies on your Supabase tables should reference:
 *   auth.jwt() ->> 'sub'  (maps to Clerk user ID)
 */
export function useSupabaseClient(): ReturnType<typeof createClient<AnyDB>> {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient<AnyDB>(supabaseUrl, supabaseAnonKey, {
        accessToken: async () => {
          if (!session) return null;
          return (await session.getToken()) ?? null;
        },
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      }),
    // Re-create client if Clerk session identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.id]
  );
}

/**
 * Unauthenticated Supabase client for public data.
 * Safe to use in Server Components without a session.
 */
export const supabasePublic = createClient<AnyDB>(supabaseUrl, supabaseAnonKey);
