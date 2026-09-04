# Visual verification — 2026-09-01

The desktop and mobile full-page previews were captured after the GitHub sync and the new WhatsApp, modal booking, testimonial rail, compact footer, and storage rewrite changes.

The homepage shows the editorial hero, the practice and trust sections, the monochrome lab, class entries, portfolio, booking CTA, newsletter, the testimonial story-slot rail, and the shortened footer. The testimonial rail is visible before the footer and uses three editorial movement visuals with explicit copy that the slots are awaiting verified customer stories; no review text is fabricated. The Studio page remains readable through its hero, calendar, CTA, existing form, and compact footer.

The mobile preview stacks the page sections correctly, turns the testimonial cards into one-card-per-view horizontal items, keeps the compact footer legible, and preserves the fixed header/drawer layout. The WhatsApp control is intentionally fixed and compact on mobile. The local route check returned HTTP 307 for both `/manus-storage/...` and `/api/manus-storage/...`, confirming that both paths reach the storage proxy rather than the SPA fallback. The tRPC health route remained reachable and returned its expected validation response when called without the required input.

## Final contract checks

Vitest now includes an accessibility contract covering the labelled WhatsApp link, testimonial previous/next controls, mobile navigation control, and the booking dialog’s trigger, submit, success, and error semantics. The full suite passed with 12 tests. The asset verification script returned HTTP 200 after following redirects for the logo, hero image, hero video, all three course images, all three testimonial editorial visuals, and both `/manus-storage` and `/api/manus-storage` entry paths.

## Keyboard e2e

A real Chromium keyboard pass succeeded on the homepage. Tab reached the header booking CTA; Enter opened the booking dialog; Escape closed it; Space activated the testimonial next control after the rail was reset to its first card; and Tab reached the WhatsApp link whose destination was verified as `https://wa.me/233544036021`. The runner is stored at `scripts/verify-keyboard.mjs`.

## Extended keyboard e2e

The Chromium runner also verified the homepage header, hero, and booking-section CTAs; the Studio page header, hero, and format CTAs; and both next and previous testimonial rail controls. Each booking trigger opened the accessible dialog and Escape closed it. Space moved the rail in both directions, and the WhatsApp link received focus with the expected Ghana destination.

## Final release screenshots

The final desktop and mobile full-page captures confirm that the homepage and Studio page retain the intended editorial hierarchy, the testimonial rail remains before the footer, the footer stays compact, and the floating WhatsApp action remains visible without obscuring primary content. The Studio calendar, booking area, and internal-page footer remain legible at the mobile viewport.

## Upcoming events verification

The supplied Bachata & Salsa Night poster is displayed before the footer in the new Upcoming Events section. Desktop shows the poster beside a structured event brief; mobile stacks the poster, schedule, venue and WhatsApp actions without horizontal overflow. The section preserves the ivory/charcoal/gold visual system and remains readable at 390px width.

## Event detail and poster lightbox verification

The event card now shows explicit Class, Social, Where, Format and Contact facts. The supplied poster is rendered in the editorial card and is an accessible button that opens a full-size lightbox; Escape, the close button and backdrop click close it. Desktop and mobile full-page captures confirm the poster/details split on desktop and the stacked layout at 390px without horizontal overflow.

## Event interaction keyboard verification

The extended Chromium journey now focuses the event poster button, opens the full-size poster with Enter, confirms the dialog image is visible, and closes it with Escape. The same run continues to validate booking CTAs, the booking modal, both testimonial rail controls, and WhatsApp.

## Composition revision verification

The Upcoming Events section now sits immediately after the studio proof section, so the sequence reads as a deliberate progression from “A practice, not a performance” to “Why people stay in motion” and then to a concrete community event. The supplied poster is fully visible within its card using contain behavior rather than cover cropping. Desktop and mobile captures confirm the event information remains legible and the image lab follows naturally after the event block.

## Final event composition pass

The event block now uses a dedicated warm-paper background, increased top and bottom breathing room, a stronger two-column editorial ratio, a constrained reading width, and a charcoal event panel with gold status marker and high-contrast facts. On mobile, the layout stacks cleanly with compact spacing and full-width actions. The poster remains fully visible with `object-fit: contain`, while the lightbox preserves full-size viewing.
