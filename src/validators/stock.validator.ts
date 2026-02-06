import { z } from "zod";

// Schema for adding/updating stock
export const upsertStockSchema = z.object({
  ingredient_id: z.string().uuid("Invalid ingredient ID format"),
  quantity: z.number().int().min(0, "Quantity must be zero or positive"),
});

// Schema for updating stock quantity
export const updateStockQuantitySchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be zero or positive"),
});

// Schema for IDs
export const stockIdsSchema = z.object({
  franchiseId: z.string().uuid("Invalid franchise ID format"),
  ingredientId: z.string().uuid("Invalid ingredient ID format"),
});

// Inferred TypeScript types
export type UpsertStockInput = z.infer<typeof upsertStockSchema>;
export type UpdateStockQuantityInput = z.infer<typeof updateStockQuantitySchema>;
export type StockIdsParams = z.infer<typeof stockIdsSchema>;
