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
      cursor: z.number().min(0).optional(), // Use cursor as offset number
    }))
    .query(async ({ ctx, input }) => {
      const startTime = Date.now();
      const limit = input.limit ?? 50;
      const offset = input.cursor ?? 0;

      // First verify table ownership efficiently
      const authStart = Date.now();
      const table = await ctx.db.table.findFirst({
        where: { 
          id: input.tableId,
          userId: ctx.session.user.id 
        },
        select: { id: true }
      });
      const authTime = Date.now() - authStart;

      if (!table) {
        throw new Error("Table not found or access denied");
      }

      // Then fetch rows with optimized query - using offset instead of cursor
      const queryStart = Date.now();
      const rows = await ctx.db.row.findMany({
        take: limit + 1,
        skip: offset,
        where: { 
          tableId: input.tableId,
        },
        orderBy: { order: "asc" },
        include: {
          cells: {
            select: {
              id: true,
              value: true,
              columnId: true,
              // Don't include full column data - frontend already has it
            }
          },
        },
      });
      const queryTime = Date.now() - queryStart;
      const totalTime = Date.now() - startTime;

      console.log(`[PERF] getByTableId: auth=${authTime}ms, query=${queryTime}ms, total=${totalTime}ms, rows=${rows.length}, offset=${offset}`);

      const hasMore = rows.length > limit;
      if (hasMore) {
        rows.pop(); // Remove the extra row
      }

      return {
        items: rows,
        hasMore,
        nextOffset: hasMore ? offset + limit : undefined,
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

  createBulk: protectedProcedure
    .input(z.object({
      tableId: z.string(),
      rows: z.array(z.object({
        name: z.string().optional(),
        cells: z.array(z.object({
          columnId: z.string(),
          value: z.string(),
        })),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the current max order
      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });
      const nextOrder = (lastRow?.order ?? -1) + 1;

      // Prepare all row data
      const rowsData = input.rows.map((rowData, index) => ({
        tableId: input.tableId,
        name: rowData.name,
        order: nextOrder + index,
      }));

      // Use createMany for better performance
      const result = await ctx.db.row.createMany({
        data: rowsData,
      });

      // Get the created row IDs
      const createdRows = await ctx.db.row.findMany({
        where: {
          tableId: input.tableId,
          order: {
            gte: nextOrder,
            lt: nextOrder + input.rows.length,
          },
        },
        select: { id: true, order: true },
        orderBy: { order: "asc" },
      });

      // Create cells in bulk
      const cellsData = createdRows.flatMap((row, rowIndex) => 
        input.rows[rowIndex]!.cells.map(cell => ({
          rowId: row.id,
          columnId: cell.columnId,
          value: cell.value,
        }))
      );

      await ctx.db.cell.createMany({
        data: cellsData,
      });

      return { count: result.count };
    }),
});