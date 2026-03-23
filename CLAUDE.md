# Tevatha Project — Claude Instructions

## 1. PROJECT CONTEXT

This is the **Tevatha Project**, a 'Zero-Hour' digital infrastructure app built on Next.js 15 App Router.

Three product silos via route groups:
- `(watchtower)` — threat matrix dashboard; collapse probability, signal feeds, doomsday clock
- `(provisioner)` — dual-rail fiat/crypto hardware store; Stripe + Solana USDC checkout
- `(protocol)` — offline-first PWA continuity ledger; IndexedDB + AES-256-GCM + Supabase sync

Auth: Clerk (Native Third-Party Auth / OIDC → Supabase RLS).
DB: Supabase with typed `database.types.ts`. Always use `AnyDB = any` pattern — do not import `Database` generic.
Crypto payments: `@solana/pay` + `@solana/web3.js`. Amount fields use `BigNumber` from `bignumber.js`, not native `bigint`.
Stripe API version: `2026-02-25.clover`.
PWA: Serwist (`@serwist/next`). Service worker at `app/sw.ts`.
Middleware: `proxy.ts` (not `middleware.ts`) — CVE-2025-29927 hardened.

## 2. AESTHETICS

Act as a premium UI engineer building a **high-tech vault management dashboard**. Never produce generic designs.

**Color system** (defined in `tailwind.config.ts` — use these tokens, not raw hex):
- Backgrounds: `bg-void-0` (#05080a) through `bg-void-3` (#07090e)
- Gold accent: `text-gold-protocol` (#c9a84c), `text-gold-bright` (#f0c842)
- Cyan accent: `text-cyan-DEFAULT` (#00d4ff) — Protocol/Envoy surfaces
- Red/threat: `text-red-bright` (#e05050), `text-red-protocol` (#e84040)
- Text hierarchy: `text-text-base` → `text-text-dim` → `text-text-mute2`
- Borders: `border-border-protocol` (default), `border-border-bright` (emphasis)

**Typography:**
- Headings: `font-syne font-bold` or `font-extrabold` — never system fonts for display text
- Telemetry/financial/data: `font-mono` (JetBrains Mono via CSS var `--font-jetbrains`)
- Body: `font-sans` (Inter)

**Motion:** Use `framer-motion` for high-impact page load reveals. Stagger children. Use `fadeUp` pattern (opacity 0→1, translateY 18px→0). Never use motion on every element — reserve for hero sections, card grids, and data reveals.

**Layout standards:**
- Section padding: `px-6 py-8` minimum for content areas
- Cards: `rounded-xl` or `rounded-2xl`, `border border-border-protocol`, `bg-void-1`
- Section headers: `font-syne font-bold text-[17px]` with a horizontal rule `<div className="flex-1 h-px bg-border-protocol" />`
- Hover: always include `-translate-y-px` lift + shadow change on interactive cards
- CTAs: gold buttons use `px-7 py-3`, `hover:bg-gold-bright hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]`
- Inset box-shadow on hero/feature cards: `0 0 0 1px rgba(255,255,255,0.03) inset`
- Top accent lines on major sections: `absolute top-0 left-0 right-0 h-px` with gradient

**Never:**
- Use `localFont` — all fonts are loaded via `next/font/google` in `lib/fonts.ts`
- Use `import type { NextRequest }` when the value is used as a constructor
- Use native `bigint` for Solana Pay `amount` fields
- Add `WebWorker` to `tsconfig.json` lib array
- Import the `Database` generic from `database.types.ts` into Supabase client/server files

## 4. STRIPE ARCHITECTURAL RULES

### Environment Variable Parity
- `STRIPE_SECRET_KEY` must **NEVER** be prefixed with `NEXT_PUBLIC_`. It is a server-only secret. Exposing it to the browser would allow anyone to make arbitrary Stripe API calls with full account access.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the only Stripe key safe for the browser. It is intentionally public.
- Any code that imports `stripe` or calls `getStripe()` with the secret key must live in: API routes, Server Actions, or Server Components — never in `"use client"` files.

### Vercel Runtime Enforcement
- Every Next.js API route that uses the Stripe SDK or processes Stripe webhooks **must** declare the Node.js runtime explicitly at the top of the file:
  ```ts
  export const runtime = 'nodejs';
  ```
- **Never** use the Edge runtime (`export const runtime = 'edge'`) for Stripe routes. The Stripe Node.js SDK uses Node.js built-ins (`crypto`, `http`, `buffer`) that are unavailable in the Edge runtime and will cause silent failures or build errors on Vercel.
- This applies to: `app/api/stripe/**`, `app/api/webhooks/stripe/**`, and any Server Action that instantiates the Stripe client.

### Webhook Signature Verification
- Stripe webhook routes must read the raw request body via `request.text()` (not `request.json()`) before calling `stripe.webhooks.constructEvent()`. Parsing JSON first destroys the raw bytes needed for HMAC verification, causing all webhook signature checks to fail.

## 3. PLANNING RULES

When asked to plan a feature:

1. **Multi-phase output** — split into phases (Phase 1, Phase 2, …) to preserve context across sessions. Each phase must be independently executable.
2. **Extreme concision** — sacrifice grammar for readability. Bullet points over prose. No filler.
3. **End every plan** with an `## Unresolved Questions` section listing all ambiguities the user must answer before any code is written. Do not proceed to code until these are resolved.

Example plan structure:
```
## Phase 1 — [name] (~N files)
- file: what changes & why
- file: what changes & why

## Phase 2 — [name] (~N files)
- ...

## Unresolved Questions
1. ...
2. ...
```
