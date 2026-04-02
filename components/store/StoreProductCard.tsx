// components/store/StoreProductCard.tsx
"use client";

import { TevathaBadge } from "@/components/properties/TevathaBadge";
import { GradeBadge }   from "@/components/provisioner/grade-badge";
import type { StoreProduct } from "@/lib/store/types";
import type { GradeLevel } from "@/types/treasury";

const VALID_GRADES = new Set<string>(["A", "B", "C", "D", "F"]);

function resolveGrade(grade: string | null, score: number | null): { grade: GradeLevel; composite: number } | null {
  // If both absent — unrated, hide badge
  if (!grade && score === null) return null;

  // Derive letter from score if grade string is absent or invalid
  let letter: GradeLevel;
  if (grade && VALID_GRADES.has(grade)) {
    letter = grade as GradeLevel;
  } else if (score !== null) {
    letter = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F";
  } else {
    return null;
  }

  return { grade: letter, composite: score ?? 0 };
}

const CATEGORY_EMOJI: Record<string, string> = {
  food:   "🥫",
  water:  "💧",
  energy: "⚡",
};

function topStats(product: StoreProduct): string[] {
  const bw = product.biological_wealth;
  if (!bw) return [];

  const stats: string[] = [];
  if (bw.category === "food") {
    if (bw.shelf_life_years !== null)    stats.push(`${bw.shelf_life_years}yr shelf`);
    if (bw.calories_per_dollar !== null) stats.push(`${Math.round(bw.calories_per_dollar)} cal/$`);
  } else if (bw.category === "water") {
    if (bw.micron_filtration !== null)   stats.push(`${bw.micron_filtration}μm`);
    if (bw.gpd_purification !== null)    stats.push(`${bw.gpd_purification} GPD`);
  } else if (bw.category === "energy") {
    if (bw.watt_hours !== null)          stats.push(`${bw.watt_hours.toLocaleString()}Wh`);
    if (bw.continuous_watts !== null)    stats.push(`${bw.continuous_watts}W cont.`);
  }

  return stats.slice(0, 2);
}

interface StoreProductCardProps {
  product: StoreProduct;
}

export function StoreProductCard({ product }: StoreProductCardProps) {
  const stats     = topStats(product);
  const emoji     = CATEGORY_EMOJI[product.category] ?? "📦";
  const firstImg  = product.images?.[0] ?? null;
  const isReview  = product.status === "review";
  const isDrop    = product.fulfillment_type === "dropship";
  const safetyBadge = resolveGrade(product.grade, product.safety_score);

  const priceDisplay =
    product.min_price_usd !== null
      ? `$${(product.min_price_usd / 100).toFixed(2)}`
      : "—";

  const borderClass = product.tevatha_certified
    ? "border-gold-protocol/50"
    : "border-border-protocol";

  // Link: internal detail page first, fallback to external URL
  const detailHref = product.external_url
    ? product.external_url
    : `/provisioner/store/${product.slug}`;

  return (
    <article
      className={`group relative bg-void-1 border rounded-xl overflow-hidden flex flex-col
                  hover:shadow-[0_8px_24px_rgba(201,168,76,0.22)] hover:-translate-y-0.5
                  transition-all duration-150 ${borderClass}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)" }}
      />

      {/* Review pill */}
      {isReview && (
        <div className="absolute top-2 right-2 z-10">
          <span className="font-mono text-[8px] px-2 py-0.5 rounded
                           bg-[#f0a500]/10 text-[#f0a500] border border-[#f0a500]/30">
            AWAITING CERTIFICATION
          </span>
        </div>
      )}

      {/* Image / fallback */}
      <div className="relative h-36 border-b border-border-protocol overflow-hidden flex-shrink-0 bg-void-2">
        {firstImg ? (
          // Raw <img> for external URLs (OFF images, vendor CDNs)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImg}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1.5">
            <span className="text-[28px] opacity-30">{emoji}</span>
            <span className="font-mono text-[8px] text-text-mute2/40 tracking-[.12em] uppercase">
              {product.brand ?? product.category}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap min-h-[20px]">
          {product.tevatha_certified && <TevathaBadge />}
          {safetyBadge && (
            <GradeBadge grade={safetyBadge.grade} composite={safetyBadge.composite} size="sm" />
          )}
          {isDrop && (
            <span className="font-mono text-[8px] text-text-mute2 border border-border-protocol
                             px-1.5 py-0.5 rounded">
              DROP-SHIP
            </span>
          )}
        </div>

        {/* Title + brand */}
        <h3 className="font-syne font-bold text-[12px] text-text-base leading-snug mb-0.5 line-clamp-2">
          {product.title}
        </h3>
        {product.brand && (
          <p className="font-mono text-[9px] text-text-mute2 mb-2">{product.brand}</p>
        )}

        {/* Biological wealth inline preview */}
        {stats.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {stats.map((s) => (
              <span
                key={s}
                className="font-mono text-[9px] text-gold-protocol border border-gold-protocol/20
                           bg-gold-protocol/5 px-2 py-0.5 rounded"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto mb-2.5">
          <div className="font-mono font-bold text-[14px] tabular-nums text-gold-protocol">
            {priceDisplay}
          </div>
          {variants.length > 1 && (
            <div className="font-mono text-[8px] text-text-mute2">
              {variants.length} variants
            </div>
          )}
        </div>

        {/* Action button */}
        <a
          href={detailHref}
          target={product.external_url ? "_blank" : undefined}
          rel={product.external_url ? "noopener noreferrer" : undefined}
          className="w-full font-mono font-bold text-[11px] tracking-[.06em]
                     px-4 py-2.5 rounded-lg transition-all duration-150 text-center block
                     bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5"
        >
          {product.external_url ? `View at Store ↗` : "View Details →"}
        </a>
      </div>
    </article>
  );
}
