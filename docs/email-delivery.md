# Server-side email delivery

The public booking forms use the `contact.submit` tRPC mutation in `server/routers.ts`. The server validates the enquiry with Zod and sends it through Resend in `server/email.ts`; the visitor’s mail application is not required.

## Required environment variables

| Variable | Purpose | Format |
| --- | --- | --- |
| `RESEND_API_KEY` | Server-only Resend API credential used to call `POST https://api.resend.com/emails`. | A valid Resend API key, never exposed to the client. |
| `CONTACT_EMAIL` | Destination inbox for booking enquiries. | A complete address such as `name@domain.com`. |

Configure both variables through the project’s Secrets settings or the managed secret workflow. Do not commit them to `.env`, source files, or client code. The current project recipient is `plusdesavoir01@gmail.com`.

## Sender verification

The service currently sends from `Georges West Dance <onboarding@resend.dev>` for the configured Resend account. For production branding, verify the studio domain in Resend and update the `from` value in `server/email.ts` to an address on that verified domain.

## Verification

Run `pnpm vitest run server/email.config.test.ts` to confirm the key can access the Resend domains endpoint. Run `pnpm test` to cover the contact validation and email payload tests. Run `pnpm check && pnpm build` before creating a checkpoint.
