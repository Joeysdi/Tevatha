"use client";

import {
  useState, useEffect, useCallback, useRef, type ReactNode
} from "react";
import { useUser }             from "@clerk/nextjs";
import { useSupabaseClient }   from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import { VaultLock } from "@/components/protocol/vault-lock";
import {
  upsertEntry, getAllEntries, enqueue, getSyncQueue,
  removeSyncItem, markSynced,
  storePinAuth, getPinAuth,
  type LedgerEntry, type LedgerCategory, type BlueprintData,
} from "@/lib/idb/ledger-store";
import {
  encryptPayload, decryptPayload, toB64, fromB64,
} from "@/lib/crypto/vault";

// ── Types ───────────────────────────────────────────────────────────────────

type ViewState = "pin-gate" | "pin-create" | "overview" | "add" | "view-entry";

const CATEGORIES: { id: LedgerCategory; label: string; icon: string; encrypted: boolean }[] = [
  { id:"crypto_custody",         label:"Crypto Custody",       icon:"🔐", encrypted:true  },
  { id:"blueprint",              label:"Bunker Blueprints",     icon:"⬡",  encrypted:false },
  { id:"emergency_contact",      label:"Emergency Contacts",    icon:"📡", encrypted:true  },
  { id:"access_protocol",        label:"Access Protocols",      icon:"◉",  encrypted:true  },
  { id:"financial_architecture", label:"Financial Architecture",icon:"◈",  encrypted:true  },
];

const PRIORITY_LABEL: Record<1|2|3, string> = {
  1:"CRITICAL", 2:"HIGH", 3:"STANDARD",
};
const PRIORITY_COL: Record<1|2|3, string> = {
  1:"text-red-bright border-red-DEFAULT/30 bg-red-dim",
  2:"text-amber-protocol border-amber-DEFAULT/25 bg-amber-dim",
  3:"text-text-dim border-border-protocol bg-glass-DEFAULT",
};

// ── Utility components ──────────────────────────────────────────────────────

function MonoBadge({ children, className="" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono
                      font-bold tracking-[.08em] border ${className}`}>
      {children}
    </span>
  );
}

function SyncIndicator({ online, pending }: { online: boolean; pending: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-protocol animate-pulse" : "bg-red-bright"}`}/>
      <span className="font-mono text-[9px] text-text-mute2 tracking-[.12em]">
        {online ? "ONLINE" : "OFFLINE"}
      </span>
      {pending > 0 && (
        <span className="font-mono text-[9px] text-amber-protocol">
          {pending} UNSYNCED
        </span>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function LedgerPage() {
  const { user }  = useUser();
  const supabase  = useSupabaseClient();

  // ── State ──────────────────────────────────────────────────────────────
  const [view,      setView]     = useState<ViewState>("pin-gate");
  const [entries,   setEntries]  = useState<LedgerEntry[]>([]);
  const [selected,  setSelected] = useState<LedgerEntry | null>(null);
  const [decrypted, setDecrypted]= useState<string | null>(null);
  const [activeTab, setTab]      = useState<LedgerCategory | "all">("all");
  const [online,    setOnline]   = useState(true);
  const [pendingSync, setPending]= useState(0);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState<string | null>(null);

  // VaultLock + PIN gate state
  const [unlocking,  setUnlocking]  = useState(false);
  const [pinShake,   setPinShake]   = useState(false);
  const [hasPinAuth, setHasPinAuth] = useState<boolean | null>(null);

  // PIN is held in a ref — never in React state (prevents accidental serialisation)
  const pinRef = useRef<string>("");

  // ── Check for existing PIN hash on mount ───────────────────────────────
  useEffect(() => {
    getPinAuth().then((r) => setHasPinAuth(!!r));
  }, []);

  // ── PIN helpers ─────────────────────────────────────────────────────────
  const validatePin = useCallback(async (pin: string): Promise<"valid" | "invalid"> => {
    const stored = await getPinAuth();
    if (!stored) return "invalid";
    const saltBytes = fromB64(stored.salt);
    const enc = new TextEncoder();
    const combined = new Uint8Array([...saltBytes, ...enc.encode(pin)]);
    const hashBuf = await crypto.subtle.digest("SHA-256", combined);
    return toB64(hashBuf) === stored.hash ? "valid" : "invalid";
  }, []);

  const setupPin = useCallback(async (pin: string): Promise<void> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const enc = new TextEncoder();
    const combined = new Uint8Array([...salt, ...enc.encode(pin)]);
    const hashBuf = await crypto.subtle.digest("SHA-256", combined);
    await storePinAuth(salt, new Uint8Array(hashBuf));
  }, []);

  // ── Network status ─────────────────────────────────────────────────────
  useEffect(() => {
    const online  = () => setOnline(true);
    const offline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online",  online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online",  online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  // ── Flush sync queue when reconnecting ─────────────────────────────────
  useEffect(() => {
    if (!online || !user) return;
    void flushSyncQueue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, user]);

  const flushSyncQueue = useCallback(async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        if (item.operation === "insert" || item.operation === "update") {
          const e = item.payload as LedgerEntry;
          await supabase.from("continuity_ledger").upsert({
            id:               e.id,
            user_id:          e.userId,
            category:         e.category,
            title:            e.title,
            encrypted_payload:e.encryptedPayload,
            iv:               e.iv,
            salt:             e.salt,
            blueprint_data:   e.blueprintData,
            priority:         e.priority,
            created_at:       e.createdAt,
            updated_at:       e.updatedAt,
          }, { onConflict: "id" });
        }
        await markSynced((item.payload as LedgerEntry).id);
        await removeSyncItem(item.id);
      } catch {
        // Leave in queue — will retry on next reconnect
      }
    }
    const remaining = await getSyncQueue();
    setPending(remaining.length);
  }, [supabase]);

  // ── Load entries ────────────────────────────────────────────────────────
  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      if (online && user) {
        // Attempt Supabase fetch
        const { data, error: sbErr } = await supabase
          .from("continuity_ledger")
          .select("*")
          .order("priority", { ascending: true })
          .order("updated_at", { ascending: false });

        if (!sbErr && data) {
          // Hydrate IDB with fresh server data
          for (const row of data) {
            const entry: LedgerEntry = {
              id:               row.id,
              userId:           row.user_id,
              category:         row.category as LedgerCategory,
              title:            row.title,
              encryptedPayload: row.encrypted_payload ?? null,
              iv:               row.iv ?? null,
              salt:             row.salt ?? null,
              blueprintData:    row.blueprint_data as BlueprintData | null,
              priority:         (row.priority ?? 1) as 1|2|3,
              synced:           true,
              createdAt:        row.created_at,
              updatedAt:        row.updated_at,
            };
            await upsertEntry(entry);
          }
        }
      }
      // Always read final state from IDB (source of truth for display)
      const local = await getAllEntries();
      setEntries(local.sort((a, b) => a.priority - b.priority));
      const queue = await getSyncQueue();
      setPending(queue.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [online, user, supabase]);

  // ── PIN unlock (returning user) ─────────────────────────────────────────
  const handleUnlock = useCallback(async (pin: string) => {
    setError(null);
    const result = await validatePin(pin);
    if (result === "invalid") {
      setPinShake(true);
      setTimeout(() => setPinShake(false), 500);
      setError("Incorrect PIN");
      return;
    }
    setUnlocking(true);
    await new Promise((r) => setTimeout(r, 650)); // padlock spring animation
    pinRef.current = pin;
    await loadEntries();
    setView("overview");
  }, [validatePin, loadEntries]);

  // ── PIN create (first-time user) ────────────────────────────────────────
  const handleCreatePin = useCallback(async (pin: string, confirm: string) => {
    setError(null);
    if (pin.length < 4) {
      setError("PIN must be at least 4 characters");
      return;
    }
    if (pin !== confirm) {
      setPinShake(true);
      setTimeout(() => setPinShake(false), 500);
      setError("PINs do not match");
      return;
    }
    await setupPin(pin);
    setHasPinAuth(true);
    setUnlocking(true);
    await new Promise((r) => setTimeout(r, 650));
    pinRef.current = pin;
    await loadEntries();
    setView("overview");
  }, [setupPin, loadEntries]);

  // ── Lock (wipe in-memory PIN) ───────────────────────────────────────────
  const lock = useCallback(() => {
    pinRef.current = "";
    setDecrypted(null);
    setSelected(null);
    setEntries([]);
    setView("pin-gate");
  }, []);

  // ── Decrypt and view entry ──────────────────────────────────────────────
  const viewEntry = useCallback(async (entry: LedgerEntry) => {
    setSelected(entry);
    setDecrypted(null);
    if (entry.encryptedPayload && entry.iv && entry.salt) {
      try {
        const plain = await decryptPayload(
          pinRef.current,
          entry.encryptedPayload,
          entry.iv,
          entry.salt
        );
        setDecrypted(plain);
      } catch {
        setDecrypted("⚠ Decryption failed — incorrect PIN or tampered data.");
      }
    }
    setView("view-entry");
  }, []);

  // ── Add new entry ───────────────────────────────────────────────────────
  const addEntry = useCallback(async (draft: {
    category:      LedgerCategory;
    title:         string;
    plaintext:     string;
    blueprintData: BlueprintData | null;
    priority:      1|2|3;
  }) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const catMeta = CATEGORIES.find((c) => c.id === draft.category)!;
      const now     = new Date().toISOString();
      const id      = crypto.randomUUID();

      let encResult = { ciphertext: null as string|null, iv: null as string|null, salt: null as string|null };

      if (catMeta.encrypted && draft.plaintext.trim()) {
        const enc = await encryptPayload(pinRef.current, draft.plaintext);
        encResult = { ciphertext: enc.ciphertext, iv: enc.iv, salt: enc.salt };
      }

      const entry: LedgerEntry = {
        id,
        userId:           user.id,
        category:         draft.category,
        title:            draft.title,
        encryptedPayload: encResult.ciphertext,
        iv:               encResult.iv,
        salt:             encResult.salt,
        blueprintData:    draft.blueprintData,
        priority:         draft.priority,
        synced:           false,
        createdAt:        now,
        updatedAt:        now,
      };

      // Write to IDB immediately (offline-safe)
      await upsertEntry(entry);
      await enqueue("insert", entry);

      // Attempt Supabase write
      if (online) {
        const { error: sbErr } = await supabase
          .from("continuity_ledger")
          .insert({
            id,
            user_id:          entry.userId,
            category:         entry.category,
            title:            entry.title,
            encrypted_payload:entry.encryptedPayload,
            iv:               entry.iv,
            salt:             entry.salt,
            blueprint_data:   entry.blueprintData,
            priority:         entry.priority,
            created_at:       now,
            updated_at:       now,
          });

        if (!sbErr) {
          await markSynced(id);
          await removeSyncItem(id); // not in queue yet, but safe
        }
      }

      await loadEntries();
      setView("overview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save entry");
    } finally {
      setLoading(false);
    }
  }, [user, online, supabase, loadEntries]);

  // ── Filtered entries ────────────────────────────────────────────────────
  const visible = activeTab === "all"
    ? entries
    : entries.filter((e) => e.category === activeTab);

  // ── Render ──────────────────────────────────────────────────────────────

  if (view === "pin-gate") {
    return (
      <PinGate
        hasPinAuth={hasPinAuth}
        unlocking={unlocking}
        pinShake={pinShake}
        error={error}
        onUnlock={handleUnlock}
        onCreatePin={handleCreatePin}
      />
    );
  }

  if (view === "add") {
    return (
      <AddEntryForm
        onAdd={addEntry}
        onCancel={() => setView("overview")}
        loading={loading}
        error={error}
      />
    );
  }

  if (view === "view-entry" && selected) {
    return (
      <EntryDetail
        entry={selected}
        decrypted={decrypted}
        onBack={() => { setSelected(null); setDecrypted(null); setView("overview"); }}
      />
    );
  }

  // ── Overview ────────────────────────────────────────────────────────────
  return (
    <FadeUp>
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

      {/* Header */}
      <header className="border-b border-border-protocol pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[9.5px] text-gold-DEFAULT
                           tracking-[.22em] uppercase mb-3">
              Protocol · Continuity Ledger
            </p>
            <h1 className="font-syne font-extrabold text-[clamp(24px,5vw,34px)]
                            text-text-base leading-tight mb-2">
              Zero-Hour{" "}
              <span className="text-gold-DEFAULT">Continuity</span>
            </h1>
            <p className="text-text-dim text-[13px] max-w-lg leading-relaxed">
              Offline-capable. PIN-encrypted. Supabase-synced when online.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <SyncIndicator online={online} pending={pendingSync} />
            <button onClick={lock}
              className="font-mono text-[9px] text-text-mute2 hover:text-red-bright
                         transition-colors tracking-[.1em]">
              LOCK SESSION ×
            </button>
          </div>
        </div>
      </header>

      {/* Category tabs */}
      <nav className="flex flex-wrap gap-1.5 p-1 bg-void-2
                      border border-border-protocol rounded-card-lg">
        {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id) => {
          const cat = CATEGORIES.find((c) => c.id === id);
          return (
            <button key={id} onClick={() => setTab(id as typeof activeTab)}
              className={`px-3.5 py-1.5 text-[11px] font-mono font-medium transition-all duration-150
                          ${activeTab === id
                            ? "border-b-2 border-cyan-DEFAULT text-cyan-DEFAULT"
                            : "text-text-mute2 hover:text-text-base"}`}>
              {cat ? `${cat.icon} ${cat.label}` : "All"}
            </button>
          );
        })}
        <button onClick={() => setView("add")}
          className="ml-auto px-4 py-1.5 text-[10px] font-mono font-bold
                     tracking-[.1em] rounded-card bg-gold-DEFAULT text-void-0
                     hover:bg-gold-bright transition-colors">
          + ADD ENTRY
        </button>
      </nav>

      {/* Entry list */}
      {loading ? (
        <div className="text-center py-16">
          <p className="font-mono text-[10px] text-text-mute2 tracking-[.2em]
                         animate-pulse">LOADING…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 border border-border-protocol
                         rounded-card-lg bg-glass-DEFAULT">
          <p className="font-mono text-[10px] text-text-mute2 tracking-[.14em]">
            NO ENTRIES — ADD YOUR FIRST LEDGER RECORD
          </p>
        </div>
      ) : (
        <StaggerParent className="grid gap-3">
          {visible.map((entry) => {
            const cat = CATEGORIES.find((c) => c.id === entry.category)!;
            return (
              <StaggerChild key={entry.id}>
              <button onClick={() => void viewEntry(entry)}
                className="w-full text-left border-l-2 border-cyan-DEFAULT/60 bg-void-1 rounded-lg
                           px-4 py-3 mb-2 transition-all duration-200
                           hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,212,255,0.08)]
                           group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="font-syne font-bold text-[14px] text-text-base
                                    truncate group-hover:text-text-base">
                        {entry.title}
                      </p>
                      <p className="font-mono text-[9.5px] text-text-mute2 mt-0.5">
                        {cat.label}
                        {cat.encrypted && (
                          <span className="ml-2 text-cyan-DEFAULT">⟨encrypted⟩</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <MonoBadge className={PRIORITY_COL[entry.priority]}>
                      {PRIORITY_LABEL[entry.priority]}
                    </MonoBadge>
                    {!entry.synced && (
                      <MonoBadge className="text-amber-protocol border-amber-DEFAULT/25 bg-amber-dim">
                        UNSYNCED
                      </MonoBadge>
                    )}
                  </div>
                </div>
              </button>
              </StaggerChild>
            );
          })}
        </StaggerParent>
      )}
    </div>
    </FadeUp>
  );
}

// ── PIN Gate ────────────────────────────────────────────────────────────────

function PinGate({
  hasPinAuth, unlocking, pinShake, error, onUnlock, onCreatePin,
}: {
  hasPinAuth:   boolean | null;
  unlocking:    boolean;
  pinShake:     boolean;
  error:        string | null;
  onUnlock:     (pin: string) => void;
  onCreatePin:  (pin: string, confirm: string) => void;
}) {
  const [mode,    setMode]    = useState<"unlock" | "create" | null>(null);
  const [pin,     setPin]     = useState("");
  const [confirm, setConfirm] = useState("");

  // Once hasPinAuth resolves, set initial mode
  useEffect(() => {
    if (hasPinAuth === null) return;
    setMode(hasPinAuth ? "unlock" : "create");
  }, [hasPinAuth]);

  if (hasPinAuth === null || mode === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="font-mono text-[10px] text-text-mute2 tracking-[.2em] animate-pulse">
          LOADING…
        </p>
      </div>
    );
  }

  const isCreate = mode === "create";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <FadeUp className="w-full max-w-sm">
        <div
          className="rounded-2xl border border-cyan-border bg-void-1 p-10 relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 40px rgba(0,212,255,0.08)" }}
        >
          {/* CYAN top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,#00d4ff,transparent)" }}
          />

          {/* VaultLock */}
          <div className="w-20 h-24 mx-auto mb-6">
            <VaultLock locked={!unlocking} />
          </div>

          <h2 className="font-syne font-bold text-[17px] text-cyan-DEFAULT text-center mb-1">
            {isCreate ? "CREATE VAULT PIN" : "UNLOCK VAULT"}
          </h2>
          <p className="font-mono text-[9.5px] text-text-mute2 text-center mb-6">
            {isCreate
              ? "First-time setup · PIN never leaves your device"
              : "Protocol · Continuity Ledger"}
          </p>

          {/* Shake wrapper */}
          <motion.div
            animate={pinShake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <input
              type="password"
              placeholder={isCreate ? "New PIN" : "· · · ·"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (isCreate) {
                  onCreatePin(pin, confirm);
                } else {
                  onUnlock(pin);
                }
              }}
              autoFocus
              className="w-full bg-void-3 border border-cyan-border rounded-lg px-4 py-3
                         font-mono text-center text-[18px] tracking-[.3em] text-text-base
                         placeholder:text-text-mute2 focus:outline-none
                         focus:border-cyan-DEFAULT transition-colors"
            />

            {isCreate && (
              <input
                type="password"
                placeholder="Confirm PIN"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreatePin(pin, confirm)}
                className="w-full bg-void-3 border border-cyan-border rounded-lg px-4 py-3
                           font-mono text-center text-[18px] tracking-[.3em] text-text-base
                           placeholder:text-text-mute2 focus:outline-none
                           focus:border-cyan-DEFAULT transition-colors"
              />
            )}
          </motion.div>

          {error && (
            <p className="font-mono text-[10px] text-red-bright text-center mt-3">{error}</p>
          )}

          <button
            onClick={() => isCreate ? onCreatePin(pin, confirm) : onUnlock(pin)}
            disabled={unlocking || !pin}
            className="mt-4 w-full bg-cyan-DEFAULT/10 border border-cyan-border
                       text-cyan-DEFAULT font-mono font-bold py-3 rounded-lg
                       hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,212,255,0.2)]
                       transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {unlocking ? "OPENING…" : isCreate ? "CREATE VAULT" : "UNLOCK VAULT"}
          </button>

          {!isCreate && (
            <button
              onClick={() => { setMode("create"); setPin(""); setConfirm(""); }}
              className="mt-3 w-full font-mono text-[10px] text-text-mute2
                         hover:text-text-dim transition-colors text-center"
            >
              Create new vault ↗
            </button>
          )}

          {isCreate && (
            <p className="font-mono text-[9px] text-text-mute2 text-center mt-3">
              There is no recovery method. Remember this PIN.
            </p>
          )}
        </div>
      </FadeUp>
    </div>
  );
}

// ── Entry Detail ────────────────────────────────────────────────────────────

function EntryDetail({
  entry, decrypted, onBack,
}: { entry: LedgerEntry; decrypted: string | null; onBack: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === entry.category)!;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <button onClick={onBack}
        className="font-mono text-[10px] text-text-mute2 hover:text-gold-DEFAULT
                   transition-colors tracking-[.1em]">
        ← BACK TO LEDGER
      </button>

      <header className="border-b border-border-protocol pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{cat.icon}</span>
          <div>
            <p className="font-mono text-[9px] text-text-mute2 tracking-[.12em] uppercase">
              {cat.label}
            </p>
            <h1 className="font-syne font-extrabold text-[22px] text-text-base">
              {entry.title}
            </h1>
          </div>
          <MonoBadge className={`ml-auto ${PRIORITY_COL[entry.priority]}`}>
            {PRIORITY_LABEL[entry.priority]}
          </MonoBadge>
        </div>
        <p className="font-mono text-[9px] text-text-mute2">
          CREATED {new Date(entry.createdAt).toLocaleString("en-GB")}
          {" · "}UPDATED {new Date(entry.updatedAt).toLocaleString("en-GB")}
        </p>
      </header>

      {/* Encrypted payload */}
      {cat.encrypted && (
        <div className="bg-glass-protocol border border-border-protocol
                         rounded-card-lg p-5">
          <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.14em]
                         uppercase mb-3">Decrypted Content</p>
          {decrypted ? (
            <pre className="font-mono text-[12px] text-text-base whitespace-pre-wrap
                             leading-relaxed bg-void-3 rounded-card p-4
                             overflow-auto max-h-80">
              {decrypted}
            </pre>
          ) : (
            <p className="font-mono text-[11px] text-text-mute2 animate-pulse">
              Decrypting…
            </p>
          )}
        </div>
      )}

      {/* Blueprint data */}
      {entry.blueprintData && (
        <BlueprintPanel data={entry.blueprintData} />
      )}
    </div>
  );
}

// ── Blueprint Panel ─────────────────────────────────────────────────────────

function BlueprintPanel({ data }: { data: BlueprintData }) {
  return (
    <div className="space-y-4">
      <div className="bg-glass-protocol border border-border-protocol
                       rounded-card-lg p-5">
        <p className="font-mono text-[9px] text-gold-DEFAULT tracking-[.14em]
                       uppercase mb-3">Location</p>
        <p className="font-syne font-bold text-[15px] text-text-base mb-1">
          {data.location}
        </p>
        {data.coordinates && (
          <p className="font-mono text-[10px] text-text-mute2">
            {data.coordinates.lat.toFixed(5)}, {data.coordinates.lng.toFixed(5)}
            {data.elevationM && ` · ${data.elevationM}m`}
          </p>
        )}
        {data.notes && (
          <p className="mt-3 text-[12px] text-text-dim leading-relaxed">{data.notes}</p>
        )}
      </div>

      {data.accessRoutes.length > 0 && (
        <div className="bg-glass-protocol border border-border-protocol
                         rounded-card-lg p-5">
          <p className="font-mono text-[9px] text-gold-DEFAULT tracking-[.14em]
                         uppercase mb-3">Access Routes</p>
          <div className="space-y-2">
            {data.accessRoutes.map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-[12px]">
                <MonoBadge className={
                  r.condition === "primary"   ? "text-green-protocol border-green-bright/30 bg-green-dim" :
                  r.condition === "secondary" ? "text-gold-DEFAULT border-gold-dim bg-gold-glow" :
                  "text-amber-protocol border-amber-DEFAULT/25 bg-amber-dim"
                }>
                  {r.condition.toUpperCase()}
                </MonoBadge>
                <span className="text-text-dim">{r.direction} · {r.distance}</span>
                <span className="text-text-mute2 ml-auto">{r.landmark}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.utilities.length > 0 && (
        <div className="bg-glass-protocol border border-border-protocol
                         rounded-card-lg p-5">
          <p className="font-mono text-[9px] text-gold-DEFAULT tracking-[.14em]
                         uppercase mb-3">Utilities</p>
          <div className="grid gap-2">
            {data.utilities.map((u, i) => (
              <div key={i}
                className="flex items-center gap-3 text-[12px] py-2
                           border-b border-border-protocol last:border-0">
                <span className="font-mono text-[10px] text-text-mute2
                                  w-16 flex-shrink-0 uppercase">{u.system}</span>
                <span className={`font-mono text-[9px] font-bold
                  ${u.status==="operational" ? "text-green-protocol" :
                    u.status==="standby"     ? "text-amber-protocol" : "text-text-mute2"}`}>
                  {u.status.toUpperCase()}
                </span>
                <span className="text-text-dim">{u.capacity}</span>
                {u.notes && <span className="text-text-mute2 ml-auto text-[11px]">{u.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Entry Form ──────────────────────────────────────────────────────────

function AddEntryForm({
  onAdd, onCancel, loading, error,
}: {
  onAdd:    (d: { category:LedgerCategory; title:string; plaintext:string;
                  blueprintData:BlueprintData|null; priority:1|2|3 }) => void;
  onCancel: () => void;
  loading:  boolean;
  error:    string | null;
}) {
  const [category,  setCat ]    = useState<LedgerCategory>("crypto_custody");
  const [title,     setTitle]   = useState("");
  const [plaintext, setPlain]   = useState("");
  const [priority,  setPri]     = useState<1|2|3>(1);

  const catMeta = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <button onClick={onCancel}
        className="font-mono text-[10px] text-text-mute2 hover:text-gold-DEFAULT
                   transition-colors tracking-[.1em]">
        ← CANCEL
      </button>

      <header>
        <p className="font-mono text-[9.5px] text-gold-DEFAULT tracking-[.22em]
                       uppercase mb-2">New Ledger Entry</p>
        <h1 className="font-syne font-extrabold text-[24px] text-text-base">
          Add Record
        </h1>
      </header>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="block font-mono text-[9px] text-text-mute2
                             tracking-[.12em] uppercase mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`px-3 py-1.5 rounded-card font-mono text-[10px]
                            border transition-all duration-150
                            ${category === c.id
                              ? "bg-gold-glow text-gold-DEFAULT border-gold-dim"
                              : "text-text-mute2 border-border-protocol hover:text-text-base"}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block font-mono text-[9px] text-text-mute2
                             tracking-[.12em] uppercase mb-2">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Primary Hardware Wallet — Ledger X"
            className="w-full bg-void-3 border border-border-protocol rounded-card
                        px-4 py-2.5 font-mono text-[12px] text-text-base
                        placeholder:text-text-mute2 focus:outline-none
                        focus:border-gold-DEFAULT transition-colors" />
        </div>

        {/* Sensitive content */}
        {catMeta.encrypted && (
          <div>
            <label className="block font-mono text-[9px] text-text-mute2
                               tracking-[.12em] uppercase mb-2">
              Sensitive Content
              <span className="ml-2 text-cyan-DEFAULT">⟨ encrypted with your PIN ⟩</span>
            </label>
            <textarea value={plaintext} onChange={(e) => setPlain(e.target.value)}
              rows={6}
              placeholder="Enter any sensitive data — seed phrase locations, wallet addresses, access keys…"
              className="w-full bg-void-3 border border-border-protocol rounded-card
                          px-4 py-3 font-mono text-[12px] text-text-base
                          placeholder:text-text-mute2 focus:outline-none
                          focus:border-cyan-DEFAULT transition-colors resize-none" />
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="block font-mono text-[9px] text-text-mute2
                             tracking-[.12em] uppercase mb-2">Priority</label>
          <div className="flex gap-2">
            {([1,2,3] as const).map((p) => (
              <button key={p} onClick={() => setPri(p)}
                className={`flex-1 py-2 rounded-card font-mono text-[10px]
                            font-bold border transition-all duration-150
                            ${priority === p
                              ? PRIORITY_COL[p]
                              : "text-text-mute2 border-border-protocol"}`}>
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="font-mono text-[10px] text-red-bright">{error}</p>
        )}

        <button
          disabled={!title.trim() || loading}
          onClick={() => onAdd({ category, title, plaintext, blueprintData: null, priority })}
          className="w-full bg-gold-DEFAULT text-void-0 font-mono font-bold
                      text-[11px] tracking-[.1em] py-3 rounded-card
                      hover:bg-gold-bright transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "ENCRYPTING & SAVING…" : "SAVE TO LEDGER →"}
        </button>
      </div>
    </div>
  );
}
