// Single Vercel serverless function for every /api/* route (see the rewrites in vercel.json).
// The Express app is pre-bundled by `pnpm build` (esbuild) into dist/api/app.mjs, so Node ESM
// never has to resolve extension-less TypeScript imports at runtime (ERR_MODULE_NOT_FOUND).
import { createApp } from "../dist/api/app.mjs";

const app = createApp();

export default app;
