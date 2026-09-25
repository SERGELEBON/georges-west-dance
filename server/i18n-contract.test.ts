import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/i18n.tsx"), "utf8");

describe("internationalisation contract", () => {
  it("declares and persists all supported languages", () => {
    expect(source).toContain('["EN", "FR", "ES", "DE", "ZH"]');
    expect(source).toContain('localStorage.getItem("gwd-language")');
    expect(source).toContain('localStorage.setItem("gwd-language", next)');
  });

  it("contains translated navigation and booking vocabulary", () => {
    for (const phrase of ["Book a class", "Send enquiry", "Choose language", "Upcoming events"]) {
      expect(source).toContain(`"${phrase}"`);
    }
    expect(source).toContain("LanguageProvider");
    expect(source).toContain("useI18n");
  });
});
