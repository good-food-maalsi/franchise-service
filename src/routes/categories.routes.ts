import { Router } from "express";
import { categoryHandler } from "../handlers/category.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  categoryIdSchema,
  type CategoryQueryParams,
  type CategoryIdParams,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../validators/category.validator.js";
import {
  sendApiResponse,
  sendApiCreatedResponse,
  sendApiDeletedResponse,
} from "../utils/api-response.js";

const router = Router();

// GET /categories - Get all categories
router.get(
  "/",
  authMiddleware,
  validateQuery(categoryQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as CategoryQueryParams;
      const result = await categoryHandler.getCategories(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /categories/:id - Get a category by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(categoryIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CategoryIdParams;
      const category = await categoryHandler.getCategoryById(params.id);
      sendApiResponse(res, category);
    } catch (error) {
      next(error);
    }
  }
);

// POST /categories - Create a new category
router.post(
  "/",
  authMiddleware,
  validateBody(createCategorySchema),
  async (req, res, next) => {
    try {
      const body = req.body as CreateCategoryInput;
      const category = await categoryHandler.createCategory(body);
      sendApiCreatedResponse(res, category);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /categories/:id - Update a category
router.put(
  "/:id",
  authMiddleware,
  validateParams(categoryIdSchema),
  validateBody(updateCategorySchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CategoryIdParams;
      const body = req.body as UpdateCategoryInput;
      const category = await categoryHandler.updateCategory(params.id, body);
      sendApiResponse(res, category);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /categories/:id - Delete a category
router.delete(
  "/:id",
  authMiddleware,
  validateParams(categoryIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CategoryIdParams;
      await categoryHandler.deleteCategory(params.id);
      sendApiDeletedResponse(res, "Category");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
