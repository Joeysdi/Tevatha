// app/(provisioner)/provisioner/methodology/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tevatha Scoring Methodology",
  description: "How Tevatha grades emergency gear from A to D. Five objective dimensions: durability, grid independence, field repairability, value density, and supply chain. Fully transparent methodology.",
  alternates: { canonical: "/provisioner/methodology" },
  openGraph: {
    title: "Tevatha Gear Scoring Methodology — How We Grade A to D",
    description: "Five-dimension objective scoring for emergency preparedness gear. Grade A = 90–100. No affiliate relationships. No sponsored grades.",
  },
};

const methodologySchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tevatha Gear Scoring Methodology",
  "description": "How Tevatha grades emergency preparedness gear using five objective dimensions: durability, grid independence, field repairability, value density, and supply chain resilience.",
  "author": { "@type": "Organization", "name": "Tevatha", "url": "https://tevatha.com" },
  "publisher": { "@type": "Organization", "name": "Tevatha", "url": "https://tevatha.com" },
  "url": "https://tevatha.com/provisioner/methodology",
  "mainEntityOfPage": "https://tevatha.com/provisioner/methodology",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does Tevatha grade emergency gear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tevatha grades gear on a composite score from 0–100 across five dimensions: durability (physical resilience and lifespan), grid independence (functions without power infrastructure), field repairability (fixable without specialized tools), value density (utility per dollar), and supply chain resilience (ease of sourcing and replacement). A = 90–100, B = 80–89, C = 70–79, D = below 70."
      }
    },
    {
      "@type": "Question",
      "name": "What does a Tevatha Grade A mean?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Grade A means a composite score of 90–100 across all five scoring dimensions. Grade A items are non-negotiable — they represent the highest utility in grid-down or emergency conditions. Items marked CRITICAL FLAG are Grade A and should be acquired before any other preparation."
      }
    },
    {
      "@type": "Question",
      "name": "Does Tevatha have affiliate relationships with gear brands?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Tevatha is a nonprofit with no affiliate relationships, no sponsored placements, and no revenue from gear links. All links go directly to manufacturer or brand websites. Grades are assigned purely on objective criteria — a low-scoring item will receive a C or D regardless of brand."
      }
    },
    {
      "@type": "Question",
      "name": "How is the Safety Index scored for real estate locations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Tevatha Safety Index scores locations on four dimensions: Nuclear Distance (proximity away from likely strike zones, based on NATO target analysis and FEMA nuclear planning zones), Disaster Risk (inverse natural disaster exposure from FEMA, EM-DAT, and national emergency management data), Population Density (inverse — rural and remote scores higher), and Political Stability (composite of Global Peace Index rank and Freedom House index)."
      }
    },
    {
      "@type": "Question",
      "name": "What data sources does Tevatha use for threat scoring?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tevatha's Watchtower threat scores draw from: Bulletin of Atomic Scientists (Doomsday Clock), Council on Foreign Relations (Conflict Tracker, 2026 Preventive Priorities Survey), CISA (critical infrastructure advisories), WHO (disease surveillance), FAO (food security), World Food Programme, IMF and CBO (economic data), Global Peace Index, and Freedom House."
      }
    },
  ]
};

const DIMENSIONS = [
  {
    id: "durability",
    label: "Durability",
    color: "#1ae8a0",
    score_anchor: "100 = Military-spec. Survives submersion, impact, extreme heat/cold. Expected lifespan 10+ years with zero maintenance.",
    zero_anchor: "0 = Consumer-grade. Fails under first-use field stress. Planned obsolescence within 1–2 years.",
    examples: [
      { item: "NAR IFAK Trauma Kit", score: 100, note: "Military TCCC spec. No moving parts. Sealed storage." },
      { item: "Wavian NATO Jerry Can", score: 100, note: "UN-certified steel. Won't crack, leak, or explode." },
      { item: "WaterBOB Bladder", score: 72, note: "Single-use design. Vulnerable to puncture." },
    ],
  },
  {
    id: "grid_independence",
    label: "Grid Independence",
    color: "#00d4ff",
    score_anchor: "100 = Zero reliance on grid power, cell networks, or supply chains. Fully self-contained.",
    zero_anchor: "0 = Non-functional without grid power or continuous internet/cell connectivity.",
    examples: [
      { item: "Garmin inReach Mini 2", score: 100, note: "Satellite-only. Works globally with no infrastructure." },
      { item: "Wavian Jerry Can", score: 100, note: "Passive storage. No power dependency." },
      { item: "Reolink RLC-810A", score: 84, note: "Requires PoE power. Can run on local solar." },
    ],
  },
  {
    id: "field_repairability",
    label: "Field Repairability",
    color: "#c9a84c",
    score_anchor: "100 = Any component repairable or replaceable with hand tools, common parts, and basic mechanical knowledge.",
    zero_anchor: "0 = Sealed unit requiring factory service or proprietary software to repair. Unrepairable in the field.",
    examples: [
      { item: "Baofeng UV-5R", score: 80, note: "Battery and antenna user-replaceable. Common parts." },
      { item: "EcoFlow DELTA Pro", score: 88, note: "Modular battery design. Some field-serviceable components." },
      { item: "Faraday Bag XL", score: 48, note: "Shielding layer cannot be repaired once torn." },
    ],
  },
  {
    id: "value_density",
    label: "Value Density",
    color: "#f0a500",
    score_anchor: "100 = Maximum life-saving utility per dollar. Cost is negligible relative to the scenario it prevents.",
    zero_anchor: "0 = High cost, marginal utility uplift. Duplicate capability already covered by higher-grade item.",
    examples: [
      { item: "QuikClot Combat Gauze", score: 99, note: "$25/unit. Stops life-threatening bleeding. No substitute." },
      { item: "SOL Emergency Bivvy", score: 98, note: "$20. Prevents hypothermia. Packs to fist-size." },
      { item: "Potable Aqua Tabs", score: 78, note: "Backup to Berkey. Limited use case at scale." },
    ],
  },
  {
    id: "supply_chain",
    label: "Supply Chain",
    color: "#e84040",
    score_anchor: "100 = Available globally. Multiple manufacturers. No single point of failure. Stocked at retail.",
    zero_anchor: "0 = Single manufacturer. Import-dependent. Frequently out of stock. No substitute available.",
    examples: [
      { item: "Garmin inReach Mini 2", score: 96, note: "Sold globally at REI, Amazon, Garmin direct." },
      { item: "NAR IFAK", score: 98, note: "Military supplier with civilian distribution. Multiple equivalents." },
      { item: "Titan Survival Tarp", score: 68, note: "Fewer retail stocking points. Niche supplier." },
    ],
  },
];

const GRADE_THRESHOLDS = [
  { grade: "A", range: "90–100", color: "#1ae8a0", meaning: "Non-negotiable. Acquire before anything else." },
  { grade: "B", range: "80–89",  color: "#c9a84c", meaning: "High value. Acquire after all Grade A items are covered." },
  { grade: "C", range: "70–79",  color: "#f0a500", meaning: "Situational. Adequate if nothing better is available in category." },
  { grade: "D", range: "<70",    color: "#e84040", meaning: "Not recommended. Better options exist in every case." },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-text-mute2">
        <Link href="/provisioner" className="hover:text-gold-protocol transition-colors">Provisioner</Link>
        <span>/</span>
        <span className="text-text-dim">Methodology</span>
      </nav>

      {/* Hero */}
      <header className="relative rounded-xl border border-gold-protocol/30 bg-void-1 p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }} />
        <p className="font-mono text-[9px] text-gold-protocol tracking-[.22em] uppercase mb-2">
          Tevatha · Scoring Methodology
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(22px,5vw,30px)] text-text-base mb-3 leading-tight">
          How We Grade Gear
        </h1>
        <p className="font-mono text-[11.5px] text-text-dim leading-relaxed">
          Every item in the Provisioner catalog is scored across five objective dimensions.
          No sponsored placements. No affiliate relationships. No brand exceptions.
          A low-scoring item receives a C or D regardless of brand recognition.
        </p>
      </header>

      {/* Grade thresholds */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">Grade Thresholds</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GRADE_THRESHOLDS.map((g) => (
            <div key={g.grade}
                 className="bg-void-1 border border-border-protocol rounded-xl p-4 text-center"
                 style={{ borderTopColor: g.color, borderTopWidth: "2px" }}>
              <div className="font-syne font-extrabold text-[32px] leading-none mb-1"
                   style={{ color: g.color }}>
                {g.grade}
              </div>
              <div className="font-mono text-[10px] text-text-mute2 mb-2">{g.range}</div>
              <p className="font-mono text-[9.5px] text-text-dim leading-relaxed">{g.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Five dimensions */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">The Five Dimensions</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
        <div className="space-y-5">
          {DIMENSIONS.map((d, i) => (
            <div key={d.id} className="bg-void-1 border border-border-protocol rounded-xl p-5 overflow-hidden"
                 style={{ borderLeftColor: `${d.color}60`, borderLeftWidth: "3px" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] text-text-mute2 opacity-50">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-syne font-bold text-[16px]" style={{ color: d.color }}>{d.label}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                <div className="bg-void-2 rounded-lg px-3 py-2">
                  <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.1em] uppercase mb-1">100 →</p>
                  <p className="font-mono text-[10.5px] text-text-dim leading-relaxed">{d.score_anchor}</p>
                </div>
                <div className="bg-void-2 rounded-lg px-3 py-2">
                  <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.1em] uppercase mb-1">0 →</p>
                  <p className="font-mono text-[10.5px] text-text-dim leading-relaxed">{d.zero_anchor}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.1em] uppercase mb-2">Examples</p>
                {d.examples.map((ex) => (
                  <div key={ex.item} className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold tabular-nums w-6 text-right flex-shrink-0"
                          style={{ color: ex.score >= 90 ? "#1ae8a0" : ex.score >= 80 ? "#c9a84c" : "#f0a500" }}>
                      {ex.score}
                    </span>
                    <span className="font-mono text-[10.5px] text-text-base flex-shrink-0">{ex.item}</span>
                    <span className="font-mono text-[10px] text-text-mute2 truncate">{ex.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Index */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">Safety Index — Real Estate</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
        <div className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
          <p className="font-mono text-[11px] text-text-dim leading-relaxed">
            Real estate listings are scored on a separate four-dimension Safety Index,
            measuring how well a location functions as an Ark node in a high-severity scenario.
          </p>
          {[
            { label: "Nuclear Distance", desc: "Proximity away from likely nuclear strike zones based on NATO target analysis and FEMA nuclear planning zones. 100 = no known strategic value, no nearby military installation, southern hemisphere preferred." },
            { label: "Disaster Risk", desc: "Inverse natural disaster exposure. Sources: FEMA Hazus, EM-DAT global disaster database, national emergency management agencies. 100 = minimal seismic, flood, wildfire, and extreme weather risk." },
            { label: "Population Density", desc: "Inverse population density score. Lower density = higher score. 100 = fewer than 2 people per km². Extreme rural isolation scores maximum. Urban proximity lowers score." },
            { label: "Political Stability", desc: "Composite of Global Peace Index (GPI) rank and Freedom House freedom index. 100 = top 3 GPI + full democracy rating. Accounts for civil conflict risk, rule of law, and property rights security." },
          ].map((d) => (
            <div key={d.label} className="border-t border-border-protocol pt-3 first:border-0 first:pt-0">
              <p className="font-mono text-[11px] font-bold text-text-base mb-1">{d.label}</p>
              <p className="font-mono text-[10.5px] text-text-dim leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrity */}
      <section className="rounded-xl border border-border-protocol bg-void-1 p-5">
        <p className="font-mono text-[9px] text-gold-protocol tracking-[.18em] uppercase mb-2">Editorial Independence</p>
        <p className="font-mono text-[11px] text-text-dim leading-relaxed">
          Tevatha is a nonprofit with zero revenue from any product listing, affiliate link,
          or brand relationship. All external links go directly to manufacturer or retailer sites.
          Scores are assigned by Tevatha analysts and are not negotiable with brands.
          A Grade D item will be listed as Grade D. Period.
        </p>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link href="/provisioner/gear"
              className="font-mono font-bold text-[11px] tracking-[.06em] px-5 py-2.5 rounded-lg
                         bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5
                         hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all duration-200">
          View Gear Catalog →
        </Link>
        <Link href="/provisioner/checklist"
              className="font-mono font-bold text-[11px] tracking-[.06em] px-5 py-2.5 rounded-lg
                         border border-border-protocol text-text-mute2
                         hover:border-gold-protocol/40 hover:text-text-base transition-all duration-200">
          Critical Checklist →
        </Link>
      </div>
    </div>
  );
}
