import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_CONTENT } from "../shared/siteContent";

describe("upcoming events content contract", () => {
  it("ships the Bachata & Salsa Night as default, editable event", () => {
    const [event] = DEFAULT_CONTENT.events.items;
    expect(event.poster).toContain("qBQRfjkRThHSnihN.jpeg");
    expect(event.titleLine1).toBe("Bachata & Salsa");
    expect(event.facts.map(f => f.value)).toContain("7:00 PM — 8:00 PM");
    expect(event.facts.map(f => f.value)).toContain("Afrikiko");
  });

  it("renders events from content with an accessible poster lightbox", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(home).toContain("event-poster-trigger");
    expect(home).toContain("event-lightbox");
    expect(home).toContain("Escape");
    expect(styles).toContain(".event-poster-trigger img { object-fit:contain");
    expect(home.indexOf('className="trust-section"')).toBeLessThan(home.indexOf('className="events-section"'));
    expect(home.indexOf('className="events-section"')).toBeLessThan(home.indexOf('className="lab-section"'));
  });
});
