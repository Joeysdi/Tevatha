// app/admin/properties/page.tsx
// Protected — Clerk + tier check (tier 3 / admin only)
"use client";

import { useEffect, useState } from "react";
import { useAuth }             from "@clerk/nextjs";
import { useRouter }           from "next/navigation";
import { PropertyForm }        from "@/components/admin/PropertyForm";
import { TevathaBadge }        from "@/components/properties/TevathaBadge";
import { FadeUp }              from "@/components/ui/motion";
import type { Property }       from "@/lib/real-estate/types";

const SOURCE_BADGE: Record<string, string> = {
  tevatha:    "text-gold-protocol bg-gold-protocol/10 border-gold-protocol/30",
  mls:        "text-cyan-DEFAULT  bg-cyan-dim/10       border-cyan-border",
  aggregator: "text-text-dim      bg-glass-DEFAULT     border-border-protocol",
};

export default function AdminPropertiesPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router                   = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<Property | null>(null);
  const [syncing, setSyncing]       = useState(false);
  const [syncMsg, setSyncMsg]       = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/admin/properties");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/admin/properties")
      .then((r) => r.json())
      .then((d) => { setProperties(d.properties ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  async function triggerSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/properties/sync", {
        method:  "POST",
        headers: { "x-cron-secret": process.env.NEXT_PUBLIC_CRON_SECRET ?? "" },
      });
      const d = await res.json();
      setSyncMsg(res.ok
        ? `✓ Synced — ${d.total_fetched} fetched, ${d.total_upserted} upserted`
        : `✗ ${d.error}`
      );
    } catch (e) {
      setSyncMsg(`✗ ${e}`);
    } finally {
      setSyncing(false);
    }
  }

  async function toggleStatus(p: Property) {
    const next = p.status === "active" ? "draft" : "active";
    await fetch(`/api/admin/properties/${p.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: next }),
    });
    setProperties((ps) => ps.map((x) => x.id === p.id ? { ...x, status: next } : x));
  }

  async function softDelete(p: Property) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await fetch(`/api/admin/properties/${p.id}`, { method: "DELETE" });
    setProperties((ps) => ps.filter((x) => x.id !== p.id));
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-void-0 px-6 py-8 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <FadeUp>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.2em] mb-1">
              ADMIN · PROPERTIES
            </p>
            <h1 className="font-syne font-extrabold text-[24px] text-text-base">
              Property Manager
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-4 py-2 rounded-lg border border-border-bright font-mono text-[11px]
                         text-text-dim hover:text-gold-protocol hover:border-gold-protocol/40
                         transition-colors disabled:opacity-50"
            >
              {syncing ? "Syncing…" : "⟳ Sync Now"}
            </button>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="px-5 py-2 rounded-lg bg-gold-protocol text-void-0
                         font-syne font-bold text-[13px]
                         hover:bg-gold-bright hover:-translate-y-0.5
                         transition-all duration-200"
            >
              + New Listing
            </button>
          </div>
        </div>

        {syncMsg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg border font-mono text-[11px] ${
            syncMsg.startsWith("✓")
              ? "border-green-bright/30 bg-green-dim/10 text-green-bright"
              : "border-red-bright/30 bg-red-dim/10 text-red-bright"
          }`}>
            {syncMsg}
          </div>
        )}
      </FadeUp>

      {/* ── New / Edit form ──────────────────────────────────────────────── */}
      {showForm && (
        <FadeUp>
          <div className="mb-8 bg-void-1 border border-border-protocol rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-[17px] text-text-base">
                {editTarget ? "Edit Listing" : "New Tevatha-Certified Listing"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditTarget(null); }}
                className="font-mono text-[11px] text-text-mute2 hover:text-red-bright transition-colors"
              >
                ✕ Cancel
              </button>
            </div>
            <PropertyForm
              initial={editTarget ?? undefined}
              onSaved={(p) => {
                setProperties((ps) =>
                  editTarget
                    ? ps.map((x) => x.id === p.id ? p : x)
                    : [p, ...ps]
                );
                setShowForm(false);
                setEditTarget(null);
              }}
            />
          </div>
        </FadeUp>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-void-1 border border-border-protocol rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-protocol">
          <h2 className="font-syne font-bold text-[15px] text-text-base">
            All Properties
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
          <span className="font-mono text-[10px] text-text-mute2">{properties.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="font-mono text-[11px] text-text-mute2 animate-pulse">Loading…</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-mono text-[13px] text-text-mute2">No properties yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-protocol">
                  {["Title","Source","Type","Status","Rank","Price","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border-protocol last:border-0 hover:bg-glass-DEFAULT transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.tevatha_certified && <TevathaBadge />}
                        <span className="font-syne text-[12px] text-text-base line-clamp-1 max-w-[200px]">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] border ${SOURCE_BADGE[p.source] ?? SOURCE_BADGE.aggregator}`}>
                        {p.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-text-dim capitalize">{p.property_type}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`px-2 py-0.5 rounded font-mono text-[9px] border transition-colors ${
                          p.status === "active"
                            ? "text-green-bright border-green-bright/30 bg-green-dim/10 hover:bg-red-dim/10 hover:text-red-bright hover:border-red-bright/30"
                            : "text-text-mute2 border-border-protocol hover:text-green-bright hover:border-green-bright/30"
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-16 bg-void-2 border border-border-protocol rounded px-2 py-1 font-mono text-[10px] text-text-base focus:outline-none focus:border-gold-protocol/50"
                        defaultValue={p.tevatha_rank ?? ""}
                        onBlur={async (e) => {
                          const rank = e.target.value ? parseInt(e.target.value, 10) : null;
                          await fetch(`/api/admin/properties/${p.id}`, {
                            method:  "PUT",
                            headers: { "Content-Type": "application/json" },
                            body:    JSON.stringify({ tevatha_rank: rank }),
                          });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-dim">
                      {p.price_display ?? (p.price_usd ? `$${(p.price_usd / 100).toLocaleString()}` : "—")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditTarget(p); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-text-mute2/30">·</span>
                        <button
                          onClick={() => softDelete(p)}
                          className="font-mono text-[10px] text-text-mute2 hover:text-red-bright transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
