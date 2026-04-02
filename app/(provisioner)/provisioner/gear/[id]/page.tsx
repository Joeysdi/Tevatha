// app/(provisioner)/provisioner/gear/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CATALOG } from "@/lib/provisioner/catalog";
import { GradeBadge } from "@/components/provisioner/grade-badge";

const PRODUCT_IMAGES: Record<string, string> = {
  "garmin-inreach-mini2":       "/products/garmin-inreach-mini2.jpg",
  "baofeng-uv5r":               "/products/baofeng-uv5r.jpg",
  "starlink-mini":              "/products/starlink-mini.png",
  "nar-ifak":                   "/products/nar-ifak.jpg",
  "myfak-advanced":             "/products/myfak-advanced.png",
  "quikclot":                   "/products/quikclot.jpg",
  "jackery-1000plus":           "/products/jackery-1000plus.png",
  "ecoflow-delta-pro":          "/products/ecoflow-delta-pro.png",
  "renogy-400w":                "/products/renogy-400w.jpg",
  "wavian-jerry":               "/products/wavian-jerry.jpg",
  "noco-gb40":                  "/products/noco-gb40.png",
  "berkey-big":                 "/products/berkey-big.jpg",
  "sawyer-squeeze":             "/products/sawyer-squeeze.png",
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

export async function generateStaticParams() {
  return CATALOG.map((p) => ({ id: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const p = CATALOG.find((p) => p.id === id);
  if (!p) return {};
  return {
    title: `${p.name} — Tevatha Gear Review`,
    description: `${p.spec} Tevatha grade ${p.grade} (${p.gradeComposite}/100). ${p.buildNote}`,
    openGraph: {
      title:       `${p.name} · Grade ${p.grade} · Tevatha`,
      description: `${p.spec} ${p.buildNote}`,
    },
  };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "#1ae8a0" : value >= 60 ? "#c9a84c" : "#e84040";
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] text-text-mute2 w-28 flex-shrink-0 uppercase tracking-[.06em]">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-void-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] tabular-nums w-6 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export default async function GearDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = CATALOG.find((p) => p.id === id);
  if (!p) notFound();

  const imgSrc = PRODUCT_IMAGES[p.imageSlug];
  const isRealEstate = p.category === "real_estate";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": isRealEstate ? "RealEstateListing" : "Product",
    "name": p.name,
    "description": p.spec,
    "brand": { "@type": "Brand", "name": p.brand },
    "offers": {
      "@type": "Offer",
      "price": (p.priceUsd / 100).toFixed(2),
      "priceCurrency": "USD",
      "availability": p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": p.externalUrl,
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": (p.gradeComposite / 20).toFixed(1),
      "bestRating": "5",
      "ratingCount": "1",
      "reviewCount": "1",
    },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-text-mute2">
        <Link href="/provisioner" className="hover:text-gold-protocol transition-colors">Provisioner</Link>
        <span>/</span>
        <Link href="/provisioner/gear" className="hover:text-gold-protocol transition-colors">Gear</Link>
        <span>/</span>
        <span className="text-text-dim">{p.name}</span>
      </nav>

      {/* Hero card */}
      <div className="relative rounded-2xl border border-border-protocol bg-void-1 overflow-hidden"
           style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}>
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)" }} />
        <div className="absolute top-0 left-0 bottom-0 w-[3px]"
             style={{ background: p.grade === "A" ? "#1ae8a0" : p.grade === "B" ? "#c9a84c" : p.grade === "C" ? "#f0a500" : "#e84040" }} />

        {/* Image */}
        {imgSrc && (
          <div className={`relative h-56 border-b border-border-protocol overflow-hidden ${isRealEstate ? "bg-void-2" : "bg-white"}`}>
            <Image
              src={imgSrc}
              alt={p.name}
              fill
              className={isRealEstate ? "object-cover" : "object-contain p-6"}
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {p.criticalFlag && (
                  <span className="font-mono text-[8px] text-red-bright border border-red-DEFAULT/30
                                   bg-red-dim px-1.5 py-0.5 rounded tracking-[.08em]">
                    CRITICAL
                  </span>
                )}
                <span className="font-mono text-[9px] text-text-mute2">{p.sku}</span>
                {p.location && (
                  <span className="font-mono text-[9px] text-text-mute2">{p.location}</span>
                )}
              </div>
              <h1 className="font-syne font-extrabold text-[22px] text-text-base leading-tight">
                {p.name}
              </h1>
              <p className="font-mono text-[11px] text-text-mute2 mt-0.5">{p.brand}</p>
            </div>
            <GradeBadge grade={p.grade} composite={p.gradeComposite} size="lg" />
          </div>

          {/* Spec */}
          <p className="text-text-dim text-[13.5px] leading-relaxed">{p.spec}</p>

          {/* Build note */}
          <div className="flex items-start gap-2 bg-void-2 border border-border-protocol rounded-xl px-4 py-3">
            <span className="text-gold-protocol font-mono text-[11px] flex-shrink-0 mt-px">→</span>
            <p className="font-mono text-[11px] text-text-mute2 leading-relaxed">{p.buildNote}</p>
          </div>

          {/* Scores */}
          {p.gearLayers && (
            <div className="space-y-2 pt-1">
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase mb-3">
                Tevatha Gear Score
              </p>
              <ScoreBar label="Durability"       value={p.gearLayers.durability} />
              <ScoreBar label="Grid Independence" value={p.gearLayers.grid_independence} />
              <ScoreBar label="Field Repair"      value={p.gearLayers.field_repairability} />
              <ScoreBar label="Value Density"     value={p.gearLayers.value_density} />
              <ScoreBar label="Supply Chain"      value={p.gearLayers.supply_chain} />
            </div>
          )}
          {p.safetyScore && (
            <div className="space-y-2 pt-1">
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase mb-3">
                Safety Index
              </p>
              <ScoreBar label="Nuclear Distance"  value={p.safetyScore.nuclearDistance} />
              <ScoreBar label="Disaster Risk"     value={p.safetyScore.disasterRisk} />
              <ScoreBar label="Population"        value={p.safetyScore.populationDensity} />
              <ScoreBar label="Stability"         value={p.safetyScore.politicalStability} />
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border-protocol">
            <div>
              <div className="font-mono font-bold text-[22px] text-gold-bright tabular-nums">
                {p.priceDisplay ?? `$${(p.priceUsd / 100).toFixed(2)}`}
              </div>
              {!isRealEstate && (
                <div className="font-mono text-[10px] text-cyan-DEFAULT mt-0.5">
                  ◎ {p.priceUsdc.toFixed(2)} USDC
                </div>
              )}
            </div>
            <a
              href={p.externalUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-[12px] tracking-[.06em] px-6 py-3 rounded-xl
                         bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5
                         hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)] transition-all duration-200"
            >
              {isRealEstate ? "Search Listings ↗" : `Buy at ${p.brand} ↗`}
            </a>
          </div>
        </div>
      </div>

      {/* Back */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/provisioner/gear"
              className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors">
          ← Back to Gear Catalog
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/provisioner/methodology"
                className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors">
            Scoring Methodology
          </Link>
          <Link href="/provisioner/checklist"
                className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors">
            Print Critical Checklist →
          </Link>
        </div>
      </div>
    </div>
  );
}
