import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      name: z.string().min(1, "Base name is required") 
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.base.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),

  getUserBases: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.base.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getStarredBases: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.base.findMany({
      where: { 
        userId: ctx.session.user.id,
        starred: true 
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  toggleStar: protectedProcedure
    .input(z.object({ 
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.findFirst({
        where: { 
          id: input.id, 
          userId: ctx.session.user.id 
        },
      });

      if (!base) {
        throw new Error("Base not found");
      }

      return ctx.db.base.update({
        where: { id: input.id },
        data: { starred: !base.starred },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ 
      id: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.base.delete({
        where: { 
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});