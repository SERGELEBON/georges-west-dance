import { describe, expect, it } from "vitest";

describe("email delivery configuration", () => {
  it("accepts the configured Resend credentials", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_EMAIL;
    expect(apiKey).toBeTruthy();
    expect(recipient, "CONTACT_EMAIL must be a complete email address").toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(response.ok).toBe(true);
  }, 15_000);
});
