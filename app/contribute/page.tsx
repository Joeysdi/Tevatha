"use client";
// app/contribute/page.tsx  →  URL: /contribute

import { useState } from "react";
import Link from "next/link";

type Track = "dev" | "listing";

const DEV_SKILLS = [
  "React / Next.js", "TypeScript", "Tailwind CSS", "Supabase / PostgreSQL",
  "Solana / Web3", "Node.js / API routes", "UI / Design", "Security research",
  "Emergency preparedness content", "Other",
];

const LISTING_CATEGORIES = [
  { value: "communications", label: "Communications" },
  { value: "medical",        label: "Medical" },
  { value: "energy",         label: "Energy" },
  { value: "mobility",       label: "Mobility" },
  { value: "water",          label: "Water" },
  { value: "security",       label: "Security" },
  { value: "shelter",        label: "Shelter" },
  { value: "real_estate",    label: "Real Estate / Land" },
];

export default function ContributePage() {
  const [track, setTrack]       = useState<Track>("dev");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Dev form state
  const [devName,   setDevName]   = useState("");
  const [devEmail,  setDevEmail]  = useState("");
  const [devGithub, setDevGithub] = useState("");
  const [devSkills, setDevSkills] = useState<string[]>([]);
  const [devNote,   setDevNote]   = useState("");

  // Listing form state
  const [lstName,     setLstName]     = useState("");
  const [lstEmail,    setLstEmail]    = useState("");
  const [lstItem,     setLstItem]     = useState("");
  const [lstBrand,    setLstBrand]    = useState("");
  const [lstUrl,      setLstUrl]      = useState("");
  const [lstCategory, setLstCategory] = useState("");
  const [lstNote,     setLstNote]     = useState("");

  function toggleSkill(skill: string) {
    setDevSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = track === "dev"
      ? { track, name: devName, email: devEmail, github: devGithub, skills: devSkills, note: devNote }
      : { track, name: lstName, email: lstEmail, item: lstItem, brand: lstBrand, url: lstUrl, category: lstCategory, note: lstNote };

    const res = await fetch("/api/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Try again or email us directly.");
    }
  }

  const inputClass = `w-full bg-void-2 border border-border-protocol rounded-lg px-3 py-2.5
    font-mono text-[12px] text-text-base placeholder:text-text-mute2/50
    focus:outline-none focus:border-gold-protocol/60 transition-colors`;

  const labelClass = "block font-mono text-[9.5px] text-text-mute2 tracking-[.12em] uppercase mb-1.5";

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-12 text-center space-y-4">
        <div className="text-[48px]">✓</div>
        <h2 className="font-syne font-extrabold text-[22px] text-text-base">
          {track === "dev" ? "Application received." : "Listing submitted."}
        </h2>
        <p className="font-mono text-[11px] text-text-dim leading-relaxed">
          {track === "dev"
            ? "We'll review your application and reach out via email if there's a fit. Thank you for wanting to help."
            : "We'll review the listing and add it to the catalog with a link to your site. Thank you for contributing."}
        </p>
        <Link href="/provisioner"
              className="inline-block mt-4 font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors">
          ← Back to Provisioner
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-text-mute2">
        <Link href="/provisioner" className="hover:text-gold-protocol transition-colors">Provisioner</Link>
        <span>/</span>
        <span className="text-text-dim">Contribute</span>
      </nav>

      {/* Hero */}
      <header className="relative rounded-xl border border-gold-protocol/30 bg-void-1 p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }} />
        <p className="font-mono text-[9px] text-gold-protocol tracking-[.22em] uppercase mb-2">
          Tevatha · Open Contribution
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(20px,5vw,28px)] text-text-base mb-2 leading-tight">
          Help Build This.<br />
          <span className="text-gold-protocol">It&apos;s Nonprofit.</span>
        </h1>
        <p className="font-mono text-[11px] text-text-dim leading-relaxed">
          Tevatha is free and always will be. We&apos;re looking for developers who
          want to build something that matters, and suppliers / landowners who want
          their gear or property listed — linked directly to your own site.
        </p>
      </header>

      {/* Track toggle */}
      <div className="grid grid-cols-2 gap-2">
        {([["dev", "Join Dev Team"], ["listing", "Submit a Listing"]] as [Track, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTrack(t)}
            className={`py-3 rounded-xl font-mono text-[11px] font-bold tracking-[.06em] border transition-all duration-200
              ${track === t
                ? "bg-gold-protocol text-void-0 border-gold-protocol"
                : "bg-void-1 border-border-protocol text-text-mute2 hover:border-gold-protocol/40 hover:text-text-base"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Forms */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {track === "dev" ? (
          <>
            <div className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase">Developer Application</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input required value={devName} onChange={e => setDevName(e.target.value)}
                    placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input required type="email" value={devEmail} onChange={e => setDevEmail(e.target.value)}
                    placeholder="you@example.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>GitHub Profile URL</label>
                <input value={devGithub} onChange={e => setDevGithub(e.target.value)}
                  placeholder="https://github.com/yourhandle" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Skills — select all that apply</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DEV_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`font-mono text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-150
                        ${devSkills.includes(skill)
                          ? "bg-gold-protocol/20 border-gold-protocol/60 text-gold-bright"
                          : "bg-void-2 border-border-protocol text-text-mute2 hover:border-gold-protocol/30"}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Why do you want to contribute?</label>
                <textarea required value={devNote} onChange={e => setDevNote(e.target.value)}
                  rows={3} placeholder="Tell us briefly what you'd like to work on..."
                  className={`${inputClass} resize-none`} />
              </div>
            </div>

            <div className="bg-void-1 border border-border-protocol rounded-xl px-4 py-3">
              <p className="font-mono text-[10px] text-text-dim leading-relaxed">
                <span className="text-gold-protocol">→ </span>
                This is volunteer / open-source contribution. Tevatha is a nonprofit with no revenue.
                Work is done in public on GitHub. We will review and respond via email.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase">Listing Submission</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Your Name</label>
                  <input required value={lstName} onChange={e => setLstName(e.target.value)}
                    placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input required type="email" value={lstEmail} onChange={e => setLstEmail(e.target.value)}
                    placeholder="you@example.com" className={inputClass} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Item / Property Name</label>
                  <input required value={lstItem} onChange={e => setLstItem(e.target.value)}
                    placeholder="e.g. Garmin inReach Mini 2" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Brand / Company</label>
                  <input required value={lstBrand} onChange={e => setLstBrand(e.target.value)}
                    placeholder="e.g. Garmin" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Your Website / Listing URL</label>
                <input required type="url" value={lstUrl} onChange={e => setLstUrl(e.target.value)}
                  placeholder="https://yoursite.com/product-page" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select required value={lstCategory} onChange={e => setLstCategory(e.target.value)}
                  className={inputClass}>
                  <option value="" disabled>Select a category…</option>
                  {LISTING_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Notes — why does this belong in the catalog?</label>
                <textarea value={lstNote} onChange={e => setLstNote(e.target.value)}
                  rows={3} placeholder="Specs, certifications, why it scores high on durability / grid independence…"
                  className={`${inputClass} resize-none`} />
              </div>
            </div>

            <div className="bg-void-1 border border-border-protocol rounded-xl px-4 py-3">
              <p className="font-mono text-[10px] text-text-dim leading-relaxed">
                <span className="text-gold-protocol">→ </span>
                Listings are free. We grade independently — no paid placement, no guaranteed grade.
                If listed, your item links directly to your URL. We never sell or resell anything.
              </p>
            </div>
          </>
        )}

        {error && (
          <p className="font-mono text-[10px] text-red-bright">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full font-mono font-bold text-[12px] tracking-[.06em] py-3 rounded-xl
                     bg-gold-protocol text-void-0 hover:bg-gold-bright hover:-translate-y-0.5
                     hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)] transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {loading ? "Submitting…" : track === "dev" ? "Submit Application →" : "Submit Listing →"}
        </button>
      </form>

    </div>
  );
}
