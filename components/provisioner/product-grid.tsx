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
  "reolink-810a":         "/products/reolink-810a.png",
  "faraday-xl":           "/products/faraday-xl.jpg",
};

type FilterTab = "all" | ProductCategory | "critical";

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
                ? "rounded-full bg-gold-glow border border-gold-protocol text-gold-bright"
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
            <ProductCard product={p} />
          </StaggerChild>
        ))}
      </StaggerParent>
    </>
  );
}

function ProductCard({ product: p }: { product: Product }) {
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
      className={`bg-void-1 border rounded-xl overflow-hidden
                  hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                  transition-shadow duration-200 ${g.border}`}
    >
      {/* Product image */}
      <div className="relative h-44 bg-void-2 border-b border-border-protocol overflow-hidden">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={p.name}
            fill
            className="object-contain p-5"
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
            <div className="font-syne font-bold text-[19px] leading-none text-gold-protocol">
              <FadeIn>${(p.priceUsd / 100).toFixed(2)}</FadeIn>
            </div>
            <div className="font-mono text-[9px] text-cyan-DEFAULT mt-0.5">
              <FadeIn delay={0.05}>◎ {p.priceUsdc.toFixed(2)} USDC</FadeIn>
            </div>
          </div>
        </div>

        <p className="text-[12.5px] text-text-dim leading-relaxed mb-3.5">
          {p.spec}
        </p>

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

      {/* Build note */}
      <div className="px-5 py-2.5 bg-void-2 border-t border-border-protocol">
        <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">
          ▸ {p.buildNote}
        </p>
      </div>

      {/* Add to cart */}
      <div className="p-5 border-t border-border-protocol">
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
      </div>
    </motion.article>
  );
}
