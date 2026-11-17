import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerContentRoutes } from "../adminRoutes";
import { apiSecurityHeaders, createRateLimiter } from "../security";

// Contact form: at most 5 enquiries per IP every 10 minutes (anti-spam).
const contactLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use("/api", apiSecurityHeaders);
  // Content documents are small; 1 MB is plenty and limits abuse. Media go straight to Blob.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "100kb", extended: false }));

  app.use("/api/trpc/contact.submit", contactLimiter.middleware);

  registerContentRoutes(app);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Never leak stack traces.
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof err === "object" && err && "status" in err ? Number((err as { status: number }).status) : 500;
    if (status >= 500) console.error("[api]", err);
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: status === 413 ? "Payload too large" : "Request failed" });
  });

  return app;
}
