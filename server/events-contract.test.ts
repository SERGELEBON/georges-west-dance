import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("upcoming events content contract", () => {
  it("keeps the supplied event poster and practical event details in the homepage", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

    expect(home).toContain("eventPoster");
    expect(home).toContain("qBQRfjkRThHSnihN.jpeg");
    expect(home).toContain("Bachata &amp; Salsa");
    expect(home).toContain("7:00 PM — 8:00 PM");
    expect(home).toContain("Afrikiko");
    expect(home).toContain("Format");
    expect(home).toContain("Contact");
    expect(home).toContain("event-poster-trigger");
    expect(home).toContain("event-lightbox");
    expect(home).toContain("Escape");
    expect(styles).toContain(".event-poster-trigger img { object-fit:contain");
    expect(home).toContain("events-section");
    expect(home).toContain("WHATSAPP_URL");
    expect(home.indexOf('className="trust-section"')).toBeLessThan(home.indexOf('className="events-section"'));
    expect(home.indexOf('className="events-section"')).toBeLessThan(home.indexOf('className="lab-section"'));
  });
});
