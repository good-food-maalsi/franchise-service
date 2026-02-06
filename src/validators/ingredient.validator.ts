import { z } from "zod";

// Schema for creating or linking a category
const categoryInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(2).max(255).optional(),
    description: z.string().max(255).optional(),
  })
  .refine((data) => data.id !== undefined || data.name !== undefined, {
    message:
      "Either 'id' (to link existing) or 'name' (to create new) must be provided",
  });

// Schema for creating an ingredient
export const createIngredientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z.string().max(255).optional(),
  supplier_id: z.string().uuid("Invalid supplier ID format"),
  unit_price: z.number().positive("Unit price must be positive"),
  categories: z.array(categoryInputSchema).optional().default([]),
});

// Schema for updating an ingredient (all fields optional)
export const updateIngredientSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(255).optional().nullable(),
  supplier_id: z.string().uuid("Invalid supplier ID format").optional(),
  unit_price: z.number().positive("Unit price must be positive").optional(),
});

// Schema for query parameters (pagination, filters)
export const ingredientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
});

// Schema for ingredient ID (URL params validation)
export const ingredientIdSchema = z.object({
  id: z.string().uuid("Invalid ingredient ID format"),
});

// Schema for adding/creating categories to an ingredient
export const addCategoriesToIngredientSchema = z.object({
  categories: z
    .array(categoryInputSchema)
    .min(1, "At least one category must be provided"),
});

// Inferred TypeScript types
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
export type IngredientQueryParams = z.infer<typeof ingredientQuerySchema>;
export type IngredientIdParams = z.infer<typeof ingredientIdSchema>;
export type AddCategoriesToIngredientInput = z.infer<
  typeof addCategoriesToIngredientSchema
>;
