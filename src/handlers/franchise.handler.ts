import { franchiseRepository } from "../repositories/franchise.repository.js";
import { ingredientRepository } from "../repositories/ingredient.repository.js";
import type {
  CreateFranchiseInput,
  UpdateFranchiseInput,
  FranchiseQueryParams,
  UpsertStockInput,
  UpdateStockQuantityInput,
} from "@good-food-maalsi/contracts/franchise";
import { NotFoundError } from "../errors/api-error.js";
import {
  validateGPSCoordinates,
  ensureExists,
  validateEmailUniqueness,
  validateEmailUniquenessForUpdate,
} from "../utils/validators.js";

export const franchiseHandler = {
  /**
   * Get all franchises
   */
  async getFranchises(params: FranchiseQueryParams) {
    return franchiseRepository.findAll(params);
  },

  /**
   * Get a franchise by ID
   */
  async getFranchiseById(id: string) {
    const franchise = await franchiseRepository.findById(id);

    if (!franchise) {
      throw new NotFoundError(`Franchise with ID ${id} not found`);
    }

    return franchise;
  },

  /**
   * Create a new franchise
   */
  async createFranchise(data: CreateFranchiseInput) {
    // Check if email already exists
    await validateEmailUniqueness(franchiseRepository, data.email, "franchise");

    // Validate GPS coordinates (franchises always have coordinates)
    validateGPSCoordinates(data.latitude, data.longitude);

    return franchiseRepository.create(data);
  },

  /**
   * Update a franchise
   */
  async updateFranchise(id: string, data: UpdateFranchiseInput) {
    // Check if franchise exists
    await ensureExists(franchiseRepository, id, "Franchise");

    // If email is modified, check that it doesn't already exist
    if (data.email) {
      await validateEmailUniquenessForUpdate(
        franchiseRepository,
        data.email,
        id,
        "franchise",
      );
    }

    // Validate GPS coordinates if provided
    if (data.latitude !== undefined || data.longitude !== undefined) {
      const currentFranchise = await franchiseRepository.findById(id);

      // Type-safe: currentFranchise should exist since we already checked with ensureExists
      if (!currentFranchise) {
        throw new NotFoundError(`Franchise with ID ${id} not found`);
      }

      const lat = data.latitude ?? currentFranchise.latitude;
      const lon = data.longitude ?? currentFranchise.longitude;

      // Validate GPS coordinates
      validateGPSCoordinates(lat, lon);
    }

    return franchiseRepository.update(id, data);
  },

  /**
   * Delete a franchise
   */
  async deleteFranchise(id: string) {
    // Check if franchise exists
    await ensureExists(franchiseRepository, id, "Franchise");

    return franchiseRepository.delete(id);
  },

  /**
   * Get stock of a franchise
   */
  async getFranchiseStock(id: string) {
    // Check if franchise exists
    await ensureExists(franchiseRepository, id, "Franchise");

    return franchiseRepository.getStock(id);
  },

  /**
   * Add or update stock
   */
  async upsertFranchiseStock(franchiseId: string, data: UpsertStockInput) {
    // Check if franchise and ingredient exist in parallel
    await Promise.all([
      ensureExists(franchiseRepository, franchiseId, "Franchise"),
      ensureExists(ingredientRepository, data.ingredient_id, "Ingredient"),
    ]);

    return franchiseRepository.upsertStock(
      franchiseId,
      data.ingredient_id,
      data.quantity,
    );
  },

  /**
   * Update stock quantity
   */
  async updateFranchiseStockQuantity(
    franchiseId: string,
    ingredientId: string,
    data: UpdateStockQuantityInput,
  ) {
    // Check if franchise and ingredient exist in parallel
    await Promise.all([
      ensureExists(franchiseRepository, franchiseId, "Franchise"),
      ensureExists(ingredientRepository, ingredientId, "Ingredient"),
    ]);

    const result = await franchiseRepository.updateStockQuantity(
      franchiseId,
      ingredientId,
      data.quantity,
    );

    if (!result) {
      throw new NotFoundError(
        `Stock entry for ingredient ${ingredientId} not found in franchise ${franchiseId}`,
      );
    }

    return result;
  },

  /**
   * Delete a stock entry
   */
  async deleteFranchiseStock(franchiseId: string, ingredientId: string) {
    // Check if franchise and ingredient exist in parallel
    await Promise.all([
      ensureExists(franchiseRepository, franchiseId, "Franchise"),
      ensureExists(ingredientRepository, ingredientId, "Ingredient"),
    ]);

    await franchiseRepository.deleteStock(franchiseId, ingredientId);
    return { message: "Stock entry deleted successfully" };
  },
};
