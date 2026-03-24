// components/watchtower/globe-provisioner-panel.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GEAR } from "@/lib/watchtower/data";
import { GearPanel } from "./gear-panel";

export type ProvisionerTab = "gear" | "shop";

interface Props {
  open:        boolean;
  onClose:     () => void;
  activeTab:   ProvisionerTab;
  onTabChange: (t: ProvisionerTab) => void;
}

const TABS: { id: ProvisionerTab; label: string }[] = [
  { id: "gear", label: "⚙ Gear" },
  { id: "shop", label: "🛒 Shop" },
];

const SHOP_CATEGORIES = [
  { href: "/provisioner", label: "All Products",     icon: "◈", desc: "Full Tevatha-Certified catalog" },
  { href: "/provisioner", label: "Communications",   icon: "📡", desc: "Satellite, radio, faraday" },
  { href: "/provisioner", label: "Medical",          icon: "🩺", desc: "Trauma kits, antibiotics" },
  { href: "/provisioner", label: "Water & Food",     icon: "💧", desc: "Filtration, long-shelf storage" },
  { href: "/provisioner", label: "Power",            icon: "⚡", desc: "Solar, battery banks, EMP-safe" },
  { href: "/provisioner", label: "Security",         icon: "🔒", desc: "Physical security, safes" },
];

export function GlobeProvisionerPanel({ open, onClose, activeTab, onTabChange }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="provisioner-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 inset-y-0 z-30 w-[400px] max-w-[88vw]
                     flex flex-col bg-void-1/97 backdrop-blur-md
                     border-l border-border-protocol overflow-hidden"
          style={{ boxShadow: "-6px 0 48px rgba(0,0,0,0.7)" }}
        >
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
               style={{ background: "linear-gradient(90deg,transparent,#c9a84c,rgba(201,168,76,0.2))" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-protocol flex-shrink-0">
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-border-bright/40 transition-colors
                         font-mono text-[11px] flex items-center justify-center">✕</button>
            <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-gold-protocol">
              Provisioner · Tevatha Store
            </p>
          </div>

          {/* Tab strip */}
          <div className="flex border-b border-border-protocol flex-shrink-0">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => onTabChange(t.id)}
                className={`flex-1 py-2.5 font-mono text-[9.5px] font-bold tracking-[.07em]
                            transition-colors duration-150
                            ${activeTab === t.id
                              ? "text-gold-bright border-b-2 border-gold-protocol bg-gold-glow"
                              : "text-text-mute2 hover:text-text-base border-b-2 border-transparent"
                            }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}>

                {activeTab === "gear" && <GearPanel categories={GEAR} />}

                {activeTab === "shop" && (
                  <div className="space-y-2">
                    <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2 mb-3">
                      Tevatha-Certified Categories
                    </p>
                    {SHOP_CATEGORIES.map((cat) => (
                      <Link key={cat.label} href={cat.href}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border-protocol
                                   bg-void-3/50 hover:border-gold-dim/50 hover:bg-gold-glow/30
                                   transition-all duration-150 group">
                        <span className="text-[18px] flex-shrink-0">{cat.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] font-bold text-text-base group-hover:text-gold-bright transition-colors">
                            {cat.label}
                          </p>
                          <p className="font-mono text-[8.5px] text-text-mute2">{cat.desc}</p>
                        </div>
                        <span className="font-mono text-[10px] text-text-mute2 group-hover:text-gold-protocol transition-colors">→</span>
                      </Link>
                    ))}
                    <div className="pt-3 border-t border-border-protocol mt-3">
                      <Link href="/provisioner"
                        className="block w-full text-center font-mono text-[10px] font-bold
                                   bg-gold-glow border border-gold-dim text-gold-bright
                                   rounded-xl py-3 hover:-translate-y-0.5
                                   hover:shadow-[0_4px_16px_rgba(201,168,76,0.25)]
                                   transition-all duration-200">
                        Open Full Store →
                      </Link>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
