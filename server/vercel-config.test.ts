import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const config = JSON.parse(
  readFileSync(resolve(process.cwd(), "vercel.json"), "utf8"),
) as {
  functions?: Record<string, { runtime?: string }>;
  rewrites: Array<{ source: string; destination: string }>;
  outputDirectory: string;
  buildCommand: string;
};

describe("Vercel configuration", () => {
  it("publishes only the React output directory", () => {
    expect(config.outputDirectory).toBe("public");
  });

  it("copies the React output into the public deployment directory", () => {
    expect(config.buildCommand).toContain("cp -R dist/public/. public/");
  });

  it("does not declare an invalid community runtime", () => {
    const runtime = config.functions?.["api/[...path].ts"]?.runtime;
    expect(runtime).toBeUndefined();
  });

  it("routes storage assets to the serverless proxy before the SPA fallback", () => {
    const storageRewrite = config.rewrites.find(
      rewrite => rewrite.source.startsWith("/manus-storage/"),
    );
    expect(storageRewrite?.destination).toBe("/api/manus-storage/:path*");
  });

  it("excludes API and storage paths from the SPA fallback", () => {
    const fallback = config.rewrites.find(
      rewrite => rewrite.destination === "/index.html",
    );
    expect(fallback?.source).toContain("api");
    expect(fallback?.source).toContain("manus-storage");
    expect(fallback?.source).toContain("?!");
  });
});
