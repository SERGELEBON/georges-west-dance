import type { NextFunction, Request, Response } from "express";

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(req: Request): string {
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real) return real;
  const fwd = req.headers["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

/**
 * Small fixed-window rate limiter kept in memory. On serverless each instance
 * has its own window, which is still enough to slow down brute force and spam.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const check = (key: string) => {
    const now = Date.now();
    if (hits.size > 5000) hits.forEach((v, k) => { if (v.resetAt < now) hits.delete(k); });
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfter: 0 };
    }
    entry.count += 1;
    return { allowed: entry.count <= max, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  };
  const reset = (key: string) => hits.delete(key);
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const result = check(`${req.path}:${clientIp(req)}`);
    if (!result.allowed) {
      res.setHeader("Retry-After", String(result.retryAfter));
      res.status(429).json({ error: "Too many requests. Please wait and try again." });
      return;
    }
    next();
  };
  return { check, reset, middleware };
}

/** Security headers for every API response. Static files get theirs from vercel.json. */
export function apiSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.removeHeader("X-Powered-By");
  next();
}

/**
 * CSRF guard for state-changing admin requests: the request must come from our
 * own origin and carry a custom header (which cross-site forms cannot set).
 */
export function isSameOriginAdminRequest(req: Request) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin && host && new URL(origin).host === String(host).split(",")[0].trim());
  } catch {
    sameOrigin = false;
  }
  return sameOrigin && req.headers["x-gwd-admin"] === "1";
}

export function requireSameOrigin(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (!isSameOriginAdminRequest(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
