// components/watchtower/globe-protocol-panel.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open:    boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function GlobeProtocolPanel({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;

    // Save currently focused element so we can restore it on close
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Auto-focus first focusable element inside the dialog
    const focusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    focusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0];
      const last  = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Protocol · Continuity Vault"
          key="protocol-panel"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-[86px] left-1/2 -translate-x-1/2 z-30
                     w-[480px] max-w-[95vw] rounded-2xl overflow-hidden
                     bg-void-1/97 backdrop-blur-md border border-cyan-border"
          style={{ boxShadow: "0 -6px 48px rgba(0,212,255,0.15)" }}
        >
          {/* Cyan accent line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
               style={{ background: "linear-gradient(90deg,transparent,#00d4ff,transparent)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-protocol">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
              <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-cyan-DEFAULT">
                Protocol · Continuity Vault
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Protocol panel"
              className="min-w-[44px] min-h-[44px] rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-cyan-border transition-colors
                         font-mono text-[11px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="px-5 py-4 grid grid-cols-3 gap-4">
            {/* Description */}
            <div className="col-span-2">
              <h3 className="font-syne font-bold text-[14px] text-text-base mb-1.5">
                Continuity Ledger
              </h3>
              <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mb-3">
                AES-256-GCM encrypted offline vault. Stores critical continuity data
                — account numbers, contacts, documents — that survives infrastructure collapse.
                PIN-gated. Works with zero connectivity.
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "AES-256-GCM", col: "text-cyan-DEFAULT border-cyan-border" },
                  { label: "OFFLINE FIRST", col: "text-cyan-DEFAULT border-cyan-border" },
                  { label: "PIN GATED",    col: "text-gold-protocol border-gold-dim" },
                  { label: "ZERO SYNC",    col: "text-text-mute2 border-border-protocol" },
                ].map((b) => (
                  <span key={b.label}
                    className={`font-mono text-[8px] tracking-[.1em] px-2 py-0.5
                                rounded border ${b.col}`}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col justify-center gap-2">
              <Link href="/ledger"
                className="block text-center font-mono text-[10px] font-bold
                           bg-cyan-DEFAULT/10 border border-cyan-border
                           text-cyan-DEFAULT rounded-xl px-4 py-3
                           hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,212,255,0.2)]
                           transition-all duration-200">
                Open Vault →
              </Link>
              <Link href="/envoy"
                className="block text-center font-mono text-[10px]
                           text-text-mute2 hover:text-text-base
                           border border-border-protocol rounded-xl px-4 py-2
                           transition-colors">
                Envoy Network
              </Link>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
