// app/donate/page.tsx  →  tevatha.com/donate
"use client";

import { useState } from "react";
import Link from "next/link";

const WALLET = "TMJwucn2aQpzfLBabAPzr8x6dH7ViZ1Rqb";

export default function DonatePage() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(WALLET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-void-0 flex flex-col items-center justify-center px-4 py-12">

      {/* Back link */}
      <div className="w-full max-w-md mb-8">
        <Link
          href="/provisioner"
          className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors"
        >
          ← Back to Tevatha
        </Link>
      </div>

      <div className="w-full max-w-md space-y-4">

        {/* Header card */}
        <div
          className="relative rounded-2xl border border-gold-protocol/30 bg-void-1 p-7 overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 40px rgba(0,0,0,0.4)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
          />

          {/* Nonprofit badge */}
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-green-bright
                           border border-green-bright/30 bg-green-bright/5 px-2.5 py-1
                           rounded-full tracking-[.1em] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-bright" />
            Free · Nonprofit · No Paywalls
          </span>

          <h1 className="font-syne font-extrabold text-[28px] text-text-base leading-tight mb-3">
            Tevatha is free.<br />
            <span className="text-gold-protocol">Keep it alive.</span>
          </h1>

          <p className="text-text-dim text-[13px] leading-relaxed">
            Tevatha is a nonprofit threat intelligence and emergency preparedness platform.
            No subscriptions. No paywalls. Everything — the Watchtower, the gear catalog,
            the survival guides — is free to everyone, forever.
          </p>

          <p className="text-text-dim text-[13px] leading-relaxed mt-3">
            If this resource helps you prepare, a small donation keeps the servers running
            and the research going.
          </p>
        </div>

        {/* Wallet card */}
        <div
          className="relative rounded-2xl border border-border-protocol bg-void-1 p-6 overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)" }}
          />

          <p className="font-mono text-[9px] text-text-mute2 tracking-[.18em] uppercase mb-4">
            Donate · USDT on Tron (TRC-20)
          </p>

          {/* Wallet address + copy */}
          <div className="bg-void-2 border border-border-protocol rounded-xl px-4 py-3.5 mb-4">
            <p className="font-mono text-[11px] text-text-base break-all leading-relaxed select-all">
              {WALLET}
            </p>
          </div>

          <button
            onClick={copy}
            className={`w-full font-mono font-bold text-[12px] tracking-[.06em]
                       px-4 py-3.5 rounded-xl transition-all duration-200
                       ${copied
                         ? "bg-green-bright/15 text-green-bright border border-green-bright/30"
                         : "bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)]"
                       }`}
          >
            {copied ? "✓ Address Copied" : "Copy Wallet Address"}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="font-mono text-[9px] text-text-mute2">Network: Tron (TRX)</span>
            <span className="w-px h-3 bg-border-protocol" />
            <span className="font-mono text-[9px] text-text-mute2">Token: USDT TRC-20</span>
            <span className="w-px h-3 bg-border-protocol" />
            <a
              href={`https://tronscan.org/#/address/${WALLET}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] text-text-mute2 hover:text-gold-protocol transition-colors"
            >
              View on Tronscan ↗
            </a>
          </div>
        </div>

        {/* Thank you note */}
        <p className="font-mono text-[10px] text-text-mute2 text-center leading-relaxed px-2">
          Every contribution goes directly to keeping Tevatha free and updated.
          Thank you for helping people prepare.
        </p>

      </div>
    </div>
  );
}
