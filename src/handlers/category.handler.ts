import { categoryRepository } from "../repositories/category.repository.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryParams,
} from "@good-food/contracts/franchise";
import { NotFoundError } from "../errors/api-error.js";
import {
  ensureExists,
  validateNameUniqueness,
  validateNameUniquenessForUpdate,
} from "../utils/validators.js";

export const categoryHandler = {
  /**
   * Get all categories
   */
  async getCategories(params: CategoryQueryParams) {
    return categoryRepository.findAll(params);
  },

  /**
   * Get a category by ID
   */
  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }

    return category;
  },

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryInput) {
    // Check if name already exists
    await validateNameUniqueness(categoryRepository, data.name, "category");

    return categoryRepository.create(data);
  },

  /**
   * Update a category
   */
  async updateCategory(id: string, data: UpdateCategoryInput) {
    // Check if category exists
    await ensureExists(categoryRepository, id, "Category");

    // If name is modified, check that it doesn't already exist
    if (data.name) {
      await validateNameUniquenessForUpdate(
        categoryRepository,
        data.name,
        id,
        "category",
      );
    }

    return categoryRepository.update(id, data);
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    // Check if category exists
    await ensureExists(categoryRepository, id, "Category");

    return categoryRepository.delete(id);
  },
};
