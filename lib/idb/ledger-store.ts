// lib/idb/ledger-store.ts
//
// Offline-first IndexedDB store for Continuity Ledger data.
//
// SCHEMA:
//   ledger_entries  — local mirror of continuity_ledger Supabase table
//   sync_queue      — pending mutations to flush when network returns
//
// SYNC PATTERN:
//   Online:  Supabase → IDB (read-through cache)
//   Offline: IDB only (reads + buffered writes)
//   Reconnect: flush sync_queue → Supabase → mark entries synced

import { openDB, type IDBPDatabase, type DBSchema } from "idb";

// ── Shared types (mirrored by Supabase database.types.ts) ─────────────────

export type LedgerCategory =
  | "crypto_custody"
  | "blueprint"
  | "emergency_contact"
  | "access_protocol"
  | "financial_architecture";

export interface BlueprintData {
  location:       string;
  coordinates?:   { lat: number; lng: number };
  elevationM?:    number;
  accessRoutes:   AccessRoute[];
  structures:     Structure[];
  utilities:      UtilitySpec[];
  notes:          string;
}

interface AccessRoute {
  direction: string;
  distance:  string;
  landmark:  string;
  condition: "primary" | "secondary" | "emergency";
}

interface Structure {
  name:        string;
  type:        string;
  sqm:         number;
  underground: boolean;
  notes:       string;
}

interface UtilitySpec {
  system:   "water" | "power" | "comms" | "food" | "security";
  status:   "operational" | "standby" | "planned";
  capacity: string;
  notes:    string;
}

export interface LedgerEntry {
  id:               string;
  userId:           string;
  category:         LedgerCategory;
  title:            string;
  encryptedPayload: string | null;   // AES-256-GCM ciphertext (base64)
  iv:               string | null;   // 12-byte IV (base64)
  salt:             string | null;   // PBKDF2 salt (base64)
  blueprintData:    BlueprintData | null;
  priority:         1 | 2 | 3;
  synced:           boolean;
  createdAt:        string;          // ISO 8601
  updatedAt:        string;
}

export type SyncOperation = "insert" | "update" | "delete";

interface SyncQueueItem {
  id:        string;           // random UUID per queue item
  operation: SyncOperation;
  entryId:   string;           // target ledger entry ID
  payload:   LedgerEntry | { id: string };  // full entry for insert/update, id-only for delete
  queuedAt:  string;
}

// ── IDB schema ─────────────────────────────────────────────────────────────

interface TevathaDB extends DBSchema {
  ledger_entries: {
    key:     string;
    value:   LedgerEntry;
    indexes: {
      by_category: LedgerCategory;
      by_updated:  string;
      by_synced:   0 | 1;    // IDB indexes don't natively handle booleans
    };
  };
  sync_queue: {
    key:   string;
    value: SyncQueueItem;
  };
}

let _db: IDBPDatabase<TevathaDB> | null = null;

const DB_NAME    = "tevatha-ledger";
const DB_VERSION = 1;

export async function getDB(): Promise<IDBPDatabase<TevathaDB>> {
  if (_db) return _db;

  _db = await openDB<TevathaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore("ledger_entries", { keyPath: "id" });
      store.createIndex("by_category", "category");
      store.createIndex("by_updated",  "updatedAt");
      // Store boolean as 0/1 for IDB index compatibility
      store.createIndex("by_synced",   "synced");

      db.createObjectStore("sync_queue", { keyPath: "id" });
    },
  });

  return _db;
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function upsertEntry(entry: LedgerEntry): Promise<void> {
  const db = await getDB();
  await db.put("ledger_entries", entry);
}

export async function getAllEntries(): Promise<LedgerEntry[]> {
  const db = await getDB();
  return db.getAll("ledger_entries");
}

export async function getEntriesByCategory(cat: LedgerCategory): Promise<LedgerEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex("ledger_entries", "by_category", cat);
}

export async function getEntry(id: string): Promise<LedgerEntry | undefined> {
  const db = await getDB();
  return db.get("ledger_entries", id);
}

/** Returns all entries not yet confirmed synced to Supabase. */
export async function getUnsyncedEntries(): Promise<LedgerEntry[]> {
  const db = await getDB();
  // IDB stores `synced` as boolean; getAllFromIndex works with native bool in idb v8
  const all = await db.getAll("ledger_entries");
  return all.filter((e) => !e.synced);
}

export async function markSynced(id: string): Promise<void> {
  const db    = await getDB();
  const entry = await db.get("ledger_entries", id);
  if (entry) await db.put("ledger_entries", { ...entry, synced: true });
}

// ── Sync queue ─────────────────────────────────────────────────────────────

export async function enqueue(
  op:    SyncOperation,
  entry: LedgerEntry
): Promise<void> {
  const db = await getDB();
  await db.put("sync_queue", {
    id:        crypto.randomUUID(),
    operation: op,
    entryId:   entry.id,
    payload:   entry,
    queuedAt:  new Date().toISOString(),
  });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll("sync_queue");
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sync_queue", id);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear("sync_queue");
}
