import { z } from "zod";

// Schema for creating a supplier
export const createSupplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  logo_url: z.string().url("Invalid URL format").max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().min(1).max(100),
  email: z.string().email().max(100),
});

// Schema for updating a supplier (all fields optional)
export const updateSupplierSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  logo_url: z.string().url("Invalid URL format").max(500).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  phone: z.string().min(1).max(100).optional(),
  email: z.string().email().max(100).optional(),
});

// Schema for query parameters (pagination, filters)
export const supplierQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
});

// Schema for supplier ID (URL params validation)
export const supplierIdSchema = z.object({
  id: z.string().uuid("Invalid supplier ID format"),
});

// Inferred TypeScript types
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierQueryParams = z.infer<typeof supplierQuerySchema>;
export type SupplierIdParams = z.infer<typeof supplierIdSchema>;
