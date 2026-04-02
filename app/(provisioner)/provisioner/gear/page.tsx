"use client";
// app/(provisioner)/provisioner/gear/page.tsx  →  URL: /provisioner/gear

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GradeBadge } from "@/components/provisioner/grade-badge";
import { CATALOG, CATALOG_STATS } from "@/lib/provisioner/catalog";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import type { Product } from "@/lib/provisioner/catalog";
import type { GradeLevel } from "@/types/treasury";

const GRADE_BAR: Record<GradeLevel, string> = {
  A: "#1ae8a0",
  B: "#c9a84c",
  C: "#f0a500",
  D: "#e84040",
  F: "rgba(255,255,255,0.07)",
};

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

// ── Category definitions ──────────────────────────────────────────────────────

interface ThreatDomainDef {
  id:         string;
  label:      string;
  icon:       string;
  color:      string;
  borderHex:  string;
  outcome:    string;
  rationale:  string;
  skus:       string[];
}

// Properties tab sentinel — skus unused (REA items rendered separately)
const PROPERTIES_TAB: ThreatDomainDef = {
  id:        "properties",
  label:     "Safe Land",
  icon:      "🌍",
  color:     "text-cyan-DEFAULT",
  borderHex: "#00d4ff",
  outcome:   "Your Ark node is ready when you need it.",
  rationale: "Off-grid land in politically stable, low-nuclear-risk countries. Each location is scored on 4 safety dimensions: nuclear distance, disaster risk, population density, and political stability.",
  skus:      [],
};

const THREAT_DOMAINS: ThreatDomainDef[] = [
  {
    id:       "communications",
    label:    "Communications",
    icon:     "📡",
    color:    "text-gold-bright",
    borderHex:"#c9a84c",
    outcome:  "You stay connected when the internet and cell networks go down.",
    rationale:"When a crisis hits, phone networks and the internet are often the first things to fail. Satellite messengers, two-way radios, and emergency weather radios let you send messages, get updates, and coordinate with your group without any infrastructure.",
    skus:     ["COM-001","COM-002","COM-003","COM-004","COM-005","COM-006","COM-007","COM-008","COM-009","COM-010","COM-011","COM-012","COM-013","COM-014"],
  },
  {
    id:       "medical",
    label:    "Medical",
    icon:     "🩺",
    color:    "text-red-bright",
    borderHex:"#e84040",
    outcome:  "You can treat serious injuries and illness without a hospital.",
    rationale:"When hospitals are overwhelmed or unreachable, your ability to treat bleeding, wounds, and illness at home could be the difference between life and death. Military-grade trauma kits, hemostatic agents, and a comprehensive medical reference are the foundation.",
    skus:     ["MED-001","MED-002","MED-003","MED-004","MED-005","MED-006","MED-007","MED-008","MED-009","MED-010","MED-011","MED-012","MED-013","MED-014"],
  },
  {
    id:       "energy",
    label:    "Energy",
    icon:     "⚡",
    color:    "text-amber-protocol",
    borderHex:"#f0a500",
    outcome:  "Your lights, devices, and medical equipment stay powered.",
    rationale:"Power outages can last days to weeks in a serious crisis. Portable battery stations store electricity for immediate use, solar panels generate power indefinitely from sunlight, and a dual-fuel generator bridges any gap — keeping your refrigerator, medical devices, and communications running.",
    skus:     ["ENE-001","ENE-002","ENE-003","ENE-004","ENE-005","ENE-006","ENE-007","ENE-008","ENE-009","ENE-010","ENE-011","ENE-012","ENE-013"],
  },
  {
    id:       "mobility",
    label:    "Mobility",
    icon:     "🚗",
    color:    "text-cyan-DEFAULT",
    borderHex:"#00d4ff",
    outcome:  "Your vehicle starts and moves when you need to leave.",
    rationale:"Getting out fast could save your life — but fuel shortages, dead batteries, and flat tires strand people every crisis. Pre-stored fuel in certified containers, a compact jump starter in every vehicle, and a GPS that works without cell service keep your evacuation route open.",
    skus:     ["MOB-001","MOB-002","MOB-003","MOB-004","MOB-005","MOB-006","MOB-007","MOB-008","MOB-009","MOB-010","MOB-011","MOB-012"],
  },
  {
    id:       "water",
    label:    "Water",
    icon:     "💧",
    color:    "text-blue-DEFAULT",
    borderHex:"#38bdf8",
    outcome:  "You have clean drinking water even when the tap runs dry.",
    rationale:"Safe water is the most critical resource in any emergency — the human body can only survive 3 days without it. A gravity-fed ceramic filter removes viruses, bacteria, and heavy metals from any water source. Emergency storage bladders and purification tablets provide redundant backup layers.",
    skus:     ["WAT-001","WAT-002","WAT-003","WAT-004","WAT-005","WAT-006","WAT-007","WAT-008","WAT-009","WAT-010","WAT-011","WAT-012"],
  },
  {
    id:       "security",
    label:    "Security",
    icon:     "🔒",
    color:    "text-green-protocol",
    borderHex:"#1ae8a0",
    outcome:  "You see what is happening around you and protect your electronics.",
    rationale:"Perimeter awareness and electronic protection are overlooked until they matter. Local security cameras that store footage on-site (no cloud) give early warning. A Faraday bag protects critical electronics from an EMP. High-lumen tactical lights are essential in grid-down conditions.",
    skus:     ["SEC-001","SEC-002","SEC-003","SEC-004","SEC-005","SEC-006","SEC-007","SEC-008","SEC-009","SEC-010","SEC-011","SEC-012"],
  },
  {
    id:       "shelter",
    label:    "Shelter",
    icon:     "🏕️",
    color:    "text-text-dim",
    borderHex:"#8b8fa8",
    outcome:  "You stay warm and dry no matter where you are.",
    rationale:"Exposure kills faster than most threats. Emergency bivvy bags retain 90% of body heat in a fist-sized pack. A quality sleeping bag rated to 20°F keeps you alive in freezing temperatures. A heavy-duty tarp serves as rain fly, ground cloth, or heat reflector in any environment.",
    skus:     ["SHE-001","SHE-002","SHE-003","SHE-004","SHE-005","SHE-006","SHE-007","SHE-008","SHE-009","SHE-010","SHE-011","SHE-012"],
  },
  PROPERTIES_TAB,
];

// ── Price formatters ──────────────────────────────────────────────────────────

function fmtUsd(p: Product): string  { return p.priceDisplay ?? `$${(p.priceUsd / 100).toFixed(2)}`; }
function fmtUsdc(p: Product): string { return `${p.priceUsdc.toFixed(2)} USDC`; }

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GearPage() {
  const [activeDomain, setActiveDomain] = useState(THREAT_DOMAINS[0]);
  const [copied,       setCopied]       = useState(false);
  const [search,       setSearch]       = useState("");

  const shareLink = useCallback(() => {
    const url = `${window.location.origin}/provisioner/gear?domain=${activeDomain.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeDomain.id]);

  const isSearching = search.trim().length > 0;

  const domainProducts: Product[] = isSearching
    ? (() => {
        const q = search.toLowerCase();
        return CATALOG.filter(
          (p) =>
            p.name.toLowerCase().includes(q)  ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)   ||
            p.spec.toLowerCase().includes(q),
        );
      })()
    : activeDomain.skus
        .map((sku) => CATALOG.find((p) => p.sku === sku))
        .filter((p): p is Product => p !== undefined);

  const criticalCount  = domainProducts.filter((p) => p.criticalFlag).length;
  const gradeACount    = domainProducts.filter((p) => p.grade === "A").length;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <FadeUp>
        <header className="relative rounded-xl border p-5 sm:p-7 overflow-hidden"
          style={{
            background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(11,13,24,1))",
            borderColor: "rgba(201,168,76,0.22)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
               style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }} />

          {/* Eyebrow + threat ticker */}
          <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em] uppercase mb-2">
            Provisioner · Preparedness Catalog
          </p>
          <div className="font-mono text-[10px] tracking-[.06em] mb-3 flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-red-bright">73% FINANCIAL COLLAPSE PROBABILITY</span>
            <span className="text-text-mute2/40">·</span>
            <span className="text-amber-protocol">68% INFRASTRUCTURE FAILURE</span>
            <span className="text-text-mute2/40">·</span>
            <span className="text-gold-protocol">85 SECONDS TO MIDNIGHT</span>
          </div>

          {/* Title */}
          <h1 className="font-syne font-extrabold text-[clamp(24px,5vw,34px)] leading-[1.12] text-text-base mb-2">
            Still Fed. Still Connected.{" "}
            <span className="text-gold-protocol">Still Operational.</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed mb-3 max-w-2xl">
            While supply chains fracture and shelves empty, your baseline holds. {CATALOG_STATS.total}+ Tevatha-certified items — graded on performance, not commission. No affiliate links. Life Over Money.
          </p>

          {/* Nonprofit badge + quick links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
            <span className="font-mono text-[10px] text-green-bright border border-green-bright/30
                             bg-green-bright/5 px-2 py-0.5 rounded tracking-[.08em] uppercase">
              Free · Nonprofit
            </span>
            <Link href="/provisioner/zero"
              className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors">
              Start Here — No Money Needed →
            </Link>
            <Link href="/provisioner/checklist"
              className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors">
              Print Checklist →
            </Link>
          </div>

          {/* Search bar */}
          <div className="mb-5 max-w-xl">
            <p className="font-mono text-[9.5px] text-text-mute2 tracking-[.1em] uppercase mb-2">
              Search {CATALOG_STATS.total}+ items
            </p>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-text-mute2/40 pointer-events-none select-none text-[14px]">
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Radio, water filter, solar…"
                className="w-full bg-void-1 border border-border-protocol rounded-lg
                           pl-9 pr-10 py-2.5 font-mono text-[12px] text-text-base
                           placeholder:text-text-mute2/40 outline-none
                           focus:border-gold-protocol/60 transition-colors duration-150"
              />
              {isSearching && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 font-mono text-[11px] text-text-mute2/50
                             hover:text-text-mute2 transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            {isSearching && (
              <p className="font-mono text-[9px] text-text-mute2/50 mt-1.5">
                {domainProducts.length === 0
                  ? "No items found"
                  : `${domainProducts.length} item${domainProducts.length !== 1 ? "s" : ""} across all categories`}
              </p>
            )}
          </div>

          {/* Stats bar */}
          <StaggerParent className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {[
              { val: CATALOG_STATS.total,      label: "TOTAL ITEMS" },
              { val: CATALOG_STATS.gradeA,     label: "GRADE A" },
              { val: CATALOG_STATS.gradeB,     label: "GRADE B" },
              { val: CATALOG_STATS.critical,   label: "CRITICAL ITEMS" },
              { val: CATALOG_STATS.categories, label: "CATEGORIES" },
              { val: CATALOG_STATS.highTicket, label: "USDC RAIL" },
            ].map((s) => (
              <StaggerChild key={s.label}>
                <div className="text-center px-2 py-2.5 bg-void-1 rounded-lg
                                border border-border-protocol border-l-2 border-l-gold-protocol">
                  <div className="font-mono font-extrabold tabular-nums text-[20px] sm:text-[22px]
                                  text-gold-protocol leading-none">{s.val}</div>
                  <div className="font-mono text-[8px] sm:text-[9px] text-text-mute2
                                  mt-1 leading-tight uppercase">{s.label}</div>
                </div>
              </StaggerChild>
            ))}
          </StaggerParent>
        </header>
      </FadeUp>

      {/* Domain tabs */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase">CATEGORY</span>
        <div className="flex-1 h-px bg-border-protocol" />
        <button
          onClick={shareLink}
          className="font-mono text-[9px] text-text-mute2 hover:text-gold-protocol
                     border border-border-protocol hover:border-gold-protocol/40
                     rounded-lg px-2.5 py-1.5 transition-all duration-150 flex items-center gap-1.5"
        >
          {copied ? "✓ Copied" : "Share ↗"}
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-2 min-w-max pb-1">
          {THREAT_DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDomain(d)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl font-mono
                          text-[11px] font-bold border transition-all duration-150 whitespace-nowrap
                ${activeDomain.id === d.id
                  ? "bg-void-1 border-[var(--dc)]"
                  : "border-border-protocol text-text-mute2 hover:text-text-base hover:border-border-bright/40"
                }`}
              style={activeDomain.id === d.id
                ? { "--dc": d.borderHex, color: d.borderHex } as React.CSSProperties
                : undefined}
            >
              <span>{d.icon}</span>
              <span className="hidden sm:inline">{d.label}</span>
              <span className="sm:hidden">{d.label.split(" /")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active domain info OR properties panel — hidden during search */}
      {!isSearching && activeDomain.id === "properties" ? (
        <FadeUp key="properties">
          <div className="relative rounded-xl border border-cyan-DEFAULT/20 bg-void-1 p-5 sm:p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px"
                 style={{ background: "linear-gradient(90deg,#00d4ff,rgba(0,212,255,0.3),transparent)" }} />
            <div className="flex items-start gap-4 flex-wrap justify-between">
              <div>
                <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.22em] uppercase mb-1">
                  Ark Node Properties · {ALL_REA.length} Locations · {ALL_REA.filter(p => p.grade === "A").length} Grade A
                </p>
                <h2 className="font-syne font-extrabold text-[clamp(18px,4vw,24px)] text-text-base leading-tight">
                  Safe Land. Every Country.
                </h2>
                <p className="font-mono text-[11px] text-text-dim mt-1 leading-relaxed max-w-lg">
                  Curated off-grid land in politically stable, low-nuclear-risk countries. Each location
                  scored on 4 dimensions. Links go directly to the best property search site for that country.
                </p>
              </div>
            </div>
          </div>
        </FadeUp>
      ) : !isSearching ? (
        <FadeUp key={activeDomain.id}>
          <div
            className="relative rounded-xl border p-4 sm:p-5 overflow-hidden"
            style={{
              borderColor: `${activeDomain.borderHex}30`,
              background: `linear-gradient(135deg,${activeDomain.borderHex}0d,rgba(11,13,24,1))`,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg,${activeDomain.borderHex},transparent)` }}
            />
            <div className="flex items-start gap-3 mb-3">
              <span className="text-[28px] leading-none">{activeDomain.icon}</span>
              <div className="flex-1 min-w-0">
                <h2 className={`font-syne font-bold text-[18px] ${activeDomain.color}`}>
                  {activeDomain.label}
                </h2>
                <p className="font-mono text-[11px] text-text-dim leading-relaxed mt-1">
                  {activeDomain.rationale}
                </p>
              </div>
            </div>
            <p className="font-syne font-bold text-[22px] leading-snug text-text-base mb-3">
              {activeDomain.outcome}
            </p>
            <div className="flex gap-4 mt-1 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse" />
                <span className="font-mono text-[9px] text-text-mute2">
                  {criticalCount} CRITICAL
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-bright" />
                <span className="font-mono text-[9px] text-text-mute2">
                  {gradeACount} GRADE A
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-mute2" />
                <span className="font-mono text-[9px] text-text-mute2">
                  {domainProducts.length} ITEMS
                </span>
              </div>
            </div>
            <a
              href={`#domain-products`}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg
                         bg-gold-protocol text-void-0 font-syne font-bold text-[12px]
                         tracking-[.06em] hover:bg-gold-bright hover:-translate-y-0.5
                         hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all duration-200"
            >
              SHOP {domainProducts.length} ITEMS →
            </a>
          </div>
        </FadeUp>
      ) : null}

      {/* Product grid — gear items OR real estate */}
      {activeDomain.id === "properties" ? (
        <PropertiesGrid />
      ) : (
      <div id="domain-products">
      <StaggerParent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {domainProducts.map((p) => (
          <StaggerChild key={p.id}>
            <div
              className="relative bg-void-1 border border-border-protocol rounded-xl overflow-hidden
                         hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,168,76,0.15)]
                         transition-all duration-200 flex flex-col h-full"
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
              {(() => {
                const imgSrc = PRODUCT_IMAGES[p.imageSlug];
                return (
                  <div className="relative h-36 border-b border-border-protocol overflow-hidden flex-shrink-0 bg-white">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={p.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-1.5">
                        <span className="font-mono text-[24px] opacity-20">📦</span>
                        <span className="font-mono text-[8px] text-text-mute2/40 tracking-[.12em] uppercase">{p.brand}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">

              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {p.criticalFlag && (
                      <span className="font-mono text-[8px] text-red-bright border border-red-DEFAULT/30
                                       bg-red-dim px-1.5 py-0.5 rounded tracking-[.08em] flex-shrink-0">
                        CRITICAL
                      </span>
                    )}
                    <span className="font-mono text-[8.5px] text-text-mute2 tracking-[.06em]">
                      {p.sku}
                    </span>
                  </div>
                  <p className="font-syne font-bold text-[13px] text-text-base leading-tight">
                    {p.name}
                  </p>
                  <p className="font-mono text-[10px] text-text-mute2">{p.brand}</p>
                </div>
                <GradeBadge grade={p.grade} composite={p.gradeComposite} size="sm" />
              </div>

              {/* Spec */}
              <p className="font-mono text-[10.5px] text-text-dim leading-relaxed mb-3 flex-1">
                {p.spec}
              </p>

              {/* Gear Safety Index */}
              {p.gearLayers && (
                <div className="space-y-1 bg-void-2 border border-border-protocol rounded-lg px-3 py-2.5 mb-3">
                  <p className="font-mono text-[7.5px] text-text-mute2 tracking-[.14em] uppercase mb-1.5">
                    Safety Index
                  </p>
                  <SafetyBar label="Durability"  value={p.gearLayers.durability}        color={p.gearLayers.durability >= 85 ? "#1ae8a0" : p.gearLayers.durability >= 70 ? "#c9a84c" : "#e84040"} />
                  <SafetyBar label="Grid-Free"   value={p.gearLayers.grid_independence} color={p.gearLayers.grid_independence >= 85 ? "#1ae8a0" : p.gearLayers.grid_independence >= 70 ? "#c9a84c" : "#e84040"} />
                  <SafetyBar label="Fieldwork"   value={p.gearLayers.field_repairability} color={p.gearLayers.field_repairability >= 85 ? "#1ae8a0" : p.gearLayers.field_repairability >= 70 ? "#c9a84c" : "#e84040"} />
                  <SafetyBar label="Value"       value={p.gearLayers.value_density}     color={p.gearLayers.value_density >= 85 ? "#1ae8a0" : p.gearLayers.value_density >= 70 ? "#c9a84c" : "#e84040"} />
                </div>
              )}

              {/* Build note */}
              <div className="flex items-start gap-2 mb-4 bg-void-2 border border-border-protocol
                               rounded-lg px-3 py-2">
                <span className="text-gold-DEFAULT font-mono text-[10px] flex-shrink-0 mt-px">→</span>
                <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">
                  {p.buildNote}
                </p>
              </div>

              {/* Price + rail */}
              <div className="flex items-center justify-between gap-2 mt-auto">
                <div>
                  <span className="font-mono text-[15px] font-bold text-gold-bright">
                    {fmtUsd(p)}
                  </span>
                  <span className="font-mono text-[9px] text-cyan-DEFAULT ml-2">
                    ◎ {fmtUsdc(p)}
                  </span>
                </div>
                <a
                    href={p.externalUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9.5px] font-bold text-void-0 bg-gold-protocol
                               px-3 py-3 rounded-lg hover:bg-gold-bright transition-colors
                               whitespace-nowrap flex-shrink-0 min-h-[44px] flex items-center"
                  >
                    {`Buy at ${p.brand} ↗`}
                  </a>
              </div>

              </div>{/* /p-4 content wrapper */}
            </div>
          </StaggerChild>
        ))}
      </StaggerParent>
      </div>
      )}

      {/* Link to full catalog */}
      {activeDomain.id !== "properties" && (
        <FadeUp delay={0.1}>
          <div className="border border-border-protocol rounded-xl px-5 py-4 flex items-center
                           justify-between gap-4 bg-void-1">
            <p className="font-mono text-[11px] text-text-mute2">
              See every certified item with full grade breakdowns
            </p>
            <Link
              href="/provisioner"
              className="font-mono text-[10px] text-gold-protocol hover:text-gold-bright
                         transition-colors flex-shrink-0"
            >
              Full Catalog →
            </Link>
          </div>
        </FadeUp>
      )}

    </div>
  );
}

// ── Properties Grid (shown when Properties tab is active) ────────────────────

const REA_SORT_OPTIONS = [
  { value: "grade",     label: "Grade" },
  { value: "nuclear",   label: "Nuclear Safety" },
  { value: "stability", label: "Stability" },
  { value: "disaster",  label: "Disaster Risk" },
] as const;

type ReaSort = typeof REA_SORT_OPTIONS[number]["value"];

const ALL_REA = CATALOG
  .filter((p) => p.category === "real_estate")
  .sort((a, b) => b.gradeComposite - a.gradeComposite);

function SafetyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[8.5px] text-text-mute2 w-20 flex-shrink-0 tracking-[.04em] uppercase truncate">
        {label}
      </span>
      <div className="flex-1 h-1 bg-void-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[8.5px] tabular-nums w-5 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function PropertiesGrid() {
  const [sort, setSort] = useState<ReaSort>("grade");
  const [search, setSearch] = useState("");

  const sorted = [...ALL_REA]
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q) ||
        p.spec.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "grade")     return b.gradeComposite - a.gradeComposite;
      if (sort === "nuclear")   return (b.safetyScore?.nuclearDistance ?? 0) - (a.safetyScore?.nuclearDistance ?? 0);
      if (sort === "stability") return (b.safetyScore?.politicalStability ?? 0) - (a.safetyScore?.politicalStability ?? 0);
      if (sort === "disaster")  return (b.safetyScore?.disasterRisk ?? 0) - (a.safetyScore?.disasterRisk ?? 0);
      return 0;
    });

  return (
    <FadeUp delay={0.05}>
      <section className="space-y-4">

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country, region…"
            className="bg-void-1 border border-border-protocol rounded-lg px-3 py-2
                       font-mono text-[11px] text-text-base placeholder:text-text-mute2/50
                       focus:outline-none focus:border-cyan-DEFAULT/50 transition-colors w-48"
          />
          <div className="flex items-center gap-1">
            <span className="font-mono text-[9px] text-text-mute2 tracking-[.1em] uppercase mr-1">Sort:</span>
            {REA_SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`font-mono text-[9.5px] px-2.5 py-1.5 rounded-lg border transition-all duration-150
                  ${sort === opt.value
                    ? "bg-cyan-DEFAULT/10 border-cyan-DEFAULT/50 text-cyan-DEFAULT"
                    : "border-border-protocol text-text-mute2 hover:border-border-bright/40"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9px] text-text-mute2 ml-auto">
            {sorted.length} results
          </span>
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((p) => {
            const ss = p.safetyScore;
            const imgSrc = PRODUCT_IMAGES[p.imageSlug];
            const composite = ss
              ? Math.round((ss.nuclearDistance + ss.disasterRisk + ss.populationDensity + ss.politicalStability) / 4)
              : p.gradeComposite;
            return (
              <Link
                key={p.id}
                href={`/provisioner/gear/${p.id}`}
                className="relative bg-void-1 border border-border-protocol rounded-xl overflow-hidden
                           hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,212,255,0.1)]
                           transition-all duration-200 flex flex-col group"
              >
                <div className="absolute top-0 left-0 right-0 h-px"
                     style={{ background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent)" }} />
                <div className="absolute top-0 left-0 bottom-0 w-[3px]"
                     style={{ background: GRADE_BAR[p.grade] }} />

                {/* Image / placeholder */}
                <div className="relative h-28 bg-void-2 border-b border-border-protocol overflow-hidden flex-shrink-0">
                  {imgSrc ? (
                    <Image src={imgSrc} alt={p.name} fill className="object-cover" sizes="(max-width:640px) 100vw,33vw" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-1 opacity-30">
                      <span className="text-[28px]">🌍</span>
                      <span className="font-mono text-[8px] text-text-mute2 tracking-[.1em] uppercase">{p.location?.split("—")[0].trim()}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 gap-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[8.5px] text-text-mute2 truncate">{p.location}</p>
                      <p className="font-syne font-bold text-[12.5px] text-text-base leading-tight mt-0.5 group-hover:text-cyan-DEFAULT transition-colors">
                        {p.name}
                      </p>
                    </div>
                    <GradeBadge grade={p.grade} composite={composite} size="sm" />
                  </div>

                  {/* Safety Index bars */}
                  {ss && (
                    <div className="space-y-1.5 bg-void-2 rounded-lg px-3 py-2.5">
                      <p className="font-mono text-[7.5px] text-text-mute2 tracking-[.14em] uppercase mb-1.5">
                        Safety Index
                      </p>
                      <SafetyBar label="Nuclear"    value={ss.nuclearDistance}    color={ss.nuclearDistance >= 85 ? "#1ae8a0" : ss.nuclearDistance >= 70 ? "#c9a84c" : "#e84040"} />
                      <SafetyBar label="Disasters"  value={ss.disasterRisk}       color={ss.disasterRisk    >= 85 ? "#1ae8a0" : ss.disasterRisk    >= 70 ? "#c9a84c" : "#e84040"} />
                      <SafetyBar label="Population" value={ss.populationDensity}  color={ss.populationDensity >= 85 ? "#1ae8a0" : ss.populationDensity >= 70 ? "#c9a84c" : "#e84040"} />
                      <SafetyBar label="Stability"  value={ss.politicalStability} color={ss.politicalStability >= 85 ? "#1ae8a0" : ss.politicalStability >= 70 ? "#c9a84c" : "#e84040"} />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="font-mono text-[12px] font-bold text-gold-bright">
                      {p.priceDisplay ?? `$${(p.priceUsd / 100).toFixed(0)}`}
                    </span>
                    <span className="font-mono text-[9px] text-cyan-DEFAULT border border-cyan-DEFAULT/30
                                     rounded-lg px-2.5 py-1.5 group-hover:bg-cyan-DEFAULT/10 transition-colors">
                      View + Search ↗
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </section>
    </FadeUp>
  );
}
