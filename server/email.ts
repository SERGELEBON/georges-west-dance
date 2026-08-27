import { ENV } from "./_core/env";

type BookingEmail = {
  name: string;
  email: string;
  phone?: string;
  activity: string;
  slot?: string;
  message: string;
};

export async function sendBookingEmail(input: BookingEmail): Promise<void> {
  if (!ENV.resendApiKey || !ENV.contactEmail) {
    throw new Error("Email delivery is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Georges West Dance <onboarding@resend.dev>",
      to: [ENV.contactEmail],
      reply_to: input.email,
      subject: `New booking enquiry — ${input.activity}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        input.phone ? `Phone / WhatsApp: ${input.phone}` : "",
        `Activity: ${input.activity}`,
        input.slot ? `Requested slot: ${input.slot}` : "",
        "",
        "Message:",
        input.message,
      ].filter(Boolean).join("\n"),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("[Email] Resend delivery failed", response.status, details);
    throw new Error("Unable to deliver enquiry");
  }
}
