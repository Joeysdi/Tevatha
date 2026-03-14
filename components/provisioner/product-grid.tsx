// components/provisioner/product-grid.tsx
"use client";

import { useState, useMemo } from "react";
import { GradeBadge }         from "./grade-badge";
import { SolanaCheckout }     from "./solana-checkout";
import type { Product, ProductCategory } from "@/lib/provisioner/catalog";
import type { GradeLevel }    from "@/types/treasury";

type FilterTab = "all" | ProductCategory | "critical";

const FILTER_LABELS: Record<FilterTab, string> = {
  all:            "All Items",
  critical:       "Critical",
  communications: "Comms",
  medical:        "Medical",
  energy:         "Energy",
  mobility:       "Mobility",
  water:          "Water",
  security:       "Security",
  shelter:        "Shelter",
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
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

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
              px-4 py-1.5 text-[11.5px] rounded-lg transition-all duration-150
              font-medium focus-visible:outline-none whitespace-nowrap
              ${activeFilter === f
                ? "bg-void-3 text-text-base font-semibold border border-border-hover shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                : "text-text-mute2 hover:text-text-base hover:bg-white/[0.03]"
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
          {filtered.length} ITEMS
        </span>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            expanded={expandedId === p.id}
            onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
          />
        ))}
      </div>
    </>
  );
}

function ProductCard({
  product: p,
  expanded,
  onToggle,
}: {
  product:  Product;
  expanded: boolean;
  onToggle: () => void;
}) {
  const gradeMeta = {
    A: { border: "border-[#1ae8a0]/25", glow: "hover:shadow-[0_0_24px_rgba(26,232,160,0.08)]" },
    B: { border: "border-gold-protocol/25", glow: "hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]" },
    C: { border: "border-amber-DEFAULT/20", glow: "" },
    D: { border: "border-red-protocol/20",  glow: "" },
    F: { border: "border-border-protocol",  glow: "" },
  } satisfies Record<GradeLevel, { border: string; glow: string }>;

  const g = gradeMeta[p.grade];

  return (
    <article
      className={`bg-void-1 border rounded-xl overflow-hidden
                  transition-all duration-200 ${g.border} ${g.glow}
                  hover:-translate-y-0.5`}
    >
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
            <div className="font-syne font-bold text-[19px] text-gold-protocol
                            leading-none">
              ${(p.priceUsd / 100).toFixed(2)}
            </div>
            <div className="font-mono text-[9px] text-text-mute2 mt-1">
              {p.priceUsdc} USDC
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
            {p.inStock ? "● IN STOCK" : "○ OUT OF STOCK"}
          </span>
        </div>
      </div>

      {/* Build note */}
      <div className="px-5 py-2.5 bg-void-2 border-t border-border-protocol">
        <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">
          ▸ {p.buildNote}
        </p>
      </div>

      {/* Checkout toggle */}
      <div className="p-5 border-t border-border-protocol">
        {!expanded ? (
          <div className="flex gap-2">
            {!p.highTicket && p.stripePriceId ? (
              <button
                onClick={onToggle}
                className="flex-1 bg-gold-protocol text-void-0 font-mono font-bold
                           text-[11px] tracking-[.06em] px-4 py-2.5 rounded-lg
                           transition-all duration-150
                           hover:bg-gold-bright hover:-translate-y-0.5"
              >
                BUY NOW — CARD
              </button>
            ) : (
              <button
                onClick={onToggle}
                className="flex-1 bg-cyan-DEFAULT/10 text-cyan-DEFAULT
                           font-mono font-bold text-[11px] tracking-[.06em]
                           px-4 py-2.5 rounded-lg border border-cyan-border
                           transition-all duration-150 hover:bg-cyan-dim"
              >
                PAY {p.priceUsdc} USDC
              </button>
            )}
          </div>
        ) : (
          <div className="animate-[fadeUp_0.2s_ease_both]">
            {p.highTicket ? (
              <SolanaCheckout
                productId={p.id}
                productName={p.name}
                priceUsdc={p.priceUsdc}
                onSuccess={() => console.info(`Invoice generated for ${p.id}`)}
              />
            ) : (
              <StripeCheckoutButton product={p} onCancel={onToggle} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// Inline Stripe redirect button — card rail for sub-$500 items
function StripeCheckoutButton({
  product,
  onCancel,
}: {
  product:  Product;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    if (!product.stripePriceId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId: product.stripePriceId, qty: 1 }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleStripeCheckout}
        disabled={loading}
        className="w-full bg-gold-protocol text-void-0 font-mono font-bold
                   text-[11px] tracking-[.08em] px-4 py-2.5 rounded-lg
                   transition-all duration-150
                   hover:bg-gold-bright hover:-translate-y-0.5
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "⟳ REDIRECTING…" : `CHECKOUT — $${(product.priceUsd / 100).toFixed(2)}`}
      </button>
      <button
        onClick={onCancel}
        className="w-full font-mono text-[10px] text-text-mute2
                   hover:text-text-dim transition-colors"
      >
        ← Cancel
      </button>
    </div>
  );
}
