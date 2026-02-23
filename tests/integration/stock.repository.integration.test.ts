import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  connectTestDatabase,
  disconnectTestDatabase,
  cleanDatabase,
} from "@/tests/helpers/db-test-helper";
import { testDataFactory } from "@/tests/helpers/seed-test-data";

describe("Stock Repository Integration Tests", () => {
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

  describe("create stock", () => {
    it("should create stock entry", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      const stock = await prisma.stockFranchise.create({
        data: {
          franchise_id: franchise.id,
          ingredient_id: ingredient.id,
          quantity: 100,
        },
      });

      expect(stock.id).toBeDefined();
      expect(stock.quantity).toBe(100);
      expect(stock.created_at).toBeInstanceOf(Date);
    });

    it("should allow quantity to be zero", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      const stock = await prisma.stockFranchise.create({
        data: {
          franchise_id: franchise.id,
          ingredient_id: ingredient.id,
          quantity: 0,
        },
      });

      expect(stock.quantity).toBe(0);
    });
  });

  describe("upsert stock", () => {
    it("should create stock if not exists", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      // Check if exists
      const existing = await prisma.stockFranchise.findFirst({
        where: {
          franchise_id: franchise.id,
          ingredient_id: ingredient.id,
        },
      });

      if (!existing) {
        const stock = await prisma.stockFranchise.create({
          data: {
            franchise_id: franchise.id,
            ingredient_id: ingredient.id,
            quantity: 50,
          },
        });
        expect(stock.quantity).toBe(50);
      }
    });

    it("should update stock if exists", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      // Create initial stock
      const initial = await prisma.stockFranchise.create({
        data: {
          franchise_id: franchise.id,
          ingredient_id: ingredient.id,
          quantity: 50,
        },
      });

      // Update
      const updated = await prisma.stockFranchise.update({
        where: { id: initial.id },
        data: { quantity: 75 },
      });

      expect(updated.quantity).toBe(75);
      expect(updated.id).toBe(initial.id);
    });
  });

  describe("findAll for franchise", () => {
    it("should get all stock for a franchise", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ing1 = await testDataFactory.createIngredient(prisma, supplier.id, {
        name: "Poulet",
      });
      const ing2 = await testDataFactory.createIngredient(prisma, supplier.id, {
        name: "Tomates",
      });

      await testDataFactory.createStock(prisma, franchise.id, ing1.id, 50);
      await testDataFactory.createStock(prisma, franchise.id, ing2.id, 100);

      const stock = await prisma.stockFranchise.findMany({
        where: { franchise_id: franchise.id },
        include: {
          ingredient: true,
        },
        orderBy: {
          ingredient: {
            name: "asc",
          },
        },
      });

      expect(stock).toHaveLength(2);
      expect(stock[0].ingredient.name).toBe("Poulet");
      expect(stock[0].quantity).toBe(50);
      expect(stock[1].ingredient.name).toBe("Tomates");
      expect(stock[1].quantity).toBe(100);
    });

    it("should return empty array when franchise has no stock", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);

      const stock = await prisma.stockFranchise.findMany({
        where: { franchise_id: franchise.id },
      });

      expect(stock).toHaveLength(0);
    });
  });

  describe("update quantity", () => {
    it("should update stock quantity", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      const stock = await testDataFactory.createStock(
        prisma,
        franchise.id,
        ingredient.id,
        50
      );

      const updated = await prisma.stockFranchise.update({
        where: { id: stock.id },
        data: { quantity: 25 },
      });

      expect(updated.quantity).toBe(25);
    });

    it("should track updated_at timestamp", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      const stock = await testDataFactory.createStock(
        prisma,
        franchise.id,
        ingredient.id,
        50
      );

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await prisma.stockFranchise.update({
        where: { id: stock.id },
        data: { quantity: 75 },
      });

      expect(updated.updated_at.getTime()).toBeGreaterThan(
        stock.updated_at.getTime()
      );
    });
  });

  describe("delete stock", () => {
    it("should delete stock entry", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      const stock = await testDataFactory.createStock(
        prisma,
        franchise.id,
        ingredient.id,
        50
      );

      await prisma.stockFranchise.delete({
        where: { id: stock.id },
      });

      const found = await prisma.stockFranchise.findUnique({
        where: { id: stock.id },
      });

      expect(found).toBeNull();
    });

    it("should delete by composite key (franchise + ingredient)", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      await testDataFactory.createStock(prisma, franchise.id, ingredient.id, 50);

      await prisma.stockFranchise.deleteMany({
        where: {
          franchise_id: franchise.id,
          ingredient_id: ingredient.id,
        },
      });

      const found = await prisma.stockFranchise.findMany({
        where: {
          franchise_id: franchise.id,
          ingredient_id: ingredient.id,
        },
      });

      expect(found).toHaveLength(0);
    });
  });

  describe("cascade delete", () => {
    it("should delete stock when franchise is deleted", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      await testDataFactory.createStock(prisma, franchise.id, ingredient.id, 50);

      await prisma.franchise.delete({
        where: { id: franchise.id },
      });

      const stock = await prisma.stockFranchise.findMany({
        where: { franchise_id: franchise.id },
      });

      expect(stock).toHaveLength(0);
    });

    it("should delete stock when ingredient is deleted", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );

      await testDataFactory.createStock(prisma, franchise.id, ingredient.id, 50);

      await prisma.ingredient.delete({
        where: { id: ingredient.id },
      });

      const stock = await prisma.stockFranchise.findMany({
        where: { ingredient_id: ingredient.id },
      });

      expect(stock).toHaveLength(0);
    });
  });

  describe("complex queries", () => {
    it("should filter stock with low quantity", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ing1 = await testDataFactory.createIngredient(prisma, supplier.id);
      const ing2 = await testDataFactory.createIngredient(prisma, supplier.id);
      const ing3 = await testDataFactory.createIngredient(prisma, supplier.id);

      await testDataFactory.createStock(prisma, franchise.id, ing1.id, 5);
      await testDataFactory.createStock(prisma, franchise.id, ing2.id, 50);
      await testDataFactory.createStock(prisma, franchise.id, ing3.id, 2);

      const lowStock = await prisma.stockFranchise.findMany({
        where: {
          franchise_id: franchise.id,
          quantity: {
            lt: 10,
          },
        },
      });

      expect(lowStock).toHaveLength(2);
    });

    it("should get stock with ingredient and supplier details", async () => {
      const supplier = await testDataFactory.createSupplier(prisma, {
        name: "Test Supplier",
      });
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id,
        { name: "Poulet" }
      );

      await testDataFactory.createStock(prisma, franchise.id, ingredient.id, 50);

      const result = await prisma.stockFranchise.findMany({
        where: { franchise_id: franchise.id },
        include: {
          ingredient: {
            include: {
              supplier: true,
            },
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].ingredient.name).toBe("Poulet");
      expect(result[0].ingredient.supplier.name).toBe("Test Supplier");
    });
  });
});

