// types/treasury.ts

export type PaymentRail   = "stripe" | "solana_usdc";
export type OrderStatus   = "pending" | "paid" | "failed" | "refunded";
export type GradeLevel    = "A" | "B" | "C" | "D" | "F";
export type TierRequirement = "T0" | "T1" | "T2" | "T3";

// ── Solana Pay invoice (stored before transaction) ─────────────────────
export interface SolanaInvoice {
  invoiceId:       string;          // UUID — our internal order ID
  referenceKey:    string;          // ephemeral Ed25519 pubkey (base58)
  recipientAta:    string;          // treasury USDC ATA
  amountUsdc:      number;          // exact USDC amount (decimal)
  amountLamports:  bigint;          // 6-decimal USDC units as bigint
  label:           string;
  message:         string;
  memo:            string;          // invoice ID embedded as on-chain memo
  expiresAt:       string;          // ISO 8601
  solanaPayUrl:    string;          // solana:<url> deeplink
  createdAt:       string;
}

// ── Processed event (idempotency table row) ─────────────────────────────
export interface ProcessedEvent {
  id:           string;             // stripe_event_id OR solana_tx_signature
  rail:         PaymentRail;
  orderId:      string;
  processedAt:  string;
}

// ── Order record ────────────────────────────────────────────────────────
export interface Order {
  id:             string;
  userId:         string;           // Clerk user ID
  rail:           PaymentRail;
  status:         OrderStatus;
  amountCents?:   number;           // Stripe (USD cents)
  amountUsdc?:    number;           // Solana
  txSignature?:   string;           // Solana tx sig
  stripeEventId?: string;
  lineItems:      OrderLineItem[];
  createdAt:      string;
  updatedAt:      string;
}

export interface OrderLineItem {
  productId: string;
  sku:       string;
  qty:       number;
  unitCents: number;
}

// ── Helius webhook enhanced transaction ─────────────────────────────────
export interface HeliusWebhookPayload {
  webhookId:  string;
  webhookType:string;
  txType:     string;
  accountData:HeliusAccountData[];
  events:     Record<string, unknown>;
  slot:       number;
  signature:  string;
  timestamp:  number;
  nativeTransfers?: HeliusTransfer[];
  tokenTransfers?:  HeliusTokenTransfer[];
}

export interface HeliusAccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: HeliusTokenBalanceChange[];
}

export interface HeliusTokenBalanceChange {
  mint:            string;
  rawTokenAmount:  { tokenAmount: string; decimals: number };
  tokenAccount:    string;
  userAccount:     string;
}

export interface HeliusTransfer {
  fromUserAccount: string;
  toUserAccount:   string;
  amount:          number;
}

export interface HeliusTokenTransfer {
  fromTokenAccount: string;
  toTokenAccount:   string;
  fromUserAccount:  string;
  toUserAccount:    string;
  tokenAmount:      number;
  mint:             string;
  tokenStandard:    string;
}
