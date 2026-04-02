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
      <header className="relative rounded-xl border p-5 sm:p-7 mb-4 overflow-hidden"
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
            <div className="font-mono text-[10px] tracking-[.06em] mb-3 flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-red-bright">73% FINANCIAL COLLAPSE PROBABILITY</span>
              <span className="text-text-mute2/40">·</span>
              <span className="text-amber-protocol">68% INFRASTRUCTURE FAILURE</span>
              <span className="text-text-mute2/40">·</span>
              <span className="text-gold-protocol">85 SECONDS TO MIDNIGHT</span>
            </div>
          </StaggerChild>
          <StaggerChild>
            <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                           leading-[1.12] text-text-base mb-2.5">
              {t("shop_hero_title")}{" "}
              <span className="text-gold-protocol">{t("shop_hero_highlight")}</span>
            </h1>
          </StaggerChild>
          <StaggerChild>
            <p className="text-text-dim text-[13px] leading-relaxed mb-5">
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

      {/* ── PRODUCT GRID (sidebar + grid) ──────────────────────────────── */}
      <section className="mt-4">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            {t("shop_section_catalog")}
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
          <Link
            href="/provisioner/tiers"
            prefetch
            className="font-mono text-[10px] text-text-mute2
                       hover:text-gold-protocol transition-colors"
          >
            {t("shop_tier_cta")}
          </Link>
        </div>
        <ProductGrid products={CATALOG} />
      </section>

      {/* ── BELOW-FOLD: Grading + Rails ─────────────────────────────────── */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5-Layer Grading */}
        <div className="bg-void-1 border border-border-protocol rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">
              {t("shop_section_grading")}
            </h2>
            <div className="flex-1 h-px bg-border-protocol" />
          </div>

          <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {GRADING_LAYERS.map((l) => (
              <StaggerChild key={l.n}>
              <div
                className="bg-void-1 border border-border-protocol rounded-xl p-4
                           border-l-2 border-l-gold-protocol"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-gold-protocol font-bold">{l.n}</span>
                  <span className="font-mono text-[9px] text-text-mute2">{l.w}</span>
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

          <FadeUp delay={0.25}>
          <div>
            <p className="font-mono text-[9.5px] text-text-mute2 tracking-[.1em] uppercase mb-2.5">
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
        </div>

        {/* Donate */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">Support This Project</h2>
            <div className="flex-1 h-px bg-border-protocol" />
          </div>
          <div
            className="relative rounded-xl bg-void-1 border border-gold-protocol/30 p-6 overflow-hidden"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
            />
            <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.2em] uppercase mb-3">
              Nonprofit · Free Resource
            </p>
            <p className="font-syne font-bold text-[17px] text-text-base mb-2 leading-snug">
              Tevatha is free.<br />
              <span className="text-gold-protocol">Your donation keeps it alive.</span>
            </p>
            <p className="text-[12px] text-text-dim leading-relaxed mb-5 max-w-sm">
              No subscriptions. No paywalls. If this resource helps you prepare, consider a small contribution via USDT on Tron (TRC-20).
            </p>
            <div className="mb-4 bg-void-2 border border-border-protocol rounded-lg px-3 py-2.5 flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-mute2 select-all break-all">
                TMJwucn2aQpzfLBabAPzr8x6dH7ViZ1Rqb
              </span>
            </div>
            <a
              href="https://tronscan.org/#/address/TMJwucn2aQpzfLBabAPzr8x6dH7ViZ1Rqb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-syne font-bold
                         text-[13px] tracking-[.06em] bg-gold-protocol text-void-0
                         hover:bg-gold-bright hover:-translate-y-0.5
                         hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)]
                         transition-all duration-200"
            >
              ♥ Donate to Creator
            </a>
            <p className="font-mono text-[9px] text-text-mute2 mt-3">
              USDT · TRC-20 · Tron network
            </p>
          </div>
        </div>
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
