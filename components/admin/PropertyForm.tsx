// components/admin/PropertyForm.tsx
"use client";

import { useState } from "react";
import type { Property, PropertyType, OffGridCapacity, CommunityType } from "@/lib/real-estate/types";

const PROPERTY_TYPES: PropertyType[]     = ["land","residential","compound","bunker","farm","cabin","retreat"];
const OFF_GRID_OPTIONS: OffGridCapacity[] = ["full","partial","grid-tied-backup"];
const COMMUNITY_OPTIONS: CommunityType[]  = ["solo","small","intentional"];

type FormData = Omit<Property, "id" | "created_at" | "updated_at" | "deleted_at" | "last_synced_at">;

function TagInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[] | null;
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const tags = value ?? [];

  function add() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <label className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-glass-DEFAULT
                       border border-border-protocol font-mono text-[10px] text-text-dim"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="text-text-mute2 hover:text-red-bright ml-0.5"
            >×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          className="flex-1 bg-void-2 border border-border-protocol rounded-lg
                     px-3 py-1.5 font-mono text-[11px] text-text-base
                     focus:outline-none focus:border-gold-protocol/50"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 rounded-lg bg-glass-DEFAULT border border-border-protocol
                     font-mono text-[10px] text-text-mute2 hover:text-gold-protocol hover:border-gold-protocol/40 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

const FIELD_CLASS = "w-full bg-void-2 border border-border-protocol rounded-lg px-3 py-2 font-mono text-[11px] text-text-base focus:outline-none focus:border-gold-protocol/50";
const LABEL_CLASS = "font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-1 block";

interface Props {
  initial?: Partial<Property>;
  onSaved?: (p: Property) => void;
}

export function PropertyForm({ initial, onSaved }: Props) {
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<Partial<FormData>>({
    source:            "tevatha",
    tevatha_certified: true,
    tevatha_rank:      null,
    status:            "draft",
    property_type:     "land",
    accepts_crypto:    false,
    ...initial,
  });

  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url    = isEdit ? `/api/admin/properties/${initial!.id}` : "/api/admin/properties";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      const saved: Property = await res.json();
      onSaved?.(saved);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Basic info ──────────────────────────────────────────────────── */}
      <fieldset className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
        <legend className="font-syne font-bold text-[13px] text-text-base px-1">Basic Info</legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Title</label>
            <input type="text" required className={FIELD_CLASS} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Slug</label>
            <input type="text" className={FIELD_CLASS} value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated if blank" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Property Type</label>
            <select className={FIELD_CLASS} value={form.property_type ?? "land"} onChange={(e) => set("property_type", e.target.value as PropertyType)}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Status</label>
            <select className={FIELD_CLASS} value={form.status ?? "draft"} onChange={(e) => set("status", e.target.value as Property["status"])}>
              {["draft","active","pending","sold"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Tevatha Rank (lower = higher)</label>
            <input type="number" className={FIELD_CLASS} value={form.tevatha_rank ?? ""} onChange={(e) => set("tevatha_rank", e.target.value ? parseInt(e.target.value, 10) : null)} />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <input type="checkbox" id="certified" checked={form.tevatha_certified ?? true} onChange={(e) => set("tevatha_certified", e.target.checked)} className="w-4 h-4 accent-gold-protocol" />
            <label htmlFor="certified" className="font-mono text-[11px] text-text-base cursor-pointer">Tevatha Certified</label>
          </div>
        </div>
      </fieldset>

      {/* ── Location ────────────────────────────────────────────────────── */}
      <fieldset className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
        <legend className="font-syne font-bold text-[13px] text-text-base px-1">Location</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["address","city","state","zip","country"] as const).map((f) => (
            <div key={f}>
              <label className={LABEL_CLASS}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input type="text" className={FIELD_CLASS} value={(form[f] as string) ?? ""} onChange={(e) => set(f, e.target.value || null as never)} />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS}>Latitude</label>
            <input type="number" step="any" className={FIELD_CLASS} value={form.lat ?? ""} onChange={(e) => set("lat", e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Longitude</label>
            <input type="number" step="any" className={FIELD_CLASS} value={form.lng ?? ""} onChange={(e) => set("lng", e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Acres</label>
            <input type="number" step="any" className={FIELD_CLASS} value={form.acres ?? ""} onChange={(e) => set("acres", e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
        </div>
      </fieldset>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <fieldset className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
        <legend className="font-syne font-bold text-[13px] text-text-base px-1">Pricing</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Price (USD, in cents)</label>
            <input type="number" className={FIELD_CLASS} value={form.price_usd ?? ""} onChange={(e) => set("price_usd", e.target.value ? parseInt(e.target.value, 10) : null)} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Price Display Override</label>
            <input type="text" className={FIELD_CLASS} placeholder="e.g. $280,000" value={form.price_display ?? ""} onChange={(e) => set("price_display", e.target.value || null)} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="crypto" checked={form.accepts_crypto ?? false} onChange={(e) => set("accepts_crypto", e.target.checked)} className="w-4 h-4 accent-gold-protocol" />
            <label htmlFor="crypto" className="font-mono text-[11px] text-text-base cursor-pointer">Accepts Crypto</label>
          </div>
        </div>
      </fieldset>

      {/* ── Specs ───────────────────────────────────────────────────────── */}
      <fieldset className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
        <legend className="font-syne font-bold text-[13px] text-text-base px-1">Specifications</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["bedrooms","sqft","year_built"] as const).map((f) => (
            <div key={f}>
              <label className={LABEL_CLASS}>{f.replace(/_/g, " ")}</label>
              <input type="number" className={FIELD_CLASS} value={(form[f] as number | undefined) ?? ""} onChange={(e) => set(f, e.target.value ? parseInt(e.target.value, 10) : null as never)} />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS}>Bathrooms</label>
            <input type="number" step="0.5" className={FIELD_CLASS} value={form.bathrooms ?? ""} onChange={(e) => set("bathrooms", e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
        </div>
      </fieldset>

      {/* ── Resilience ──────────────────────────────────────────────────── */}
      <fieldset className="border rounded-xl p-5 space-y-4" style={{ borderColor: "rgba(201,168,76,0.25)", background: "linear-gradient(135deg,rgba(201,168,76,0.03),transparent)" }}>
        <legend className="font-syne font-bold text-[13px] text-gold-protocol px-1">⚡ Resilience Profile</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Off-Grid Capacity</label>
            <select className={FIELD_CLASS} value={form.off_grid_capacity ?? ""} onChange={(e) => set("off_grid_capacity", (e.target.value || null) as OffGridCapacity | null)}>
              <option value="">None</option>
              {OFF_GRID_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Community Type</label>
            <select className={FIELD_CLASS} value={form.community_type ?? ""} onChange={(e) => set("community_type", (e.target.value || null) as CommunityType | null)}>
              <option value="">Unspecified</option>
              {COMMUNITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {(["resource_autonomy_days","elevation_ft","safety_score","natural_hazard_score"] as const).map((f) => (
            <div key={f}>
              <label className={LABEL_CLASS}>{f.replace(/_/g, " ")}</label>
              <input type="number" className={FIELD_CLASS} value={(form[f] as number | undefined) ?? ""} onChange={(e) => set(f, e.target.value ? parseInt(e.target.value, 10) : null as never)} />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS}>Distance to City (mi)</label>
            <input type="number" step="any" className={FIELD_CLASS} value={form.distance_to_city_mi ?? ""} onChange={(e) => set("distance_to_city_mi", e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Food Production</label>
            <input type="text" className={FIELD_CLASS} value={form.food_production ?? ""} onChange={(e) => set("food_production", e.target.value || null)} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Defensive Infrastructure</label>
            <input type="text" className={FIELD_CLASS} value={form.defensive_infrastructure ?? ""} onChange={(e) => set("defensive_infrastructure", e.target.value || null)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <TagInput label="Water Sources"  value={form.water_source  ?? null} onChange={(v) => set("water_source",  v)} />
          <TagInput label="Power Systems"  value={form.power_systems ?? null} onChange={(v) => set("power_systems", v)} />
          <TagInput label="Communications" value={form.communications ?? null} onChange={(v) => set("communications", v)} />
        </div>
      </fieldset>

      {/* ── Media + meta ────────────────────────────────────────────────── */}
      <fieldset className="bg-void-1 border border-border-protocol rounded-xl p-5 space-y-4">
        <legend className="font-syne font-bold text-[13px] text-text-base px-1">Media &amp; Meta</legend>
        <div>
          <label className={LABEL_CLASS}>Description</label>
          <textarea rows={4} className={FIELD_CLASS} value={form.description ?? ""} onChange={(e) => set("description", e.target.value || null)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>External URL</label>
          <input type="url" className={FIELD_CLASS} value={form.external_url ?? ""} onChange={(e) => set("external_url", e.target.value || null)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TagInput label="Images (URLs)"  value={form.images     ?? null} onChange={(v) => set("images",     v)} />
          <TagInput label="Highlights"     value={form.highlights ?? null} onChange={(v) => set("highlights", v)} />
          <TagInput label="Tags"           value={form.tags       ?? null} onChange={(v) => set("tags",       v)} />
        </div>
      </fieldset>

      {error && <p className="font-mono text-[11px] text-red-bright">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-7 py-3 rounded-lg bg-gold-protocol text-void-0
                   font-syne font-bold text-[13px]
                   hover:bg-gold-bright hover:-translate-y-0.5
                   hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                   transition-all duration-200 disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Listing"}
      </button>
    </form>
  );
}
