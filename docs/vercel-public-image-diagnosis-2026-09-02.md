# Diagnostic du déploiement public Vercel — 2026-09-02

## Observation

The public deployment `https://georges-west-dance.vercel.app/` renders the React page and its text, but image elements using `/manus-storage/...` are broken. The hero background is empty/dark and the logo plate is visibly broken in the public browser screenshot.

## Direct route test

From the public browser origin, all tested storage routes returned HTTP 404 with `content-type: text/plain; charset=utf-8` and no redirect. This applies to both `/manus-storage/<asset>` and `/api/manus-storage/<asset>` for the logo, hero image, hero video, performance image, and all three editorial testimonial visuals.

The failing examples include:

| Public path | Result |
| --- | --- |
| `/manus-storage/gwd-official-logo_20959e49.jpg` | 404 text/plain |
| `/api/manus-storage/gwd-official-logo_20959e49.jpg` | 404 text/plain |
| `/manus-storage/gwd-hero-video_2d7b6989.mp4` | 404 text/plain |
| `/manus-storage/gwd-testimonial-motion-01_1961e85c.jpg` | 404 text/plain |

## Initial diagnosis

The deployed frontend references Manus storage paths, but the Vercel deployment currently does not expose either the storage proxy route or the rewrite to it. This is a deployment/runtime routing problem rather than a React rendering problem. The deployed revision is therefore missing the effective serverless route, has stale Vercel configuration, or was built from a revision whose serverless function did not include the storage proxy.

The next correction must make the public asset strategy self-contained for Vercel: either publish persistent assets as Vercel-served static files and update the frontend references, or ensure the Vercel function and rewrite are actually included and deployed. The public 404 evidence should be re-run after the correction.

## API route evidence

The public deployment also returns Vercel `NOT_FOUND` 404 responses for `/api/trpc/system.health` and `/api/oauth/callback`, not application-level responses. Therefore the issue is broader than the storage proxy: the Vercel deployment currently publishes the static frontend but does not deploy or route `api/[...path].ts` at all. The current public deployment is consequently not using the intended full-stack Vercel configuration, or it is pointed at a revision/root configuration where the `api` directory is not included.

## Correction prepared locally

All 11 media files were re-published as absolute CDN URLs. Direct checks returned HTTP 200 with the following MIME types: JPEG for the logo, hero, studio portrait, performance image, three course images, and three editorial visuals; MP4 for the hero video. The frontend now contains no active `/manus-storage/...` references. `pnpm test` passed with 13 tests, `pnpm check` passed, `pnpm build` passed, and local desktop previews show the hero and Studio imagery correctly.

The public domain still needs a new Vercel deployment before the fix can be observed there. The current production domain was not modified remotely by this task.
