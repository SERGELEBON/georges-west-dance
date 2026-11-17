import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import express, { type Express, type Request, type Response } from "express";
import { z } from "zod";
import { siteContentSchema } from "../shared/siteContent";
import { adminConfigured, clearSession, isAdmin, issueSession, requireAdmin } from "./adminAuth";
import { getActiveCredentials, normalizeEmail, saveCredentials, verifyLogin } from "./adminCredentials";
import { getContent, getVersions, hasBlobStore, restoreVersion, saveContent } from "./contentStore";
import { clientIp, createRateLimiter, isSameOriginAdminRequest, requireSameOrigin } from "./security";

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
const writeLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 30 });
const accountLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

const emailField = z.string().trim().max(254).email();
const passwordField = z.string().min(1).max(200);
const newPasswordField = z.string().min(12, "The new password needs at least 12 characters").max(200)
  .refine(p => /[a-zA-Z]/.test(p) && /[^a-zA-Z]/.test(p), "Mix letters with numbers or symbols");

const ALLOWED_UPLOADS = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"];
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const noStore = (res: Response) => res.setHeader("Cache-Control", "no-store, max-age=0");

export function registerContentRoutes(app: Express) {
  // ---------- Public ----------
  app.get("/api/content", async (_req, res) => {
    const content = await getContent();
    // Browsers always revalidate (no stale copy after an edit); Vercel's CDN keeps it
    // 30 s so edits appear within ~30 s while the function stays cheap under traffic.
    res.setHeader("Cache-Control", "public, no-cache");
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=30, stale-while-revalidate=120");
    res.json(content);
  });

  // Client-side uploads straight to Vercel Blob (bypasses the 4.5 MB function body limit).
  app.post("/api/admin/upload", async (req: Request, res: Response) => {
    noStore(res);
    const body = req.body as HandleUploadBody;
    if (body?.type === "blob.generate-client-token") {
      // Token requests come from the admin UI: same-origin + valid session required.
      if (!isSameOriginAdminRequest(req)) { res.status(403).json({ error: "Forbidden" }); return; }
      if (!(await isAdmin(req))) { res.status(401).json({ error: "Unauthorized" }); return; }
    }
    if (!hasBlobStore()) { console.error("[admin] upload refused: BLOB_READ_WRITE_TOKEN missing"); res.status(503).json({ error: "Uploads are not available right now. Please contact your web developer." }); return; }
    try {
      const result = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async pathname => {
          if (!/^media\/[\w\-.]{1,120}$/.test(pathname)) throw new Error("Invalid file name");
          return {
            allowedContentTypes: ALLOWED_UPLOADS,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            addRandomSuffix: true,
            allowOverwrite: false,
            cacheControlMaxAge: 60 * 60 * 24 * 365,
          };
        },
        // Signature-verified callback from Vercel Blob; nothing to persist, the URL is saved with the content.
        onUploadCompleted: async () => undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Upload refused" });
    }
  });

  // ---------- Admin ----------
  const admin = express.Router();
  admin.use(requireSameOrigin);
  admin.use((_req, res, next) => { noStore(res); next(); });

  admin.get("/session", async (req, res) => {
    res.json({ authenticated: await isAdmin(req), configured: await adminConfigured() });
  });

  admin.post("/login", async (req, res) => {
    if (!(await adminConfigured())) {
      res.status(503).json({ error: "Sign-in is not available yet. Please contact your web developer." });
      return;
    }
    const key = `login:${clientIp(req)}`;
    const limit = loginLimiter.check(key);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      res.status(429).json({ error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} min.` });
      return;
    }
    const parsed = z.object({ email: emailField, password: passwordField }).safeParse(req.body);
    const creds = parsed.success ? await verifyLogin(parsed.data.email, parsed.data.password) : null;
    if (!creds) {
      await sleep(700); // slow down guessing
      res.status(401).json({ error: "Invalid email or password" }); // never reveal which one was wrong
      return;
    }
    loginLimiter.reset(key);
    await issueSession(res, creds.version);
    res.json({ ok: true });
  });

  // ---------- Account (sign-in email + password) ----------
  admin.get("/account", requireAdmin, async (_req, res) => {
    const creds = await getActiveCredentials();
    res.json({ email: creds?.email ?? "" });
  });

  admin.put("/account", requireAdmin, async (req, res) => {
    const key = `account:${clientIp(req)}`;
    const limit = accountLimiter.check(key);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      res.status(429).json({ error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} min.` });
      return;
    }
    const parsed = z.object({
      currentPassword: passwordField,
      email: emailField,
      newPassword: z.union([z.literal(""), newPasswordField]).optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid data" });
      return;
    }
    const creds = await getActiveCredentials();
    if (!creds || !(await creds.check(parsed.data.currentPassword))) {
      await sleep(700);
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    accountLimiter.reset(key);
    if (creds.source === "env" && !hasBlobStore() && process.env.VERCEL) {
      console.error("[admin] account save refused: BLOB_READ_WRITE_TOKEN missing"); res.status(503).json({ error: "Saving is not available right now. Please contact your web developer." });
      return;
    }
    try {
      await saveCredentials(normalizeEmail(parsed.data.email), parsed.data.newPassword || parsed.data.currentPassword);
      const updated = await getActiveCredentials();
      if (updated) await issueSession(res, updated.version); // keep this browser signed in, log out the others
      res.json({ ok: true, email: updated?.email });
    } catch (error) {
      console.error("[admin] account save failed", error);
      res.status(500).json({ error: "Could not save the new sign-in details." });
    }
  });

  admin.post("/logout", (_req, res) => {
    clearSession(res);
    res.json({ ok: true });
  });

  admin.get("/content", requireAdmin, async (_req, res) => {
    res.json(await getContent({ fresh: true }));
  });

  admin.put("/content", requireAdmin, writeLimiter.middleware, async (req, res) => {
    const parsed = siteContentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Some fields are invalid",
        issues: parsed.error.issues.slice(0, 20).map(i => ({ path: i.path.join("."), message: i.message })),
      });
      return;
    }
    try {
      const version = await saveContent(parsed.data);
      res.json({ ok: true, version });
    } catch (error) {
      console.error("[admin] save failed", error);
      res.status(500).json({ error: "Could not save. Please try again in a moment; if it keeps failing, contact your web developer." });
    }
  });

  admin.get("/versions", requireAdmin, async (_req, res) => {
    res.json(await getVersions());
  });

  admin.post("/versions/restore", requireAdmin, writeLimiter.middleware, async (req, res) => {
    const parsed = z.object({ id: z.string().regex(/^content\/site-[\w\-.]+\.json$/) }).safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid version" }); return; }
    try {
      res.json(await restoreVersion(parsed.data.id));
    } catch {
      res.status(404).json({ error: "Version not found" });
    }
  });

  app.use("/api/admin", admin);

}
