// app/(provisioner)/provisioner/page.tsx  →  URL: /provisioner
import type { Metadata } from "next";
import Link               from "next/link";
import { ProductGrid }    from "@/components/provisioner/product-grid";
import { GradeBadge }     from "@/components/provisioner/grade-badge";
import { ProvisionerCta } from "@/components/watchtower/provisioner-cta";
import { FadeUp, FadeIn, StaggerParent, StaggerChild } from "@/components/ui/motion";
import { CATALOG, CATALOG_STATS } from "@/lib/provisioner/catalog";
import { GRADE_META }              from "@/lib/provisioner/grading";
import type { GradeLevel }         from "@/types/treasury";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Tevatha-Certified gear. Every item graded across 5 layers: durability, grid independence, field repairability, value density, and supply chain resilience.",
};

const GRADE_EXPLAINER: { grade: GradeLevel; label: string }[] = [
  { grade:"A", label:"Mission-critical. Deploy immediately." },
  { grade:"B", label:"Approved. Deploy in context of need." },
  { grade:"C", label:"Conditional. Use when A/B unavailable." },
  { grade:"D", label:"Contingency. Last resort only." },
];

export default function ShopPage() {
  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <header className="relative rounded-xl border p-7 mb-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(11,13,24,1))",
          borderColor: "rgba(201,168,76,0.22)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
        />

        <StaggerParent>
          <StaggerChild>
            <p className="font-mono text-[9.5px] text-gold-protocol
                           tracking-[.22em] uppercase mb-3">
              Provisioner Store · Tevatha-Certified Gear
            </p>
          </StaggerChild>
          <StaggerChild>
            <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                           leading-[1.12] text-text-base mb-2.5">
              Gear That Works When{" "}
              <span className="text-gold-protocol">Nothing Else Does</span>
            </h1>
          </StaggerChild>
          <StaggerChild>
            <p className="text-text-dim text-[13px] leading-relaxed max-w-xl mb-5">
              No affiliate links. No sponsored placements. Every item earns its place
              through the 5-Layer Grading System. Life Over Money.
            </p>
          </StaggerChild>
        </StaggerParent>

        {/* Catalog stats */}
        <StaggerParent className="grid grid-cols-3 sm:grid-cols-6 gap-3" delayChildren={0.2}>
          {[
            { val:CATALOG_STATS.total,      label:"Total Items"    },
            { val:CATALOG_STATS.gradeA,     label:"Grade A"        },
            { val:CATALOG_STATS.gradeB,     label:"Grade B"        },
            { val:CATALOG_STATS.critical,   label:"Critical Items" },
            { val:CATALOG_STATS.categories, label:"Categories"     },
            { val:CATALOG_STATS.highTicket, label:"USDC Rail"      },
          ].map((s) => (
            <StaggerChild key={s.label}>
              <div
                className="text-center px-3 py-2.5 bg-void-1 rounded-lg
                           border border-border-protocol"
              >
                <div className="font-syne font-extrabold text-[22px]
                                text-gold-protocol leading-none">
                  <FadeIn delay={0.3}>{s.val}</FadeIn>
                </div>
                <div className="font-mono text-[9px] text-text-mute2
                                mt-1 leading-tight">
                  {s.label.toUpperCase()}
                </div>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>
      </header>

      {/* ── 5-LAYER GRADING SYSTEM ─────────────────────────────────────── */}
      <section className="bg-void-1 border border-border-protocol
                           rounded-xl p-5 mb-6">
        <h2 className="font-syne font-bold text-[17px] text-text-base mb-4">
          5-Layer Asset Grading System
        </h2>

        {/* Grading layers */}
        <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {[
            { n:"L1", layer:"Durability",                w:"30%", desc:"Must function after 5+ years storage or hard use without degradation."          },
            { n:"L2", layer:"Grid Independence",          w:"30%", desc:"Must function without grid power, internet, or cellular connectivity."          },
            { n:"L3", layer:"Field Repairability",        w:"20%", desc:"Repairable with basic tools or globally available replacement parts."           },
            { n:"L4", layer:"Value Density",              w:"10%", desc:"Must justify cost against caloric, survival, or protection value produced."     },
            { n:"L5", layer:"Supply Chain Resilience",    w:"10%", desc:"Must remain sourceable when primary supply chains are disrupted."               },
          ].map((l) => (
            <StaggerChild key={l.n}>
            <div
              className="bg-void-1 border border-border-protocol rounded-xl p-4
                         border-l-2 border-l-gold-protocol"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-gold-protocol
                                 font-bold">{l.n}</span>
                <span className="font-mono text-[9px] text-text-mute2">
                  {l.w}
                </span>
              </div>
              <div className="font-syne font-bold text-[12px] text-text-base mb-1.5">
                {l.layer}
              </div>
              <p className="font-mono text-[9.5px] text-text-mute2 leading-relaxed">
                {l.desc}
              </p>
            </div>
            </StaggerChild>
          ))}
        </StaggerParent>

        {/* Grade scale */}
        <FadeUp delay={0.25}>
        <div>
          <p className="font-mono text-[9.5px] text-text-mute2
                         tracking-[.1em] uppercase mb-2.5">
            Grade Scale
          </p>
          <div className="flex flex-wrap gap-2.5">
            {GRADE_EXPLAINER.map(({ grade, label }) => (
              <div
                key={grade}
                className="flex items-center gap-2 px-3 py-1.5
                           bg-void-2 border border-border-protocol rounded-lg"
              >
                <GradeBadge grade={grade} composite={0} size="sm" />
                <span className="text-[11.5px] text-text-dim">{label}</span>
              </div>
            ))}
          </div>
        </div>
        </FadeUp>
      </section>

      {/* ── PAYMENT RAILS ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">Payment Rails</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
      <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stripe rail */}
        <StaggerChild>
        <div className="rounded-xl bg-void-1 border border-gold-protocol/22 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] text-gold-protocol
                             font-bold tracking-[.1em]">CARD RAIL</span>
            <span className="font-mono text-[9px] text-text-mute2">
              STRIPE · STANDARD ITEMS
            </span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed mb-3">
            Standard checkout for individual gear items under $500. Visa,
            Mastercard, AMEX. PCI-DSS via Stripe. Instant fulfilment.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-bright animate-pulse" />
            <span className="font-mono text-[10px] text-green-bright">ACTIVE</span>
          </div>
        </div>
        </StaggerChild>

        {/* Solana USDC rail */}
        <StaggerChild>
        <div className="rounded-xl bg-void-1 border border-cyan-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] text-cyan-DEFAULT
                             font-bold tracking-[.1em]">SOLANA USDC RAIL</span>
            <span className="font-mono text-[9px] text-text-mute2">
              OPOS · HIGH-TICKET ≥$500
            </span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed mb-3">
            USDC on Solana for high-ticket gear ($500+). Solana Pay spec.
            Unique ephemeral reference key per invoice. No counterparty risk.
            Sub-second finality.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
            <span className="font-mono text-[10px] text-cyan-DEFAULT">ACTIVE</span>
          </div>
        </div>
        </StaggerChild>
      </StaggerParent>
      </div>

      {/* ── PRODUCT GRID (client island) ───────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            Tevatha-Certified Catalog
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
          <Link
            href="/provisioner/tiers"
            prefetch
            className="font-mono text-[10px] text-text-mute2
                       hover:text-gold-protocol transition-colors ml-auto"
          >
            Run Tier Assessment first →
          </Link>
        </div>
        <ProductGrid products={CATALOG} />
      </section>

      <ProvisionerCta
        headline="Know your tier before you buy."
        subtext="Buying without knowing your tier wastes capital. Run the Preparedness Assessment first — shop from your specific gap list, not a generic starter kit."
        label="Run Tier Assessment →"
        href="/provisioner/tiers"
        urgency="GRADE A ITEMS: LIMITED ALLOCATION — BUILD ORDER ACTIVE"
      />
    </div>
  );
}
