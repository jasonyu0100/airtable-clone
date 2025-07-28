import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const tableRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      name: z.string().min(1, "Table name is required"),
      baseId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.create({
        data: {
          name: input.name,
          baseId: input.baseId,
          userId: ctx.session.user.id,
        },
      });
    }),

  getByBaseId: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.table.findMany({
        where: { 
          baseId: input.baseId,
          userId: ctx.session.user.id 
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.table.findFirst({
        where: { 
          id: input.id,
          userId: ctx.session.user.id 
        },
        include: {
          columns: {
            orderBy: { order: "asc" },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.delete({
        where: { 
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});