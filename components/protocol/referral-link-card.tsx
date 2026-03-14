// components/protocol/referral-link-card.tsx
"use client";

import { useState, useCallback } from "react";

interface ReferralLinkCardProps { userId: string; }

export function ReferralLinkCard({ userId }: ReferralLinkCardProps) {
  const link    = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tevatha.com"}/?ref=${userId.slice(-8)}`;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [link]);

  return (
    <div className="border border-cyan-border rounded-xl p-6
                    bg-cyan-dim backdrop-blur-glass"
         style={{ boxShadow: "0 0 0 1px rgba(0,212,255,0.06) inset, 0 4px 24px rgba(0,0,0,0.3)" }}>
      <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.2em]
                     uppercase mb-4 opacity-90">Your Referral Link</p>
      <div className="flex items-center gap-3 flex-wrap">
        <code className="flex-1 font-mono text-[11.5px] text-text-base
                          bg-void-3 border border-border-protocol rounded-lg
                          px-4 py-2.5 truncate min-w-0">
          {link}
        </code>
        <button onClick={copy}
          className="font-mono text-[10.5px] font-bold tracking-[.1em]
                     px-5 py-2.5 rounded-lg border transition-all duration-150
                     bg-cyan-DEFAULT text-void-0 border-transparent
                     hover:bg-cyan-DEFAULT/85 hover:-translate-y-px
                     hover:shadow-[0_4px_16px_rgba(0,212,255,0.2)]
                     active:translate-y-0">
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
      <p className="font-mono text-[9.5px] text-text-mute2 mt-4 leading-relaxed">
        Commission credited within 48h of referred user&apos;s first confirmed order.
      </p>
    </div>
  );
}
