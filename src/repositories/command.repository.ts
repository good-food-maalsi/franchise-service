import { prisma } from "../config/database.js";
import type { Prisma } from "@prisma/client";
import type {
  CreateCommandInput,
  UpdateCommandInput,
  CommandQueryParams,
  CommandItem,
  AddIngredientToCommandInput,
  UpdateCommandIngredientInput,
} from "@good-food/contracts/franchise";
import { CommandStatus } from "@prisma/client";

/** Payload for create: franchise_id required (resolved by route). */
type CreateCommandData = Omit<CreateCommandInput, "items"> & {
  franchise_id: string;
};

export const commandRepository = {
  /**
   * Get all commands with pagination and filters
   */
  async findAll(params: CommandQueryParams) {
    const { page = 1, limit = 10, franchise_id, status, user_id } = params;
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.CommandWhereInput = {};

    if (franchise_id) {
      where.franchise_id = franchise_id;
    }

    if (status) {
      where.status = status;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    const [commands, total] = await Promise.all([
      prisma.command.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          franchise: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
          command_ingredients: {
            include: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  unit_price: true,
                },
              },
            },
            orderBy: {
              ingredient: {
                name: "asc",
              },
            },
          },
          _count: {
            select: {
              command_ingredients: true,
            },
          },
        },
      }),
      prisma.command.count({ where }),
    ]);

    return {
      data: commands,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a command by ID
   */
  async findById(id: string) {
    return prisma.command.findUnique({
      where: { id },
      include: {
        franchise: true,
        command_ingredients: {
          include: {
            ingredient: {
              include: {
                supplier: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            ingredient: {
              name: "asc",
            },
          },
        },
        _count: {
          select: {
            command_ingredients: true,
          },
        },
      },
    });
  },

  /**
   * Create a new command with items
   */
  async create(data: CreateCommandData, items: CommandItem[]) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const command = await tx.command.create({
        data: {
          franchise_id: data.franchise_id,
          status: data.status ?? CommandStatus.draft,
          user_id: data.user_id,
        },
      });

      // Create items if provided
      if (items.length > 0) {
        await tx.commandIngredient.createMany({
          data: items.map((item) => ({
            command_id: command.id,
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
          })),
        });
      }

      // Return command with its relations
      return tx.command.findUnique({
        where: { id: command.id },
        include: {
          franchise: true,
          command_ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });
  },

  /**
   * Update a command
   */
  async update(id: string, data: UpdateCommandInput) {
    return prisma.command.update({
      where: { id },
      data,
      include: {
        franchise: true,
        command_ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  },

  /**
   * Delete a command
   */
  async delete(id: string) {
    return prisma.command.delete({
      where: { id },
    });
  },

  /**
   * Check if a command exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.command.count({
      where: { id },
    });
    return count > 0;
  },

  /**
   * Get ingredients of a command
   */
  async getIngredients(commandId: string) {
    const result = await prisma.commandIngredient.findMany({
      where: { command_id: commandId },
      include: {
        ingredient: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        ingredient: {
          name: "asc",
        },
      },
    });

    return result;
  },

  /**
   * Add an ingredient to a command
   */
  async addIngredient(commandId: string, data: AddIngredientToCommandInput) {
    // Check if ingredient already exists in command
    const existing = await prisma.commandIngredient.findFirst({
      where: {
        command_id: commandId,
        ingredient_id: data.ingredient_id,
      },
    });

    if (existing) {
      // Update quantity
      return prisma.commandIngredient.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + data.quantity,
        },
        include: {
          ingredient: true,
        },
      });
    }

    // Create a new CommandIngredient
    return prisma.commandIngredient.create({
      data: {
        command_id: commandId,
        ingredient_id: data.ingredient_id,
        quantity: data.quantity,
      },
      include: {
        ingredient: true,
      },
    });
  },

  /**
   * Update ingredient quantity in a command
   */
  async updateIngredientQuantity(
    commandId: string,
    ingredientId: string,
    data: UpdateCommandIngredientInput,
  ) {
    const commandIngredient = await prisma.commandIngredient.findFirst({
      where: {
        command_id: commandId,
        ingredient_id: ingredientId,
      },
    });

    if (!commandIngredient) {
      return null;
    }

    return prisma.commandIngredient.update({
      where: { id: commandIngredient.id },
      data: {
        quantity: data.quantity,
      },
      include: {
        ingredient: true,
      },
    });
  },

  /**
   * Remove an ingredient from a command
   */
  async removeIngredient(commandId: string, ingredientId: string) {
    return prisma.commandIngredient.deleteMany({
      where: {
        command_id: commandId,
        ingredient_id: ingredientId,
      },
    });
  },
};
