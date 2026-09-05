import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("fixed header and hero layout contract", () => {
  it("keeps the complete hero below the fixed language strip and header", () => {
    const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

    expect(styles).toContain(".hero-section { margin-top:118px; min-height:calc(100vh - 118px); height:calc(100vh - 118px); }");
    expect(styles).toContain(".hero-section { margin-top:106px; min-height:calc(100vh - 106px); height:calc(100vh - 106px); }");
    expect(styles).toContain(".site-header { height:86px;");
    expect(styles).toContain(".language-strip { height:32px;");
  });
});
