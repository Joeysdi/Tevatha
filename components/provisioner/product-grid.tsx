// components/provisioner/product-grid.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerParent, StaggerChild } from "@/components/ui/motion";
import { GradeBadge }  from "./grade-badge";
import type { Product, ProductCategory } from "@/lib/provisioner/catalog";
import type { GradeLevel } from "@/types/treasury";
import { useTranslation } from "@/lib/i18n/use-translation";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import type { StoreProduct } from "@/lib/store/types";

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

type Tier = "T0" | "T1" | "T2" | "T3";
type SortBy = "grade" | "price-asc" | "price-desc" | "tier";

const GRADE_ORDER: Record<GradeLevel, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };
const TIER_ORDER: Record<Tier, number> = { T3: 0, T2: 1, T1: 2, T0: 3 };

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

const TIER_COLORS: Record<Tier, string> = {
  T0: "text-text-mute2",
  T1: "text-green-bright",
  T2: "text-blue-DEFAULT",
  T3: "text-purple-DEFAULT",
};

const CATEGORY_LABELS: Record<ProductCategory | "food" | "all", string> = {
  all:            "All Items",
  communications: "Communications",
  food:           "Food Storage",
  medical:        "Medical",
  energy:         "Energy",
  mobility:       "Mobility",
  water:          "Water",
  security:       "Security",
  shelter:        "Shelter",
  real_estate:    "Real Estate",
};

interface FilterState {
  activeCategory: ProductCategory | "all";
  activeGrades: GradeLevel[];
  activeTiers: Tier[];
  criticalOnly: boolean;
  sortBy: SortBy;
}

interface FilterControlsProps extends FilterState {
  availableCategories: ProductCategory[];
  categoryCounts: Record<string, number>;
  onCategoryChange: (c: ProductCategory | "all") => void;
  onGradeToggle: (g: GradeLevel) => void;
  onTierToggle: (t: Tier) => void;
  onCriticalToggle: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function FilterControls({
  activeCategory, activeGrades, activeTiers, criticalOnly,
  availableCategories, categoryCounts,
  onCategoryChange, onGradeToggle, onTierToggle, onCriticalToggle,
  onClear, hasActiveFilters,
}: FilterControlsProps) {
  return (
    <div className="space-y-5">
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="font-mono text-[10px] text-gold-protocol hover:text-gold-bright transition-colors"
        >
          ✕ Clear filters
        </button>
      )}

      {/* Department */}
      <div>
        <p className="font-mono text-[9px] text-text-mute2 tracking-[.12em] uppercase mb-1.5">
          Department
        </p>
        <div className="space-y-0.5">
          {(["all", ...availableCategories] as (ProductCategory | "all")[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`w-full flex items-center justify-between px-2.5 rounded-lg
                         text-left font-mono text-[11px] min-h-[36px] transition-colors
                         border-l-2 ${
                           activeCategory === cat
                             ? "border-l-gold-protocol text-gold-bright bg-gold-glow"
                             : "border-l-transparent text-text-mute2 hover:text-text-dim hover:bg-white/[0.03]"
                         }`}
            >
              <span>{CATEGORY_LABELS[cat] ?? cat}</span>
              <span className="font-mono text-[9px] text-text-mute2 tabular-nums">
                {categoryCounts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <p className="font-mono text-[9px] text-text-mute2 tracking-[.12em] uppercase mb-1.5">
          Grade
        </p>
        <div className="space-y-0.5">
          {(["A", "B", "C", "D"] as GradeLevel[]).map((g) => (
            <label
              key={g}
              className="flex items-center gap-2.5 px-2.5 min-h-[36px] cursor-pointer rounded-lg hover:bg-white/[0.03]"
            >
              <input
                type="checkbox"
                checked={activeGrades.includes(g)}
                onChange={() => onGradeToggle(g)}
                className="accent-[#c9a84c] w-3.5 h-3.5 cursor-pointer flex-shrink-0"
              />
              <span className="font-mono text-[11px] text-text-dim">Grade {g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tier */}
      <div>
        <p className="font-mono text-[9px] text-text-mute2 tracking-[.12em] uppercase mb-1.5">
          Tier
        </p>
        <div className="flex gap-1.5">
          {(["T1", "T2", "T3"] as Tier[]).map((t) => (
            <button
              key={t}
              onClick={() => onTierToggle(t)}
              className={`font-mono text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors min-h-[36px]
                         ${
                           activeTiers.includes(t)
                             ? "border-gold-protocol text-gold-bright bg-gold-glow"
                             : "border-border-protocol text-text-mute2 hover:border-border-bright/40 hover:text-text-dim"
                         }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Only */}
      <div className="flex items-center justify-between px-2.5 min-h-[36px]">
        <span className="font-mono text-[11px] text-text-dim">Critical only</span>
        <button
          onClick={onCriticalToggle}
          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
            criticalOnly ? "bg-red-protocol" : "bg-void-2 border border-border-protocol"
          }`}
          aria-label="Toggle critical only"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform bg-white shadow-sm ${
              criticalOnly ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ── DB product section ────────────────────────────────────────────────────────
function DbProductSection({ activeCategory }: { activeCategory: ProductCategory | "food" | "all" }) {
  const [dbProducts, setDbProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    setLoading(true);
    const cat = activeCategory === "all" ? "" : `&category=${activeCategory}`;
    fetch(`/api/store/products?limit=24${cat}`)
      .then((r) => r.json())
      .then((d) => { setDbProducts(d.products ?? []); })
      .catch(() => { setDbProducts([]); })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  if (!loading && dbProducts.length === 0) return null;

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-syne font-bold text-[17px] text-text-base">Tevatha Store</span>
        <span className="font-mono text-[9px] text-text-mute2 border border-border-protocol
                         rounded px-1.5 py-0.5">DB</span>
        <div className="flex-1 h-px bg-border-protocol" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-void-2 animate-pulse rounded-xl h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {dbProducts.map((p) => (
            <StoreProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const { t } = useTranslation();

  // ── Filter & sort state ──────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [activeGrades, setActiveGrades] = useState<GradeLevel[]>([]);
  const [activeTiers, setActiveTiers] = useState<Tier[]>([]);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("grade");

  // ── UI state ─────────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Derived data ─────────────────────────────────────────────────────────
  const availableCategories = useMemo<ProductCategory[]>(() => {
    return Array.from(new Set(products.map((p) => p.category))).sort() as ProductCategory[];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "all") result = result.filter((p) => p.category === activeCategory);
    if (criticalOnly) result = result.filter((p) => p.criticalFlag);
    if (activeGrades.length > 0) result = result.filter((p) => activeGrades.includes(p.grade));
    if (activeTiers.length > 0) result = result.filter((p) => activeTiers.includes(p.tier as Tier));

    const sorted = [...result];
    switch (sortBy) {
      case "grade":
        sorted.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]);
        break;
      case "price-asc":
        sorted.sort((a, b) => a.priceUsd - b.priceUsd);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceUsd - a.priceUsd);
        break;
      case "tier":
        sorted.sort((a, b) => TIER_ORDER[a.tier as Tier] - TIER_ORDER[b.tier as Tier]);
        break;
    }
    return sorted;
  }, [products, activeCategory, criticalOnly, activeGrades, activeTiers, sortBy]);

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeGrades.length > 0 ||
    activeTiers.length > 0 ||
    criticalOnly;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleGrade = (g: GradeLevel) =>
    setActiveGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const toggleTier = (t: Tier) =>
    setActiveTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const clearFilters = () => {
    setActiveCategory("all");
    setActiveGrades([]);
    setActiveTiers([]);
    setCriticalOnly(false);
  };

  const filterProps: FilterControlsProps = {
    activeCategory, activeGrades, activeTiers, criticalOnly, sortBy,
    availableCategories, categoryCounts,
    onCategoryChange: setActiveCategory,
    onGradeToggle: toggleGrade,
    onTierToggle: toggleTier,
    onCriticalToggle: () => setCriticalOnly((v) => !v),
    onClear: clearFilters,
    hasActiveFilters,
  };

  return (
    <>
      <div className="flex gap-6 items-start">
        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <div className="hidden lg:block w-52 flex-shrink-0 sticky top-4
                        bg-void-1 border border-border-protocol rounded-xl p-4">
          <FilterControls {...filterProps} />
        </div>

        {/* ── Main content ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 font-mono text-[11px]
                           text-text-mute2 hover:text-text-base border border-border-protocol
                           rounded-lg px-3 py-2 min-h-[44px] transition-colors"
              >
                <span>≡</span>
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-protocol" />
                )}
              </button>

              <span className="font-mono text-[11px] text-text-mute2">
                {filtered.length} {t("shop_items")}
              </span>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-mute2 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="font-mono text-[11px] text-text-dim bg-void-1 border border-border-protocol
                           rounded-lg px-2.5 py-2 min-h-[44px] focus:outline-none
                           focus:border-gold-protocol/60 transition-colors cursor-pointer"
              >
                <option value="grade">Grade</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
                <option value="tier">Tier</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          <StaggerParent className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <StaggerChild key={p.id}>
                <ProductCard product={p} />
              </StaggerChild>
            ))}
          </StaggerParent>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-mono text-[12px] text-text-mute2">No items match your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-3 font-mono text-[11px] text-gold-protocol hover:text-gold-bright transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* DB product section — rendered below static grid, never interleaved */}
          <DbProductSection activeCategory={activeCategory} />
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ───────────────────────────────────── */}
      <AnimatePresence>
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex items-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-void-0/85"
              onClick={() => setFilterOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full bg-void-1 border-t border-border-protocol
                         rounded-t-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border-protocol" />
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-border-protocol/50">
                <span className="font-syne font-bold text-[15px] text-text-base">Filters</span>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="text-text-mute2 hover:text-text-base transition-colors text-[18px] leading-none min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="p-5">
                <FilterControls {...filterProps} />
              </div>

              <div className="sticky bottom-0 p-4 border-t border-border-protocol bg-void-1">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full font-mono font-bold text-[12px] tracking-[.06em]
                             px-4 py-3 rounded-lg bg-gold-protocol text-void-0
                             hover:bg-gold-bright transition-colors"
                >
                  Show {filtered.length} items
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const { t } = useTranslation();

  const gradeMeta = {
    A: { border: "border-[#1ae8a0]/25", glow: "hover:shadow-[0_0_24px_rgba(26,232,160,0.08)]" },
    B: { border: "border-gold-protocol/25", glow: "hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]" },
    C: { border: "border-amber-DEFAULT/20", glow: "" },
    D: { border: "border-red-protocol/20",  glow: "" },
    F: { border: "border-border-protocol",  glow: "" },
  } satisfies Record<GradeLevel, { border: string; glow: string }>;

  const g = gradeMeta[p.grade];
  const imgSrc = PRODUCT_IMAGES[p.imageSlug];

  return (
    <article
      className={`group relative bg-void-1 border rounded-xl overflow-hidden flex flex-col
                  hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] hover:-translate-y-0.5
                  transition-all duration-150 ${g.border}`}
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
      <div className={`relative h-36 border-b border-border-protocol overflow-hidden flex-shrink-0 ${
        p.category === "real_estate" ? "bg-void-2" : "bg-white"
      }`}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={p.name}
            fill
            className={p.category === "real_estate" ? "object-cover" : "object-contain p-4"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <span className="font-mono text-[24px] opacity-20">📦</span>
            <span className="font-mono text-[8px] text-text-mute2/40 tracking-[.12em] uppercase">{p.brand}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <GradeBadge grade={p.grade} composite={p.gradeComposite} size="sm" />
          {p.criticalFlag && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5
                             rounded-full bg-red-dim text-red-bright
                             border border-red-protocol/28
                             font-mono text-[10px] font-semibold">
              <span className="w-1 h-1 rounded-full bg-red-bright animate-pulse" />
              CRITICAL
            </span>
          )}
        </div>

        {/* Name + brand */}
        <h3 className="font-syne font-bold text-[13px] text-text-base leading-snug mb-0.5">
          {p.name}
        </h3>
        <p className="font-mono text-[9.5px] text-text-mute2 mb-2">
          {p.brand} · {p.sku}
        </p>

        {/* Spec */}
        <p className="text-[11.5px] text-text-dim leading-relaxed mb-2.5 line-clamp-2 flex-1">
          {p.spec}
        </p>

        {/* Safety bars — real estate */}
        {p.safetyScore && (
          <div className="space-y-1.5 mb-2.5 p-2.5 bg-void-2 rounded-lg border border-border-protocol/50">
            <p className="font-mono text-[8px] text-text-mute2 tracking-[.1em] uppercase mb-1.5">Safety Index</p>
            <SafetyBar label="Nuclear Dist" value={p.safetyScore.nuclearDistance} />
            <SafetyBar label="Disaster"     value={p.safetyScore.disasterRisk} />
            <SafetyBar label="Density"      value={p.safetyScore.populationDensity} />
            <SafetyBar label="Stability"    value={p.safetyScore.politicalStability} />
          </div>
        )}

        {/* Safety bars — gear items */}
        {p.gearLayers && (
          <div className="space-y-1.5 mb-2.5 p-2.5 bg-void-2 rounded-lg border border-border-protocol/50">
            <p className="font-mono text-[8px] text-text-mute2 tracking-[.1em] uppercase mb-1.5">Safety Index</p>
            <SafetyBar label="Durability"  value={p.gearLayers.durability} />
            <SafetyBar label="Grid Indep"  value={p.gearLayers.grid_independence} />
            <SafetyBar label="Repair"      value={p.gearLayers.field_repairability} />
            <SafetyBar label="Value"       value={p.gearLayers.value_density} />
            <SafetyBar label="Supply"      value={p.gearLayers.supply_chain} />
          </div>
        )}

        {/* Price + tier + stock row */}
        <div className="flex items-center justify-between gap-1 mb-2.5">
          <div>
            <div className="font-mono font-bold text-[14px] tabular-nums leading-none text-gold-protocol">
              {p.priceDisplay ?? `$${(p.priceUsd / 100).toFixed(2)}`}
            </div>
            {p.category === "real_estate" && p.location && (
              <div className="font-mono text-[8px] text-text-mute2 mt-0.5 leading-tight">
                {p.location}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className={`font-mono text-[10px] font-bold ${TIER_COLORS[p.tier as Tier]}`}>
              {p.tier}
            </span>
            <div className={`font-mono text-[9px] ${p.inStock ? "text-green-bright" : "text-red-bright"}`}>
              {p.inStock ? "● In stock" : "○ Out"}
            </div>
          </div>
        </div>

        {/* Build note — desktop only */}
        {p.buildNote && (
          <div className="hidden lg:block mb-2.5 px-2 py-1.5 bg-void-2/60 border-t border-border-protocol/50 -mx-3 mt-auto">
            <p className="font-mono text-[9.5px] text-text-mute2 leading-relaxed">
              ▸ {p.buildNote}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className={p.buildNote ? "" : "mt-auto"}>
          <a
            href={p.externalUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full font-mono font-bold text-[11px] tracking-[.06em]
                       px-4 py-3 rounded-lg transition-all duration-150 text-center block
                       bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5"
          >
            {p.category === "real_estate" ? "Search Listings ↗" : `Buy at ${p.brand} ↗`}
          </a>
        </div>
      </div>
    </article>
  );
}
