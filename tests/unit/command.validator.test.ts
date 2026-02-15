import { describe, it, expect } from "vitest";
import {
  CommandStatus,
  createCommandSchema,
  updateCommandSchema,
  commandQuerySchema,
  addIngredientToCommandSchema,
  updateCommandIngredientSchema,
} from "@good-food-maalsi/contracts/franchise";

describe("Command Validators", () => {
  describe("createCommandSchema", () => {
    it("should validate command with items", () => {
      const validData = {
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        status: CommandStatus.draft,
        items: [
          {
            ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
            quantity: 10,
          },
        ],
      };

      const result = createCommandSchema.parse(validData);
      expect(result.items).toHaveLength(1);
      expect(result.status).toBe(CommandStatus.draft);
    });

    it("should allow omitting status", () => {
      const validData = {
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        items: [
          {
            ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
            quantity: 1,
          },
        ],
      };

      const result = createCommandSchema.parse(validData);
      expect(result.status).toBe(CommandStatus.draft);
    });

    it("should allow empty items array", () => {
      const validData = {
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        items: [],
      };

      const result = createCommandSchema.parse(validData);
      expect(result.items).toHaveLength(0);
    });

    it("should reject invalid franchise_id", () => {
      const invalidData = {
        franchise_id: "not-a-uuid",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
      };

      expect(() => createCommandSchema.parse(invalidData)).toThrow();
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        items: [
          {
            ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
            quantity: -5,
          },
        ],
      };

      expect(() => createCommandSchema.parse(invalidData)).toThrow();
    });

    it("should reject zero quantity", () => {
      const invalidData = {
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        items: [
          {
            ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
            quantity: 0,
          },
        ],
      };

      expect(() => createCommandSchema.parse(invalidData)).toThrow();
    });

    it("should reject decimal quantity", () => {
      const invalidData = {
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        items: [
          {
            ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
            quantity: 10.5,
          },
        ],
      };

      expect(() => createCommandSchema.parse(invalidData)).toThrow();
    });

    it("should accept all valid statuses", () => {
      const statuses = [
        CommandStatus.draft,
        CommandStatus.confirmed,
        CommandStatus.in_progress,
        CommandStatus.delivered,
        CommandStatus.canceled,
      ];

      statuses.forEach((status) => {
        const validData = {
          franchise_id: "550e8400-e29b-41d4-a716-446655440000",
          user_id: "550e8400-e29b-41d4-a716-446655440001",
          status,
          items: [
            {
              ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
              quantity: 1,
            },
          ],
        };

        const result = createCommandSchema.parse(validData);
        expect(result.status).toBe(status);
      });
    });
  });

  describe("updateCommandSchema", () => {
    it("should validate status update", () => {
      const validData = {
        status: CommandStatus.confirmed,
      };

      const result = updateCommandSchema.parse(validData);
      expect(result.status).toBe(CommandStatus.confirmed);
    });

    it("should validate user_id update", () => {
      const validData = {
        user_id: "550e8400-e29b-41d4-a716-446655440010",
      };

      const result = updateCommandSchema.parse(validData);
      expect(result.user_id).toBe("550e8400-e29b-41d4-a716-446655440010");
    });

    it("should accept empty object", () => {
      const result = updateCommandSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe("commandQuerySchema", () => {
    it("should validate with all filters", () => {
      const validQuery = {
        page: "1",
        limit: "10",
        franchise_id: "550e8400-e29b-41d4-a716-446655440000",
        status: CommandStatus.confirmed,
        user_id: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = commandQuerySchema.parse(validQuery);
      expect(result.franchise_id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.status).toBe(CommandStatus.confirmed);
      expect(result.user_id).toBe("550e8400-e29b-41d4-a716-446655440001");
    });

    it("should allow empty pagination params", () => {
      const result = commandQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe("addIngredientToCommandSchema", () => {
    it("should validate ingredient addition", () => {
      const validData = {
        ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
        quantity: 5,
      };

      const result = addIngredientToCommandSchema.parse(validData);
      expect(result.quantity).toBe(5);
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
        quantity: -1,
      };

      expect(() => addIngredientToCommandSchema.parse(invalidData)).toThrow();
    });
  });

  describe("updateCommandIngredientSchema", () => {
    it("should validate quantity update", () => {
      const validData = {
        quantity: 15,
      };

      const result = updateCommandIngredientSchema.parse(validData);
      expect(result.quantity).toBe(15);
    });

    it("should reject zero quantity", () => {
      const invalidData = {
        quantity: 0,
      };

      expect(() => updateCommandIngredientSchema.parse(invalidData)).toThrow();
    });

    it("should reject decimal quantity", () => {
      const invalidData = {
        quantity: 10.5,
      };

      expect(() => updateCommandIngredientSchema.parse(invalidData)).toThrow();
    });
  });
});
