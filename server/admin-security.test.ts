import { describe, expect, it, beforeAll, afterAll } from "vitest";
import type { Request } from "express";
import { DEFAULT_CONTENT, siteContentSchema } from "../shared/siteContent";
import { adminConfigured } from "./adminAuth";
import { __resetCredentialCache, DEFAULT_ADMIN_EMAIL, getActiveCredentials, saveCredentials, verifyLogin } from "./adminCredentials";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createRateLimiter, isSameOriginAdminRequest } from "./security";

const clone = () => JSON.parse(JSON.stringify(DEFAULT_CONTENT));

describe("content validation blocks injection", () => {
  it("accepts the default content", () => {
    expect(siteContentSchema.safeParse(DEFAULT_CONTENT).success).toBe(true);
  });
  it.each(["javascript:alert(1)", "data:text/html,<script>", "//evil.com/x.mp4", "http://insecure.com/a.jpg", "vbscript:x"])("rejects unsafe URL %s", url => {
    const c = clone();
    c.hero.slides[0].src = url;
    expect(siteContentSchema.safeParse(c).success).toBe(false);
  });
  it("rejects HTML in single-line fields", () => {
    const c = clone();
    c.hero.titleLine1 = "<img src=x onerror=alert(1)>";
    expect(siteContentSchema.safeParse(c).success).toBe(false);
  });
  it("rejects unknown WhatsApp formats", () => {
    const c = clone();
    c.contact.whatsappNumber = "233&text=<script>";
    expect(siteContentSchema.safeParse(c).success).toBe(false);
  });
  it("caps oversized text", () => {
    const c = clone();
    c.about.body = "a".repeat(5000);
    expect(siteContentSchema.safeParse(c).success).toBe(false);
  });
});

describe("admin auth (email + password)", () => {
  const credFile = path.resolve(process.cwd(), ".data", "admin-credentials.json");
  beforeAll(async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.ADMIN_EMAIL;
    process.env.ADMIN_PASSWORD = "correct horse battery";
    process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
    await fs.rm(credFile, { force: true });
    __resetCredentialCache();
  });
  afterAll(async () => { await fs.rm(credFile, { force: true }); __resetCredentialCache(); });

  it("signs in with the default email + env password", async () => {
    expect(await adminConfigured()).toBe(true);
    expect(await verifyLogin(DEFAULT_ADMIN_EMAIL, "correct horse battery")).not.toBeNull();
    expect(await verifyLogin(" GuehiPoegnanSergeJ@gmail.com ", "correct horse battery")).not.toBeNull();
    expect(await verifyLogin(DEFAULT_ADMIN_EMAIL, "correct horse batter")).toBeNull();
    expect(await verifyLogin("someone@else.com", "correct horse battery")).toBeNull();
    expect(await verifyLogin(DEFAULT_ADMIN_EMAIL, "")).toBeNull();
  });

  it("dashboard change replaces env credentials, stored encrypted", async () => {
    const before = (await getActiveCredentials())!.version;
    await saveCredentials("new.admin@example.com", "another long pass 42");
    const raw = await fs.readFile(credFile, "utf8");
    expect(raw).not.toContain("new.admin@example.com");
    __resetCredentialCache();
    const after = await getActiveCredentials();
    expect(after?.source).toBe("dashboard");
    expect(after?.version).not.toBe(before); // old sessions are invalidated
    expect(await verifyLogin("new.admin@example.com", "another long pass 42")).not.toBeNull();
    expect(await verifyLogin(DEFAULT_ADMIN_EMAIL, "correct horse battery")).toBeNull();
  });

  it("falls back to env if the secret changes (file cannot be decrypted)", async () => {
    process.env.ADMIN_SESSION_SECRET = "y".repeat(40);
    __resetCredentialCache();
    expect((await getActiveCredentials())?.source).toBe("env");
    process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
    __resetCredentialCache();
  });
});

describe("request guards", () => {
  const req = (headers: Record<string, string>) => ({ headers } as unknown as Request);
  it("requires same origin and the admin header", () => {
    expect(isSameOriginAdminRequest(req({ origin: "https://gwd.com", host: "gwd.com", "x-gwd-admin": "1" }))).toBe(true);
    expect(isSameOriginAdminRequest(req({ origin: "https://evil.com", host: "gwd.com", "x-gwd-admin": "1" }))).toBe(false);
    expect(isSameOriginAdminRequest(req({ origin: "https://gwd.com", host: "gwd.com" }))).toBe(false);
    expect(isSameOriginAdminRequest(req({ host: "gwd.com", "x-gwd-admin": "1" }))).toBe(false);
  });
  it("rate limits after the threshold", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
    const results = Array.from({ length: 5 }, () => limiter.check("ip").allowed);
    expect(results).toEqual([true, true, true, false, false]);
  });
});
