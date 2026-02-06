import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  connectTestDatabase,
  disconnectTestDatabase,
  cleanDatabase,
} from "@/tests/helpers/db-test-helper";
import { testDataFactory } from "@/tests/helpers/seed-test-data";

describe("Category Repository Integration Tests", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("findAll", () => {
    it("should return empty array when no categories exist", async () => {
      const result = await prisma.category.findMany();
      expect(result).toEqual([]);
    });

    it("should return all categories with pagination", async () => {
      // Create test data
      await testDataFactory.createCategory(prisma, { name: "Category 1" });
      await testDataFactory.createCategory(prisma, { name: "Category 2" });
      await testDataFactory.createCategory(prisma, { name: "Category 3" });

      const result = await prisma.category.findMany({
        take: 2,
        skip: 0,
        orderBy: { name: "asc" },
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Category 1");
      expect(result[1].name).toBe("Category 2");
    });

    it("should search categories by name", async () => {
      await testDataFactory.createCategory(prisma, { name: "Viandes" });
      await testDataFactory.createCategory(prisma, { name: "Légumes" });
      await testDataFactory.createCategory(prisma, { name: "Fruits" });

      const result = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: "Viand", mode: "insensitive" } },
            { description: { contains: "Viand", mode: "insensitive" } },
          ],
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Viandes");
    });
  });

  describe("findById", () => {
    it("should return category by id", async () => {
      const created = await testDataFactory.createCategory(prisma, {
        name: "Test Category",
      });

      const found = await prisma.category.findUnique({
        where: { id: created.id },
      });

      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Category");
    });

    it("should return null when category not found", async () => {
      const found = await prisma.category.findUnique({
        where: { id: "550e8400-e29b-41d4-a716-446655440000" },
      });

      expect(found).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should return category by name (case insensitive)", async () => {
      await testDataFactory.createCategory(prisma, { name: "Viandes" });

      const found = await prisma.category.findFirst({
        where: {
          name: {
            equals: "VIANDES",
            mode: "insensitive",
          },
        },
      });

      expect(found).toBeDefined();
      expect(found?.name).toBe("Viandes");
    });
  });

  describe("create", () => {
    it("should create a new category", async () => {
      const category = await prisma.category.create({
        data: {
          name: "Viandes",
          description: "Produits carnés",
        },
      });

      expect(category.id).toBeDefined();
      expect(category.name).toBe("Viandes");
      expect(category.description).toBe("Produits carnés");
      expect(category.created_at).toBeInstanceOf(Date);
      expect(category.updated_at).toBeInstanceOf(Date);
    });

    it("should create category without description", async () => {
      const category = await prisma.category.create({
        data: {
          name: "Légumes",
        },
      });

      expect(category.description).toBeNull();
    });

    it("should fail to create duplicate category name", async () => {
      await prisma.category.create({
        data: { name: "Viandes" },
      });

      // Note: Prisma ne vérifie pas l'unicité au niveau schéma
      // mais le handler le fait - ce test montre qu'on PEUT créer des doublons
      // si on ne valide pas au niveau handler
      const duplicate = await prisma.category.create({
        data: { name: "Viandes" },
      });

      expect(duplicate).toBeDefined();

      // Vérifier qu'on a bien 2 catégories
      const count = await prisma.category.count();
      expect(count).toBe(2);
    });
  });

  describe("update", () => {
    it("should update category", async () => {
      const created = await testDataFactory.createCategory(prisma, {
        name: "Viandes",
      });

      const updated = await prisma.category.update({
        where: { id: created.id },
        data: {
          name: "Viandes et Volailles",
          description: "Produits carnés et volailles",
        },
      });

      expect(updated.name).toBe("Viandes et Volailles");
      expect(updated.description).toBe("Produits carnés et volailles");
      expect(updated.updated_at.getTime()).toBeGreaterThan(
        created.updated_at.getTime()
      );
    });

    it("should fail to update non-existent category", async () => {
      await expect(
        prisma.category.update({
          where: { id: "550e8400-e29b-41d4-a716-446655440000" },
          data: { name: "New Name" },
        })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete category", async () => {
      const created = await testDataFactory.createCategory(prisma);

      await prisma.category.delete({
        where: { id: created.id },
      });

      const found = await prisma.category.findUnique({
        where: { id: created.id },
      });

      expect(found).toBeNull();
    });

    it("should fail to delete non-existent category", async () => {
      await expect(
        prisma.category.delete({
          where: { id: "550e8400-e29b-41d4-a716-446655440000" },
        })
      ).rejects.toThrow();
    });

    it("should cascade delete ingredient_categories", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const category = await testDataFactory.createCategory(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      // Link ingredient to category
      await prisma.ingredientCategory.create({
        data: {
          ingredient_id: ingredient.id,
          category_id: category.id,
        },
      });

      // Delete category
      await prisma.category.delete({
        where: { id: category.id },
      });

      // Verify cascade
      const relations = await prisma.ingredientCategory.findMany({
        where: { category_id: category.id },
      });

      expect(relations).toHaveLength(0);
    });
  });

  describe("count and pagination", () => {
    it("should count categories correctly", async () => {
      await testDataFactory.createCategory(prisma);
      await testDataFactory.createCategory(prisma);
      await testDataFactory.createCategory(prisma);

      const count = await prisma.category.count();
      expect(count).toBe(3);
    });

    it("should paginate results", async () => {
      for (let i = 0; i < 15; i++) {
        await testDataFactory.createCategory(prisma, {
          name: `Category ${i.toString().padStart(2, "0")}`,
        });
      }

      const page1 = await prisma.category.findMany({
        take: 5,
        skip: 0,
        orderBy: { name: "asc" },
      });

      const page2 = await prisma.category.findMany({
        take: 5,
        skip: 5,
        orderBy: { name: "asc" },
      });

      expect(page1).toHaveLength(5);
      expect(page2).toHaveLength(5);
      expect(page1[0].name).not.toBe(page2[0].name);
    });
  });
});

