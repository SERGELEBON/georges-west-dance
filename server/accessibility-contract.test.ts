import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const bookingSource = readFileSync(resolve(process.cwd(), "client/src/components/BookingDialog.tsx"), "utf8");

describe("interactive accessibility contracts", () => {
  it("labels WhatsApp, rail controls, and the mobile navigation", () => {
    expect(homeSource).toContain('aria-label="Chat with Georges West Dance on WhatsApp"');
    expect(homeSource).toContain('aria-label="Previous testimonial story slot"');
    expect(homeSource).toContain('aria-label="Next testimonial story slot"');
    expect(homeSource).toContain('aria-controls="mobile-navigation"');
  });

  it("keeps the booking modal form keyboard and screen-reader friendly", () => {
    expect(bookingSource).toContain("DialogTrigger asChild");
    expect(bookingSource).toContain('type="submit"');
    expect(bookingSource).toContain('role="status"');
    expect(bookingSource).toContain('role="alert"');
    expect(bookingSource).toContain("required");
  });
});
