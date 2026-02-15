import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";
import type {
  CreateFranchiseInput,
  UpdateFranchiseInput,
  FranchiseQueryParams,
} from "@good-food-maalsi/contracts/franchise";

export const franchiseRepository = {
  /**
   * Get all franchises with pagination and filters
   */
  async findAll(params: FranchiseQueryParams) {
    const { page = 1, limit = 10, search, city, state } = params;
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.FranchiseWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { street: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    const [franchises, total] = await Promise.all([
      prisma.franchise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          _count: {
            select: {
              stocks: true,
              commands: true,
            },
          },
        },
      }),
      prisma.franchise.count({ where }),
    ]);

    return {
      data: franchises,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a franchise by ID
   */
  async findById(id: string) {
    return prisma.franchise.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            ingredient: true,
          },
        },
        commands: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
        _count: {
          select: {
            stocks: true,
            commands: true,
          },
        },
      },
    });
  },

  /**
   * Get a franchise by email
   */
  async findByEmail(email: string) {
    return prisma.franchise.findUnique({
      where: { email },
    });
  },

  /**
   * Create a new franchise
   */
  async create(data: CreateFranchiseInput) {
    return prisma.franchise.create({
      data,
    });
  },

  /**
   * Update a franchise
   */
  async update(id: string, data: UpdateFranchiseInput) {
    return prisma.franchise.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a franchise
   */
  async delete(id: string) {
    return prisma.franchise.delete({
      where: { id },
    });
  },

  /**
   * Get stock of a franchise
   */
  async getStock(franchiseId: string) {
    return prisma.stockFranchise.findMany({
      where: { franchise_id: franchiseId },
      include: {
        ingredient: {
          include: {
            supplier: true,
            ingredient_categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { ingredient: { name: "asc" } },
    });
  },

  /**
   * Check if a franchise exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.franchise.count({
      where: { id },
    });
    return count > 0;
  },

  /**
   * Add or update stock (upsert)
   */
  async upsertStock(
    franchiseId: string,
    ingredientId: string,
    quantity: number,
  ) {
    // Check if stock entry exists
    const existingStock = await prisma.stockFranchise.findFirst({
      where: {
        franchise_id: franchiseId,
        ingredient_id: ingredientId,
      },
    });

    if (existingStock) {
      // Update
      return prisma.stockFranchise.update({
        where: { id: existingStock.id },
        data: { quantity },
        include: {
          ingredient: {
            include: {
              supplier: true,
            },
          },
        },
      });
    }

    // Create
    return prisma.stockFranchise.create({
      data: {
        franchise_id: franchiseId,
        ingredient_id: ingredientId,
        quantity,
      },
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
      },
    });
  },

  /**
   * Update stock quantity
   */
  async updateStockQuantity(
    franchiseId: string,
    ingredientId: string,
    quantity: number,
  ) {
    const stock = await prisma.stockFranchise.findFirst({
      where: {
        franchise_id: franchiseId,
        ingredient_id: ingredientId,
      },
    });

    if (!stock) {
      return null;
    }

    return prisma.stockFranchise.update({
      where: { id: stock.id },
      data: { quantity },
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
      },
    });
  },

  /**
   * Delete a stock entry
   */
  async deleteStock(franchiseId: string, ingredientId: string) {
    return prisma.stockFranchise.deleteMany({
      where: {
        franchise_id: franchiseId,
        ingredient_id: ingredientId,
      },
    });
  },
};
