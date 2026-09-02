import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const detailSource = readFileSync(resolve(process.cwd(), "client/src/pages/ClassDetail.tsx"), "utf8");
const indexSource = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");

const sourceFiles = [homeSource, detailSource, indexSource];

describe("Vercel public asset contract", () => {
  it("uses absolute CDN URLs for all frontend media references", () => {
    for (const source of sourceFiles) {
      expect(source).not.toContain("/manus-storage/");
    }

    expect(homeSource).toContain("https://files.manuscdn.com/");
    expect(detailSource).toContain("https://files.manuscdn.com/");
    expect(indexSource).toContain("https://files.manuscdn.com/");
  });
});
