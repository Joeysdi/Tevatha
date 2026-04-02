"use client";
// app/(provisioner)/provisioner/gear/page.tsx  →  URL: /provisioner/gear

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GradeBadge } from "@/components/provisioner/grade-badge";
import { CATALOG } from "@/lib/provisioner/catalog";
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

// ── Domain definitions ───────────────────────────────────────────────────────

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

const THREAT_DOMAINS: ThreatDomainDef[] = [
  {
    id:       "nuclear",
    label:    "Nuclear / EMP",
    icon:     "☢️",
    color:    "text-red-bright",
    borderHex:"#e84040",
    outcome:  "Your power is live when the grid is not.",
    rationale:"EMP destroys unshielded electronics and collapses grid power instantly. Priority is off-grid energy independence, EMP-shielded communications, and satellite fallback when terrestrial networks fail.",
    skus:     ["COM-001","COM-002","COM-005","ENE-001","ENE-002","ENE-003","SEC-003","COM-003","COM-004","MOB-003","SHE-001","REA-001","REA-003","REA-006"],
  },
  {
    id:       "economic",
    label:    "Economic",
    icon:     "💸",
    color:    "text-gold-bright",
    borderHex:"#c9a84c",
    outcome:  "You still eat and drink when the shelves don't restock.",
    rationale:"Supply chain collapse means no resupply — what you have pre-crisis is what you operate with. Priority: water independence, grid-free energy, and fuel reserves to maintain mobility when supply networks seize.",
    skus:     ["ENE-001","ENE-002","ENE-003","WAT-001","WAT-002","MOB-001","MOB-002","COM-003","WAT-003","WAT-004","ENE-004","MOB-003","SHE-001","SHE-002","REA-001","REA-004","REA-005","REA-010","REA-011"],
  },
  {
    id:       "civil",
    label:    "Civil / Political",
    icon:     "🔥",
    color:    "text-amber-protocol",
    borderHex:"#f0a500",
    outcome:  "You know before the crowd knows. You move before they do.",
    rationale:"Societal fracture events demand perimeter awareness, rapid evacuation capability, and off-grid communications independent of compromised infrastructure. Know before the crowd knows.",
    skus:     ["COM-001","COM-002","COM-005","MOB-001","MOB-002","SEC-001","COM-003","COM-004","MOB-003","SEC-002","SHE-001","REA-001","REA-002","REA-004","REA-007","REA-008"],
  },
  {
    id:       "cyber",
    label:    "Cyber / Tech",
    icon:     "🤖",
    color:    "text-cyan-DEFAULT",
    borderHex:"#00d4ff",
    outcome:  "Your comms hold when digital infrastructure fails.",
    rationale:"Coordinated cyberattacks target grid and communications infrastructure simultaneously. EMP-hardened communications, off-grid power, and Faraday-shielded devices preserve operational capability when digital infrastructure collapses.",
    skus:     ["COM-001","COM-002","COM-005","ENE-001","ENE-002","SEC-003","COM-003","ENE-004","MOB-003"],
  },
  {
    id:       "bio",
    label:    "Biological",
    icon:     "🦠",
    color:    "text-green-protocol",
    borderHex:"#1ae8a0",
    outcome:  "Your household runs self-sufficient in full isolation.",
    rationale:"Isolation and medical self-sufficiency are the Ark response to biological events. Medical supplies, independent water filtration, and satellite communications for monitoring without exposure to compromised networks.",
    skus:     ["MED-001","MED-002","MED-003","WAT-001","WAT-002","COM-001","MED-004","MED-005","WAT-004","SHE-001"],
  },
  {
    id:       "climate",
    label:    "Climate",
    icon:     "🌊",
    color:    "text-blue-DEFAULT",
    borderHex:"#38bdf8",
    outcome:  "Your water is clean when municipal systems fail.",
    rationale:"Water access failure and supply chain disruption are the primary climate cascade vectors. Independent water filtration, renewable energy, and fuel reserves maintain operational capability through extended disruption windows.",
    skus:     ["WAT-001","WAT-002","ENE-002","ENE-003","MOB-001","WAT-003","WAT-004","ENE-004","SHE-001","SHE-002","SHE-003"],
  },
];

// ── Price formatters ──────────────────────────────────────────────────────────

function fmtUsd(p: Product): string  { return p.priceDisplay ?? `$${(p.priceUsd / 100).toFixed(2)}`; }
function fmtUsdc(p: Product): string { return `${p.priceUsdc.toFixed(2)} USDC`; }

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GearPage() {
  const [activeDomain, setActiveDomain] = useState(THREAT_DOMAINS[0]);
  const [copied, setCopied] = useState(false);

  const shareLink = useCallback(() => {
    const url = `${window.location.origin}/provisioner/gear?domain=${activeDomain.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeDomain.id]);

  const domainProducts: Product[] = activeDomain.skus
    .map((sku) => CATALOG.find((p) => p.sku === sku))
    .filter((p): p is Product => p !== undefined);

  const criticalCount  = domainProducts.filter((p) => p.criticalFlag).length;
  const gradeACount    = domainProducts.filter((p) => p.grade === "A").length;

  return (
    <div className="space-y-6">

      {/* Hero */}
      <FadeUp>
        <header className="relative rounded-xl border border-border-protocol bg-void-1 p-6 sm:p-8 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,#c9a84c,transparent)" }}
          />
          <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em] uppercase mb-3">
            Provisioner · Threat Domain Catalog
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(22px,5vw,32px)]
                          text-text-base leading-tight mb-2">
            Your Risk Analysis{" "}
            <span className="text-gold-protocol">Points Here.</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed max-w-xl">
            Select the threat your Watchtower analysis says is most probable. The gear you need to stay operational when it arrives is below.
          </p>
        </header>
      </FadeUp>

      {/* Domain tabs */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase">THREAT DOMAIN</span>
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
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[40px] rounded-xl font-mono
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

      {/* Active domain info */}
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

      {/* Product grid */}
      <div id="domain-products">
      <StaggerParent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className={`relative h-36 border-b border-border-protocol overflow-hidden flex-shrink-0 ${p.category === "real_estate" ? "bg-void-2" : "bg-white"}`}>
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={p.name}
                        fill
                        className={p.category === "real_estate" ? "object-cover" : "object-contain p-4"}
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
                  {p.category !== "real_estate" && (
                    <span className="font-mono text-[9px] text-cyan-DEFAULT ml-2">
                      ◎ {fmtUsdc(p)}
                    </span>
                  )}
                  {p.location && (
                    <p className="font-mono text-[8px] text-text-mute2 mt-0.5">{p.location}</p>
                  )}
                </div>
                <a
                    href={p.externalUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9.5px] font-bold text-void-0 bg-gold-protocol
                               px-3 py-3 rounded-lg hover:bg-gold-bright transition-colors
                               whitespace-nowrap flex-shrink-0 min-h-[44px] flex items-center"
                  >
                    {p.category === "real_estate" ? "Search Listings ↗" : `Buy at ${p.brand} ↗`}
                  </a>
              </div>

              </div>{/* /p-4 content wrapper */}
            </div>
          </StaggerChild>
        ))}
      </StaggerParent>
      </div>

      {/* Link to full catalog */}
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

      {/* ── REAL ESTATE ARK NODES ──────────────────────────────────────────── */}
      <RealEstateSection />

    </div>
  );
}

// ── Real Estate Section ───────────────────────────────────────────────────────

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

function RealEstateSection() {
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
      <section className="space-y-5">

        {/* Header */}
        <div className="relative rounded-xl border border-cyan-DEFAULT/20 bg-void-1 p-5 sm:p-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px"
               style={{ background: "linear-gradient(90deg,#00d4ff,rgba(0,212,255,0.3),transparent)" }} />
          <div className="flex items-start justify-between gap-4 flex-wrap">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
