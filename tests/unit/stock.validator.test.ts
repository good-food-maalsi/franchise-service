import { describe, it, expect } from "vitest";
import {
  upsertStockSchema,
  updateStockQuantitySchema,
  stockIdsSchema,
} from "@good-food/contracts/franchise";

describe("Stock Validators", () => {
  describe("upsertStockSchema", () => {
    it("should validate correct stock data", () => {
      const validData = {
        ingredient_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 50,
      };

      const result = upsertStockSchema.parse(validData);
      expect(result.quantity).toBe(50);
      expect(result.ingredient_id).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("should accept zero quantity", () => {
      const validData = {
        ingredient_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 0,
      };

      const result = upsertStockSchema.parse(validData);
      expect(result.quantity).toBe(0);
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        ingredient_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: -5,
      };

      expect(() => upsertStockSchema.parse(invalidData)).toThrow();
    });

    it("should reject decimal quantity", () => {
      const invalidData = {
        ingredient_id: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 50.5,
      };

      expect(() => upsertStockSchema.parse(invalidData)).toThrow();
    });

    it("should reject invalid ingredient_id", () => {
      const invalidData = {
        ingredient_id: "not-a-uuid",
        quantity: 50,
      };

      expect(() => upsertStockSchema.parse(invalidData)).toThrow();
    });

    it("should reject missing fields", () => {
      expect(() => upsertStockSchema.parse({ quantity: 50 })).toThrow();
      expect(() =>
        upsertStockSchema.parse({
          ingredient_id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      ).toThrow();
    });
  });

  describe("updateStockQuantitySchema", () => {
    it("should validate quantity update", () => {
      const validData = {
        quantity: 75,
      };

      const result = updateStockQuantitySchema.parse(validData);
      expect(result.quantity).toBe(75);
    });

    it("should accept zero quantity", () => {
      const validData = {
        quantity: 0,
      };

      const result = updateStockQuantitySchema.parse(validData);
      expect(result.quantity).toBe(0);
    });

    it("should reject negative quantity", () => {
      const invalidData = {
        quantity: -10,
      };

      expect(() => updateStockQuantitySchema.parse(invalidData)).toThrow();
    });

    it("should reject decimal quantity", () => {
      const invalidData = {
        quantity: 75.3,
      };

      expect(() => updateStockQuantitySchema.parse(invalidData)).toThrow();
    });
  });

  describe("stockIdsSchema", () => {
    it("should validate correct IDs", () => {
      const validData = {
        franchiseId: "550e8400-e29b-41d4-a716-446655440000",
        ingredientId: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = stockIdsSchema.parse(validData);
      expect(result.franchiseId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.ingredientId).toBe("550e8400-e29b-41d4-a716-446655440001");
    });

    it("should reject invalid franchiseId", () => {
      const invalidData = {
        franchiseId: "not-a-uuid",
        ingredientId: "550e8400-e29b-41d4-a716-446655440001",
      };

      expect(() => stockIdsSchema.parse(invalidData)).toThrow();
    });

    it("should reject invalid ingredientId", () => {
      const invalidData = {
        franchiseId: "550e8400-e29b-41d4-a716-446655440000",
        ingredientId: "not-a-uuid",
      };

      expect(() => stockIdsSchema.parse(invalidData)).toThrow();
    });

    it("should reject missing fields", () => {
      expect(() =>
        stockIdsSchema.parse({
          franchiseId: "550e8400-e29b-41d4-a716-446655440000",
        }),
      ).toThrow();
      expect(() =>
        stockIdsSchema.parse({
          ingredientId: "550e8400-e29b-41d4-a716-446655440001",
        }),
      ).toThrow();
    });
  });
});
