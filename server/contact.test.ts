import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("contact.submit", () => {
  it("rejects incomplete or invalid enquiry data before delivery", async () => {
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } satisfies TrpcContext;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.submit({
      name: "A",
      email: "not-an-email",
      activity: "",
      message: "short",
    })).rejects.toBeTruthy();
  });
});
