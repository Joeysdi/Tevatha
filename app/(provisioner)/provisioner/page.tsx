// app/(provisioner)/provisioner/page.tsx  →  URL: /provisioner
"use client";

import Link               from "next/link";
import { ProductGrid }    from "@/components/provisioner/product-grid";
import { GradeBadge }     from "@/components/provisioner/grade-badge";
import { ProvisionerCta } from "@/components/watchtower/provisioner-cta";
import { FadeUp, FadeIn, StaggerParent, StaggerChild } from "@/components/ui/motion";
import { CATALOG, CATALOG_STATS } from "@/lib/provisioner/catalog";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { GradeLevel } from "@/types/treasury";

export default function ShopPage() {
  const { t } = useTranslation();

  const GRADE_EXPLAINER: { grade: GradeLevel; label: string }[] = [
    { grade:"A", label:t("shop_grade_a_label") },
    { grade:"B", label:t("shop_grade_b_label") },
    { grade:"C", label:t("shop_grade_c_label") },
    { grade:"D", label:t("shop_grade_d_label") },
  ];

  const GRADING_LAYERS = [
    { n:"L1", nameKey:"shop_l1_name" as const, descKey:"shop_l1_desc" as const, w:"30%" },
    { n:"L2", nameKey:"shop_l2_name" as const, descKey:"shop_l2_desc" as const, w:"30%" },
    { n:"L3", nameKey:"shop_l3_name" as const, descKey:"shop_l3_desc" as const, w:"20%" },
    { n:"L4", nameKey:"shop_l4_name" as const, descKey:"shop_l4_desc" as const, w:"10%" },
    { n:"L5", nameKey:"shop_l5_name" as const, descKey:"shop_l5_desc" as const, w:"10%" },
  ];

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <header className="relative rounded-xl border p-5 sm:p-7 mb-6 overflow-hidden"
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
              {t("shop_eyebrow")}
            </p>
          </StaggerChild>
          <StaggerChild>
            <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                           leading-[1.12] text-text-base mb-2.5">
              {t("shop_hero_title")}{" "}
              <span className="text-gold-protocol">{t("shop_hero_highlight")}</span>
            </h1>
          </StaggerChild>
          <StaggerChild>
            <p className="text-text-dim text-[13px] leading-relaxed max-w-xl mb-5">
              {t("shop_hero_sub")}
            </p>
          </StaggerChild>
        </StaggerParent>

        {/* Catalog stats */}
        <StaggerParent className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3" delayChildren={0.2}>
          {[
            { val:CATALOG_STATS.total,      labelKey:"shop_stat_total"    as const },
            { val:CATALOG_STATS.gradeA,     labelKey:"shop_stat_grade_a"  as const },
            { val:CATALOG_STATS.gradeB,     labelKey:"shop_stat_grade_b"  as const },
            { val:CATALOG_STATS.critical,   labelKey:"shop_stat_critical" as const },
            { val:CATALOG_STATS.categories, labelKey:"shop_stat_cats"     as const },
            { val:CATALOG_STATS.highTicket, labelKey:"shop_stat_usdc"     as const },
          ].map((s) => (
            <StaggerChild key={s.labelKey}>
              <div
                className="text-center px-2 sm:px-3 py-2.5 bg-void-1 rounded-lg
                           border border-border-protocol border-l-2 border-l-gold-protocol"
              >
                <div className="font-mono font-extrabold tabular-nums text-[20px] sm:text-[22px]
                                text-gold-protocol leading-none">
                  <FadeIn delay={0.3}>{s.val}</FadeIn>
                </div>
                <div className="font-mono text-[8px] sm:text-[9px] text-text-mute2
                                mt-1 leading-tight uppercase">
                  {t(s.labelKey)}
                </div>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>
      </header>

      {/* ── 5-LAYER GRADING SYSTEM ─────────────────────────────────────── */}
      <section className="bg-void-1 border border-border-protocol
                           rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            {t("shop_section_grading")}
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>

        {/* Grading layers */}
        <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {GRADING_LAYERS.map((l) => (
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
                {t(l.nameKey)}
              </div>
              <p className="font-mono text-[9.5px] text-text-mute2 leading-relaxed">
                {t(l.descKey)}
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
            {t("shop_grade_scale_label")}
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
          <h2 className="font-syne font-bold text-[17px] text-text-base">{t("shop_section_rails")}</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
      <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stripe rail */}
        <StaggerChild>
        <div className="rounded-xl bg-void-1 border border-gold-protocol/22 p-5"
             style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] text-gold-protocol
                             font-bold tracking-[.1em]">{t("shop_rail_card")}</span>
            <span className="font-mono text-[9px] text-text-mute2">
              {t("shop_rail_card_sub")}
            </span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed mb-3">
            {t("shop_rail_card_desc")}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-bright animate-pulse" />
            <span className="font-mono text-[10px] text-green-bright">{t("shop_rail_active")}</span>
          </div>
        </div>
        </StaggerChild>

        {/* Solana USDC rail */}
        <StaggerChild>
        <div className="rounded-xl bg-void-1 border border-cyan-border p-5"
             style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] text-cyan-DEFAULT
                             font-bold tracking-[.1em]">{t("shop_rail_usdc")}</span>
            <span className="font-mono text-[9px] text-text-mute2">
              {t("shop_rail_usdc_sub")}
            </span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed mb-3">
            {t("shop_rail_usdc_desc")}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
            <span className="font-mono text-[10px] text-cyan-DEFAULT">{t("shop_rail_active")}</span>
          </div>
        </div>
        </StaggerChild>
      </StaggerParent>
      </div>

      {/* ── PRODUCT GRID (client island) ───────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            {t("shop_section_catalog")}
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
          <Link
            href="/provisioner/tiers"
            prefetch
            className="font-mono text-[10px] text-text-mute2
                       hover:text-gold-protocol transition-colors ml-auto"
          >
            {t("shop_tier_cta")}
          </Link>
        </div>
        <ProductGrid products={CATALOG} />
      </section>

      <ProvisionerCta
        headline={t("prov_cta_headline")}
        subtext={t("prov_cta_sub")}
        label={t("prov_cta_label")}
        href="/provisioner/tiers"
        urgency={t("prov_cta_urgency")}
      />
    </div>
  );
}
