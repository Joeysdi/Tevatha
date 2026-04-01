// lib/auth/roles.ts
//
// Centralizes all role/auth checks. Import requireAdmin() or requireEnvoy()
// from here — do NOT define local copies in individual routes.
//
// DEPLOY NOTE: Clerk dashboard → JWT Templates → add `publicMetadata` to
// session claims so that `auth().sessionClaims?.publicMetadata` is populated.
// Without this, all users will resolve to role 'public'.

import { auth } from "@clerk/nextjs/server";

export type UserRole = "public" | "envoy" | "admin";

/**
 * Reads the Clerk JWT session claims to determine the user's role.
 * Falls back to 'public' if the claim is absent.
 */
export async function getUserRole(): Promise<UserRole> {
  const session = await auth();
  const meta = session.sessionClaims?.publicMetadata as
    | { role?: string }
    | undefined;
  const role = meta?.role;
  if (role === "admin") return "admin";
  if (role === "envoy") return "envoy";
  return "public";
}

/**
 * Requires the caller to be authenticated with role 'admin'.
 * Throws 'unauthenticated' (→ 401) or 'forbidden' (→ 403).
 * Returns the Clerk user ID on success.
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");

  const role = await getUserRole();
  if (role !== "admin") throw new Error("forbidden");

  return userId;
}

/**
 * Requires the caller to be authenticated with role 'envoy' or 'admin'.
 * Throws 'unauthenticated' (→ 401) or 'forbidden' (→ 403).
 * Returns the Clerk user ID on success.
 */
export async function requireEnvoy(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");

  const role = await getUserRole();
  if (role !== "envoy" && role !== "admin") throw new Error("forbidden");

  return userId;
}

/**
 * Standard error-to-status mapper matching existing route conventions.
 * Usage: status: authErrorStatus(msg)
 */
export function authErrorStatus(msg: string): number {
  if (msg === "unauthenticated") return 401;
  if (msg === "forbidden") return 403;
  return 500;
}
