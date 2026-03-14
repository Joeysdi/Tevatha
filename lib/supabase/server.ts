// lib/supabase/server.ts
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Database type applied when generated via: npx supabase gen types typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client for use in:
 *  - React Server Components (RSC)
 *  - Route Handlers (app/api/*)
 *  - Server Actions
 *
 * Uses Clerk's `auth().getToken()` — no template argument needed
 * because Supabase Native Third-Party Auth accepts the raw Clerk JWT.
 *
 * @example
 * // In a Server Component:
 * const supabase = await createServerSupabaseClient();
 * const { data } = await supabase.from('items').select('*');
 */
export async function createServerSupabaseClient(): Promise<
  ReturnType<typeof createClient<AnyDB>>
> {
  const { getToken } = await auth();

  return createClient<AnyDB>(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      // getToken() with no arguments returns the raw Clerk session JWT
      // which Supabase's OIDC integration validates against your
      // configured Clerk JWKS endpoint in the Supabase dashboard
      return (await getToken()) ?? null;
    },
  });
}

/**
 * Service-role client for privileged server-only operations.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createServiceSupabaseClient(): ReturnType<typeof createClient<AnyDB>> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient<AnyDB>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
