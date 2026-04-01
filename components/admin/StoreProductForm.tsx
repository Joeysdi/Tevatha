// components/admin/StoreProductForm.tsx
"use client";

import { useState, useRef } from "react";
import type { StoreProduct, FoodBW, WaterBW, EnergyBW } from "@/lib/store/types";

const FIELD_CLASS =
  "w-full bg-void-2 border border-border-protocol rounded-lg px-3 py-2 font-mono text-[11px] " +
  "text-text-base placeholder:text-text-mute2/50 focus:outline-none focus:border-gold-protocol/60 transition-colors";

const LABEL_CLASS =
  "font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-1 block";

// ── Tag input ─────────────────────────────────────────────────────────────────
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
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput("");
  }

  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-void-2
                       border border-border-protocol font-mono text-[10px] text-text-dim"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="text-text-mute2 hover:text-red-bright ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
          }}
          placeholder="Type and press Enter"
          className={FIELD_CLASS}
        />
        <button
          type="button"
          onClick={add}
          className="font-mono text-[10px] px-3 rounded-lg border border-border-protocol
                     text-text-mute2 hover:text-text-base hover:border-border-bright/40 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Biological wealth sub-forms ───────────────────────────────────────────────

function FoodBWFields({ bw, onChange }: { bw: Partial<FoodBW>; onChange: (v: Partial<FoodBW>) => void }) {
  function num(field: keyof FoodBW, val: string) {
    onChange({ ...bw, [field]: val === "" ? null : parseFloat(val) });
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Shelf Life (years)</label>
          <input type="number" className={FIELD_CLASS} value={bw.shelf_life_years ?? ""}
            onChange={(e) => num("shelf_life_years", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Servings Total</label>
          <input type="number" className={FIELD_CLASS} value={bw.servings_total ?? ""}
            onChange={(e) => num("servings_total", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Cal / Serving</label>
          <input type="number" className={FIELD_CLASS} value={bw.calories_per_serving ?? ""}
            onChange={(e) => num("calories_per_serving", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Protein g / Serving</label>
          <input type="number" className={FIELD_CLASS} value={bw.protein_g_per_serving ?? ""}
            onChange={(e) => num("protein_g_per_serving", e.target.value)} />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Preparation</label>
        <select
          className={FIELD_CLASS}
          value={bw.preparation ?? ""}
          onChange={(e) => onChange({ ...bw, preparation: (e.target.value || null) as FoodBW["preparation"] })}
        >
          <option value="">— none —</option>
          <option value="just_add_water">Just Add Water</option>
          <option value="freeze_dried">Freeze Dried</option>
          <option value="dehydrated">Dehydrated</option>
          <option value="whole_grain">Whole Grain</option>
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!bw.seed_reproducible}
          onChange={(e) => onChange({ ...bw, seed_reproducible: e.target.checked })}
          className="accent-[#c9a84c]" />
        <span className="font-mono text-[11px] text-text-dim">Seed Reproducible</span>
      </label>
    </div>
  );
}

function WaterBWFields({ bw, onChange }: { bw: Partial<WaterBW>; onChange: (v: Partial<WaterBW>) => void }) {
  function num(field: keyof WaterBW, val: string) {
    onChange({ ...bw, [field]: val === "" ? null : parseFloat(val) });
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>GPD Purification</label>
          <input type="number" className={FIELD_CLASS} value={bw.gpd_purification ?? ""}
            onChange={(e) => num("gpd_purification", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Micron Filtration</label>
          <input type="number" step="0.001" className={FIELD_CLASS} value={bw.micron_filtration ?? ""}
            onChange={(e) => num("micron_filtration", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Maintenance (days)</label>
          <input type="number" className={FIELD_CLASS} value={bw.maintenance_interval_days ?? ""}
            onChange={(e) => num("maintenance_interval_days", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Total Gallons Lifetime</label>
          <input type="number" className={FIELD_CLASS} value={bw.total_gallons_lifetime ?? ""}
            onChange={(e) => num("total_gallons_lifetime", e.target.value)} />
        </div>
      </div>
      <div className="flex gap-4">
        {(["removes_viruses", "removes_bacteria", "removes_chemicals"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!(bw as Record<string, unknown>)[k]}
              onChange={(e) => onChange({ ...bw, [k]: e.target.checked })}
              className="accent-[#c9a84c]" />
            <span className="font-mono text-[10px] text-text-dim capitalize">
              {k.replace(/_/g, " ")}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function EnergyBWFields({ bw, onChange }: { bw: Partial<EnergyBW>; onChange: (v: Partial<EnergyBW>) => void }) {
  function num(field: keyof EnergyBW, val: string) {
    onChange({ ...bw, [field]: val === "" ? null : parseFloat(val) });
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Watt Hours</label>
          <input type="number" className={FIELD_CLASS} value={bw.watt_hours ?? ""}
            onChange={(e) => num("watt_hours", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Lifecycle Cycles</label>
          <input type="number" className={FIELD_CLASS} value={bw.lifecycle_cycles ?? ""}
            onChange={(e) => num("lifecycle_cycles", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Continuous Watts</label>
          <input type="number" className={FIELD_CLASS} value={bw.continuous_watts ?? ""}
            onChange={(e) => num("continuous_watts", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Peak Watts</label>
          <input type="number" className={FIELD_CLASS} value={bw.peak_watts ?? ""}
            onChange={(e) => num("peak_watts", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Charge Time (hr)</label>
          <input type="number" step="0.5" className={FIELD_CLASS} value={bw.charge_time_hours ?? ""}
            onChange={(e) => num("charge_time_hours", e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!bw.emp_shielded}
          onChange={(e) => onChange({ ...bw, emp_shielded: e.target.checked })}
          className="accent-[#c9a84c]" />
        <span className="font-mono text-[11px] text-text-dim">EMP Shielded</span>
      </label>
    </div>
  );
}

// ── CSV import sub-panel ──────────────────────────────────────────────────────

function CsvImportPanel({ category }: { category: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ imported: number; flagged: number; errors: string[] } | null>(null);

  function downloadTemplate() {
    const baseHeaders = "name,sku,price_usd,category,brand,description,grade,safety_score," +
      "tevatha_certified,tevatha_rank,fulfillment_type,vendor_name,external_url,images,highlights,tags,accepts_crypto";

    const categoryHeaders =
      category === "food"
        ? ",shelf_life_years,calories_per_serving,servings_total,protein_g_per_serving,calories_per_100g,preparation,seed_reproducible,dietary_restrictions"
        : category === "water"
        ? ",gpd_purification,micron_filtration,maintenance_interval_days,total_gallons_lifetime,removes_viruses,removes_bacteria,removes_chemicals"
        : category === "energy"
        ? ",watt_hours,lifecycle_cycles,continuous_watts,peak_watts,charge_time_hours,emp_shielded"
        : "";

    const csv = baseHeaders + categoryHeaders + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tevatha-${category || "store"}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("loading");
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/store/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setState("done");
      } else {
        setResult({ imported: 0, flagged: 0, errors: [data.error ?? "Upload failed"] });
        setState("error");
      }
    } catch (e) {
      setResult({ imported: 0, flagged: 0, errors: [String(e)] });
      setState("error");
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="p-3 border border-border-protocol rounded-lg bg-void-2/40 space-y-2.5">
      <p className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em]">
        CSV Bulk Import
      </p>

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={downloadTemplate}
          className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-protocol
                     text-text-mute2 hover:text-text-base hover:border-border-bright/40 transition-colors"
        >
          ↓ Download Template
        </button>
        <label className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-gold-protocol/40
                          text-gold-protocol hover:bg-gold-protocol/10 transition-colors cursor-pointer">
          {state === "loading" ? "Uploading…" : "Upload CSV"}
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleUpload}
            disabled={state === "loading"}
          />
        </label>
      </div>

      {result && (
        <div className={`font-mono text-[10px] ${state === "done" ? "text-green-bright" : "text-red-bright"}`}>
          {state === "done"
            ? `✓ ${result.imported} imported, ${result.flagged} flagged for review`
            : `✗ ${result.errors[0] ?? "Error"}`}
          {result.errors.length > 1 && (
            <span className="text-text-mute2"> (+{result.errors.length - 1} more)</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

type FormData = Omit<StoreProduct, "id" | "created_at" | "updated_at" | "deleted_at" | "last_synced_at" | "store_variants">;

interface StoreProductFormProps {
  initial?: Partial<FormData>;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const BLANK: FormData = {
  source: "manual",
  source_id: null,
  tevatha_certified: true,
  tevatha_rank: null,
  title: "",
  slug: "",
  status: "active",
  category: "food",
  brand: null,
  description: null,
  images: null,
  highlights: null,
  tags: null,
  grade: null,
  safety_score: null,
  biological_wealth: null,
  min_price_usd: null,
  accepts_crypto: false,
  fulfillment_type: "direct",
  vendor_name: null,
  external_url: null,
  raw_data: null,
};

export function StoreProductForm({ initial, onSave, onCancel }: StoreProductFormProps) {
  const [form, setForm] = useState<FormData>({ ...BLANK, ...initial });
  const [bwFood, setBwFood]     = useState<Partial<FoodBW>>({ category: "food" });
  const [bwWater, setBwWater]   = useState<Partial<WaterBW>>({ category: "water" });
  const [bwEnergy, setBwEnergy] = useState<Partial<EnergyBW>>({ category: "energy" });
  const [saving, setSaving] = useState(false);

  function field(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value || null }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const bw =
        form.category === "food"
          ? ({ ...bwFood, category: "food" } as FoodBW)
          : form.category === "water"
          ? ({ ...bwWater, category: "water" } as WaterBW)
          : ({ ...bwEnergy, category: "energy" } as EnergyBW);

      await onSave({ ...form, biological_wealth: bw });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Core fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={LABEL_CLASS}>Title *</label>
          <input required className={FIELD_CLASS} value={form.title ?? ""} onChange={field("title")} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Brand</label>
          <input className={FIELD_CLASS} value={form.brand ?? ""} onChange={field("brand")} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Slug</label>
          <input className={FIELD_CLASS} value={form.slug ?? ""} onChange={field("slug")}
            placeholder="auto-generated if blank" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Category *</label>
          <select required className={FIELD_CLASS} value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FormData["category"] }))}>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="energy">Energy</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Status</label>
          <select className={FIELD_CLASS} value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormData["status"] }))}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Grade</label>
          <input className={FIELD_CLASS} value={form.grade ?? ""} onChange={field("grade")} placeholder="A/B/C/D/F" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Safety Score (0–100)</label>
          <input type="number" min={0} max={100} className={FIELD_CLASS}
            value={form.safety_score ?? ""} onChange={field("safety_score")} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Tevatha Rank</label>
          <input type="number" className={FIELD_CLASS} value={form.tevatha_rank ?? ""} onChange={field("tevatha_rank")} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Fulfillment</label>
          <select className={FIELD_CLASS} value={form.fulfillment_type}
            onChange={(e) => setForm((f) => ({ ...f, fulfillment_type: e.target.value as FormData["fulfillment_type"] }))}>
            <option value="direct">Direct</option>
            <option value="dropship">Drop-ship</option>
          </select>
        </div>
        {form.fulfillment_type === "dropship" && (
          <div className="col-span-2">
            <label className={LABEL_CLASS}>Vendor Name</label>
            <input className={FIELD_CLASS} value={form.vendor_name ?? ""} onChange={field("vendor_name")} />
          </div>
        )}
        <div className="col-span-2">
          <label className={LABEL_CLASS}>External URL</label>
          <input type="url" className={FIELD_CLASS} value={form.external_url ?? ""} onChange={field("external_url")} />
        </div>
        <div className="col-span-2">
          <label className={LABEL_CLASS}>Description</label>
          <textarea rows={3} className={FIELD_CLASS} value={form.description ?? ""} onChange={field("description")} />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.tevatha_certified}
            onChange={(e) => setForm((f) => ({ ...f, tevatha_certified: e.target.checked }))}
            className="accent-[#c9a84c]" />
          <span className="font-mono text-[11px] text-text-dim">Tevatha Certified</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.accepts_crypto}
            onChange={(e) => setForm((f) => ({ ...f, accepts_crypto: e.target.checked }))}
            className="accent-[#c9a84c]" />
          <span className="font-mono text-[11px] text-text-dim">Accepts Crypto</span>
        </label>
      </div>

      <TagInput label="Tags" value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} />
      <TagInput label="Highlights" value={form.highlights} onChange={(v) => setForm((f) => ({ ...f, highlights: v }))} />

      {/* Dynamic BiologicalWealth section */}
      <div>
        <p className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-2">
          Biological Wealth · {form.category}
        </p>
        <div className="p-3 border border-border-protocol rounded-lg bg-void-2/30">
          {form.category === "food"   && <FoodBWFields   bw={bwFood}   onChange={setBwFood} />}
          {form.category === "water"  && <WaterBWFields  bw={bwWater}  onChange={setBwWater} />}
          {form.category === "energy" && <EnergyBWFields bw={bwEnergy} onChange={setBwEnergy} />}
        </div>
      </div>

      <CsvImportPanel category={form.category} />

      <div className="flex gap-3 justify-end pt-2 border-t border-border-protocol">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[11px] px-4 py-2 rounded-lg border border-border-protocol
                     text-text-mute2 hover:text-text-base hover:border-border-bright/40 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="font-mono font-bold text-[11px] px-5 py-2 rounded-lg
                     bg-gold-protocol text-void-0 hover:bg-gold-bright
                     hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save Product"}
        </button>
      </div>
    </form>
  );
}
