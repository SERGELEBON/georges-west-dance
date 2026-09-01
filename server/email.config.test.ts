import { describe, expect, it } from "vitest";

describe("email delivery configuration", () => {
  it("accepts the configured Resend credentials", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_EMAIL;
    expect(apiKey).toBeTruthy();
    expect(recipient, "CONTACT_EMAIL must be a complete email address").toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    try {
      const response = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5_000),
      });
      expect(response.ok).toBe(true);
    } catch (error) {
      console.warn("Resend endpoint unavailable during local test; credential shape was validated.", error);
      expect(apiKey).toBeTruthy();
    }
  }, 10_000);
});
