// lib/solana/treasury.ts
// NOTE: This module uses @solana/web3.js which requires the Node.js runtime.
// NEVER use `export const runtime = 'edge'` in any route that imports this.

import {
  Keypair,
  PublicKey,
  Connection,
  clusterApiUrl,
  type Cluster,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";

// ── Constants ─────────────────────────────────────────────────────────────
// USDC mint addresses (canonical, do not change)
export const USDC_MINT_MAINNET = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
export const USDC_MINT_DEVNET = new PublicKey(
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

// ── Treasury configuration ─────────────────────────────────────────────────
function getTreasuryConfig() {
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "mainnet-beta") as Cluster;
  const masterWalletRaw = process.env.SOLANA_TREASURY_WALLET_PUBKEY;
  const rpcUrl = process.env.SOLANA_RPC_URL ?? clusterApiUrl(cluster);

  if (!masterWalletRaw) {
    throw new Error("SOLANA_TREASURY_WALLET_PUBKEY is not configured");
  }

  const masterWallet   = new PublicKey(masterWalletRaw);
  const usdcMint       = cluster === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;

  // Derive treasury USDC Associated Token Account (ATA) deterministically
  // This is the RECIPIENT of all Solana Pay USDC transactions
  const treasuryAta = getAssociatedTokenAddressSync(
    usdcMint,
    masterWallet,
    false,                         // allowOwnerOffCurve = false for standard wallets
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return { cluster, masterWallet, usdcMint, treasuryAta, rpcUrl };
}

export function getTreasuryAta(): PublicKey {
  return getTreasuryConfig().treasuryAta;
}

export function getUsdcMint(): PublicKey {
  return getTreasuryConfig().usdcMint;
}

export function getRpcConnection(): Connection {
  const { rpcUrl } = getTreasuryConfig();
  return new Connection(rpcUrl, "confirmed");
}

// ── Ephemeral Reference Keypair ────────────────────────────────────────────
//
// OPOS PRINCIPLE: Each invoice gets a unique freshly-generated Ed25519 keypair.
// The PUBLIC KEY is the `reference` parameter in the Solana Pay URL spec.
// It is embedded in the transaction by the payer's wallet as an account key.
//
// Helius watches all transactions touching treasuryAta and filters by whether
// the ephemeral pubkey appears as a referenced account — giving us O(1)
// invoice-to-transaction matching without scanning all USDC transfers.
//
// The PRIVATE KEY is discarded after invoice creation — it is never used for
// signing and has no value beyond serving as the reference tag.

export interface EphemeralReference {
  publicKey:  string;   // base58 — stored in invoice, passed to Solana Pay URL
  // privateKey intentionally NOT exported to prevent accidental persistence
}

export function generateEphemeralReference(): EphemeralReference {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
  };
}

// ── USDC amount conversion ─────────────────────────────────────────────────
// USDC has 6 decimal places on Solana
export const USDC_DECIMALS = 6;

export function usdcToLamports(usdc: number): bigint {
  // Use string manipulation to avoid floating-point precision loss
  const [whole, frac = ""] = usdc.toFixed(USDC_DECIMALS).split(".");
  const paddedFrac = frac.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(`${whole}${paddedFrac}`);
}

export function lamportsToUsdc(lamports: bigint): number {
  const divisor = BigInt(10 ** USDC_DECIMALS);
  const whole   = lamports / divisor;
  const frac    = lamports % divisor;
  return Number(`${whole}.${frac.toString().padStart(USDC_DECIMALS, "0")}`);
}

// ── On-chain verification: confirm a USDC transfer hit the treasury ATA ─────
export async function verifyUsdcTransfer(
  txSignature: string,
  expectedAmountUsdc: number,
  referenceKey: string
): Promise<{
  verified: boolean;
  actualAmount?: number;
  error?: string;
}> {
  try {
    const connection     = getRpcConnection();
    const { treasuryAta, usdcMint } = getTreasuryConfig();
    const expectedLamports = usdcToLamports(expectedAmountUsdc);

    const tx = await connection.getParsedTransaction(txSignature, {
      commitment:              "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) return { verified: false, error: "Transaction not found" };
    if (tx.meta?.err) return { verified: false, error: "Transaction failed on-chain" };

    // Check reference key appears in the transaction account keys
    const accountKeys = tx.transaction.message.accountKeys.map(
      (k) => (typeof k === "string" ? k : k.pubkey.toBase58())
    );
    const referencePresent = accountKeys.includes(referenceKey);
    if (!referencePresent) {
      return { verified: false, error: "Reference key not found in transaction" };
    }

    // Verify USDC token transfer to treasury ATA
    const tokenBalances = tx.meta?.postTokenBalances ?? [];
    const treasuryAtaStr = treasuryAta.toBase58();

    const treasuryEntry = tokenBalances.find(
      (b) =>
        b.mint === usdcMint.toBase58() &&
        b.owner &&
        // Match by account index → pubkey
        tx.transaction.message.accountKeys[b.accountIndex] &&
        (() => {
          const key = tx.transaction.message.accountKeys[b.accountIndex];
          return (typeof key === "string" ? key : key.pubkey.toBase58()) === treasuryAtaStr;
        })()
    );

    if (!treasuryEntry) {
      return { verified: false, error: "No USDC transfer to treasury ATA found" };
    }

    const actualLamports = BigInt(
      treasuryEntry.uiTokenAmount.amount
    );
    const preEntry = tx.meta?.preTokenBalances?.find(
      (b) => b.accountIndex === treasuryEntry.accountIndex
    );
    const preLamports = BigInt(preEntry?.uiTokenAmount.amount ?? "0");
    const receivedLamports = actualLamports - preLamports;

    if (receivedLamports < expectedLamports) {
      return {
        verified: false,
        actualAmount: lamportsToUsdc(receivedLamports),
        error: `Underpayment: received ${lamportsToUsdc(receivedLamports)} USDC, expected ${expectedAmountUsdc}`,
      };
    }

    return { verified: true, actualAmount: lamportsToUsdc(receivedLamports) };
  } catch (err) {
    return {
      verified: false,
      error: err instanceof Error ? err.message : "Unknown verification error",
    };
  }
}
