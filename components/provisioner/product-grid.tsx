// components/provisioner/product-grid.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { StaggerParent, StaggerChild, FadeIn } from "@/components/ui/motion";
import { GradeBadge }  from "./grade-badge";
import { useCart }     from "@/lib/cart/store";
import type { Product, ProductCategory } from "@/lib/provisioner/catalog";
import type { GradeLevel } from "@/types/treasury";
import { useTranslation } from "@/lib/i18n/use-translation";

// Maps imageSlug → local /public path for each product that has an image
const PRODUCT_IMAGES: Record<string, string> = {
  "garmin-inreach-mini2": "/products/garmin-inreach-mini2.jpg",
  "baofeng-uv5r":         "/products/baofeng-uv5r.jpg",
  "starlink-mini":        "/products/starlink-mini.png",
  "nar-ifak":             "/products/nar-ifak.jpg",
  "myfak-advanced":       "/products/myfak-advanced.png",
  "quikclot":             "/products/quikclot.jpg",
  "jackery-1000plus":     "/products/jackery-1000plus.png",
  "ecoflow-delta-pro":    "/products/ecoflow-delta-pro.png",
  "renogy-400w":          "/products/renogy-400w.jpg",
  "wavian-jerry":         "/products/wavian-jerry.jpg",
  "noco-gb40":            "/products/noco-gb40.png",
  "berkey-big":           "/products/berkey-big.jpg",
  "sawyer-squeeze":       "/products/sawyer-squeeze.png",
  "reolink-810a":               "/products/reolink-810a.png",
  "faraday-xl":                 "/products/faraday-xl.jpg",
  "midland-er310":              "/products/midland-er310.jpg",
  "motorola-t800":              "/products/motorola-t800.jpg",
  "israeli-bandage":            "/products/israeli-bandage.jpg",
  "celox-granules":             "/products/celox-granules.jpg",
  "goal-zero-yeti-200x":        "/products/goal-zero-yeti-200x.jpg",
  "garmin-gpsmap-67":           "/products/garmin-gpsmap-67.jpg",
  "waterbob":                   "/products/waterbob.jpg",
  "potable-aqua":               "/products/potable-aqua.jpg",
  "surefire-g2x":               "/products/surefire-g2x.jpg",
  "sol-bivvy":                  "/products/sol-bivvy.jpg",
  "kelty-cosmic-20":            "/products/kelty-cosmic-20.jpg",
  "titan-tarp":                 "/products/titan-tarp.jpg",
  "rea-nz-south-island":        "/products/rea-nz-south-island.jpg",
  "rea-switzerland-graubunden": "/products/rea-switzerland-graubunden.jpg",
  "rea-iceland-westfjords":     "/products/rea-iceland-westfjords.jpg",
  "rea-uruguay-rivera":         "/products/rea-uruguay-rivera.jpg",
  "rea-portugal-alentejo":      "/products/rea-portugal-alentejo.jpg",
  "rea-finland-lapland":        "/products/rea-finland-lapland.jpg",
  "rea-australia-tasmania":     "/products/rea-australia-tasmania.jpg",
  "rea-canada-bc-interior":     "/products/rea-canada-bc-interior.jpg",
  "rea-norway-innlandet":       "/products/rea-norway-innlandet.jpg",
  "rea-costa-rica-guanacaste":  "/products/rea-costa-rica-guanacaste.jpg",
  "rea-chile-patagonia":        "/products/rea-chile-patagonia.jpg",
  "rea-panama-boquete":         "/products/rea-panama-boquete.jpg",
};

type FilterTab = "all" | ProductCategory | "critical";

function SafetyBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "#1ae8a0" : value >= 60 ? "#c9a84c" : "#e84040";
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[8px] text-text-mute2 tracking-[.08em] w-[72px] flex-shrink-0 uppercase">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-void-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[8px] tabular-nums w-6 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

const GRADE_BAR: Record<GradeLevel, string> = {
  A: "#1ae8a0",
  B: "#c9a84c",
  C: "#f0a500",
  D: "#e84040",
  F: "rgba(255,255,255,0.07)",
};

const TIER_COLORS = {
  T0: "text-text-mute2",
  T1: "text-green-bright",
  T2: "text-blue-DEFAULT",
  T3: "text-purple-DEFAULT",
} as const;

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitState, setSubmitState] = useState<"idle"|"loading"|"done"|"error">("idle");

  const openInquiry = (p: Product) => {
    setInquiryProduct(p);
    setForm({ name: "", email: "", message: `I'm interested in ${p.name} and would like more information.` });
    setSubmitState("idle");
  };

  const FILTER_LABELS: Record<FilterTab, string> = {
    all:            t("filter_all_items"),
    critical:       t("filter_critical"),
    communications: t("filter_comms"),
    medical:        t("filter_medical"),
    energy:         t("filter_energy"),
    mobility:       t("filter_mobility"),
    water:          t("filter_water"),
    security:       t("filter_security"),
    shelter:        t("filter_shelter"),
    real_estate:    "Real Estate",
  };

  // Derive available filter tabs from actual catalog
  const availableFilters = useMemo<FilterTab[]>(() => {
    const cats = new Set<FilterTab>(
      products.map((p) => p.category as FilterTab)
    );
    return ["all", "critical", ...Array.from(cats).sort()] as FilterTab[];
  }, [products]);

  const filtered = useMemo(() => {
    if (activeFilter === "all")      return products;
    if (activeFilter === "critical") return products.filter((p) => p.criticalFlag);
    return products.filter((p) => p.category === activeFilter);
  }, [products, activeFilter]);

  const handleInquirySubmit = async () => {
    if (!inquiryProduct) return;
    setSubmitState("loading");
    try {
      const res = await fetch("/api/provisioner/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: inquiryProduct.id, ...form }),
      });
      setSubmitState(res.ok ? "done" : "error");
    } catch {
      setSubmitState("error");
    }
  };

  const closeModal = () => {
    setInquiryProduct(null);
    setForm({ name: "", email: "", message: "" });
    setSubmitState("idle");
  };

  return (
    <>
      {/* Filter strip */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-void-2 rounded-xl
                      border border-border-protocol mb-7">
        {availableFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`
              px-4 py-1.5 text-[11.5px] font-medium transition-all duration-150
              focus-visible:outline-none whitespace-nowrap
              ${activeFilter === f
                ? "rounded-full bg-gold-glow border border-gold-protocol border-l-2 border-l-gold-protocol text-gold-bright"
                : "rounded-full border-transparent text-text-mute2 hover:bg-white/[0.03]"
              }
            `}
          >
            {FILTER_LABELS[f] ?? f}
            {f === "critical" && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-bright
                               inline-block animate-pulse" />
            )}
          </button>
        ))}
        <span className="ml-auto self-center pr-2 font-mono text-[9.5px]
                          text-text-mute2 tracking-[.06em]">
          {filtered.length} {t("shop_items")}
        </span>
      </div>

      {/* Product grid */}
      <StaggerParent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <StaggerChild key={p.id}>
            <ProductCard product={p} onInquire={openInquiry} />
          </StaggerChild>
        ))}
      </StaggerParent>

      {/* Inquiry modal */}
      {inquiryProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-0/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-void-1 border border-border-protocol
                       rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent)" }} />

            {/* Header */}
            <div className="p-5 border-b border-border-protocol">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GradeBadge grade={inquiryProduct.grade} composite={inquiryProduct.gradeComposite} size="sm" />
                    <span className="font-mono text-[9px] text-text-mute2">
                      {inquiryProduct.location}
                    </span>
                  </div>
                  <h2 className="font-syne font-bold text-[16px] text-text-base leading-snug">
                    {inquiryProduct.name}
                  </h2>
                  <p className="font-mono text-[11px] text-gold-protocol mt-0.5">
                    {inquiryProduct.priceDisplay}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-text-mute2 hover:text-text-base transition-colors text-[18px] leading-none flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5">
              {submitState === "done" ? (
                <div className="text-center py-4">
                  <div className="text-[28px] mb-3">✓</div>
                  <p className="font-syne font-bold text-[15px] text-green-bright mb-1">Inquiry received.</p>
                  <p className="font-mono text-[11px] text-text-dim">We&apos;ll connect you within 24h.</p>
                  <button
                    onClick={closeModal}
                    className="mt-5 font-mono text-[11px] font-bold px-5 py-2 rounded-lg
                               border border-border-protocol text-text-mute2 hover:text-text-base
                               hover:border-border-bright transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : submitState === "error" ? (
                <div className="text-center py-4">
                  <p className="font-syne font-bold text-[15px] text-red-bright mb-1">Something went wrong.</p>
                  <p className="font-mono text-[11px] text-text-dim">
                    Email <span className="text-gold-protocol">provisioner@tevatha.com</span> directly.
                  </p>
                  <button
                    onClick={() => setSubmitState("idle")}
                    className="mt-5 font-mono text-[11px] font-bold px-5 py-2 rounded-lg
                               border border-border-protocol text-text-mute2 hover:text-text-base
                               transition-all"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-mono text-[9.5px] text-text-mute2 tracking-[.1em] uppercase mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-void-2 border border-border-protocol rounded-lg
                                 px-3 py-2.5 font-mono text-[12px] text-text-base
                                 placeholder:text-text-mute2/50 focus:outline-none
                                 focus:border-gold-protocol/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9.5px] text-text-mute2 tracking-[.1em] uppercase mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full bg-void-2 border border-border-protocol rounded-lg
                                 px-3 py-2.5 font-mono text-[12px] text-text-base
                                 placeholder:text-text-mute2/50 focus:outline-none
                                 focus:border-gold-protocol/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9.5px] text-text-mute2 tracking-[.1em] uppercase mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full bg-void-2 border border-border-protocol rounded-lg
                                 px-3 py-2.5 font-mono text-[12px] text-text-base resize-none
                                 placeholder:text-text-mute2/50 focus:outline-none
                                 focus:border-gold-protocol/60 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleInquirySubmit}
                    disabled={submitState === "loading" || !form.name || !form.email}
                    className="w-full font-mono font-bold text-[11px] tracking-[.06em]
                               px-4 py-2.5 rounded-lg bg-gold-protocol text-void-0
                               hover:bg-gold-bright hover:-translate-y-0.5 transition-all duration-150
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {submitState === "loading" ? "Sending…" : "Submit Inquiry →"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function ProductCard({ product: p, onInquire }: { product: Product; onInquire: (p: Product) => void }) {
  const { t } = useTranslation();
  const { addItem, setOpen } = useCart();
  const [added, setAdded] = useState(false);

  const gradeMeta = {
    A: { border: "border-[#1ae8a0]/25", glow: "hover:shadow-[0_0_24px_rgba(26,232,160,0.08)]" },
    B: { border: "border-gold-protocol/25", glow: "hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]" },
    C: { border: "border-amber-DEFAULT/20", glow: "" },
    D: { border: "border-red-protocol/20",  glow: "" },
    F: { border: "border-border-protocol",  glow: "" },
  } satisfies Record<GradeLevel, { border: string; glow: string }>;

  const g = gradeMeta[p.grade];
  const imgSrc = PRODUCT_IMAGES[p.imageSlug];

  const handleAddToCart = () => {
    addItem({
      id:           p.id,
      sku:          p.sku,
      name:         p.name,
      brand:        p.brand,
      priceUsd:     p.priceUsd,
      priceUsdc:    p.priceUsdc,
      highTicket:   p.highTicket,
      imageSlug:    p.imageSlug,
      stripePriceId: p.stripePriceId,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setOpen(true);
    }, 600);
  };

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`relative bg-void-1 border rounded-xl overflow-hidden
                  hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                  transition-shadow duration-200 ${g.border}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.55),transparent)" }}
      />
      {/* Grade left-bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{ background: GRADE_BAR[p.grade] }}
      />
      {/* Product image */}
      <div className={`relative h-44 border-b border-border-protocol overflow-hidden ${p.category === "real_estate" ? "bg-void-2" : "bg-white"}`}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={p.name}
            fill
            className={p.category === "real_estate" ? "object-cover" : "object-contain p-5"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <span className="font-mono text-[28px] opacity-20">📦</span>
            <span className="font-mono text-[9px] text-text-mute2/40 tracking-[.14em] uppercase">{p.brand}</span>
          </div>
        )}
      </div>

      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <GradeBadge grade={p.grade} composite={p.gradeComposite} size="sm" />
              {p.criticalFlag && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5
                                 rounded-full bg-red-dim text-red-bright
                                 border border-red-protocol/28
                                 font-mono text-[9px] font-semibold">
                  <span className="w-1 h-1 rounded-full bg-red-bright animate-pulse" />
                  CRITICAL
                </span>
              )}
            </div>
            <h3 className="font-syne font-bold text-[15px] text-text-base
                            leading-snug">
              {p.name}
            </h3>
            <p className="font-mono text-[9.5px] text-text-mute2 mt-1">
              {p.brand} · {p.sku}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="font-mono text-[7px] text-text-mute2 tracking-[.14em] uppercase mb-0.5">USD</div>
            <div className="font-mono font-bold text-[15px] tabular-nums leading-none text-gold-protocol">
              <FadeIn>{p.priceDisplay ?? `$${(p.priceUsd / 100).toFixed(2)}`}</FadeIn>
            </div>
            {p.category !== "real_estate" && (
              <div className="font-mono text-[9px] text-cyan-DEFAULT mt-0.5">
                <FadeIn delay={0.05}>◎ {p.priceUsdc.toFixed(2)} USDC</FadeIn>
              </div>
            )}
            {p.location && (
              <div className="font-mono text-[8px] text-text-mute2 mt-0.5 max-w-[120px] text-right leading-tight">
                {p.location}
              </div>
            )}
          </div>
        </div>

        <p className="text-[12.5px] text-text-dim leading-relaxed mb-3.5">
          {p.spec}
        </p>

        {p.safetyScore && (
          <div className="space-y-1.5 mb-3.5 p-3 bg-void-2 rounded-lg border border-border-protocol/50">
            <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.1em] uppercase mb-2">Safety Index</p>
            <SafetyBar label="Nuclear Dist" value={p.safetyScore.nuclearDistance} />
            <SafetyBar label="Disaster"     value={p.safetyScore.disasterRisk} />
            <SafetyBar label="Density"      value={p.safetyScore.populationDensity} />
            <SafetyBar label="Stability"    value={p.safetyScore.politicalStability} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`font-mono text-[10px] font-bold
                            ${TIER_COLORS[p.tier]}`}>
            {p.tier} ITEM
          </span>
          <span className={`font-mono text-[10px] ${p.inStock ? "text-green-bright" : "text-red-bright"}`}>
            {p.inStock ? `● ${t("shop_in_stock")}` : `○ ${t("shop_out_of_stock")}`}
          </span>
        </div>
      </div>

      {/* Build / listing note */}
      <div className="px-5 py-2.5 bg-void-2/60 border-t border-border-protocol/50">
        <p className="font-mono text-[9px] text-text-mute2 tracking-[.08em] uppercase mb-1">
          {p.listingNote ?? "Build note"}
        </p>
        <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">
          ▸ {p.buildNote}
        </p>
      </div>

      {/* Action button */}
      <div className="p-5 border-t border-border-protocol">
        {p.category === "real_estate" ? (
          <button
            onClick={() => onInquire(p)}
            className="w-full font-mono font-bold text-[11px] tracking-[.06em]
                       px-4 py-2.5 rounded-lg transition-all duration-150
                       bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5"
          >
            Inquire →
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!p.inStock}
            className={`w-full font-mono font-bold text-[11px] tracking-[.06em]
                       px-4 py-2.5 rounded-lg transition-all duration-150
                       ${added
                         ? "bg-green-bright/20 text-green-bright border border-green-bright/30"
                         : "bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5"
                       }
                       disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added
              ? `✓ ${t("shop_added_to_cart")}`
              : p.inStock
                ? `${t("shop_add_to_cart")} — $${(p.priceUsd / 100).toFixed(2)}`
                : t("shop_out_of_stock")}
          </button>
        )}
      </div>
    </motion.article>
  );
}
