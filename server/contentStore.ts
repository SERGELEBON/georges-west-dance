import { del, list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_CONTENT, normalizeContent, type SiteContent } from "../shared/siteContent";

/**
 * Content persistence.
 * - Production (Vercel): each save is written to Vercel Blob as an immutable,
 *   timestamped JSON file (content/site-<ts>.json). The newest one wins, and the
 *   previous versions stay available for one-click restore.
 * - Local development without BLOB_READ_WRITE_TOKEN: a JSON file in .data/.
 */

const PREFIX = "content/site-";
const KEEP_VERSIONS = 25;
const LOCAL_DIR = path.resolve(process.cwd(), ".data");

export const hasBlobStore = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export type ContentVersion = { id: string; savedAt: string; size: number };

let memoryCache: { content: SiteContent; at: number } | null = null;
const CACHE_MS = 15_000;

async function listVersions(): Promise<Array<ContentVersion & { url: string }>> {
  if (hasBlobStore()) {
    const { blobs } = await list({ prefix: PREFIX, limit: 100 });
    return blobs
      .map(b => ({ id: b.pathname, url: b.url, savedAt: new Date(b.uploadedAt).toISOString(), size: b.size }))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }
  try {
    const files = await fs.readdir(LOCAL_DIR);
    const versions = await Promise.all(
      files.filter(f => f.startsWith("site-") && f.endsWith(".json")).map(async f => {
        const stat = await fs.stat(path.join(LOCAL_DIR, f));
        return { id: `content/${f}`, url: path.join(LOCAL_DIR, f), savedAt: stat.mtime.toISOString(), size: stat.size };
      }),
    );
    return versions.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

async function readVersion(url: string): Promise<unknown> {
  if (hasBlobStore()) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);
    return response.json();
  }
  return JSON.parse(await fs.readFile(url, "utf8"));
}

export async function getContent({ fresh = false } = {}): Promise<SiteContent> {
  if (!fresh && memoryCache && Date.now() - memoryCache.at < CACHE_MS) return memoryCache.content;
  try {
    const [latest] = await listVersions();
    const content = latest ? normalizeContent(await readVersion(latest.url)) : DEFAULT_CONTENT;
    memoryCache = { content, at: Date.now() };
    return content;
  } catch (error) {
    console.error("[content] read failed, serving defaults", error);
    return memoryCache?.content ?? DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<ContentVersion> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const body = JSON.stringify(content);
  let version: ContentVersion;
  if (hasBlobStore()) {
    const blob = await put(`${PREFIX}${stamp}.json`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true, // unguessable URL
      cacheControlMaxAge: 60,
    });
    version = { id: blob.pathname, savedAt: new Date().toISOString(), size: body.length };
  } else {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    const file = `site-${stamp}.json`;
    await fs.writeFile(path.join(LOCAL_DIR, file), body, "utf8");
    version = { id: `content/${file}`, savedAt: new Date().toISOString(), size: body.length };
  }
  memoryCache = { content, at: Date.now() };
  void pruneVersions();
  return version;
}

async function pruneVersions() {
  try {
    const versions = await listVersions();
    const old = versions.slice(KEEP_VERSIONS);
    if (!old.length) return;
    if (hasBlobStore()) await del(old.map(v => v.url));
    else await Promise.all(old.map(v => fs.unlink(v.url)));
  } catch (error) {
    console.warn("[content] prune failed", error);
  }
}

export async function getVersions(): Promise<ContentVersion[]> {
  return (await listVersions()).map(({ id, savedAt, size }) => ({ id, savedAt, size }));
}

export async function restoreVersion(id: string): Promise<SiteContent> {
  const target = (await listVersions()).find(v => v.id === id);
  if (!target) throw new Error("Version not found");
  const content = normalizeContent(await readVersion(target.url));
  await saveContent(content);
  return content;
}
