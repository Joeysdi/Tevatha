// components/watchtower/globe-envoy-panel.tsx
"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open:    boolean;
  onClose: () => void;
}

const TIER_RATES = [
  { tier: 1, label: "Envoy",    rate: "5%",  threshold: "$0"      },
  { tier: 2, label: "Sentinel", rate: "8%",  threshold: "$10,000" },
  { tier: 3, label: "Warden",   rate: "12%", threshold: "$50,000" },
];

export function GlobeEnvoyPanel({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="envoy-panel"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-[86px] left-1/2 -translate-x-1/2 z-30
                     w-[520px] max-w-[95vw] rounded-2xl overflow-hidden
                     bg-void-1/97 backdrop-blur-md border border-gold-dim"
          style={{ boxShadow: "0 -6px 48px rgba(201,168,76,0.15)" }}
        >
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
               style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-protocol">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-protocol animate-pulse" />
              <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-gold-protocol">
                Envoy Network · Ambassador Program
              </p>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-gold-dim transition-colors
                         font-mono text-[11px] flex items-center justify-center">✕</button>
          </div>

          <div className="px-5 py-4">
            {/* Commission tiers */}
            <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2 mb-3">
              Commission Tiers
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {TIER_RATES.map((t) => (
                <div key={t.tier}
                  className="bg-void-3 border border-border-protocol rounded-xl p-3 text-center">
                  <p className="font-mono text-[8px] text-text-mute2 mb-1">Tier {t.tier} · {t.label}</p>
                  <p className="font-syne font-bold text-[20px] text-gold-bright leading-none mb-1">
                    {t.rate}
                  </p>
                  <p className="font-mono text-[8px] text-text-mute2">from {t.threshold}</p>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex gap-3">
              <Link href="/envoy"
                className="flex-1 text-center font-mono text-[10px] font-bold
                           bg-gold-glow border border-gold-dim
                           text-gold-bright rounded-xl px-4 py-3
                           hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(201,168,76,0.25)]
                           transition-all duration-200">
                Ambassador Dashboard →
              </Link>
              <Link href="/provisioner"
                className="flex-1 text-center font-mono text-[10px]
                           text-text-mute2 hover:text-text-base
                           border border-border-protocol rounded-xl px-4 py-3
                           transition-colors">
                Shop Now
              </Link>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
