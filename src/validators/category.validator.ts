import { z } from "zod";

// Schema for creating a category
export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z.string().max(255).optional(),
});

// Schema for updating a category (all fields optional)
export const updateCategorySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(255).optional().nullable(),
});

// Schema for query parameters (pagination, filters)
export const categoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
});

// Schema for category ID (URL params validation)
export const categoryIdSchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
});

// Inferred TypeScript types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdSchema>;
