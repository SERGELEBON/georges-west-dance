# Admin — Georges West Dance

URL: `https://<site>/admin` (not indexed by Google).

## One-time Vercel setup
1. **Storage → Create → Blob → Connect to project** (adds `BLOB_READ_WRITE_TOKEN` automatically).
2. **Settings → Environment Variables** (Production + Preview):
   - `ADMIN_PASSWORD`: 12+ characters (a long passphrase).
   - `ADMIN_SESSION_SECRET`: 32+ random characters (`openssl rand -base64 48`).
3. Redeploy.

## What can be edited
Hero (texts + slides video/image, separate phone version, framing, B&W), About, George's profile,
Events (add / hide / reorder), Classes + the 3 class pages, Portfolio, Booking, Contact & social links,
logo, SEO, visibility of each section. The last 25 saves are kept in **History** (one-click restore).

## Hero video best practice
- Desktop: 16:9 MP4 (H.264), 10–25 s, ≤ 8 MB, no sound (it plays muted).
- Phone: optional 9:16 version in “Phone version”.
- Only a vertical video? Choose **Framing → Whole video over blurred background**.

## Security
- Password login → HttpOnly, Secure, SameSite=Strict cookie (`__Host-`), 8 h session, signed (HS256).
- Login limited to 5 attempts / 15 min per IP; contact form limited to 5 / 10 min.
- Every admin write requires same origin + custom header (CSRF) and is validated with Zod
  (lengths capped, `<`/`>` refused in single-line fields, only `https://` or `/…` URLs).
- React escapes all text (no `dangerouslySetInnerHTML`); strict CSP, HSTS, X-Frame-Options DENY.
- Uploads go straight to Vercel Blob with a short-lived token: images (JPG/PNG/WEBP/AVIF) and MP4/WEBM only, 200 MB max.
