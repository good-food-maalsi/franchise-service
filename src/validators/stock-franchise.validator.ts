import { z } from "zod";

export const stockFranchiseQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  franchise_id: z.string().optional(),
});

export const createStockFranchiseSchema = z.object({
  franchise_id: z.string().optional(),
  ingredient_id: z.string(),
  quantity: z.number().int().min(0),
});

export const updateStockFranchiseSchema = z.object({
  quantity: z.number().int().min(0),
});

export const stockFranchiseIdSchema = z.object({
  id: z.string(),
});

export type StockFranchiseQueryParams = z.infer<
  typeof stockFranchiseQuerySchema
>;
export type CreateStockFranchiseInput = z.infer<
  typeof createStockFranchiseSchema
>;
export type UpdateStockFranchiseInput = z.infer<
  typeof updateStockFranchiseSchema
>;
