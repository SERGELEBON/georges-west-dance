import { parse as parseCookie } from "cookie";
import type { NextFunction, Request, Response } from "express";
import { jwtVerify, SignJWT } from "jose";
import { getActiveCredentials, safeEqual, sessionSecret } from "./adminCredentials";

const SESSION_HOURS = 8;
const ISSUER = "gwd-admin";

const isProd = () => process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
// __Host- prefix forces Secure + Path=/ + no Domain: the cookie cannot be set or read by subdomains.
export const adminCookieName = () => (isProd() ? "__Host-gwd_admin" : "gwd_admin");

function secretKey() {
  const secret = sessionSecret();
  if (secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

/** True when sign-in is possible: a session secret plus either dashboard credentials or ADMIN_PASSWORD. */
export async function adminConfigured() {
  return (await getActiveCredentials()) !== null;
}

/**
 * The session carries the credentials version (`cv`): changing the email or password
 * in the dashboard immediately invalidates every other open session.
 */
export async function issueSession(res: Response, credentialsVersion: string) {
  const token = await new SignJWT({ role: "admin", cv: credentialsVersion })
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
    if (payload.sub !== "admin" || payload.role !== "admin" || typeof payload.cv !== "string") return false;
    const creds = await getActiveCredentials();
    return Boolean(creds && safeEqual(payload.cv, creds.version));
  } catch {
    return false;
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (await isAdmin(req)) return next();
  res.status(401).json({ error: "Unauthorized" });
}
