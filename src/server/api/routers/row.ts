import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const rowRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      tableId: z.string(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the next order number
      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });

      const nextOrder = (lastRow?.order ?? -1) + 1;

      return ctx.db.row.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          order: nextOrder,
        },
      });
    }),

  updateName: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.row.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  getByTableId: protectedProcedure
    .input(z.object({ 
      tableId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const rows = await ctx.db.row.findMany({
        take: limit + 1,
        where: { tableId: input.tableId },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { order: "asc" },
        include: {
          cells: {
            include: {
              column: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (rows.length > limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: rows,
        nextCursor,
      };
    }),

  updateCell: protectedProcedure
    .input(z.object({
      rowId: z.string(),
      columnId: z.string(),
      value: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cell.upsert({
        where: {
          columnId_rowId: {
            columnId: input.columnId,
            rowId: input.rowId,
          },
        },
        update: {
          value: input.value,
        },
        create: {
          columnId: input.columnId,
          rowId: input.rowId,
          value: input.value,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.row.delete({
        where: { id: input.id },
      });
    }),
});