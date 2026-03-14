// lib/crypto/vault.ts
//
// Client-side AES-256-GCM encryption for Continuity Ledger sensitive fields.
//
// DESIGN PRINCIPLES:
//   1. PBKDF2 key derivation — PIN never stored, never transmitted.
//   2. Unique salt per entry — breaks dictionary attacks across entries.
//   3. Random 12-byte IV per encrypt — GCM nonce reuse is catastrophic.
//   4. 600K iterations — OWASP 2023 minimum for PBKDF2-SHA-256.
//   5. All output base64 strings — safe for JSON / Supabase TEXT columns.
//
// WebCrypto is available in all modern browsers (Chrome 37+, FF 34+, Safari 11+)
// and Node.js 15+ as `globalThis.crypto.subtle`.

const PBKDF2_ITERS  = 600_000;
const SALT_BYTES    = 16;
const IV_BYTES      = 12;
const enc           = new TextEncoder();
const dec           = new TextDecoder();

// ── Codec helpers ──────────────────────────────────────────────────────────

export function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

export function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// ── Key material ───────────────────────────────────────────────────────────

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

export function generateIv(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_BYTES));
}

/**
 * Derives a non-extractable AES-256-GCM CryptoKey from a user PIN.
 * The salt must be stored alongside the ciphertext — unique per entry.
 *
 * @param pin   User-supplied passphrase (never stored)
 * @param salt  16-byte random salt (stored as base64 in the ledger entry)
 */
export async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    "raw", enc.encode(pin).buffer as ArrayBuffer, "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERS, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,             // non-extractable
    ["encrypt", "decrypt"]
  );
}

export interface EncryptResult {
  ciphertext: string;  // base64 AES-GCM ciphertext + auth tag
  iv:         string;  // base64 12-byte nonce
  salt:       string;  // base64 16-byte PBKDF2 salt
}

/**
 * Encrypts a plaintext string with a PIN-derived key.
 * Generates fresh salt + IV on every call.
 */
export async function encryptPayload(
  pin: string,
  plaintext: string
): Promise<EncryptResult> {
  const salt  = generateSalt();
  const iv    = generateIv();
  const key   = await deriveKey(pin, salt);
  const ctBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    enc.encode(plaintext).buffer as ArrayBuffer
  );
  return {
    ciphertext: toB64(ctBuf),
    iv:         toB64(iv),
    salt:       toB64(salt),
  };
}

/**
 * Decrypts a ciphertext produced by encryptPayload.
 * Throws DOMException if the PIN is wrong or data is tampered (GCM auth failure).
 */
export async function decryptPayload(
  pin:        string,
  ciphertext: string,
  iv:         string,
  salt:       string
): Promise<string> {
  const key    = await deriveKey(pin, fromB64(salt));
  const ivBytes = fromB64(iv);
  const ctBytes = fromB64(ciphertext);
  const ptBuf  = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer as ArrayBuffer },
    key,
    ctBytes.buffer as ArrayBuffer
  );
  return dec.decode(ptBuf);
}
