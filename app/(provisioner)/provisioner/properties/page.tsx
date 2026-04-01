// app/(provisioner)/provisioner/properties/page.tsx  →  URL: /provisioner/properties
import { Suspense }           from "react";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { PropertyCard }       from "@/components/properties/PropertyCard";
import { PropertyFilters }    from "@/components/properties/PropertyFilters";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import type { Property }      from "@/lib/real-estate/types";
import type { Metadata }      from "next";

export const metadata: Metadata = {
  title: "Resilience Properties",
  description: "Off-grid land, compounds, farms, and retreats — curated for sovereign living.",
};

// Revalidate every 2 days to match the cron schedule
export const revalidate = 172800;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function loadProperties(sp: Record<string, string | undefined>) {
  const supabase  = createServiceSupabaseClient();
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit     = 24;
  const offset    = (page - 1) * limit;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .eq("status", "active")
    .order("tevatha_certified", { ascending: false })
    .order("tevatha_rank",      { ascending: true,  nullsFirst: false })
    .order("safety_score",      { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (sp.type)     query = query.eq("property_type", sp.type);
  if (sp.offGrid === "true") query = query.not("off_grid_capacity", "is", null);
  if (sp.minPrice) query = query.gte("price_usd", parseInt(sp.minPrice, 10) * 100);
  if (sp.maxPrice) query = query.lte("price_usd", parseInt(sp.maxPrice, 10) * 100);
  if (sp.minAcres) query = query.gte("acres", parseFloat(sp.minAcres));

  const { data, count } = await query;
  const properties = (data ?? []) as Property[];

  return {
    certified: properties.filter((p) => p.tevatha_certified),
    market:    properties.filter((p) => !p.tevatha_certified),
    total:     count ?? 0,
    page,
  };
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { certified, market, total } = await loadProperties(sp);

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <header
        className="relative rounded-xl border p-5 sm:p-7 mb-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(11,13,24,1))",
          borderColor: "rgba(201,168,76,0.22)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
        />
        <FadeUp>
          <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em] uppercase mb-3">
            RESILIENCE REAL ESTATE · TEVATHA PROVISIONER
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(24px,4.5vw,32px)] leading-[1.12] text-text-base mb-2.5">
            Sovereign Land &{" "}
            <span className="text-gold-protocol">Off-Grid Properties</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed max-w-2xl">
            Tevatha-Certified resilience properties elevated above market noise.
            Off-grid compounds, farms, bunkers, and retreats — vetted for
            autonomy, safety score, and long-term viability.
          </p>
        </FadeUp>

        <div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-protocol animate-pulse" />
            <span className="text-text-dim">{certified.length} Tevatha-Certified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-text-mute2/40" />
            <span className="text-text-mute2">{market.length} Market listings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-bright" />
            <span className="text-text-dim">{total} total</span>
          </div>
        </div>
      </header>

      {/* ── FILTERS ─────────────────────────────────────────────────────────── */}
      <Suspense>
        <PropertyFilters />
      </Suspense>

      {/* ── TEVATHA-CERTIFIED STRIP ──────────────────────────────────────────── */}
      {certified.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-gold-protocol">
              ⚡ Tevatha-Certified
            </h2>
            <div className="flex-1 h-px bg-gold-protocol/20" />
            <span className="font-mono text-[10px] text-text-mute2">
              {certified.length} listing{certified.length !== 1 ? "s" : ""}
            </span>
          </div>
          <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {certified.map((p) => (
              <StaggerChild key={p.id}>
                <PropertyCard property={p} />
              </StaggerChild>
            ))}
          </StaggerParent>
        </section>
      )}

      {/* ── MARKET LISTINGS STRIP ────────────────────────────────────────────── */}
      {market.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">
              Market Listings
            </h2>
            <div className="flex-1 h-px bg-border-protocol" />
            <span className="font-mono text-[10px] text-text-mute2">
              MLS + aggregator feeds
            </span>
          </div>
          <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {market.map((p) => (
              <StaggerChild key={p.id}>
                <PropertyCard property={p} />
              </StaggerChild>
            ))}
          </StaggerParent>
        </section>
      )}

      {/* ── EMPTY STATE ──────────────────────────────────────────────────────── */}
      {certified.length === 0 && market.length === 0 && (
        <FadeUp delay={0.1}>
          <div className="text-center py-20">
            <p className="font-mono text-[32px] mb-4">⛰</p>
            <p className="font-syne font-bold text-[18px] text-text-base mb-2">
              No properties found
            </p>
            <p className="text-text-dim text-[13px] mb-6">
              Try adjusting your filters or contact us to discuss your requirements.
            </p>
            <a
              href="mailto:properties@tevatha.com"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg
                         bg-gold-protocol text-void-0 font-syne font-bold text-[13px]
                         hover:bg-gold-bright hover:-translate-y-0.5
                         hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                         transition-all duration-200"
            >
              Contact for Listings
            </a>
          </div>
        </FadeUp>
      )}
    </div>
  );
}
