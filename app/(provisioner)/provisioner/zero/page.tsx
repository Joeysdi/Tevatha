// app/(provisioner)/provisioner/zero/page.tsx — $0 free preparation guide
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Start Here — Free Preparation Guide",
  description: "Can't afford gear yet? Start here. A free step-by-step preparation guide that costs nothing but time. Water, food, communication, community — before you buy anything.",
};

const STEPS = [
  {
    number: "01",
    title: "Water — 72 Hours Free",
    color: "#00d4ff",
    items: [
      "Fill every large container you own from the tap right now — pots, jugs, clean trash cans.",
      "Fill your bathtub if you have any warning (WaterBOB is optional — a clean tub liner works).",
      "Target: 1 gallon per person per day. A family of 4 needs 12 gallons for 72 hours.",
      "Bleach works: 8 drops of unscented household bleach per gallon purifies tap water for storage.",
      "Know where your nearest creek, river, or lake is. Boiling kills bacteria and viruses.",
    ],
  },
  {
    number: "02",
    title: "Food — What's Already in Your Home",
    color: "#c9a84c",
    items: [
      "Do a pantry audit today. Write down what you have and how long it lasts.",
      "Rotate, don't hoard — buy an extra can of what you already eat each grocery trip.",
      "Target: 3-day supply minimum. 2 weeks is the real safety margin.",
      "Rice, beans, oats, canned goods — cheapest calories per dollar, long shelf life.",
      "A manual can opener costs $3. Add it to your cart today.",
    ],
  },
  {
    number: "03",
    title: "Communication — Before Phones Go Down",
    color: "#1ae8a0",
    items: [
      "Write down 5 important phone numbers on paper. You will not remember them without your phone.",
      "Pick a meeting point within walking distance of your home. Everyone in your household must know it.",
      "Pick a second meeting point across town in case the first is unreachable.",
      "Designate one out-of-state contact everyone calls to report status — local lines jam, long-distance often stays open.",
      "A battery-powered or hand-crank NOAA weather radio costs $20–$40 at any hardware store.",
    ],
  },
  {
    number: "04",
    title: "Documents — 30 Minutes of Work",
    color: "#f0a500",
    items: [
      "Take photos of every important document: passport, ID, insurance cards, prescriptions, deed, birth certificates.",
      "Upload to a cloud service (Google Drive, iCloud) so you can access them from any device.",
      "Put physical originals in a single waterproof zip-lock bag stored in one known location.",
      "Write down account numbers, insurance policy numbers, and contact numbers on paper.",
      "If you have medications, know the generic names — brand availability collapses in disruptions.",
    ],
  },
  {
    number: "05",
    title: "72-Hour Bag — Under $50 at Hardware Store",
    color: "#e84040",
    items: [
      "A sturdy backpack you already own is fine. Don't buy a new one.",
      "Add: 3 days of food (granola bars, jerky, nuts), water bottles, first aid kit ($10 at any pharmacy).",
      "Flashlight + extra batteries. A $5 hand-crank flashlight is better than nothing.",
      "Change of clothes, rain poncho ($2), basic medications, phone charger.",
      "Cash in small bills — ATMs and card readers fail in power outages.",
    ],
  },
  {
    number: "06",
    title: "Community — Your Highest Leverage Asset",
    color: "#c9a84c",
    items: [
      "Introduce yourself to your immediate neighbors if you haven't. This is not optional.",
      "Know which neighbors have skills: medical training, mechanical ability, agriculture knowledge.",
      "Know which neighbors are elderly or disabled and will need help evacuating.",
      "A neighborhood with 10 prepared households is exponentially more resilient than 10 isolated households.",
      "CERT (Community Emergency Response Team) training is free in most US cities — takes one weekend.",
    ],
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Prepare for Emergencies with No Money",
  "description": "A free step-by-step emergency preparedness guide that costs nothing but time. Water, food, communication, documents, 72-hour bag, and community — before you buy any gear.",
  "totalTime": "PT4H",
  "estimatedCost": { "@type": "MonetaryAmount", "currency": "USD", "value": "0" },
  "step": STEPS.map((s, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": s.title,
    "text": s.items.join(" "),
  })),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I prepare for an emergency with no money?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start with water — fill every container you own from the tap. Target 1 gallon per person per day for 72 hours. Then do a pantry audit, write down 5 key phone numbers on paper, pick two meeting points, and photograph all important documents. These steps cost nothing."
      }
    },
    {
      "@type": "Question",
      "name": "How much water do I need for emergency preparedness?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FEMA recommends 1 gallon per person per day. A family of 4 needs 12 gallons for 72 hours and 56 gallons for 2 weeks. Fill your bathtub at the first sign of disruption — a standard tub holds 80–100 gallons. Add 8 drops of unscented household bleach per gallon to purify stored tap water."
      }
    },
    {
      "@type": "Question",
      "name": "What should go in a 72-hour emergency bag?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use a backpack you already own. Pack 3 days of non-perishable food (granola bars, jerky, nuts), water bottles, a basic first aid kit, flashlight with extra batteries, change of clothes, rain poncho, phone charger, medications, and cash in small bills. Total cost at a hardware store: under $50."
      }
    },
    {
      "@type": "Question",
      "name": "What documents should I have ready for an emergency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Photograph your passport, driver's license, insurance cards, prescriptions, property deed, and birth certificates. Upload them to Google Drive or iCloud. Store physical originals in a single waterproof zip-lock bag in one known location. Write down account numbers and insurance policy numbers on paper."
      }
    },
    {
      "@type": "Question",
      "name": "Why is community important for emergency preparedness?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A neighborhood with 10 prepared households is exponentially more resilient than 10 isolated individuals. Know your neighbors' skills (medical, mechanical, agricultural) and who needs evacuation help. Designate one out-of-state contact for everyone to call — local lines jam in disasters, long-distance often stays open."
      }
    },
  ]
};

export default function ZeroPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Link
        href="/provisioner"
        className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors block"
      >
        ← Back to Provisioner
      </Link>

      {/* Hero */}
      <header className="relative rounded-xl border border-red-protocol/30 bg-void-1 p-6 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,#e84040,#c9a84c,transparent)" }}
        />
        <p className="font-mono text-[9px] text-red-bright tracking-[.22em] uppercase mb-2">
          Start Here · $0 Preparation
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(22px,5vw,30px)] text-text-base mb-3 leading-tight">
          You Don&apos;t Need Money<br />
          <span className="text-gold-protocol">to Start Preparing.</span>
        </h1>
        <p className="text-text-dim text-[13px] leading-relaxed">
          Most preparation is free. It&apos;s knowledge, plans, and actions — not gear.
          Gear multiplies a prepared person. It does nothing for an unprepared one.
          Do this first. Buy gear second.
        </p>
      </header>

      {/* Steps */}
      {STEPS.map((step) => (
        <div
          key={step.number}
          className="relative rounded-xl border border-border-protocol bg-void-1 p-5 overflow-hidden"
          style={{ borderLeftColor: `${step.color}40`, borderLeftWidth: "3px" }}
        >
          <div className="flex items-start gap-4 mb-4">
            <span
              className="font-mono font-bold text-[28px] leading-none flex-shrink-0 opacity-40"
              style={{ color: step.color }}
            >
              {step.number}
            </span>
            <h2
              className="font-syne font-bold text-[17px] leading-tight mt-1"
              style={{ color: step.color }}
            >
              {step.title}
            </h2>
          </div>
          <ul className="space-y-2">
            {step.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="font-mono text-[10px] flex-shrink-0 mt-0.5" style={{ color: step.color }}>→</span>
                <p className="font-mono text-[11.5px] text-text-dim leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Next step CTA */}
      <div className="rounded-xl border border-gold-protocol/30 bg-void-1 p-6">
        <p className="font-mono text-[9px] text-gold-protocol tracking-[.18em] uppercase mb-2">
          Done With the Free Steps?
        </p>
        <h3 className="font-syne font-bold text-[18px] text-text-base mb-3">
          Now look at the gear.
        </h3>
        <p className="text-text-dim text-[12px] leading-relaxed mb-4">
          The Provisioner catalog is curated and graded. Grade A critical items are the only ones worth buying first.
          Start with medical — it saves lives before anything else does.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/provisioner/checklist"
            className="font-mono font-bold text-[11px] tracking-[.06em] px-5 py-2.5 rounded-lg
                       bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5
                       hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all duration-200"
          >
            Critical Gear Checklist →
          </Link>
          <Link
            href="/provisioner/gear"
            className="font-mono font-bold text-[11px] tracking-[.06em] px-5 py-2.5 rounded-lg
                       border border-border-protocol text-text-mute2
                       hover:border-gold-protocol/40 hover:text-text-base transition-all duration-200"
          >
            Full Catalog →
          </Link>
        </div>
      </div>

    </div>
  );
}
