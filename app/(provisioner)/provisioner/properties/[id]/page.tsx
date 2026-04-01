// app/(provisioner)/provisioner/properties/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams }         from "next/navigation";
import Link                  from "next/link";
import { TevathaBadge }      from "@/components/properties/TevathaBadge";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import type { Property }     from "@/lib/real-estate/types";

function StatCell({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="bg-void-2 border border-border-protocol rounded-lg p-3">
      <div className="font-mono text-[8.5px] text-text-mute2 uppercase tracking-[.1em] mb-1">{label}</div>
      <div className="font-mono font-bold text-[13px] text-text-base">{value}</div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm]         = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [formError, setFormError]   = useState("");
  const imgRef = useRef<number>(0);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setProperty(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/properties/inquire", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, propertyId: property?.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Request failed");
      }
      setSubmitted(true);
    } catch (err) {
      setFormError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="font-mono text-[11px] text-text-mute2 animate-pulse">Loading…</div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="text-center py-24">
        <p className="font-syne font-bold text-[20px] text-text-base mb-2">Property not found</p>
        <Link href="/provisioner/properties" className="font-mono text-[11px] text-gold-protocol hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const p           = property;
  const isTevatha   = p.tevatha_certified;
  const images      = p.images ?? [];
  const activeImage = images[imgRef.current] ?? images[0];

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/provisioner/properties"
        className="inline-flex items-center gap-1.5 font-mono text-[10px]
                   text-text-mute2 hover:text-gold-protocol transition-colors mb-5"
      >
        ← Back to listings
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <FadeUp>
        <div
          className="relative rounded-xl border p-5 sm:p-7 mb-6 overflow-hidden"
          style={{
            background: isTevatha
              ? "linear-gradient(135deg,rgba(201,168,76,0.09),rgba(11,13,24,1))"
              : "rgba(8,12,16,0.8)",
            borderColor: isTevatha ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.07)",
          }}
        >
          {isTevatha && (
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
            />
          )}

          {isTevatha && <div className="mb-3"><TevathaBadge /></div>}

          <h1 className="font-syne font-extrabold text-[clamp(20px,4vw,28px)] text-text-base leading-snug mb-2">
            {p.title}
          </h1>
          <p className="font-mono text-[11px] text-text-dim mb-4">
            {[p.address, p.city, p.state, p.country].filter(Boolean).join(", ")}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="font-mono font-bold text-[24px] text-gold-protocol tabular-nums">
              {p.price_display ?? (p.price_usd ? `$${(p.price_usd / 100).toLocaleString()}` : "Price on request")}
            </div>
            {p.acres && (
              <span className="font-mono text-[11px] text-text-dim">{p.acres.toFixed(1)} acres</span>
            )}
            {p.property_type && (
              <span className="px-2.5 py-0.5 rounded-full bg-glass-DEFAULT border border-border-protocol font-mono text-[10px] text-text-dim capitalize">
                {p.property_type}
              </span>
            )}
          </div>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          {images.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-border-protocol">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={p.title}
                className="w-full h-64 object-cover"
              />
              {images.length > 1 && (
                <div className="flex gap-2 p-3 bg-void-1 overflow-x-auto">
                  {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      onClick={() => { imgRef.current = i; }}
                      className="w-14 h-10 object-cover rounded cursor-pointer border border-border-protocol hover:border-gold-protocol/50 transition-colors flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div className="bg-void-1 border border-border-protocol rounded-xl p-5">
              <h2 className="font-syne font-bold text-[15px] text-text-base mb-3">About this property</h2>
              <p className="text-text-dim text-[13px] leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Highlights */}
          {p.highlights && p.highlights.length > 0 && (
            <div className="bg-void-1 border border-border-protocol rounded-xl p-5">
              <h2 className="font-syne font-bold text-[15px] text-text-base mb-3">Highlights</h2>
              <ul className="space-y-1.5">
                {p.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-[11px] text-text-dim">
                    <span className="text-gold-protocol mt-0.5">→</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Standard specs */}
          <div className="bg-void-1 border border-border-protocol rounded-xl p-5">
            <h2 className="font-syne font-bold text-[15px] text-text-base mb-4">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCell label="Bedrooms"   value={p.bedrooms} />
              <StatCell label="Bathrooms"  value={p.bathrooms} />
              <StatCell label="Sqft"       value={p.sqft?.toLocaleString()} />
              <StatCell label="Year Built" value={p.year_built} />
              <StatCell label="Acres"      value={p.acres?.toFixed(2)} />
              <StatCell label="Country"    value={p.country} />
            </div>
          </div>

          {/* Resilience stats — Tevatha only */}
          {isTevatha && (
            <div
              className="border rounded-xl p-5"
              style={{
                borderColor: "rgba(201,168,76,0.25)",
                background: "linear-gradient(135deg,rgba(201,168,76,0.04),transparent)",
              }}
            >
              <h2 className="font-syne font-bold text-[15px] text-gold-protocol mb-4">
                ⚡ Resilience Profile
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCell label="Off-Grid Capacity"    value={p.off_grid_capacity?.replace(/-/g, " ")} />
                <StatCell label="Autonomy (days)"      value={p.resource_autonomy_days} />
                <StatCell label="Elevation (ft)"       value={p.elevation_ft?.toLocaleString()} />
                <StatCell label="Distance to City (mi)" value={p.distance_to_city_mi} />
                <StatCell label="Safety Score"         value={p.safety_score != null ? `${p.safety_score}/100` : null} />
                <StatCell label="Hazard Score"         value={p.natural_hazard_score != null ? `${p.natural_hazard_score}/100` : null} />
                <StatCell label="Community Type"       value={p.community_type} />
                <StatCell label="Food Production"      value={p.food_production} />
                <StatCell label="Comms"                value={p.communications?.join(", ")} />
              </div>
              {p.water_source && p.water_source.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-protocol">
                  <div className="font-mono text-[8.5px] text-text-mute2 uppercase tracking-[.1em] mb-2">Water Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {p.water_source.map((w) => (
                      <span key={w} className="px-2 py-0.5 rounded bg-glass-DEFAULT border border-border-protocol font-mono text-[10px] text-text-dim capitalize">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {p.power_systems && p.power_systems.length > 0 && (
                <div className="mt-3">
                  <div className="font-mono text-[8.5px] text-text-mute2 uppercase tracking-[.1em] mb-2">Power Systems</div>
                  <div className="flex flex-wrap gap-2">
                    {p.power_systems.map((pw) => (
                      <span key={pw} className="px-2 py-0.5 rounded bg-glass-DEFAULT border border-border-protocol font-mono text-[10px] text-text-dim capitalize">
                        {pw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right column — Inquiry form ────────────────────────────────── */}
        <div className="space-y-4">
          <div
            className="rounded-xl border p-5 sticky top-4"
            style={{
              borderColor: isTevatha ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.07)",
              background: "rgba(8,12,16,0.9)",
            }}
          >
            <h3 className="font-syne font-bold text-[15px] text-text-base mb-1">
              Inquire About This Property
            </h3>
            <p className="font-mono text-[10px] text-text-mute2 mb-4">
              A Tevatha advisor will respond within 24 hours.
            </p>

            {submitted ? (
              <div className="text-center py-6">
                <p className="font-mono text-[24px] mb-2">✓</p>
                <p className="font-syne font-bold text-[14px] text-green-bright">Inquiry submitted</p>
                <p className="font-mono text-[10px] text-text-mute2 mt-1">We&apos;ll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-3">
                {(["name", "email"] as const).map((field) => (
                  <div key={field}>
                    <label className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-1 block">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      required
                      value={form[field]}
                      onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                      className="w-full bg-void-2 border border-border-protocol rounded-lg
                                 px-3 py-2 font-mono text-[11px] text-text-base
                                 focus:outline-none focus:border-gold-protocol/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-1 block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your requirements, timeline, and budget…"
                    className="w-full bg-void-2 border border-border-protocol rounded-lg
                               px-3 py-2 font-mono text-[11px] text-text-base
                               focus:outline-none focus:border-gold-protocol/50 resize-none"
                  />
                </div>

                {formError && (
                  <p className="font-mono text-[10px] text-red-bright">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-5 py-3 rounded-lg bg-gold-protocol text-void-0
                             font-syne font-bold text-[13px]
                             hover:bg-gold-bright hover:-translate-y-0.5
                             hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                             transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send Inquiry"}
                </button>
              </form>
            )}

            {p.external_url && (
              <a
                href={p.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center font-mono text-[10px] text-text-mute2 hover:text-text-dim transition-colors"
              >
                View on source ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
