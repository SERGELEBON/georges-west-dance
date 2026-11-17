import { describe, expect, it, beforeAll } from "vitest";
import type { Request } from "express";
import { DEFAULT_CONTENT, siteContentSchema } from "../shared/siteContent";
import { passwordMatches, adminConfigured } from "./adminAuth";
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

describe("admin auth", () => {
  beforeAll(() => {
    process.env.ADMIN_PASSWORD = "correct horse battery";
    process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
  });
  it("checks the password", () => {
    expect(adminConfigured()).toBe(true);
    expect(passwordMatches("correct horse battery")).toBe(true);
    expect(passwordMatches("correct horse batter")).toBe(false);
    expect(passwordMatches("")).toBe(false);
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
