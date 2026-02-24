import { prisma } from "../config/database.js";
import type {
  StockFranchiseQueryParams,
  CreateStockFranchiseInput,
  UpdateStockFranchiseInput,
} from "@good-food/contracts/franchise";

export const stockFranchiseRepository = {
  async findAll(params: StockFranchiseQueryParams) {
    const { page = 1, limit = 10, search, franchise_id } = params;
    const skip = (page - 1) * limit;

    const where = {
      franchise_id,
      ...(search && {
        ingredient: {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.stockFranchise.findMany({
        where,
        skip,
        take: limit,
        include: {
          ingredient: {
            include: {
              supplier: true,
            },
          },
          franchise: true,
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.stockFranchise.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    return prisma.stockFranchise.findUnique({
      where: { id },
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
        franchise: true,
      },
    });
  },

  async findByFranchiseAndIngredient(
    franchiseId: string,
    ingredientId: string,
  ) {
    return prisma.stockFranchise.findFirst({
      where: {
        franchise_id: franchiseId,
        ingredient_id: ingredientId,
      },
    });
  },

  async create(data: CreateStockFranchiseInput) {
    return prisma.stockFranchise.create({
      data: {
        franchise_id: data.franchise_id!,
        ingredient_id: data.ingredient_id,
        quantity: data.quantity,
      },
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
        franchise: true,
      },
    });
  },

  async update(id: string, data: UpdateStockFranchiseInput) {
    return prisma.stockFranchise.update({
      where: { id },
      data,
      include: {
        ingredient: {
          include: {
            supplier: true,
          },
        },
        franchise: true,
      },
    });
  },

  async delete(id: string) {
    await prisma.stockFranchise.delete({
      where: { id },
    });
  },

  async exists(id: string): Promise<boolean> {
    const count = await prisma.stockFranchise.count({
      where: { id },
    });
    return count > 0;
  },
};
