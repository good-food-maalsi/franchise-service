import { commandRepository } from "../repositories/command.repository.js";
import { franchiseRepository } from "../repositories/franchise.repository.js";
import { ingredientRepository } from "../repositories/ingredient.repository.js";
import type {
  CreateCommandInput,
  UpdateCommandInput,
  CommandQueryParams,
  AddIngredientToCommandInput,
  UpdateCommandIngredientInput,
} from "@good-food-maalsi/contracts/franchise";
import { NotFoundError } from "../errors/api-error.js";
import { ensureExists } from "../utils/validators.js";

export const commandHandler = {
  /**
   * Get all commands
   */
  async getCommands(params: CommandQueryParams) {
    return commandRepository.findAll(params);
  },

  /**
   * Get a command by ID
   */
  async getCommandById(id: string) {
    const command = await commandRepository.findById(id);

    if (!command) {
      throw new NotFoundError(`Command with ID ${id} not found`);
    }

    return command;
  },

  /**
   * Create a new command.
   * The franchise_id resolved (admin = body, user = token) must be passed by the route.
   */
  async createCommand(
    data: CreateCommandInput,
    context: { franchiseId: string },
  ) {
    const { franchiseId } = context;
    await ensureExists(franchiseRepository, franchiseId, "Franchise");

    if (data.items && data.items.length > 0) {
      const ingredientIds = data.items.map((item) => item.ingredient_id);
      await Promise.all(
        ingredientIds.map((id) =>
          ensureExists(ingredientRepository, id, "Ingredient"),
        ),
      );
    }

    const { items, ...rest } = data;
    return commandRepository.create(
      { ...rest, franchise_id: franchiseId },
      items || [],
    );
  },

  /**
   * Update a command
   */
  async updateCommand(id: string, data: UpdateCommandInput) {
    // Check if command exists
    await ensureExists(commandRepository, id, "Command");

    return commandRepository.update(id, data);
  },

  /**
   * Delete a command
   */
  async deleteCommand(id: string) {
    // Check if command exists
    await ensureExists(commandRepository, id, "Command");

    return commandRepository.delete(id);
  },

  /**
   * Get ingredients of a command
   */
  async getCommandIngredients(commandId: string) {
    // Check if command exists
    await ensureExists(commandRepository, commandId, "Command");

    return commandRepository.getIngredients(commandId);
  },

  /**
   * Add an ingredient to a command
   */
  async addIngredientToCommand(
    commandId: string,
    data: AddIngredientToCommandInput,
  ) {
    // Check if command and ingredient exist in parallel
    await Promise.all([
      ensureExists(commandRepository, commandId, "Command"),
      ensureExists(ingredientRepository, data.ingredient_id, "Ingredient"),
    ]);

    return commandRepository.addIngredient(commandId, data);
  },

  /**
   * Update ingredient quantity in a command
   */
  async updateCommandIngredient(
    commandId: string,
    ingredientId: string,
    data: UpdateCommandIngredientInput,
  ) {
    // Check if command and ingredient exist in parallel
    await Promise.all([
      ensureExists(commandRepository, commandId, "Command"),
      ensureExists(ingredientRepository, ingredientId, "Ingredient"),
    ]);

    const result = await commandRepository.updateIngredientQuantity(
      commandId,
      ingredientId,
      data,
    );

    if (!result) {
      throw new NotFoundError(
        `Ingredient ${ingredientId} not found in command ${commandId}`,
      );
    }

    return result;
  },

  /**
   * Remove an ingredient from a command
   */
  async removeIngredientFromCommand(commandId: string, ingredientId: string) {
    // Check if command and ingredient exist in parallel
    await Promise.all([
      ensureExists(commandRepository, commandId, "Command"),
      ensureExists(ingredientRepository, ingredientId, "Ingredient"),
    ]);

    await commandRepository.removeIngredient(commandId, ingredientId);
    return { message: "Ingredient removed successfully" };
  },
};
