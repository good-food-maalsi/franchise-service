import { Router } from "express";
import { ingredientHandler } from "../handlers/ingredient.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  createIngredientSchema,
  updateIngredientSchema,
  ingredientQuerySchema,
  ingredientIdSchema,
  addCategoriesToIngredientSchema,
  type IngredientQueryParams,
  type IngredientIdParams,
  type CreateIngredientInput,
  type UpdateIngredientInput,
  type AddCategoriesToIngredientInput,
} from "../validators/ingredient.validator.js";
import {
  sendApiResponse,
  sendApiCreatedResponse,
  sendApiDeletedResponse,
} from "../utils/api-response.js";
import { z } from "zod";

const router = Router();

// Params schema for category routes
const ingredientCategoryParamsSchema = z.object({
  id: z.string().uuid("Invalid ingredient ID format"),
  categoryId: z.string().uuid("Invalid category ID format"),
});

type IngredientCategoryParams = z.infer<typeof ingredientCategoryParamsSchema>;

// GET /ingredients - Get all ingredients
router.get(
  "/",
  authMiddleware,
  validateQuery(ingredientQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as IngredientQueryParams;
      const result = await ingredientHandler.getIngredients(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /ingredients/:id - Get an ingredient by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(ingredientIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as IngredientIdParams;
      const ingredient = await ingredientHandler.getIngredientById(params.id);
      sendApiResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  }
);

// POST /ingredients - Create a new ingredient
router.post(
  "/",
  authMiddleware,
  validateBody(createIngredientSchema),
  async (req, res, next) => {
    try {
      const body = req.body as CreateIngredientInput;
      const ingredient = await ingredientHandler.createIngredient(body);
      sendApiCreatedResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /ingredients/:id - Update an ingredient
router.put(
  "/:id",
  authMiddleware,
  validateParams(ingredientIdSchema),
  validateBody(updateIngredientSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as IngredientIdParams;
      const body = req.body as UpdateIngredientInput;
      const ingredient = await ingredientHandler.updateIngredient(
        params.id,
        body
      );
      sendApiResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /ingredients/:id - Delete an ingredient
router.delete(
  "/:id",
  authMiddleware,
  validateParams(ingredientIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as IngredientIdParams;
      await ingredientHandler.deleteIngredient(params.id);
      sendApiDeletedResponse(res, "Ingredient");
    } catch (error) {
      next(error);
    }
  }
);

// GET /ingredients/:id/categories - Get categories of an ingredient
router.get(
  "/:id/categories",
  authMiddleware,
  validateParams(ingredientIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as IngredientIdParams;
      const categories = await ingredientHandler.getIngredientCategories(
        params.id
      );
      sendApiResponse(res, categories);
    } catch (error) {
      next(error);
    }
  }
);

// POST /ingredients/:id/categories - Add categories to an ingredient
router.post(
  "/:id/categories",
  authMiddleware,
  validateParams(ingredientIdSchema),
  validateBody(addCategoriesToIngredientSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as IngredientIdParams;
      const body = req.body as AddCategoriesToIngredientInput;
      const categories = await ingredientHandler.addCategoriesToIngredient(
        params.id,
        body
      );
      sendApiResponse(res, categories);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /ingredients/:id/categories/:categoryId - Remove a category from an ingredient
router.delete(
  "/:id/categories/:categoryId",
  authMiddleware,
  validateParams(ingredientCategoryParamsSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as IngredientCategoryParams;
      const result = await ingredientHandler.removeCategoryFromIngredient(
        params.id,
        params.categoryId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
