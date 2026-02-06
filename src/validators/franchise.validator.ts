import { z } from "zod";

// Schema for creating a franchise
export const createFranchiseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zip: z.string().min(1).max(10),
  owner_id: z.string().uuid(),
  email: z.string().email().max(100),
  phone: z.string().min(1).max(20),
});

// Schema for updating a franchise (all fields optional)
export const updateFranchiseSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  street: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(50).optional(),
  zip: z.string().min(1).max(10).optional(),
  owner_id: z.string().uuid().optional(),
  email: z.string().email().max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
});

// Schema for query parameters (pagination, filters)
export const franchiseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Schema for franchise ID (URL params validation)
export const franchiseIdSchema = z.object({
  id: z.string().uuid("Invalid franchise ID format"),
});

// Inferred TypeScript types
export type CreateFranchiseInput = z.infer<typeof createFranchiseSchema>;
export type UpdateFranchiseInput = z.infer<typeof updateFranchiseSchema>;
export type FranchiseQueryParams = z.infer<typeof franchiseQuerySchema>;
export type FranchiseIdParams = z.infer<typeof franchiseIdSchema>;
