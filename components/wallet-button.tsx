// components/wallet-button.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

/**
 * Dynamically imported WalletMultiButton with SSR disabled.
 *
 * WHY: @solana/wallet-adapter-react-ui accesses `window` and `Buffer`
 * at module initialization. SSR will throw. The Node.js runtime
 * (NOT edge runtime) is required for Buffer availability.
 *
 * Usage:
 *   import { WalletButton } from "@/components/wallet-button";
 *   <WalletButton />
 */

// Dynamic import of the entire wallet context tree — not just the button —
// ensures NO wallet-adapter code runs during SSR/RSC rendering
const DynamicWalletContextProvider = dynamic(
  () =>
    import("@/providers/wallet-provider").then(
      (mod) => mod.WalletContextProvider
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-9 w-32 rounded-card bg-glass-default border border-border-DEFAULT animate-pulse" />
    ),
  }
);

const DynamicWalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

type WalletButtonProps = ComponentProps<typeof DynamicWalletMultiButton>;

export function WalletButton(props: WalletButtonProps) {
  return (
    <DynamicWalletContextProvider>
      <DynamicWalletMultiButton {...props} />
    </DynamicWalletContextProvider>
  );
}
