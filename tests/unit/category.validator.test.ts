import { describe, it, expect } from "vitest";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  categoryIdSchema,
} from "@good-food-maalsi/contracts/franchise";

describe("Category Validators", () => {
  describe("createCategorySchema", () => {
    it("should validate correct category data", () => {
      const validData = {
        name: "Viandes",
        description: "Produits carnés",
      };

      const result = createCategorySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should accept category without description", () => {
      const validData = {
        name: "Viandes",
      };

      const result = createCategorySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should reject name too short", () => {
      const invalidData = {
        name: "A",
        description: "Test",
      };

      expect(() => createCategorySchema.parse(invalidData)).toThrow();
    });

    it("should reject name too long", () => {
      const invalidData = {
        name: "A".repeat(256),
        description: "Test",
      };

      expect(() => createCategorySchema.parse(invalidData)).toThrow();
    });

    it("should reject description too long", () => {
      const invalidData = {
        name: "Viandes",
        description: "A".repeat(256),
      };

      expect(() => createCategorySchema.parse(invalidData)).toThrow();
    });

    it("should reject missing name", () => {
      const invalidData = {
        description: "Test",
      };

      expect(() => createCategorySchema.parse(invalidData)).toThrow();
    });
  });

  describe("updateCategorySchema", () => {
    it("should validate correct update data", () => {
      const validData = {
        name: "Viandes et Volailles",
        description: "Produits carnés et volailles",
      };

      const result = updateCategorySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should accept partial updates", () => {
      const validData = {
        name: "Viandes",
      };

      const result = updateCategorySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should accept null description", () => {
      const validData = {
        description: null,
      };

      const result = updateCategorySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should accept empty object", () => {
      const validData = {};

      const result = updateCategorySchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe("categoryQuerySchema", () => {
    it("should validate correct query params", () => {
      const validQuery = {
        page: "1",
        limit: "10",
        search: "viande",
      };

      const result = categoryQuerySchema.parse(validQuery);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.search).toBe("viande");
    });

    it("should allow empty pagination params", () => {
      const result = categoryQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should coerce string to number", () => {
      const validQuery = {
        page: "5",
        limit: "20",
      };

      const result = categoryQuerySchema.parse(validQuery);
      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
    });

    it("should reject limit too high", () => {
      const invalidQuery = {
        limit: "101",
      };

      expect(() => categoryQuerySchema.parse(invalidQuery)).toThrow();
    });

    it("should reject page less than 1", () => {
      const invalidQuery = {
        page: "0",
      };

      expect(() => categoryQuerySchema.parse(invalidQuery)).toThrow();
    });
  });

  describe("categoryIdSchema", () => {
    it("should validate correct UUID", () => {
      const validId = {
        id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = categoryIdSchema.parse(validId);
      expect(result).toEqual(validId);
    });

    it("should reject invalid UUID", () => {
      const invalidId = {
        id: "not-a-uuid",
      };

      expect(() => categoryIdSchema.parse(invalidId)).toThrow();
    });

    it("should reject missing id", () => {
      expect(() => categoryIdSchema.parse({})).toThrow();
    });
  });
});
