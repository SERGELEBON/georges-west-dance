import { describe, expect, it } from "vitest";
import { WHATSAPP_NUMBER, WHATSAPP_URL } from "@shared/contact";

describe("studio contact links", () => {
  it("uses the configured Ghana WhatsApp number", () => {
    expect(WHATSAPP_NUMBER).toBe("233544036021");
    expect(WHATSAPP_URL).toContain("https://wa.me/233544036021");
    expect(WHATSAPP_URL).toContain("Georges%20West%20Dance");
  });
});
