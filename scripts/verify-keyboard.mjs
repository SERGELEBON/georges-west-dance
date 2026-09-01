import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openAndCloseBooking(selector, label) {
  const trigger = page.locator(selector).first();
  await trigger.focus();
  assert(await trigger.evaluate(element => element === document.activeElement), `${label} could not receive focus`);
  await page.keyboard.press("Enter");
  const dialog = page.locator('[data-slot="dialog-content"]');
  await dialog.waitFor({ state: "visible" });
  assert(await page.locator(".booking-dialog-form").isVisible(), `${label} did not open the booking dialog`);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
}

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await openAndCloseBooking(".header-cta", "Homepage header CTA");
  await openAndCloseBooking(".hero-ctas .gold-button", "Homepage hero CTA");
  await openAndCloseBooking(".booking-copy .dark-button", "Homepage booking CTA");

  const rail = page.locator(".testimonial-rail");
  const nextControl = page.locator('.testimonial-controls button[aria-label="Next testimonial story slot"]');
  const previousControl = page.locator('.testimonial-controls button[aria-label="Previous testimonial story slot"]');
  await rail.evaluate(element => element.scrollTo({ left: 0, behavior: "instant" }));
  await nextControl.focus();
  const beforeNext = await rail.evaluate(element => element.scrollLeft);
  await page.keyboard.press("Space");
  await page.waitForTimeout(900);
  const afterNext = await rail.evaluate(element => element.scrollLeft);
  assert(afterNext > beforeNext, `Space did not move the testimonial rail forward (${beforeNext} → ${afterNext})`);

  await rail.evaluate(element => element.scrollTo({ left: element.scrollWidth, behavior: "instant" }));
  await previousControl.focus();
  const beforePrevious = await rail.evaluate(element => element.scrollLeft);
  await page.keyboard.press("Space");
  await page.waitForTimeout(900);
  const afterPrevious = await rail.evaluate(element => element.scrollLeft);
  assert(afterPrevious < beforePrevious, `Space did not move the testimonial rail backward (${beforePrevious} → ${afterPrevious})`);

  const whatsapp = page.locator(".whatsapp-float");
  await whatsapp.focus();
  assert(await whatsapp.evaluate(element => element === document.activeElement), "WhatsApp link could not receive focus");
  const whatsappHref = await whatsapp.getAttribute("href");
  assert(whatsappHref?.startsWith("https://wa.me/233544036021"), "WhatsApp link has the wrong destination");

  await page.goto(`${baseUrl}/classes/studio`, { waitUntil: "networkidle" });
  await openAndCloseBooking(".detail-header .gold-button", "Studio header CTA");
  await openAndCloseBooking(".detail-hero-copy .gold-button", "Studio hero CTA");
  await openAndCloseBooking(".detail-cta .dark-button", "Studio format CTA");

  console.log("Keyboard e2e verification passed: all primary booking CTAs, booking modal, testimonial rail controls, and WhatsApp link.");
} finally {
  await browser.close();
}
