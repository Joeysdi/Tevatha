// components/watchtower/globe-intel-panel.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  DOMAINS, SIGNALS, COLLAPSE_CLASSES,
} from "@/lib/watchtower/data";
import { useTranslation } from "@/lib/i18n/use-translation";

export type IntelTab = "hub";

interface Props {
  open:        boolean;
  onClose:     () => void;
  activeTab:   IntelTab;
  onTabChange: (t: IntelTab) => void;
}

const TABS: { id: IntelTab; label: string }[] = [
  { id: "hub", label: "⬡ Hub" },
];

const DOMAIN_COLORS: Record<string, string> = {
  "Nuclear / EMP":    "#e84040",
  "Cyber / Tech":     "#00d4ff",
  "Civil / Political":"#f0a500",
  "Economic":         "#c9a84c",
  "Biological":       "#1ae8a0",
  "Climate":          "#38bdf8",
};

const SEV_STYLES: Record<string, string> = {
  t4: "bg-red-protocol/25 text-red-bright border-red-protocol/30",
  t3: "bg-amber-dim text-amber-protocol border-amber-DEFAULT/20",
  t2: "bg-blue-dim text-blue-DEFAULT border-blue-DEFAULT/20",
  t1: "bg-green-dim text-green-bright border-green-bright/20",
};

// ─────────────────────────────────────────────────────────────────────────────

export function GlobeIntelPanel({
  open,
  onClose,
  activeTab,
  onTabChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="intel-panel"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-0 inset-y-0 z-30 w-[360px] max-w-[88vw]
                     flex flex-col bg-void-1/97 backdrop-blur-md
                     border-r border-border-protocol overflow-hidden"
          style={{ boxShadow: "6px 0 48px rgba(0,0,0,0.7)" }}
        >
          {/* Red accent line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
               style={{ background: "linear-gradient(90deg,#e84040,rgba(232,64,64,0.2),transparent)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-border-protocol flex-shrink-0">
            <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-red-bright">
              Watchtower · {t("nav_intel")}
            </p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-border-bright/40
                         transition-colors font-mono text-[11px]
                         flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Tab strip */}
          <div className="flex border-b border-border-protocol flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 py-2.5 font-mono text-[9.5px] font-bold tracking-[.07em]
                            transition-colors duration-150
                            ${activeTab === tab.id
                              ? "text-red-bright border-b-2 border-red-protocol bg-red-protocol/6"
                              : "text-text-mute2 hover:text-text-base border-b-2 border-transparent"
                            }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              >
                {activeTab === "hub" && <HubTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ── HUB TAB ──────────────────────────────────────────────────────────────────

function HubTab() {
  const { t } = useTranslation();

  return (
    <div className="divide-y divide-border-protocol/60">

      {/* Doomsday clock */}
      <div className="px-4 py-3 bg-red-protocol/6">
        <p className="font-mono text-[7.5px] tracking-[.22em] uppercase text-red-bright/70 mb-1.5">
          {t("intel_doomsday_header")}
        </p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-syne font-extrabold text-[40px] leading-none text-red-bright tabular-nums">
            85s
          </span>
          <span className="font-mono text-[11px] text-text-mute2">{t("intel_to_midnight")}</span>
        </div>
        <p className="font-mono text-[9px] text-text-dim leading-relaxed">
          {t("intel_doomsday_body")}
        </p>
      </div>

      {/* Threat domain scores */}
      <div className="px-4 py-3">
        <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2 mb-2.5">
          {t("intel_domains_header")}
        </p>
        <div className="space-y-2">
          {DOMAINS.map((d) => {
            const col = DOMAIN_COLORS[d.label] ?? "#c9a84c";
            return (
              <div key={d.id}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[12px] leading-none">{d.icon}</span>
                  <span className="font-mono text-[9px] text-text-dim flex-1 truncate">{d.label}</span>
                  <span className="font-mono text-[8.5px] font-bold tabular-nums" style={{ color: col }}>{d.score}</span>
                  <span className="font-mono text-[9px]" style={{ color: col }}>{d.trend}</span>
                </div>
                <div className="h-1 rounded-full bg-void-3 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.score}%`, background: col, boxShadow: `0 0 6px ${col}55` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapse probability */}
      <div className="px-4 py-3">
        <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2 mb-2.5">
          {t("intel_collapse_header")}
        </p>
        <div className="space-y-2">
          {COLLAPSE_CLASSES.map((c) => {
            const col = c.sev === "EX" ? "#e84040"
              : c.sev === "CR" ? "#e84040"
              : c.sev === "HI" ? "#f0a500"
              : "#38bdf8";
            return (
              <div key={c.cls} className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold w-3.5 flex-shrink-0" style={{ color: col }}>
                  {c.cls}
                </span>
                <div className="flex-1 h-1 rounded-full bg-void-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.prob}%`, background: col }} />
                </div>
                <span className="font-mono text-[9px] font-bold tabular-nums w-7 text-right flex-shrink-0" style={{ color: col }}>
                  {c.prob}%
                </span>
                <span className="font-mono text-[8px] text-text-mute2 w-24 flex-shrink-0 truncate">{c.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority signals */}
      <div className="px-4 py-3">
        <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2 mb-2.5">
          {t("intel_signals_header")} {Math.min(SIGNALS.length, 7)}
        </p>
        <div className="space-y-2">
          {[...SIGNALS].sort((a, b) => b.score - a.score).slice(0, 7).map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded border
                               font-mono text-[7px] font-bold ${SEV_STYLES[s.tier] ?? SEV_STYLES.t2}`}>
                {s.tier.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] text-text-base leading-snug line-clamp-2">{s.sig}</p>
                <p className="font-mono text-[7.5px] text-text-mute2 mt-0.5">{s.domain}</p>
              </div>
              <span className="font-mono text-[9px] font-bold text-red-bright tabular-nums flex-shrink-0">
                {s.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Language picker */}
      <LanguagePicker />

    </div>
  );
}

// ── LANGUAGE PICKER ───────────────────────────────────────────────────────────

function LanguagePicker() {
  const { locale, setLocale, locales, meta, t } = useTranslation();

  return (
    <div className="px-4 py-4">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2">
          {t("language_label")}
        </p>
        <div className="flex-1 h-px bg-border-protocol/60" />
        <span className="font-mono text-[8px] text-text-mute2/50 uppercase tracking-[.1em]">
          {meta[locale].flag} {meta[locale].nativeName}
        </span>
      </div>

      {/* Language grid — 3 columns */}
      <div className="grid grid-cols-3 gap-1.5">
        {locales.map((loc) => {
          const active = loc === locale;
          return (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`flex items-center gap-1.5 px-2 py-2 rounded-lg
                          border font-mono text-[8.5px] transition-all duration-150 text-left
                          ${active
                            ? "border-gold-protocol/55 bg-gold-glow text-gold-bright"
                            : "border-border-protocol/60 text-text-mute2 hover:border-border-bright/40 hover:text-text-base hover:bg-white/[0.025]"
                          }`}
            >
              <span className="text-[11px] leading-none flex-shrink-0">{meta[loc].flag}</span>
              <span className="leading-none truncate">{meta[loc].nativeName}</span>
            </button>
          );
        })}
      </div>

      <p className="font-mono text-[7px] text-text-mute2/35 mt-3 text-center tracking-[.1em]">
        UI ONLY · Intelligence data remains in English
      </p>
    </div>
  );
}
