import { ingredientRepository } from "../repositories/ingredient.repository.js";
import { supplierRepository } from "../repositories/supplier.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
  IngredientQueryParams,
  AddCategoriesToIngredientInput,
} from "@good-food-maalsi/contracts/franchise";
import { NotFoundError, BadRequestError } from "../errors/api-error.js";
import { ensureExists } from "../utils/validators.js";

export const ingredientHandler = {
  /**
   * Get all ingredients
   */
  async getIngredients(params: IngredientQueryParams) {
    return ingredientRepository.findAll(params);
  },

  /**
   * Get an ingredient by ID
   */
  async getIngredientById(id: string) {
    const ingredient = await ingredientRepository.findById(id);

    if (!ingredient) {
      throw new NotFoundError(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  },

  /**
   * Create a new ingredient
   */
  async createIngredient(data: CreateIngredientInput) {
    // Check if supplier exists
    await ensureExists(supplierRepository, data.supplier_id, "Supplier");

    // Validate categories in parallel
    if (data.categories && data.categories.length > 0) {
      // Extract IDs of existing categories
      const categoryIds = data.categories
        .filter((cat) => cat.id)
        .map((cat) => cat.id as string);

      // Check existence of all categories in parallel
      if (categoryIds.length > 0) {
        await Promise.all(
          categoryIds.map((id) =>
            ensureExists(categoryRepository, id, "Category"),
          ),
        );
      }

      // Validate names of new categories
      for (const cat of data.categories) {
        if (!cat.id && (!cat.name || cat.name.trim().length < 2)) {
          throw new BadRequestError(
            "Category name must be at least 2 characters",
          );
        }
      }
    }

    const { categories, ...ingredientData } = data;
    return ingredientRepository.create(ingredientData, categories || []);
  },

  /**
   * Update an ingredient
   */
  async updateIngredient(id: string, data: UpdateIngredientInput) {
    // Check if ingredient and supplier exist in parallel
    const checks = [ensureExists(ingredientRepository, id, "Ingredient")];

    if (data.supplier_id) {
      checks.push(
        ensureExists(supplierRepository, data.supplier_id, "Supplier"),
      );
    }

    await Promise.all(checks);

    return ingredientRepository.update(id, data);
  },

  /**
   * Delete an ingredient
   */
  async deleteIngredient(id: string) {
    // Check if ingredient exists
    await ensureExists(ingredientRepository, id, "Ingredient");

    return ingredientRepository.delete(id);
  },

  /**
   * Get categories of an ingredient
   */
  async getIngredientCategories(ingredientId: string) {
    // Check if ingredient exists
    await ensureExists(ingredientRepository, ingredientId, "Ingredient");

    return ingredientRepository.getCategories(ingredientId);
  },

  /**
   * Add/create categories to an ingredient
   */
  async addCategoriesToIngredient(
    ingredientId: string,
    data: AddCategoriesToIngredientInput,
  ) {
    // Check if ingredient exists
    await ensureExists(ingredientRepository, ingredientId, "Ingredient");

    // Extract IDs of existing categories
    const categoryIds = data.categories
      .filter((cat) => cat.id)
      .map((cat) => cat.id as string);

    // Check existence of all categories in parallel
    if (categoryIds.length > 0) {
      await Promise.all(
        categoryIds.map((id) =>
          ensureExists(categoryRepository, id, "Category"),
        ),
      );
    }

    // Validate names of new categories
    for (const cat of data.categories) {
      if (!cat.id && (!cat.name || cat.name.trim().length < 2)) {
        throw new BadRequestError(
          "Category name must be at least 2 characters",
        );
      }
    }

    return ingredientRepository.addCategories(ingredientId, data.categories);
  },

  /**
   * Remove a category from an ingredient
   */
  async removeCategoryFromIngredient(ingredientId: string, categoryId: string) {
    // Check if ingredient and category exist in parallel
    await Promise.all([
      ensureExists(ingredientRepository, ingredientId, "Ingredient"),
      ensureExists(categoryRepository, categoryId, "Category"),
    ]);

    await ingredientRepository.removeCategory(ingredientId, categoryId);
    return { message: "Category removed successfully" };
  },
};
