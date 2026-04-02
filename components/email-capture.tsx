// components/email-capture.tsx
"use client";

import { useState } from "react";

export function EmailCapture({ compact = false }: { compact?: boolean }) {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/email-capture", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-bright" />
        <span className="font-mono text-[11px] text-green-bright">
          You&apos;re on the list. Stay prepared.
        </span>
      </div>
    );
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col sm:flex-row gap-2"}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="your@email.com"
        className="bg-void-2 border border-border-protocol rounded-lg px-3 py-2.5
                   font-mono text-[12px] text-text-base placeholder:text-text-mute2/40
                   focus:outline-none focus:border-gold-protocol/60 transition-colors
                   min-w-0 flex-1"
      />
      <button
        onClick={submit}
        disabled={status === "loading"}
        className="font-mono font-bold text-[11px] tracking-[.06em] px-4 py-2.5 rounded-lg
                   bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5
                   hover:shadow-[0_4px_16px_rgba(201,168,76,0.3)] transition-all duration-150
                   disabled:opacity-40 whitespace-nowrap flex-shrink-0"
      >
        {status === "loading" ? "..." : "Get Threat Updates →"}
      </button>
      {status === "error" && (
        <p className="font-mono text-[10px] text-red-bright mt-1">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
