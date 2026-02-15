import { supplierRepository } from "../repositories/supplier.repository.js";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQueryParams,
} from "@good-food-maalsi/contracts/franchise";
import { NotFoundError } from "../errors/api-error.js";
import {
  validateGPSCoordinatesPair,
  ensureExists,
  validateEmailUniqueness,
  validateEmailUniquenessForUpdate,
} from "../utils/validators.js";

export const supplierHandler = {
  /**
   * Get all suppliers
   */
  async getSuppliers(params: SupplierQueryParams) {
    return supplierRepository.findAll(params);
  },

  /**
   * Get a supplier by ID
   */
  async getSupplierById(id: string) {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      throw new NotFoundError(`Supplier with ID ${id} not found`);
    }

    return supplier;
  },

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierInput) {
    // Check if email already exists
    await validateEmailUniqueness(supplierRepository, data.email, "supplier");

    // Validate GPS coordinates if provided
    validateGPSCoordinatesPair(data.latitude, data.longitude);

    return supplierRepository.create(data);
  },

  /**
   * Update a supplier
   */
  async updateSupplier(id: string, data: UpdateSupplierInput) {
    // Check if supplier exists
    await ensureExists(supplierRepository, id, "Supplier");

    // If email is modified, check that it doesn't already exist
    if (data.email) {
      await validateEmailUniquenessForUpdate(
        supplierRepository,
        data.email,
        id,
        "supplier",
      );
    }

    // Validate GPS coordinates if provided
    if (data.latitude !== undefined || data.longitude !== undefined) {
      const currentSupplier = await supplierRepository.findById(id);

      // Type-safe: currentSupplier should exist since we already checked with ensureExists
      if (!currentSupplier) {
        throw new NotFoundError(`Supplier with ID ${id} not found`);
      }

      const lat = data.latitude ?? currentSupplier.latitude;
      const lon = data.longitude ?? currentSupplier.longitude;

      // Validate GPS coordinates pair
      validateGPSCoordinatesPair(lat, lon);
    }

    return supplierRepository.update(id, data);
  },

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: string) {
    // Check if supplier exists
    await ensureExists(supplierRepository, id, "Supplier");

    return supplierRepository.delete(id);
  },
};
