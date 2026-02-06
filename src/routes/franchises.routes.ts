import { Router } from "express";
import { franchiseHandler } from "../handlers/franchise.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  createFranchiseSchema,
  updateFranchiseSchema,
  franchiseQuerySchema,
  franchiseIdSchema,
  type FranchiseQueryParams,
  type FranchiseIdParams,
  type CreateFranchiseInput,
  type UpdateFranchiseInput,
} from "../validators/franchise.validator.js";
import {
  upsertStockSchema,
  updateStockQuantitySchema,
  type UpsertStockInput,
  type UpdateStockQuantityInput,
} from "../validators/stock.validator.js";
import {
  sendApiResponse,
  sendApiCreatedResponse,
  sendApiDeletedResponse,
} from "../utils/api-response.js";
import { z } from "zod";

const router = Router();

// Stock IDs schema for routes
const stockRouteParamsSchema = z.object({
  id: z.string().uuid("Invalid franchise ID format"),
  ingredientId: z.string().uuid("Invalid ingredient ID format"),
});

type StockRouteParams = z.infer<typeof stockRouteParamsSchema>;

// GET /franchises - Get all franchises
router.get(
  "/",
  authMiddleware,
  validateQuery(franchiseQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as FranchiseQueryParams;
      const result = await franchiseHandler.getFranchises(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /franchises/:id - Get a franchise by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(franchiseIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as FranchiseIdParams;
      const franchise = await franchiseHandler.getFranchiseById(params.id);
      sendApiResponse(res, franchise);
    } catch (error) {
      next(error);
    }
  }
);

// POST /franchises - Create a new franchise
router.post(
  "/",
  authMiddleware,
  validateBody(createFranchiseSchema),
  async (req, res, next) => {
    try {
      const body = req.body as CreateFranchiseInput;
      const franchise = await franchiseHandler.createFranchise(body);
      sendApiCreatedResponse(res, franchise);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /franchises/:id - Update a franchise
router.put(
  "/:id",
  authMiddleware,
  validateParams(franchiseIdSchema),
  validateBody(updateFranchiseSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as FranchiseIdParams;
      const body = req.body as UpdateFranchiseInput;
      const franchise = await franchiseHandler.updateFranchise(params.id, body);
      sendApiResponse(res, franchise);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /franchises/:id - Delete a franchise
router.delete(
  "/:id",
  authMiddleware,
  validateParams(franchiseIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as FranchiseIdParams;
      await franchiseHandler.deleteFranchise(params.id);
      sendApiDeletedResponse(res, "Franchise");
    } catch (error) {
      next(error);
    }
  }
);

// GET /franchises/:id/stock - Get stock of a franchise
router.get(
  "/:id/stock",
  authMiddleware,
  validateParams(franchiseIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as FranchiseIdParams;
      const stock = await franchiseHandler.getFranchiseStock(params.id);
      sendApiResponse(res, stock);
    } catch (error) {
      next(error);
    }
  }
);

// POST /franchises/:id/stock - Add or update stock
router.post(
  "/:id/stock",
  authMiddleware,
  validateParams(franchiseIdSchema),
  validateBody(upsertStockSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as FranchiseIdParams;
      const body = req.body as UpsertStockInput;
      const stock = await franchiseHandler.upsertFranchiseStock(
        params.id,
        body
      );
      sendApiCreatedResponse(res, stock);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /franchises/:id/stock/:ingredientId - Update stock quantity
router.put(
  "/:id/stock/:ingredientId",
  authMiddleware,
  validateParams(stockRouteParamsSchema),
  validateBody(updateStockQuantitySchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as StockRouteParams;
      const body = req.body as UpdateStockQuantityInput;
      const stock = await franchiseHandler.updateFranchiseStockQuantity(
        params.id,
        params.ingredientId,
        body
      );
      sendApiResponse(res, stock);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /franchises/:id/stock/:ingredientId - Delete a stock entry
router.delete(
  "/:id/stock/:ingredientId",
  authMiddleware,
  validateParams(stockRouteParamsSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as StockRouteParams;
      const result = await franchiseHandler.deleteFranchiseStock(
        params.id,
        params.ingredientId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
