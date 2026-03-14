// providers/wallet-provider.tsx
"use client";

import { useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, type Cluster } from "@solana/web3.js";

// Import wallet adapter styles — only in this file, server-safe
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
  cluster?: Cluster;
}

/**
 * Solana Wallet Context Provider.
 *
 * CRITICAL: This component is marked "use client" and must ONLY be
 * rendered via a Next.js dynamic() import with { ssr: false } from
 * any layout or page. Direct import will cause React hydration errors
 * because @solana/web3.js uses browser-only APIs at module init time.
 *
 * @see components/wallet-button.tsx for the safe dynamic import pattern
 */
export function WalletContextProvider({
  children,
  cluster = "mainnet-beta",
}: WalletContextProviderProps) {
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster]);

  // Wallet adapters — extend as needed
  // These are instantiated in useMemo to avoid re-init on every render
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
