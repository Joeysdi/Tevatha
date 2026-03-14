// components/provisioner/solana-checkout.tsx
"use client";

import { useState, useCallback } from "react";
import type { SolanaInvoice } from "@/types/treasury";

interface SolanaCheckoutProps {
  productId:   string;
  productName: string;
  priceUsdc:   number;
  onSuccess?:  (invoice: SolanaInvoice) => void;
}

export function SolanaCheckout({
  productId,
  productName,
  priceUsdc,
  onSuccess,
}: SolanaCheckoutProps) {
  const [invoice,  setInvoice]  = useState<SolanaInvoice | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  const generateInvoice = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/solana/invoice", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId, qty: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invoice generation failed");

      setInvoice(data as SolanaInvoice);
      onSuccess?.(data as SolanaInvoice);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [productId, onSuccess]);

  const copyUrl = useCallback(async () => {
    if (!invoice) return;
    await navigator.clipboard.writeText(invoice.solanaPayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [invoice]);

  if (!invoice) {
    return (
      <div className="space-y-3">
        <button
          onClick={generateInvoice}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2
                     bg-cyan-DEFAULT text-void-0 font-mono font-bold
                     text-[12px] tracking-[.08em] px-5 py-3 rounded-lg
                     transition-all duration-200
                     hover:bg-cyan-DEFAULT/90 hover:-translate-y-0.5
                     hover:shadow-[0_4px_20px_rgba(0,212,255,0.25)]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:transform-none"
        >
          {loading ? (
            <><span className="animate-spin">⟳</span> Generating Invoice…</>
          ) : (
            <>⬡ PAY {priceUsdc} USDC — SOLANA</>
          )}
        </button>

        {error && (
          <p className="font-mono text-[10px] text-red-bright text-center">
            {error}
          </p>
        )}

        <p className="font-mono text-[9.5px] text-text-mute2 text-center
                      tracking-[.08em]">
          USDC ON SOLANA · NO COUNTERPARTY RISK · INSTANT SETTLEMENT
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Invoice details */}
      <div className="bg-void-2 border border-cyan-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono text-[9.5px] text-text-mute2 tracking-[.12em]">
            INVOICE
          </span>
          <span className="font-mono text-[10px] text-cyan-DEFAULT">
            {invoice.invoiceId.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-text-dim">Product</span>
            <span className="text-text-base font-medium">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dim">Amount</span>
            <span className="text-cyan-DEFAULT font-mono font-bold">
              {invoice.amountUsdc} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dim">Expires</span>
            <span className="font-mono text-[11px] text-text-mute2">
              {new Date(invoice.expiresAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Solana Pay URL for wallet deeplink */}
      <a
        href={invoice.solanaPayUrl}
        className="w-full flex items-center justify-center gap-2
                   bg-cyan-DEFAULT text-void-0 font-mono font-bold
                   text-[12px] tracking-[.08em] px-5 py-3 rounded-lg
                   transition-all duration-200
                   hover:bg-cyan-DEFAULT/90"
      >
        ◎ OPEN IN WALLET
      </a>

      <button
        onClick={copyUrl}
        className="w-full flex items-center justify-center gap-2
                   bg-transparent text-cyan-DEFAULT font-mono text-[11px]
                   tracking-[.06em] px-5 py-2 rounded-lg
                   border border-cyan-border
                   transition-all duration-150
                   hover:bg-cyan-dim"
      >
        {copied ? "✓ COPIED" : "COPY PAYMENT URL"}
      </button>

      <button
        onClick={() => { setInvoice(null); setError(null); }}
        className="w-full font-mono text-[10px] text-text-mute2
                   hover:text-text-dim transition-colors"
      >
        ← Generate new invoice
      </button>
    </div>
  );
}
