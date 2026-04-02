// app/(provisioner)/provisioner/checklist/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/provisioner/print-button";

export const metadata: Metadata = {
  title: "Critical Gear Checklist",
  description: "Printable Tevatha critical gear checklist — the minimum non-negotiable items for grid-down survival. Free.",
};

const CHECKLIST = [
  {
    category: "COMMUNICATIONS",
    items: [
      { name: "Garmin inReach Mini 2", note: "Two-way satellite SOS — no cell required", url: "https://www.garmin.com/en-US/p/775983" },
      { name: "Midland ER310 Emergency Radio", note: "Hand-crank NOAA weather — no power needed", url: "https://www.midlandusa.com/products/er310" },
    ],
  },
  {
    category: "MEDICAL",
    items: [
      { name: "NAR IFAK Trauma Kit", note: "1 per adult. SOF-T tourniquet + HyFin chest seal", url: "https://www.narescue.com/individual-first-aid-kit-ifak" },
      { name: "MyMedic MYFAK Advanced Kit", note: "1 per household — 150+ piece trauma + wound care", url: "https://mymedic.com/products/the-myfak-pro-kit" },
      { name: "QuikClot Combat Gauze ×3", note: "Controls life-threatening bleeding in 3–5 min", url: "https://www.zmedica.com/collections/quikclot" },
      { name: "Israeli Emergency Bandage ×10", note: "2 per go-bag minimum. One-handed application", url: "https://www.persysmedical.com/products/emergency-bandage" },
      { name: "Celox Hemostatic Granules ×5", note: "Clots in 30 sec. For wounds where packing not feasible", url: "https://www.celox.co.uk/products/celox-granules/" },
    ],
  },
  {
    category: "WATER",
    items: [
      { name: "Berkey Big Berkey", note: "Gravity filter. Removes viruses, bacteria, heavy metals. No power", url: "https://berkeyfilters.com/products/big-berkey" },
      { name: "WaterBOB Emergency Bladder ×2", note: "Fill at first sign of disruption. 100 gal = 50-day supply", url: "https://waterbob.com/" },
    ],
  },
  {
    category: "MOBILITY",
    items: [
      { name: "Wavian NATO Jerry Can ×4", note: "Always kept full. Rotate fuel quarterly with PRI-G", url: "https://wavian.us/" },
      { name: "NOCO Boost Plus GB40 ×2", note: "1 per vehicle. Charge quarterly", url: "https://no-co.com/gb40.html" },
      { name: "Garmin GPSMAP 67 Handheld", note: "Primary nav when cell infrastructure is down", url: "https://www.garmin.com/en-US/p/765156" },
    ],
  },
  {
    category: "SHELTER",
    items: [
      { name: "SOL Emergency Bivvy ×4", note: "1 per go-bag. Packs to fist-size. Works below freezing", url: "https://www.surviveoutdoorslonger.com/products/escape-bivvy" },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the most important emergency gear to buy first?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Medical is first — specifically a tourniquet and trauma kit. The NAR IFAK with SOF-T tourniquet and a QuikClot Combat Gauze can stop life-threatening bleeding in 3–5 minutes. After medical, prioritize a two-way satellite communicator like the Garmin inReach Mini 2, which works with no cell infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "What emergency communication gear works without cell service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Garmin inReach Mini 2 provides two-way satellite messaging and SOS from anywhere on Earth with no cell network required. The Midland ER310 is a hand-crank NOAA weather radio that needs no power. For local coordination, the Baofeng UV-5R is a low-cost ham radio that works on public safety frequencies."
      }
    },
    {
      "@type": "Question",
      "name": "How do I store emergency water long term?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The WaterBOB is a 100-gallon bathtub bladder — fill it at the first sign of disruption for a 50-day supply for one person. For ongoing filtration, the Berkey Big Berkey gravity filter removes viruses, bacteria, and heavy metals with no power or pressure required. Keep both on hand."
      }
    },
    {
      "@type": "Question",
      "name": "What backup power should I have for grid-down emergencies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A portable power station like the Jackery 1000 Plus or EcoFlow Delta Pro can run critical electronics, CPAP machines, and small appliances for days. Pair with a 400W solar panel (Renogy) for indefinite grid-independent power. Always keep a NOCO GB40 jump starter in each vehicle."
      }
    },
    {
      "@type": "Question",
      "name": "How much fuel should I stockpile for an emergency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Keep 4 Wavian NATO Jerry Cans (5 gallons each = 20 gallons total) filled at all times. Rotate fuel quarterly using PRI-G fuel stabilizer to maintain potency. This provides 300–400 miles of evacuation range on top of a full tank. Store in a cool, ventilated area away from ignition sources."
      }
    },
  ]
};

export default function ChecklistPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Print hide */}
      <div className="print:hidden mb-6">
        <Link
          href="/provisioner"
          className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors"
        >
          ← Back to Provisioner
        </Link>
      </div>

      {/* Header */}
      <div className="relative rounded-xl border border-gold-protocol/30 bg-void-1 p-6 mb-6 overflow-hidden print:border-black print:bg-white print:text-black">
        <div
          className="absolute top-0 left-0 right-0 h-px print:hidden"
          style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
        />
        <p className="font-mono text-[9px] text-gold-protocol tracking-[.22em] uppercase mb-2 print:text-black">
          Tevatha · Critical Gear Checklist
        </p>
        <h1 className="font-syne font-extrabold text-[26px] text-text-base mb-2 print:text-black">
          Non-Negotiable Items
        </h1>
        <p className="font-mono text-[11px] text-text-dim leading-relaxed print:text-black">
          These are the minimum items needed to sustain life and communication in a grid-down event.
          Check off each item as you acquire it. Links go directly to the manufacturer.
        </p>
        <PrintButton />
      </div>

      {/* Checklist */}
      <div className="space-y-6">
        {CHECKLIST.map((section) => (
          <div key={section.category}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-mono text-[10px] text-text-mute2 tracking-[.18em] uppercase print:text-black">
                {section.category}
              </h2>
              <div className="flex-1 h-px bg-border-protocol print:bg-gray-300" />
            </div>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start gap-3 bg-void-1 border border-border-protocol
                             rounded-xl px-4 py-3 print:bg-white print:border-gray-200"
                >
                  {/* Checkbox */}
                  <div className="w-4 h-4 border-2 border-gold-protocol/50 rounded flex-shrink-0 mt-0.5 print:border-black" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-syne font-bold text-[13px] text-text-base
                                 hover:text-gold-protocol transition-colors print:text-black print:no-underline"
                    >
                      {item.name} ↗
                    </a>
                    <p className="font-mono text-[10px] text-text-mute2 mt-0.5 print:text-gray-600">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 py-4 border-t border-border-protocol print:border-gray-300">
        <p className="font-mono text-[9px] text-text-mute2 print:text-gray-500">
          Tevatha · tevatha.com · Free nonprofit resource · No affiliation with any listed brand
        </p>
      </div>

    </div>
  );
}
