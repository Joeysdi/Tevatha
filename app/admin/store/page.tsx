// app/admin/store/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth }             from "@clerk/nextjs";
import { useRouter }           from "next/navigation";
import { StoreProductForm }    from "@/components/admin/StoreProductForm";
import { TevathaBadge }        from "@/components/properties/TevathaBadge";
import { FadeUp }              from "@/components/ui/motion";
import type { StoreProduct }   from "@/lib/store/types";

const STATUS_BADGE: Record<string, string> = {
  active:   "text-green-bright   bg-green-bright/10   border-green-bright/30",
  draft:    "text-text-mute2    bg-glass-DEFAULT      border-border-protocol",
  review:   "text-[#f0a500]    bg-[#f0a500]/10       border-[#f0a500]/30",
  archived: "text-red-bright   bg-red-bright/10      border-red-bright/30",
};

const SOURCE_BADGE: Record<string, string> = {
  tevatha:          "text-gold-bright    bg-gold-bright/10   border-gold-bright/30",
  manual:           "text-gold-protocol  bg-gold-protocol/10 border-gold-protocol/30",
  open_food_facts:  "text-cyan-DEFAULT   bg-cyan-dim/10      border-cyan-border",
  csv:              "text-blue-DEFAULT   bg-blue-DEFAULT/10  border-blue-DEFAULT/30",
};

export default function AdminStorePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreProduct | null>(null);
  const [syncing, setSyncing]   = useState(false);
  const [syncMsg, setSyncMsg]   = useState("");
  const [rankEdits, setRankEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/admin/store");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/admin/store")
      .then((r) => r.json())
      .then((d) => { setProducts(d.products ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  async function triggerSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/store/sync", {
        method:  "POST",
        headers: { "x-cron-secret": process.env.NEXT_PUBLIC_CRON_SECRET ?? "" },
      });
      const d = await res.json();
      setSyncMsg(
        res.ok
          ? `✓ Synced — ${d.total_fetched} fetched, ${d.total_upserted} upserted`
          : `✗ ${d.error}`
      );
    } catch (e) {
      setSyncMsg(`✗ ${e}`);
    } finally {
      setSyncing(false);
    }
  }

  async function softDelete(p: StoreProduct) {
    if (!confirm(`Archive "${p.title}"?`)) return;
    await fetch(`/api/admin/store/${p.id}`, { method: "DELETE" });
    setProducts((ps) => ps.filter((x) => x.id !== p.id));
  }

  async function saveRank(p: StoreProduct) {
    const raw = rankEdits[p.id];
    if (raw === undefined) return;
    const rank = raw === "" ? null : parseInt(raw, 10);
    await fetch(`/api/admin/store/${p.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ tevatha_rank: rank }),
    });
    setProducts((ps) =>
      ps.map((x) => (x.id === p.id ? { ...x, tevatha_rank: rank } : x))
    );
    setRankEdits((r) => { const n = { ...r }; delete n[p.id]; return n; });
  }

  async function handleSave(data: Omit<StoreProduct, "id" | "created_at" | "updated_at" | "deleted_at" | "last_synced_at" | "store_variants">) {
    if (editTarget) {
      const res = await fetch(`/api/admin/store/${editTarget.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const updated = await res.json();
      setProducts((ps) => ps.map((x) => (x.id === editTarget.id ? updated : x)));
    } else {
      const res = await fetch("/api/admin/store", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const created = await res.json();
      setProducts((ps) => [created, ...ps]);
    }
    setShowForm(false);
    setEditTarget(null);
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-void-0 text-text-base px-6 py-10 max-w-6xl mx-auto">
      <FadeUp>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-syne font-bold text-[24px] text-text-base">Store Admin</h1>
            <p className="font-mono text-[11px] text-text-mute2 mt-0.5">
              DB-backed food / water / energy products
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="font-mono text-[10px] px-4 py-2 rounded-lg border border-border-protocol
                         text-text-mute2 hover:text-text-base hover:border-border-bright/40
                         transition-colors disabled:opacity-40"
            >
              {syncing ? "Syncing…" : "Sync Now"}
            </button>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="font-mono font-bold text-[11px] px-4 py-2 rounded-lg
                         bg-gold-protocol text-void-0 hover:bg-gold-bright
                         hover:-translate-y-0.5 transition-all"
            >
              + New Product
            </button>
          </div>
        </div>

        {syncMsg && (
          <div className={`mb-4 font-mono text-[11px] px-3 py-2 rounded-lg border ${
            syncMsg.startsWith("✓")
              ? "text-green-bright border-green-bright/30 bg-green-bright/5"
              : "text-red-bright border-red-bright/30 bg-red-bright/5"
          }`}>
            {syncMsg}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 p-5 bg-void-1 border border-border-protocol rounded-xl">
            <h2 className="font-syne font-bold text-[16px] mb-4">
              {editTarget ? "Edit Product" : "New Product"}
            </h2>
            <StoreProductForm
              initial={editTarget ?? undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditTarget(null); }}
            />
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-void-2 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="border border-border-protocol rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-protocol bg-void-1">
                  {["Title", "Category", "Source", "Status", "Grade", "Rank", "Price", "Actions"].map((h) => (
                    <th key={h} className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] px-3 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border-protocol/50 hover:bg-void-1/60 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {p.tevatha_certified && <TevathaBadge />}
                        <span className="font-syne font-bold text-[12px] text-text-base line-clamp-1">
                          {p.title}
                        </span>
                      </div>
                      {p.brand && (
                        <div className="font-mono text-[9px] text-text-mute2">{p.brand}</div>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[10px] text-text-dim capitalize">
                        {p.category}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border
                                       ${SOURCE_BADGE[p.source] ?? "text-text-mute2 border-border-protocol"}`}>
                        {p.source.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border
                                       ${STATUS_BADGE[p.status] ?? "text-text-mute2 border-border-protocol"}`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px] text-text-dim">
                        {p.grade ?? "—"}
                      </span>
                    </td>

                    {/* Inline rank edit */}
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={rankEdits[p.id] ?? (p.tevatha_rank ?? "")}
                        onChange={(e) => setRankEdits((r) => ({ ...r, [p.id]: e.target.value }))}
                        onBlur={() => saveRank(p)}
                        className="w-14 bg-void-2 border border-border-protocol rounded px-2 py-0.5
                                   font-mono text-[11px] text-text-base focus:outline-none
                                   focus:border-gold-protocol/60"
                        placeholder="—"
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px] tabular-nums text-gold-protocol">
                        {p.min_price_usd !== null
                          ? `$${(p.min_price_usd / 100).toFixed(2)}`
                          : "—"}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditTarget(p); setShowForm(true); }}
                          className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => softDelete(p)}
                          className="font-mono text-[10px] text-text-mute2 hover:text-red-bright transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center font-mono text-[12px] text-text-mute2">
                      No products yet. Add one manually or run a sync.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </FadeUp>
    </div>
  );
}
