import { prisma } from "../config/database.js";
import type { Prisma } from "@prisma/client";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
  IngredientQueryParams,
  CategoryInput,
} from "@good-food/contracts/franchise";

export const ingredientRepository = {
  /**
   * Get all ingredients with pagination and filters
   */
  async findAll(params: IngredientQueryParams) {
    const { page = 1, limit = 10, search, supplier_id, category_id } = params;
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.IngredientWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (supplier_id) {
      where.supplier_id = supplier_id;
    }

    if (category_id) {
      where.ingredient_categories = {
        some: {
          category_id,
        },
      };
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ingredient_categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              stocks: true,
              command_ingredients: true,
            },
          },
        },
      }),
      prisma.ingredient.count({ where }),
    ]);

    return {
      data: ingredients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get an ingredient by ID
   */
  async findById(id: string) {
    return prisma.ingredient.findUnique({
      where: { id },
      include: {
        supplier: true,
        ingredient_categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            stocks: true,
            command_ingredients: true,
          },
        },
      },
    });
  },

  /**
   * Create a new ingredient with categories
   */
  async create(
    data: Omit<CreateIngredientInput, "categories">,
    categories: CategoryInput[],
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the ingredient
      const ingredient = await tx.ingredient.create({
        data: {
          name: data.name,
          description: data.description,
          supplier_id: data.supplier_id,
          unit_price: data.unit_price,
        },
      });

      // Handle categories if provided
      if (categories.length > 0) {
        const categoryIds: string[] = [];

        for (const cat of categories) {
          if (cat.id) {
            // Link to existing category
            categoryIds.push(cat.id);
          } else if (cat.name) {
            // Create a new category
            const newCategory = await tx.category.create({
              data: {
                name: cat.name,
                description: cat.description,
              },
            });
            categoryIds.push(newCategory.id);
          }
        }

        // Create IngredientCategory relations
        await tx.ingredientCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            ingredient_id: ingredient.id,
            category_id: categoryId,
          })),
        });
      }

      // Return ingredient with its relations
      return tx.ingredient.findUnique({
        where: { id: ingredient.id },
        include: {
          supplier: true,
          ingredient_categories: {
            include: {
              category: true,
            },
          },
        },
      });
    });
  },

  /**
   * Update an ingredient
   */
  async update(id: string, data: UpdateIngredientInput) {
    return prisma.ingredient.update({
      where: { id },
      data,
      include: {
        supplier: true,
        ingredient_categories: {
          include: {
            category: true,
          },
        },
      },
    });
  },

  /**
   * Delete an ingredient
   */
  async delete(id: string) {
    return prisma.ingredient.delete({
      where: { id },
    });
  },

  /**
   * Check if an ingredient exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.ingredient.count({
      where: { id },
    });
    return count > 0;
  },

  /**
   * Get categories of an ingredient
   */
  async getCategories(ingredientId: string) {
    const result = await prisma.ingredientCategory.findMany({
      where: { ingredient_id: ingredientId },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          name: "asc",
        },
      },
    });

    return result.map((ic) => ic.category);
  },

  /**
   * Add/create categories to an ingredient
   */
  async addCategories(ingredientId: string, categories: CategoryInput[]) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const categoryIds: string[] = [];

      for (const cat of categories) {
        if (cat.id) {
          // Link to existing category
          categoryIds.push(cat.id);
        } else if (cat.name) {
          // Check if category already exists by name
          let existingCategory = await tx.category.findFirst({
            where: {
              name: {
                equals: cat.name,
                mode: "insensitive",
              },
            },
          });

          if (!existingCategory) {
            // Create a new category
            existingCategory = await tx.category.create({
              data: {
                name: cat.name,
                description: cat.description,
              },
            });
          }

          categoryIds.push(existingCategory.id);
        }
      }

      // Create relations (ignore duplicates)
      for (const categoryId of categoryIds) {
        // Check if relation already exists
        const existing = await tx.ingredientCategory.findFirst({
          where: {
            ingredient_id: ingredientId,
            category_id: categoryId,
          },
        });

        if (!existing) {
          await tx.ingredientCategory.create({
            data: {
              ingredient_id: ingredientId,
              category_id: categoryId,
            },
          });
        }
      }

      // Return updated categories
      const result = await tx.ingredientCategory.findMany({
        where: { ingredient_id: ingredientId },
        include: {
          category: true,
        },
        orderBy: {
          category: {
            name: "asc",
          },
        },
      });

      return result.map((ic) => ic.category);
    });
  },

  /**
   * Remove a category from an ingredient
   */
  async removeCategory(ingredientId: string, categoryId: string) {
    return prisma.ingredientCategory.deleteMany({
      where: {
        ingredient_id: ingredientId,
        category_id: categoryId,
      },
    });
  },
};
