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
    <div className="border border-cyan-border rounded-card-lg p-5
                    bg-cyan-dim backdrop-blur-glass">
      <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.18em]
                     uppercase mb-3">Your Referral Link</p>
      <div className="flex items-center gap-3 flex-wrap">
        <code className="flex-1 font-mono text-[11px] text-text-base
                          bg-void-3 border border-border-protocol rounded-card
                          px-3 py-2 truncate">
          {link}
        </code>
        <button onClick={copy}
          className="font-mono text-[10px] font-bold tracking-[.1em]
                     px-4 py-2 rounded-card border transition-all duration-150
                     bg-cyan-DEFAULT text-void-0 border-transparent
                     hover:bg-cyan-DEFAULT/80">
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
      <p className="font-mono text-[9.5px] text-text-mute2 mt-3">
        Commission credited within 48h of referred user&apos;s first confirmed order.
      </p>
    </div>
  );
}
