// app/admin/envoys/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth }             from "@clerk/nextjs";
import { useRouter }           from "next/navigation";
import { FadeUp }              from "@/components/ui/motion";

interface EnvoyRow {
  id:               string;
  code:             string;
  clerk_user_id:    string;
  created_by:       string;
  is_active:        boolean;
  created_at:       string;
  referral_count:   number;
  total_commission: number;
}

export default function AdminEnvoysPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [envoys, setEnvoys]       = useState<EnvoyRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [userId, setUserId]       = useState("");
  const [creating, setCreating]   = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/admin/envoys");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/admin/envoys")
      .then((r) => r.json())
      .then((d) => { setEnvoys(d.envoys ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  async function createEnvoy() {
    if (!userId.trim()) return;
    setCreating(true);
    setCreateMsg("");
    try {
      const res = await fetch("/api/admin/envoys", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clerk_user_id: userId.trim() }),
      });
      const d = await res.json();
      if (!res.ok) { setCreateMsg(`✗ ${d.error}`); return; }
      setCreateMsg(`✓ Code issued: ${d.code}`);
      setUserId("");
      setShowForm(false);
      // Prepend to list
      setEnvoys((prev) => [{
        id:               crypto.randomUUID(),
        code:             d.code,
        clerk_user_id:    d.clerk_user_id,
        created_by:       "",
        is_active:        true,
        created_at:       new Date().toISOString(),
        referral_count:   0,
        total_commission: 0,
      }, ...prev]);
    } catch (e) {
      setCreateMsg(`✗ ${e}`);
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(envoy: EnvoyRow) {
    const next = !envoy.is_active;
    await fetch(`/api/admin/envoys/${envoy.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_active: next }),
    });
    setEnvoys((es) => es.map((e) => e.id === envoy.id ? { ...e, is_active: next } : e));
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-void-0 text-text-base px-6 py-10 max-w-6xl mx-auto">
      <FadeUp>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-syne font-bold text-[24px] text-text-base">Envoy Network</h1>
            <p className="font-mono text-[11px] text-text-mute2 mt-0.5">
              Referral codes · attribution · commissions
            </p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setCreateMsg(""); }}
            className="font-mono font-bold text-[11px] px-4 py-2 rounded-lg
                       bg-gold-protocol text-void-0 hover:bg-gold-bright
                       hover:-translate-y-0.5 transition-all"
          >
            + Create Envoy
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6 p-5 bg-void-1 border border-border-protocol rounded-xl">
            <h2 className="font-syne font-bold text-[15px] mb-4 text-text-base">
              Issue Envoy Code
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Clerk User ID (user_xxxxxxxx)"
                className="flex-1 bg-void-2 border border-border-protocol rounded-lg px-3 py-2
                           font-mono text-[12px] text-text-base placeholder:text-text-mute2
                           focus:outline-none focus:border-gold-protocol/60"
              />
              <button
                onClick={createEnvoy}
                disabled={creating || !userId.trim()}
                className="font-mono font-bold text-[11px] px-5 py-2 rounded-lg
                           bg-gold-protocol text-void-0 hover:bg-gold-bright
                           hover:-translate-y-0.5 transition-all disabled:opacity-40"
              >
                {creating ? "Issuing…" : "Issue Code"}
              </button>
            </div>
            {createMsg && (
              <p className={`mt-3 font-mono text-[11px] ${
                createMsg.startsWith("✓") ? "text-green-bright" : "text-red-bright"
              }`}>
                {createMsg}
              </p>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-void-2 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="border border-border-protocol rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-protocol bg-void-1">
                  {["Code", "Clerk User ID", "Referrals", "Commission", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="font-mono text-[9px] text-text-mute2 uppercase tracking-[.1em] px-3 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {envoys.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border-protocol/50 hover:bg-void-1/60 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold text-[12px] text-gold-protocol tracking-wider">
                        {e.code}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[10px] text-text-dim truncate max-w-[140px] block">
                        {e.clerk_user_id}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px] tabular-nums text-text-base">
                        {e.referral_count}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[11px] tabular-nums text-gold-protocol">
                        ${e.total_commission.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                        e.is_active
                          ? "text-green-bright bg-green-bright/10 border-green-bright/30"
                          : "text-text-mute2 bg-glass-DEFAULT border-border-protocol"
                      }`}>
                        {e.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[10px] text-text-mute2">
                        {new Date(e.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => toggleActive(e)}
                        className={`font-mono text-[10px] transition-colors ${
                          e.is_active
                            ? "text-text-mute2 hover:text-red-bright"
                            : "text-text-mute2 hover:text-green-bright"
                        }`}
                      >
                        {e.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {envoys.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center font-mono text-[12px] text-text-mute2">
                      No envoys yet. Issue the first code.
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
