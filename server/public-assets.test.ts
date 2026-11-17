import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_CONTENT } from "../shared/siteContent";

describe("public asset contract", () => {
  it("never references the Manus storage proxy from the frontend", () => {
    for (const file of ["client/src/pages/Home.tsx", "client/src/pages/ClassDetail.tsx", "client/index.html", "shared/siteContent.ts"]) {
      expect(readFileSync(resolve(process.cwd(), file), "utf8")).not.toContain("/manus-storage/");
    }
  });

  it("ships every local hero media file referenced by the default content", () => {
    const local = DEFAULT_CONTENT.hero.slides.flatMap(s => [s.src, s.mobileSrc, s.poster]).filter(u => u.startsWith("/media/"));
    expect(local.length).toBeGreaterThan(0);
    for (const url of local) expect(existsSync(resolve(process.cwd(), "client/public", url.slice(1)))).toBe(true);
  });
});
