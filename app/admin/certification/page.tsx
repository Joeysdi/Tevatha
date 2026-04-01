// app/admin/certification/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth }             from "@clerk/nextjs";
import { useRouter }           from "next/navigation";
import { FadeUp }              from "@/components/ui/motion";

type ItemType = "product" | "property";

interface ReviewProduct {
  id:       string;
  title:    string;
  category: string;
  source:   string;
  status:   string;
  grade:    string | null;
  biological_wealth: Record<string, unknown> | null;
  raw_data: Record<string, unknown> | null;
}

interface ReviewProperty {
  id:       string;
  title:    string;
  address:  string | null;
  city:     string | null;
  state:    string | null;
  source:   string;
  status:   string;
  grade:    string | null;
  raw_data: Record<string, unknown> | null;
}

type ReviewItem = ReviewProduct | ReviewProperty;

const SOURCE_BADGE: Record<string, string> = {
  tevatha:         "text-gold-bright    bg-gold-bright/10   border-gold-bright/30",
  manual:          "text-gold-protocol  bg-gold-protocol/10 border-gold-protocol/30",
  open_food_facts: "text-cyan-DEFAULT   bg-cyan-dim/10      border-cyan-border",
  csv:             "text-blue-DEFAULT   bg-blue-DEFAULT/10  border-blue-DEFAULT/30",
  mls:             "text-text-dim       bg-glass-DEFAULT    border-border-protocol",
  aggregator:      "text-text-dim       bg-glass-DEFAULT    border-border-protocol",
};

export default function AdminCertificationPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [tab, setTab]               = useState<ItemType>("product");
  const [products, setProducts]     = useState<ReviewProduct[]>([]);
  const [properties, setProperties] = useState<ReviewProperty[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());
  const [rejectNote, setRejectNote] = useState("");
  const [actionMsg, setActionMsg]   = useState("");
  const [acting, setActing]         = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/admin/certification");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    setLoading(true);

    Promise.all([
      fetch("/api/admin/store?includeDeleted=false").then((r) => r.json()),
      fetch("/api/admin/properties").then((r) => r.json()),
    ]).then(([storeData, propsData]) => {
      setProducts((storeData.products ?? []).filter((p: ReviewProduct) => p.status === "review"));
      setProperties((propsData.properties ?? []).filter(
        (p: ReviewProperty) => p.status === "pending" && p.source !== "tevatha"
      ));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isSignedIn]);

  const items: ReviewItem[] = tab === "product" ? products : properties;

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll() {
    setSelected(items.length === selected.size ? new Set() : new Set(items.map((i) => i.id)));
  }

  function toggleExpand(id: string) {
    setExpanded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function applyAction(action: "approve" | "reject") {
    if (selected.size === 0) return;
    setActing(true);
    setActionMsg("");
    try {
      const res = await fetch("/api/admin/certification", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ids:    Array.from(selected),
          action,
          note:   rejectNote || undefined,
          type:   tab,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setActionMsg(`✗ ${d.error}`); return; }

      const ids = Array.from(selected);
      setActionMsg(`✓ ${action === "approve" ? "Approved" : "Rejected"} ${ids.length} item(s)`);
      setSelected(new Set());
      setRejectNote("");

      if (tab === "product") {
        setProducts((ps) => ps.filter((p) => !ids.includes(p.id)));
      } else {
        setProperties((ps) => ps.filter((p) => !ids.includes(p.id)));
      }
    } catch (e) {
      setActionMsg(`✗ ${e}`);
    } finally {
      setActing(false);
    }
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-void-0 text-text-base px-6 py-10 max-w-6xl mx-auto">
      <FadeUp>
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-syne font-bold text-[24px] text-text-base">Certification Queue</h1>
          <p className="font-mono text-[11px] text-text-mute2 mt-0.5">
            Review external imports before they go live
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border-protocol">
          {(["product", "property"] as ItemType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(new Set()); setActionMsg(""); }}
              className={`font-mono text-[11px] px-4 py-2 -mb-px border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-gold-protocol text-gold-protocol"
                  : "border-transparent text-text-mute2 hover:text-text-base"
              }`}
            >
              {t === "product" ? "Products" : "Properties"}
              <span className="ml-2 font-mono text-[9px] px-1.5 py-0.5 rounded bg-void-2 text-text-mute2">
                {t === "product" ? products.length : properties.length}
              </span>
            </button>
          ))}
        </div>

        {/* Batch actions */}
        {selected.size > 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-void-1 border border-border-protocol rounded-xl">
            <span className="font-mono text-[11px] text-text-dim">{selected.size} selected</span>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Rejection note (optional)"
              className="flex-1 bg-void-2 border border-border-protocol rounded px-2.5 py-1.5
                         font-mono text-[11px] text-text-base placeholder:text-text-mute2
                         focus:outline-none focus:border-gold-protocol/60"
            />
            <button
              onClick={() => applyAction("approve")}
              disabled={acting}
              className="font-mono font-bold text-[10px] px-4 py-1.5 rounded-lg
                         bg-gold-protocol text-void-0 hover:bg-gold-bright
                         hover:-translate-y-0.5 transition-all disabled:opacity-40"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => applyAction("reject")}
              disabled={acting}
              className="font-mono font-bold text-[10px] px-4 py-1.5 rounded-lg
                         bg-red-bright/10 text-red-bright border border-red-bright/30
                         hover:bg-red-bright/20 transition-all disabled:opacity-40"
            >
              ✗ Reject
            </button>
          </div>
        )}

        {actionMsg && (
          <div className={`mb-4 font-mono text-[11px] px-3 py-2 rounded-lg border ${
            actionMsg.startsWith("✓")
              ? "text-green-bright border-green-bright/30 bg-green-bright/5"
              : "text-red-bright border-red-bright/30 bg-red-bright/5"
          }`}>
            {actionMsg}
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
                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size > 0 && selected.size === items.length}
                      onChange={selectAll}
                      className="accent-gold-protocol"
                    />
                  </th>
                  {["Title", "Source", "Grade", "Details", "Actions"].map((h) => (
                    <th key={h} className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] px-3 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isExpanded = expanded.has(item.id);
                  return (
                    <>
                      <tr
                        key={item.id}
                        className="border-b border-border-protocol/50 hover:bg-void-1/60 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="accent-gold-protocol"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-syne font-bold text-[12px] text-text-base line-clamp-1">
                            {item.title}
                          </span>
                          {tab === "property" && (item as ReviewProperty).city && (
                            <div className="font-mono text-[9px] text-text-mute2">
                              {(item as ReviewProperty).city}, {(item as ReviewProperty).state}
                            </div>
                          )}
                          {tab === "product" && (item as ReviewProduct).category && (
                            <div className="font-mono text-[9px] text-text-mute2 capitalize">
                              {(item as ReviewProduct).category}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`font-mono text-[9px] px-2 py-0.5 rounded border
                                           ${SOURCE_BADGE[item.source] ?? "text-text-mute2 border-border-protocol"}`}>
                            {item.source.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-[11px] text-text-dim">
                            {item.grade ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="font-mono text-[10px] text-text-mute2 hover:text-cyan-DEFAULT transition-colors"
                          >
                            {isExpanded ? "▲ Hide" : "▼ Raw"}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setSelected(new Set([item.id]));
                                await applyAction("approve");
                              }}
                              className="font-mono text-[10px] text-text-mute2 hover:text-gold-protocol transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              onClick={async () => {
                                setSelected(new Set([item.id]));
                                await applyAction("reject");
                              }}
                              className="font-mono text-[10px] text-text-mute2 hover:text-red-bright transition-colors"
                            >
                              ✗
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id}-expanded`} className="border-b border-border-protocol/30">
                          <td colSpan={6} className="px-3 py-3 bg-void-1/40">
                            <pre className="font-mono text-[10px] text-text-dim whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                              {JSON.stringify(item.raw_data ?? {}, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center font-mono text-[12px] text-text-mute2">
                      Queue is clear — no items pending review.
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
