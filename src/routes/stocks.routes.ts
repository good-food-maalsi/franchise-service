import { Router } from "express";
import { stockFranchiseHandler } from "../handlers/stock-franchise.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  stockFranchiseQuerySchema,
  createStockFranchiseSchema,
  updateStockFranchiseSchema,
  stockFranchiseIdSchema,
  type StockFranchiseQueryParams,
  type CreateStockFranchiseInput,
  type UpdateStockFranchiseInput,
} from "../validators/stock-franchise.validator.js";
import {
  sendApiResponse,
  sendApiCreatedResponse,
} from "../utils/api-response.js";
import { BadRequestError } from "../errors/api-error.js";

const router = Router();

interface StockIdParams {
  id: string;
}

/**
 * Resolves the franchise_id from query/body (admin) or user token (franchise user).
 */
function resolveFranchiseId(
  data: { franchise_id?: string },
  user?: { role?: string; franchise_id?: string }
): string {
  // Admin can specify any franchise_id
  if (user?.role === "admin" && data.franchise_id) {
    return data.franchise_id;
  }

  // Non-admin users must use their token's franchise_id
  if (user?.franchise_id) {
    return user.franchise_id;
  }

  // Admin without franchise_id
  if (user?.role === "admin") {
    throw new BadRequestError("Admin must provide franchise_id in request");
  }

  throw new BadRequestError("Unable to determine franchise_id");
}

// GET /stocks - Get all stocks
router.get(
  "/",
  authMiddleware,
  validateQuery(stockFranchiseQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as StockFranchiseQueryParams;
      const franchiseId = resolveFranchiseId(
        { franchise_id: query.franchise_id },
        req.user
      );
      const result = await stockFranchiseHandler.getStocks({
        ...query,
        franchise_id: franchiseId,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /stocks/:id - Get a stock by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(stockFranchiseIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as StockIdParams;
      const stock = await stockFranchiseHandler.getStockById(params.id);
      sendApiResponse(res, stock);
    } catch (error) {
      next(error);
    }
  }
);

// POST /stocks - Create a new stock
router.post(
  "/",
  authMiddleware,
  validateBody(createStockFranchiseSchema),
  async (req, res, next) => {
    try {
      const body = req.body as CreateStockFranchiseInput;
      const franchiseId = resolveFranchiseId(body, req.user);
      const stock = await stockFranchiseHandler.createStock({
        ...body,
        franchise_id: franchiseId,
      });
      sendApiCreatedResponse(res, stock);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /stocks/:id - Update a stock
router.put(
  "/:id",
  authMiddleware,
  validateParams(stockFranchiseIdSchema),
  validateBody(updateStockFranchiseSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as StockIdParams;
      const body = req.body as UpdateStockFranchiseInput;
      const stock = await stockFranchiseHandler.updateStock(params.id, body);
      sendApiResponse(res, stock);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /stocks/:id - Delete a stock
router.delete(
  "/:id",
  authMiddleware,
  validateParams(stockFranchiseIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as StockIdParams;
      const result = await stockFranchiseHandler.deleteStock(params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
