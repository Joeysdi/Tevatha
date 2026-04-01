// components/properties/PropertyCard.tsx
"use client";

import Link from "next/link";
import { TevathaBadge } from "./TevathaBadge";
import type { Property } from "@/lib/real-estate/types";

interface Props {
  property: Property;
}

const TYPE_PILL: Record<string, string> = {
  land:        "bg-green-dim/20 text-green-bright",
  residential: "bg-blue-dim/20   text-blue-DEFAULT",
  compound:    "bg-amber-dim/20  text-amber-protocol",
  bunker:      "bg-red-dim/20    text-red-bright",
  farm:        "bg-green-dim/20  text-green-bright",
  cabin:       "bg-amber-dim/20  text-amber-DEFAULT",
  retreat:     "bg-cyan-dim/20   text-cyan-DEFAULT",
};

function formatPrice(cents: number | null, display: string | null): string {
  if (display) return display;
  if (!cents) return "Price on request";
  const usd = cents / 100;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000)     return `$${Math.round(usd / 1000)}K`;
  return `$${usd.toLocaleString()}`;
}

export function PropertyCard({ property: p }: Props) {
  const isTevatha   = p.tevatha_certified;
  const thumbnail   = p.images?.[0];
  const pillClass   = TYPE_PILL[p.property_type] ?? "bg-glass-DEFAULT text-text-dim";

  return (
    <Link
      href={`/provisioner/properties/${p.slug ?? p.id}`}
      className={[
        "group block rounded-xl border overflow-hidden transition-all duration-200",
        "hover:-translate-y-px",
        isTevatha
          ? "border-gold-protocol/40 bg-void-1 hover:border-gold-protocol/70 hover:shadow-gold"
          : "border-border-protocol bg-void-1 hover:border-border-bright hover:shadow-card",
      ].join(" ")}
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
    >
      {/* Top accent line */}
      {isTevatha && (
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
        />
      )}

      {/* Image */}
      <div className="relative h-40 bg-void-2 overflow-hidden">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[32px] text-text-mute2/30">⛰</span>
          </div>
        )}

        {/* Type pill */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${pillClass}`}>
          {p.property_type}
        </span>

        {/* Source label for external */}
        {!isTevatha && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-mono text-text-mute2 bg-void-0/80">
            {p.source === "mls" ? "MLS" : "AGGREGATOR"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {isTevatha && (
          <div className="mb-2">
            <TevathaBadge />
          </div>
        )}

        <h3 className="font-syne font-bold text-[13px] text-text-base leading-snug mb-1 line-clamp-2">
          {p.title}
        </h3>

        <p className="font-mono text-[10px] text-text-mute2 mb-3">
          {[p.city, p.state, p.country].filter(Boolean).join(", ")}
        </p>

        {/* Price */}
        <div className="font-mono font-bold text-[15px] text-gold-protocol mb-3 tabular-nums">
          {formatPrice(p.price_usd, p.price_display)}
        </div>

        {/* Key stats */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-text-dim">
          {p.acres && <span>{p.acres.toFixed(1)} ac</span>}
          {p.bedrooms && <span>{p.bedrooms} bd</span>}
          {p.bathrooms && <span>{p.bathrooms} ba</span>}
          {p.sqft && <span>{p.sqft.toLocaleString()} sqft</span>}
        </div>

        {/* Resilience stats — Tevatha only */}
        {isTevatha && (
          <div className="mt-3 pt-3 border-t border-border-protocol flex flex-wrap gap-x-3 gap-y-1">
            {p.off_grid_capacity && (
              <span className="font-mono text-[9.5px] text-green-bright">
                ⚡ {p.off_grid_capacity.replace(/-/g, " ")}
              </span>
            )}
            {p.resource_autonomy_days && (
              <span className="font-mono text-[9.5px] text-text-dim">
                {p.resource_autonomy_days}d autonomy
              </span>
            )}
            {p.safety_score != null && (
              <span className="font-mono text-[9.5px] text-gold-protocol">
                ★ {p.safety_score}/100
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
