import { Router } from "express";
import { supplierHandler } from "../handlers/supplier.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
  supplierIdSchema,
  type SupplierQueryParams,
  type SupplierIdParams,
  type CreateSupplierInput,
  type UpdateSupplierInput,
} from "../validators/supplier.validator.js";
import {
  sendApiResponse,
  sendApiCreatedResponse,
  sendApiDeletedResponse,
} from "../utils/api-response.js";

const router = Router();

// GET /suppliers - Get all suppliers
router.get(
  "/",
  authMiddleware,
  validateQuery(supplierQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as SupplierQueryParams;
      const result = await supplierHandler.getSuppliers(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /suppliers/:id - Get a supplier by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(supplierIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as SupplierIdParams;
      const supplier = await supplierHandler.getSupplierById(params.id);
      sendApiResponse(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

// POST /suppliers - Create a new supplier
router.post(
  "/",
  authMiddleware,
  validateBody(createSupplierSchema),
  async (req, res, next) => {
    try {
      const body = req.body as CreateSupplierInput;
      const supplier = await supplierHandler.createSupplier(body);
      sendApiCreatedResponse(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /suppliers/:id - Update a supplier
router.put(
  "/:id",
  authMiddleware,
  validateParams(supplierIdSchema),
  validateBody(updateSupplierSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as SupplierIdParams;
      const body = req.body as UpdateSupplierInput;
      const supplier = await supplierHandler.updateSupplier(params.id, body);
      sendApiResponse(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /suppliers/:id - Delete a supplier
router.delete(
  "/:id",
  authMiddleware,
  validateParams(supplierIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as SupplierIdParams;
      await supplierHandler.deleteSupplier(params.id);
      sendApiDeletedResponse(res, "Supplier");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
