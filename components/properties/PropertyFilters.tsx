// components/properties/PropertyFilters.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const TYPES = ["land", "compound", "bunker", "farm", "cabin", "retreat"] as const;

export function PropertyFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const current = {
    type:     searchParams.get("type")     ?? "",
    offGrid:  searchParams.get("offGrid")  ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minAcres: searchParams.get("minAcres") ?? "",
  };

  const labelClass = "font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] mb-1 block";
  const selectClass = [
    "w-full bg-void-2 border border-border-protocol rounded-lg",
    "px-3 py-2 font-mono text-[11px] text-text-base",
    "focus:outline-none focus:border-gold-protocol/50",
    "appearance-none cursor-pointer",
  ].join(" ");
  const inputClass = selectClass;

  return (
    <div className="bg-void-1 border border-border-protocol rounded-xl p-4 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        {/* Type */}
        <div>
          <label className={labelClass}>Property Type</label>
          <select
            className={selectClass}
            value={current.type}
            onChange={(e) => update("type", e.target.value || null)}
          >
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Off-grid */}
        <div>
          <label className={labelClass}>Off-Grid</label>
          <select
            className={selectClass}
            value={current.offGrid}
            onChange={(e) => update("offGrid", e.target.value || null)}
          >
            <option value="">Any</option>
            <option value="true">Off-Grid Only</option>
          </select>
        </div>

        {/* Min price */}
        <div>
          <label className={labelClass}>Min Price ($)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0"
            value={current.minPrice}
            onChange={(e) => update("minPrice", e.target.value || null)}
            min={0}
          />
        </div>

        {/* Max price */}
        <div>
          <label className={labelClass}>Max Price ($)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="No limit"
            value={current.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value || null)}
            min={0}
          />
        </div>

        {/* Min acres */}
        <div>
          <label className={labelClass}>Min Acres</label>
          <input
            type="number"
            className={inputClass}
            placeholder="Any"
            value={current.minAcres}
            onChange={(e) => update("minAcres", e.target.value || null)}
            min={0}
            step={0.5}
          />
        </div>
      </div>

      {/* Active filter pills */}
      {Object.values(current).some(Boolean) && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[9px] text-text-mute2">ACTIVE:</span>
          {Object.entries(current).map(([key, val]) =>
            val ? (
              <button
                key={key}
                onClick={() => update(key, null)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full
                           bg-gold-protocol/10 border border-gold-protocol/30
                           font-mono text-[9px] text-gold-protocol
                           hover:bg-red-dim/20 hover:border-red-bright/30 hover:text-red-bright
                           transition-colors"
              >
                {key}={val} ×
              </button>
            ) : null
          )}
          <button
            onClick={() => router.push(pathname)}
            className="font-mono text-[9px] text-text-mute2 hover:text-red-bright transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
