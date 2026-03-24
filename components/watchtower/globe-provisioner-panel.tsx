// components/watchtower/globe-provisioner-panel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GEAR } from "@/lib/watchtower/data";

export type ProvisionerTab = "products" | "browse";

interface Props {
  open:        boolean;
  onClose:     () => void;
  activeTab:   ProvisionerTab;
  onTabChange: (t: ProvisionerTab) => void;
}

const TABS: { id: ProvisionerTab; label: string }[] = [
  { id: "products", label: "🛒 Products" },
  { id: "browse",   label: "◈ Browse"   },
];

const SHOP_CATEGORIES = [
  { href: "/provisioner", label: "All Products",   icon: "◈", desc: "Full Tevatha-Certified catalog" },
  { href: "/provisioner", label: "Communications", icon: "📡", desc: "Satellite, radio, faraday"     },
  { href: "/provisioner", label: "Medical",        icon: "🩺", desc: "Trauma kits, antibiotics"      },
  { href: "/provisioner", label: "Water & Food",   icon: "💧", desc: "Filtration, long-shelf storage" },
  { href: "/provisioner", label: "Power",          icon: "⚡", desc: "Solar, battery banks, EMP-safe" },
  { href: "/provisioner", label: "Security",       icon: "🔒", desc: "Physical security, safes"      },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold-protocol text-[10px] tracking-[1px]">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

export function GlobeProvisionerPanel({ open, onClose, activeTab, onTabChange }: Props) {
  const [activeCat, setActiveCat] = useState<string>("All");

  const allCats     = ["All", ...GEAR.map((g) => g.cat)];
  const filteredItems = GEAR.flatMap((g) =>
    activeCat === "All" || g.cat === activeCat
      ? g.items.map((item) => ({ ...item, cat: g.cat }))
      : [],
  );

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
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg,transparent,#c9a84c,rgba(201,168,76,0.2))" }}
          />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-protocol flex-shrink-0">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-border-bright/40 transition-colors
                         font-mono text-[11px] flex items-center justify-center"
            >✕</button>
            <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-gold-protocol">
              Provisioner · Tevatha Store
            </p>
          </div>

          {/* Tab strip */}
          <div className="flex border-b border-border-protocol flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 py-2.5 font-mono text-[9.5px] font-bold tracking-[.07em]
                            transition-colors duration-150
                            ${activeTab === t.id
                              ? "text-gold-bright border-b-2 border-gold-protocol bg-gold-glow"
                              : "text-text-mute2 hover:text-text-base border-b-2 border-transparent"
                            }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* ── Products tab ─────────────────────────────────────────── */}
                {activeTab === "products" && (
                  <div>
                    {/* Category filter */}
                    <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5 border-b border-border-protocol/40">
                      {allCats.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCat(cat)}
                          className={`px-2.5 py-1 rounded-full border font-mono text-[8px] transition-all
                                      ${activeCat === cat
                                        ? "bg-gold-glow border-gold-protocol text-gold-bright"
                                        : "border-border-protocol text-text-mute2 hover:border-gold-protocol/30"
                                      }`}
                        >
                          {cat}
                        </button>
                      ))}
                      <span className="ml-auto font-mono text-[7.5px] text-text-mute2/60 self-center pr-1">
                        {filteredItems.length} items
                      </span>
                    </div>

                    {/* Product list */}
                    <div className="divide-y divide-border-protocol/40">
                      {filteredItems.map((item, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-white/[0.018] transition-colors">
                          {/* Name + price */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span
                                  className={`font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold
                                    ${item.tier === "T1"
                                      ? "text-green-bright border-green-bright/30 bg-green-dim"
                                      : item.tier === "T2"
                                      ? "text-blue-DEFAULT border-blue-DEFAULT/30 bg-blue-dim"
                                      : "text-purple-DEFAULT border-purple-DEFAULT/30 bg-void-3"
                                    }`}
                                >
                                  {item.tier}
                                </span>
                                {item.critical && (
                                  <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border
                                                   text-red-bright border-red-protocol/30 bg-red-dim
                                                   font-bold flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-red-bright animate-pulse" />
                                    CRITICAL
                                  </span>
                                )}
                                <span className="font-mono text-[7px] text-text-mute2/60">{item.cat}</span>
                              </div>
                              <p className="font-syne font-semibold text-[12px] text-text-base leading-snug">
                                {item.name}
                              </p>
                              <p className="font-mono text-[9px] text-text-mute2">{item.brand}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="font-mono font-bold text-[14px] text-gold-bright tabular-nums">
                                {item.price}
                              </p>
                            </div>
                          </div>

                          {/* Stars + spec */}
                          <div className="flex items-center gap-2 mb-2">
                            <Stars n={item.rating} />
                            <p className="font-mono text-[8.5px] text-text-dim line-clamp-1 flex-1">
                              {item.spec}
                            </p>
                          </div>

                          {/* Buy button */}
                          <Link
                            href="/provisioner"
                            className="flex items-center justify-center gap-1.5 w-full
                                       py-1.5 rounded-lg border border-gold-dim
                                       bg-gold-glow text-gold-bright font-mono text-[9px] font-bold
                                       hover:border-gold-protocol/60 hover:-translate-y-px
                                       hover:shadow-[0_4px_16px_rgba(201,168,76,0.2)]
                                       transition-all duration-150"
                          >
                            Buy on Tevatha →
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-3 border-t border-border-protocol">
                      <Link
                        href="/provisioner"
                        className="block w-full text-center font-mono text-[9px] font-bold
                                   bg-void-3 border border-border-protocol text-text-mute2
                                   rounded-xl py-2.5 hover:text-gold-bright hover:border-gold-protocol/30
                                   transition-all duration-200"
                      >
                        Open Full Store →
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── Browse tab ───────────────────────────────────────────── */}
                {activeTab === "browse" && (
                  <div className="p-3 space-y-2">
                    <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2 mb-3">
                      Tevatha-Certified Categories
                    </p>
                    {SHOP_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border-protocol
                                   bg-void-3/50 hover:border-gold-dim/50 hover:bg-gold-glow/30
                                   transition-all duration-150 group"
                      >
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
                      <Link
                        href="/provisioner"
                        className="block w-full text-center font-mono text-[10px] font-bold
                                   bg-gold-glow border border-gold-dim text-gold-bright
                                   rounded-xl py-3 hover:-translate-y-0.5
                                   hover:shadow-[0_4px_16px_rgba(201,168,76,0.25)]
                                   transition-all duration-200"
                      >
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
