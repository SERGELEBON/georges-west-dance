import { createHash, timingSafeEqual } from "node:crypto";
import { parse as parseCookie } from "cookie";
import type { NextFunction, Request, Response } from "express";
import { jwtVerify, SignJWT } from "jose";

const SESSION_HOURS = 8;
const ISSUER = "gwd-admin";

const isProd = () => process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
// __Host- prefix forces Secure + Path=/ + no Domain: the cookie cannot be set or read by subdomains.
export const adminCookieName = () => (isProd() ? "__Host-gwd_admin" : "gwd_admin");

function secretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "";
  if (secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export function adminConfigured() {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "";
  return password.length >= 12 && secret.length >= 32;
}

/** Constant-time password check (hash both sides so lengths always match). */
export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (expected.length < 12) return false;
  const a = createHash("sha256").update(candidate, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function issueSession(res: Response) {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
  res.cookie(adminCookieName(), token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600 * 1000,
  });
}

export function clearSession(res: Response) {
  res.clearCookie(adminCookieName(), { httpOnly: true, secure: isProd(), sameSite: "strict", path: "/" });
}

export async function isAdmin(req: Request) {
  try {
    const cookies = parseCookie(req.headers.cookie || "");
    const token = cookies[adminCookieName()];
    if (!token) return false;
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER, algorithms: ["HS256"] });
    return payload.sub === "admin" && payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (await isAdmin(req)) return next();
  res.status(401).json({ error: "Unauthorized" });
}
