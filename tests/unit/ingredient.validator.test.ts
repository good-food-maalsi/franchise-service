import { describe, it, expect } from "vitest";
import {
  createIngredientSchema,
  updateIngredientSchema,
  ingredientQuerySchema,
  addCategoriesToIngredientSchema,
} from "@good-food-maalsi/contracts/franchise";

describe("Ingredient Validators", () => {
  describe("createIngredientSchema", () => {
    it("should validate correct ingredient data", () => {
      const validData = {
        name: "Poulet fermier",
        description: "Poulet Label Rouge",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: 12.5,
        categories: [],
      };

      const result = createIngredientSchema.parse(validData);
      expect(result.name).toBe("Poulet fermier");
      expect(result.unit_price).toBe(12.5);
    });

    it("should validate with categories by ID", () => {
      const validData = {
        name: "Poulet fermier",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: 12.5,
        categories: [{ id: "550e8400-e29b-41d4-a716-446655440001" }],
      };

      const result = createIngredientSchema.parse(validData);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].id).toBe(
        "550e8400-e29b-41d4-a716-446655440001",
      );
    });

    it("should validate with categories by name (create on-the-fly)", () => {
      const validData = {
        name: "Poulet fermier",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: 12.5,
        categories: [{ name: "Bio", description: "Produits biologiques" }],
      };

      const result = createIngredientSchema.parse(validData);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe("Bio");
    });

    it("should default categories to empty array", () => {
      const validData = {
        name: "Poulet fermier",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: 12.5,
      };

      const result = createIngredientSchema.parse(validData);
      expect(result.categories).toEqual([]);
    });

    it("should reject invalid supplier_id", () => {
      const invalidData = {
        name: "Poulet fermier",
        supplier_id: "not-a-uuid",
        unit_price: 12.5,
      };

      expect(() => createIngredientSchema.parse(invalidData)).toThrow();
    });

    it("should reject negative price", () => {
      const invalidData = {
        name: "Poulet fermier",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: -5,
      };

      expect(() => createIngredientSchema.parse(invalidData)).toThrow();
    });

    it("should reject zero price", () => {
      const invalidData = {
        name: "Poulet fermier",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: 0,
      };

      expect(() => createIngredientSchema.parse(invalidData)).toThrow();
    });

    it("should reject category without id or name", () => {
      const invalidData = {
        name: "Poulet fermier",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        unit_price: 12.5,
        categories: [{ description: "Test" }],
      };

      expect(() => createIngredientSchema.parse(invalidData)).toThrow();
    });
  });

  describe("updateIngredientSchema", () => {
    it("should validate partial updates", () => {
      const validData = {
        name: "Poulet fermier Premium",
      };

      const result = updateIngredientSchema.parse(validData);
      expect(result.name).toBe("Poulet fermier Premium");
    });

    it("should validate null description", () => {
      const validData = {
        description: null,
      };

      const result = updateIngredientSchema.parse(validData);
      expect(result.description).toBeNull();
    });

    it("should accept empty object", () => {
      const result = updateIngredientSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe("ingredientQuerySchema", () => {
    it("should validate with all filters", () => {
      const validQuery = {
        page: "1",
        limit: "10",
        search: "poulet",
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        category_id: "550e8400-e29b-41d4-a716-446655440001",
      };

      const result = ingredientQuerySchema.parse(validQuery);
      expect(result.search).toBe("poulet");
      expect(result.supplier_id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.category_id).toBe("550e8400-e29b-41d4-a716-446655440001");
    });

    it("should allow empty pagination params", () => {
      const result = ingredientQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should reject invalid supplier_id", () => {
      const invalidQuery = {
        supplier_id: "not-a-uuid",
      };

      expect(() => ingredientQuerySchema.parse(invalidQuery)).toThrow();
    });
  });

  describe("addCategoriesToIngredientSchema", () => {
    it("should validate categories to add", () => {
      const validData = {
        categories: [
          { id: "550e8400-e29b-41d4-a716-446655440000" },
          { name: "Bio" },
        ],
      };

      const result = addCategoriesToIngredientSchema.parse(validData);
      expect(result.categories).toHaveLength(2);
    });

    it("should reject empty categories array", () => {
      const invalidData = {
        categories: [],
      };

      expect(() =>
        addCategoriesToIngredientSchema.parse(invalidData),
      ).toThrow();
    });

    it("should reject missing categories field", () => {
      expect(() => addCategoriesToIngredientSchema.parse({})).toThrow();
    });
  });
});
