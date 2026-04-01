// lib/crypto/field-encrypt.ts
//
// Server-side field-level AES-256-GCM encryption.
// Simpler than vault.ts — uses a static env key rather than PIN/PBKDF2.
//
// Key setup (generate once):
//   openssl rand -hex 32   → set as FIELD_ENCRYPTION_KEY in Vercel dashboard
//
// All outputs are base64 strings (Supabase TEXT column safe).
// Uses globalThis.crypto.subtle — available Node.js 15+, all Vercel runtimes.

const IV_BYTES = 12; // GCM standard nonce size

// ── Key loading ───────────────────────────────────────────────────────────────

let _keyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (_keyPromise) return _keyPromise;
  _keyPromise = (async () => {
    const hex = process.env.FIELD_ENCRYPTION_KEY;
    if (!hex) {
      throw new Error(
        "[field-encrypt] FIELD_ENCRYPTION_KEY env var is not set. " +
        "Generate with: openssl rand -hex 32"
      );
    }
    if (hex.length !== 64) {
      throw new Error(
        "[field-encrypt] FIELD_ENCRYPTION_KEY must be 64 hex chars (32 bytes)"
      );
    }
    const keyBytes = Uint8Array.from(
      hex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
    );
    return globalThis.crypto.subtle.importKey(
      "raw",
      keyBytes.buffer as ArrayBuffer,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  })();
  return _keyPromise;
}

// ── Codec helpers (mirrors vault.ts for consistency) ──────────────────────────

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// ── Core encrypt/decrypt ──────────────────────────────────────────────────────

export interface FieldEncryptResult {
  ciphertext: string;  // base64 AES-GCM ciphertext + 16-byte auth tag
  iv:         string;  // base64 12-byte nonce
}

/**
 * Encrypts a plaintext string with the static env key.
 * Generates a fresh 12-byte IV on every call.
 */
export async function encryptField(plaintext: string): Promise<FieldEncryptResult> {
  const key = await getKey();
  const iv  = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const enc = new TextEncoder();

  const ctBuf = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    enc.encode(plaintext).buffer as ArrayBuffer
  );

  return {
    ciphertext: toB64(ctBuf),
    iv:         toB64(iv),
  };
}

/**
 * Decrypts a ciphertext produced by encryptField.
 * Throws DOMException if key is wrong or data is tampered (GCM auth failure).
 */
export async function decryptField(ciphertext: string, iv: string): Promise<string> {
  const key     = await getKey();
  const ivBytes = fromB64(iv);
  const ctBytes = fromB64(ciphertext);
  const dec     = new TextDecoder();

  const ptBuf = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer as ArrayBuffer },
    key,
    ctBytes.buffer as ArrayBuffer
  );

  return dec.decode(ptBuf);
}

// ── Coordinate helpers ────────────────────────────────────────────────────────

export interface EncryptedCoords {
  latEnc: string;
  latIv:  string;
  lngEnc: string;
  lngIv:  string;
}

/**
 * Encrypts exact lat/lng coordinates for secure storage.
 */
export async function encryptCoords(
  lat: number,
  lng: number
): Promise<EncryptedCoords> {
  const [latResult, lngResult] = await Promise.all([
    encryptField(String(lat)),
    encryptField(String(lng)),
  ]);
  return {
    latEnc: latResult.ciphertext,
    latIv:  latResult.iv,
    lngEnc: lngResult.ciphertext,
    lngIv:  lngResult.iv,
  };
}

/**
 * Decrypts lat/lng coordinates from storage.
 */
export async function decryptCoords(
  latEnc: string,
  latIv:  string,
  lngEnc: string,
  lngIv:  string
): Promise<{ lat: number; lng: number }> {
  const [latStr, lngStr] = await Promise.all([
    decryptField(latEnc, latIv),
    decryptField(lngEnc, lngIv),
  ]);
  return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
}

/**
 * Rounds a coordinate to `precision` decimal places (~1km at precision=2).
 * Safe for public display — does not reveal exact location.
 */
export function approxCoord(coord: number, precision = 2): number {
  const factor = Math.pow(10, precision);
  return Math.round(coord * factor) / factor;
}
