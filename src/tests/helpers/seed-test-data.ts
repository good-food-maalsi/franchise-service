import type { PrismaClient } from "@prisma/client";
import { CommandStatus } from "@prisma/client";

/**
 * Seed minimal data for tests
 */
export async function seedTestData(prisma: PrismaClient) {
  // Create a supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: "Test Supplier",
      email: "test@supplier.com",
      phone: "+33 1 23 45 67 89",
      latitude: 48.8566,
      longitude: 2.3522,
    },
  });

  // Create a franchise
  const franchise = await prisma.franchise.create({
    data: {
      name: "Test Franchise",
      email: "test@franchise.com",
      phone: "+33 1 23 45 67 89",
      street: "123 Test Street",
      city: "Paris",
      state: "Île-de-France",
      zip: "75001",
      latitude: 48.8566,
      longitude: 2.3522,
      owner_id: "550e8400-e29b-41d4-a716-446655440000",
    },
  });

  // Create a category
  const category = await prisma.category.create({
    data: {
      name: "Test Category",
      description: "Category for testing",
    },
  });

  // Create an ingredient
  const ingredient = await prisma.ingredient.create({
    data: {
      name: "Test Ingredient",
      description: "Ingredient for testing",
      supplier_id: supplier.id,
      unit_price: 10.5,
    },
  });

  // Link ingredient to category
  await prisma.ingredientCategory.create({
    data: {
      ingredient_id: ingredient.id,
      category_id: category.id,
    },
  });

  return {
    supplier,
    franchise,
    category,
    ingredient,
  };
}

// Global counter to ensure uniqueness
let testCounter = 0;

/**
 * Generate a unique identifier for tests
 */
function generateUniqueId(): string {
  testCounter++;
  return `${Date.now()}-${testCounter}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

/**
 * Create specific data for a test
 */
export const testDataFactory = {
  async createSupplier(prisma: PrismaClient, overrides = {}) {
    const uniqueId = generateUniqueId();
    return prisma.supplier.create({
      data: {
        name: `Supplier ${uniqueId}`,
        email: `supplier-${uniqueId}@test.com`,
        phone: "+33 1 23 45 67 89",
        ...overrides,
      },
    });
  },

  async createFranchise(prisma: PrismaClient, overrides = {}) {
    const uniqueId = generateUniqueId();
    return prisma.franchise.create({
      data: {
        name: `Franchise ${uniqueId}`,
        email: `franchise-${uniqueId}@test.com`,
        phone: "+33 1 23 45 67 89",
        street: "123 Test Street",
        city: "Paris",
        state: "Île-de-France",
        zip: "75001",
        latitude: 48.8566,
        longitude: 2.3522,
        owner_id: "550e8400-e29b-41d4-a716-446655440000",
        ...overrides,
      },
    });
  },

  async createCategory(prisma: PrismaClient, overrides = {}) {
    const uniqueId = generateUniqueId();
    return prisma.category.create({
      data: {
        name: `Category ${uniqueId}`,
        description: "Test category",
        ...overrides,
      },
    });
  },

  async createIngredient(
    prisma: PrismaClient,
    supplierId: string,
    overrides = {}
  ) {
    const uniqueId = generateUniqueId();
    return prisma.ingredient.create({
      data: {
        name: `Ingredient ${uniqueId}`,
        description: "Test ingredient",
        supplier_id: supplierId,
        unit_price: 10.5,
        ...overrides,
      },
    });
  },

  async createCommand(
    prisma: PrismaClient,
    franchiseId: string,
    overrides = {}
  ) {
    return prisma.command.create({
      data: {
        franchise_id: franchiseId,
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        status: CommandStatus.draft,
        ...overrides,
      },
    });
  },

  async createStock(
    prisma: PrismaClient,
    franchiseId: string,
    ingredientId: string,
    quantity = 50
  ) {
    return prisma.stockFranchise.create({
      data: {
        franchise_id: franchiseId,
        ingredient_id: ingredientId,
        quantity,
      },
    });
  },
};

