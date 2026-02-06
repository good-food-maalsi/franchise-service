import { z } from "zod";
import { CommandStatus } from "../generated/prisma/client.js";

// Schema for a command item
const commandItemSchema = z.object({
  ingredient_id: z.string().uuid("Invalid ingredient ID format"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Schema for creating a command
export const createCommandSchema = z.object({
  franchise_id: z.string().uuid("Invalid franchise ID format").optional(),
  status: z
    .enum([
      CommandStatus.draft,
      CommandStatus.confirmed,
      CommandStatus.in_progress,
      CommandStatus.delivered,
      CommandStatus.canceled,
    ])
    .default(CommandStatus.draft)
    .optional(),
  user_id: z.string().uuid("Invalid user ID format"),
  items: z
    .array(commandItemSchema)
    .min(1, "At least one item must be provided")
    .optional()
    .default([]),
});

// Schema for updating a command (all fields optional)
export const updateCommandSchema = z.object({
  status: z
    .enum([
      CommandStatus.draft,
      CommandStatus.confirmed,
      CommandStatus.in_progress,
      CommandStatus.delivered,
      CommandStatus.canceled,
    ])
    .optional(),
  user_id: z.string().uuid("Invalid user ID format").optional(),
});

// Schema for query parameters (pagination, filters)
export const commandQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  franchise_id: z.string().uuid().optional(),
  status: z
    .enum([
      CommandStatus.draft,
      CommandStatus.confirmed,
      CommandStatus.in_progress,
      CommandStatus.delivered,
      CommandStatus.canceled,
    ])
    .optional(),
  user_id: z.string().uuid().optional(),
});

// Schema for command ID (URL params validation)
export const commandIdSchema = z.object({
  id: z.string().uuid("Invalid command ID format"),
});

// Schema for adding an ingredient to a command
export const addIngredientToCommandSchema = z.object({
  ingredient_id: z.string().uuid("Invalid ingredient ID format"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Schema for updating ingredient quantity
export const updateCommandIngredientSchema = z.object({
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Inferred TypeScript types
export type CommandItem = z.infer<typeof commandItemSchema>;
export type CreateCommandInput = z.infer<typeof createCommandSchema>;
export type UpdateCommandInput = z.infer<typeof updateCommandSchema>;
export type CommandQueryParams = z.infer<typeof commandQuerySchema>;
export type CommandIdParams = z.infer<typeof commandIdSchema>;
export type AddIngredientToCommandInput = z.infer<
  typeof addIngredientToCommandSchema
>;
export type UpdateCommandIngredientInput = z.infer<
  typeof updateCommandIngredientSchema
>;
