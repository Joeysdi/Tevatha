// lib/solana/pay.ts
// Implements Solana Pay Transaction Request URL specification:
// https://docs.solanapay.com/spec#specification-transfer-request

import { PublicKey } from "@solana/web3.js";
import {
  encodeURL,
  type TransferRequestURL,
} from "@solana/pay";
import BigNumber from "bignumber.js";
import { getTreasuryAta, getUsdcMint } from "./treasury";
import type { SolanaInvoice } from "@/types/treasury";
import { randomUUID } from "crypto";

const INVOICE_TTL_MINUTES = 30;

export interface CreateInvoiceParams {
  invoiceId?:    string;
  amountUsdc:    number;
  label:         string;
  message:       string;
  referenceKey:  string;  // base58 ephemeral pubkey from generateEphemeralReference()
}

export function buildSolanaPayInvoice(params: CreateInvoiceParams): SolanaInvoice {
  const {
    amountUsdc,
    label,
    message,
    referenceKey,
  } = params;

  const invoiceId   = params.invoiceId ?? randomUUID();
  const recipient   = getTreasuryAta();
  const usdcMint    = getUsdcMint();
  const reference   = new PublicKey(referenceKey);
  const expiresAt   = new Date(
    Date.now() + INVOICE_TTL_MINUTES * 60 * 1000
  ).toISOString();

  // Build Solana Pay Transfer Request URL
  // Spec: solana:<recipient>?amount=<n>&spl-token=<mint>&reference=<key>&label=<l>&message=<m>&memo=<m>
  const transferRequest: TransferRequestURL = {
    recipient,
    amount:    new BigNumber(amountUsdc), // Solana Pay amount = token units (USDC), NOT microUSDC
    splToken:  usdcMint,
    reference: [reference],           // Array — wallet embeds all refs as account keys
    label,
    message,
    memo:      invoiceId,              // On-chain memo = our invoice ID
  };

  const solanaPayUrl = encodeURL(transferRequest).toString();

  return {
    invoiceId,
    referenceKey,
    recipientAta:   recipient.toBase58(),
    amountUsdc,
    amountLamports: usdcToLamports(amountUsdc),
    label,
    message,
    memo:           invoiceId,
    expiresAt,
    solanaPayUrl,
    createdAt:      new Date().toISOString(),
  };
}
