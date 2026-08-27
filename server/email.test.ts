import { afterEach, describe, expect, it, vi } from "vitest";
import { sendBookingEmail } from "./email";

afterEach(() => vi.unstubAllGlobals());

describe("sendBookingEmail", () => {
  it("posts a booking enquiry to Resend with reply-to and activity context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email_test" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendBookingEmail({
      name: "Ama Mensah",
      email: "ama@example.com",
      phone: "+233 20 000 0000",
      activity: "Small-group or private",
      slot: "Wed 2 Sep · 17:30",
      message: "I would like to improve musicality and confidence.",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(String(options.body))).toMatchObject({
      to: [process.env.CONTACT_EMAIL],
      reply_to: "ama@example.com",
      subject: "New booking enquiry — Small-group or private",
    });
  });
});
