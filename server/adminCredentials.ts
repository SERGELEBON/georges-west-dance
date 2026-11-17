import { createCipheriv, createDecipheriv, createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import { hasBlobStore } from "./contentStore";

/**
 * Admin sign-in credentials (email + password).
 *
 * - First sign-in: email = ADMIN_EMAIL (or DEFAULT_ADMIN_EMAIL), password = ADMIN_PASSWORD (Vercel env).
 * - Once changed from the dashboard (Account tab), the new email + scrypt password hash are stored
 *   in Vercel Blob, ENCRYPTED with AES-256-GCM (key derived from ADMIN_SESSION_SECRET), so the
 *   stored file reveals nothing even if its URL leaked. The stored record then replaces the env values.
 * - Recovery: delete the `auth/` file in Vercel → Storage → Blob; sign-in falls back to the env values.
 */

export const DEFAULT_ADMIN_EMAIL = "guehipoegnansergej@gmail.com";
const PREFIX = "auth/admin-";
const LOCAL_FILE = path.resolve(process.cwd(), ".data", "admin-credentials.json");
const CACHE_MS = 15_000;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

type StoredCredentials = { email: string; salt: string; hash: string; updatedAt: string };
export type ActiveCredentials = { email: string; source: "dashboard" | "env"; version: string; check: (password: string) => Promise<boolean> };

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const sessionSecret = () => process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "";
const envEmail = () => normalizeEmail(process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL);
const envPassword = () => process.env.ADMIN_PASSWORD || "";
const sha256 = (value: string | Buffer) => createHash("sha256").update(value).digest();

function scrypt(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

/** Constant-time comparison of two strings of any length. */
export function safeEqual(a: string, b: string) {
  return timingSafeEqual(sha256(a), sha256(b));
}

function encryptionKey() {
  return sha256(`gwd-admin-credentials|${sessionSecret()}`);
}

function encrypt(record: StoredCredentials) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(record), "utf8"), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") });
}

function decrypt(payload: string): StoredCredentials | null {
  try {
    const { v, iv, tag, data } = JSON.parse(payload);
    if (v !== 1) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    const plain = Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
    const record = JSON.parse(plain) as StoredCredentials;
    return typeof record.email === "string" && typeof record.hash === "string" && typeof record.salt === "string" ? record : null;
  } catch {
    return null; // wrong secret or tampered file
  }
}

let cache: { record: StoredCredentials | null; at: number } | null = null;

async function readStored(): Promise<StoredCredentials | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.record;
  let record: StoredCredentials | null = null;
  if (hasBlobStore()) {
    const { blobs } = await list({ prefix: PREFIX, limit: 20 });
    const latest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    if (latest) {
      const res = await fetch(latest.url, { cache: "no-store" });
      if (res.ok) record = decrypt(await res.text());
    }
  } else {
    try { record = decrypt(await fs.readFile(LOCAL_FILE, "utf8")); } catch { record = null; }
  }
  cache = { record, at: Date.now() };
  return record;
}

export async function getActiveCredentials(): Promise<ActiveCredentials | null> {
  if (sessionSecret().length < 32) return null;
  let stored: StoredCredentials | null = null;
  try { stored = await readStored(); } catch (error) { console.error("[admin] credentials read failed", error); }
  if (stored) {
    const s = stored;
    return {
      email: s.email,
      source: "dashboard",
      version: sha256(`db|${s.email}|${s.hash}|${s.updatedAt}`).toString("hex").slice(0, 24),
      check: async password => timingSafeEqual(await scrypt(password, Buffer.from(s.salt, "base64")), Buffer.from(s.hash, "base64")),
    };
  }
  const password = envPassword();
  if (password.length < 12) return null;
  const email = envEmail();
  return {
    email,
    source: "env",
    version: sha256(`env|${email}|${password}`).toString("hex").slice(0, 24),
    check: async candidate => safeEqual(candidate, password),
  };
}

/** Email + password check. Always does the same work so timing does not reveal which part was wrong. */
export async function verifyLogin(email: string, password: string): Promise<ActiveCredentials | null> {
  const creds = await getActiveCredentials();
  if (!creds) return null;
  const emailOk = safeEqual(normalizeEmail(email), creds.email);
  const passwordOk = await creds.check(password);
  return emailOk && passwordOk ? creds : null;
}

export async function saveCredentials(email: string, password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt);
  const record: StoredCredentials = { email: normalizeEmail(email), salt: salt.toString("base64"), hash: hash.toString("base64"), updatedAt: new Date().toISOString() };
  const body = encrypt(record);
  if (hasBlobStore()) {
    const { blobs: old } = await list({ prefix: PREFIX, limit: 20 });
    await put(`${PREFIX}${Date.now()}.json`, body, { access: "public", contentType: "application/json", addRandomSuffix: true, cacheControlMaxAge: 60 });
    if (old.length) await del(old.map(b => b.url)).catch(() => undefined);
  } else {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, body, { encoding: "utf8", mode: 0o600 });
  }
  cache = { record, at: Date.now() };
}

/** Test helper. */
export function __resetCredentialCache() { cache = null; }
