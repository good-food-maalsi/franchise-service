import { prisma } from "../config/database.js";
import type { Prisma } from "@prisma/client";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryParams,
} from "@good-food/contracts/franchise";

export const categoryRepository = {
  /**
   * Get all categories with pagination and filters
   */
  async findAll(params: CategoryQueryParams) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              ingredient_categories: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a category by ID
   */
  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        ingredient_categories: {
          include: {
            ingredient: true,
          },
          orderBy: {
            ingredient: {
              name: "asc",
            },
          },
        },
        _count: {
          select: {
            ingredient_categories: true,
          },
        },
      },
    });
  },

  /**
   * Get a category by name
   */
  async findByName(name: string) {
    return prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  },

  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
    });
  },

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a category
   */
  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },

  /**
   * Check if a category exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.category.count({
      where: { id },
    });
    return count > 0;
  },
};
