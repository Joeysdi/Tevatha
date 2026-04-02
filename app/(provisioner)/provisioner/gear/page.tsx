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

    </div>
  );
}
