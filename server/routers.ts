import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { sendBookingEmail } from "./email";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(320),
        phone: z.string().trim().max(40).optional(),
        activity: z.string().trim().min(2).max(120),
        slot: z.string().trim().max(120).optional(),
        message: z.string().trim().min(10).max(2000),
      }))
      .mutation(async ({ input }) => {
        await sendBookingEmail(input);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
