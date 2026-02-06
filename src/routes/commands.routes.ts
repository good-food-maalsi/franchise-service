import { Router } from "express";
import { commandHandler } from "../handlers/command.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  createCommandSchema,
  updateCommandSchema,
  commandQuerySchema,
  commandIdSchema,
  addIngredientToCommandSchema,
  updateCommandIngredientSchema,
  type CommandQueryParams,
  type CommandIdParams,
  type CreateCommandInput,
  type UpdateCommandInput,
  type AddIngredientToCommandInput,
  type UpdateCommandIngredientInput,
} from "../validators/command.validator.js";
import {
  sendApiResponse,
  sendApiCreatedResponse,
  sendApiDeletedResponse,
} from "../utils/api-response.js";
import { BadRequestError } from "../errors/api-error.js";
import { z } from "zod";

const router = Router();

// Params schema for ingredient routes
const commandIngredientParamsSchema = z.object({
  id: z.string().uuid("Invalid command ID format"),
  ingredientId: z.string().uuid("Invalid ingredient ID format"),
});

type CommandIngredientParams = z.infer<typeof commandIngredientParamsSchema>;

/**
 * Resolves the franchise_id from body (admin) or user token (franchise user).
 */
function resolveFranchiseId(
  body: { franchise_id?: string },
  user?: { role?: string; franchise_id?: string }
): string {
  // Admin can specify any franchise_id in the body
  if (user?.role === "admin" && body.franchise_id) {
    return body.franchise_id;
  }

  // Non-admin users must use their token's franchise_id
  if (user?.franchise_id) {
    return user.franchise_id;
  }

  // Admin without body.franchise_id
  if (user?.role === "admin") {
    throw new BadRequestError(
      "Admin must provide franchise_id in request body"
    );
  }

  throw new BadRequestError("Unable to determine franchise_id");
}

// GET /commands - Get all commands
router.get(
  "/",
  authMiddleware,
  validateQuery(commandQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as CommandQueryParams;
      const result = await commandHandler.getCommands(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /commands/:id - Get a command by ID
router.get(
  "/:id",
  authMiddleware,
  validateParams(commandIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIdParams;
      const command = await commandHandler.getCommandById(params.id);
      sendApiResponse(res, command);
    } catch (error) {
      next(error);
    }
  }
);

// POST /commands - Create a new command
router.post(
  "/",
  authMiddleware,
  validateBody(createCommandSchema),
  async (req, res, next) => {
    try {
      const body = req.body as CreateCommandInput;
      const franchiseId = resolveFranchiseId(body, req.user);
      const command = await commandHandler.createCommand(body, {
        franchiseId,
      });
      sendApiCreatedResponse(res, command);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /commands/:id - Update a command
router.put(
  "/:id",
  authMiddleware,
  validateParams(commandIdSchema),
  validateBody(updateCommandSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIdParams;
      const body = req.body as UpdateCommandInput;
      const command = await commandHandler.updateCommand(params.id, body);
      sendApiResponse(res, command);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /commands/:id - Delete a command
router.delete(
  "/:id",
  authMiddleware,
  validateParams(commandIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIdParams;
      await commandHandler.deleteCommand(params.id);
      sendApiDeletedResponse(res, "Command");
    } catch (error) {
      next(error);
    }
  }
);

// GET /commands/:id/ingredients - Get ingredients of a command
router.get(
  "/:id/ingredients",
  authMiddleware,
  validateParams(commandIdSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIdParams;
      const ingredients = await commandHandler.getCommandIngredients(params.id);
      sendApiResponse(res, ingredients);
    } catch (error) {
      next(error);
    }
  }
);

// POST /commands/:id/ingredients - Add an ingredient to a command
router.post(
  "/:id/ingredients",
  authMiddleware,
  validateParams(commandIdSchema),
  validateBody(addIngredientToCommandSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIdParams;
      const body = req.body as AddIngredientToCommandInput;
      const ingredient = await commandHandler.addIngredientToCommand(
        params.id,
        body
      );
      sendApiCreatedResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /commands/:id/ingredients/:ingredientId - Update ingredient quantity
router.put(
  "/:id/ingredients/:ingredientId",
  authMiddleware,
  validateParams(commandIngredientParamsSchema),
  validateBody(updateCommandIngredientSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIngredientParams;
      const body = req.body as UpdateCommandIngredientInput;
      const ingredient = await commandHandler.updateCommandIngredient(
        params.id,
        params.ingredientId,
        body
      );
      sendApiResponse(res, ingredient);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /commands/:id/ingredients/:ingredientId - Remove an ingredient from a command
router.delete(
  "/:id/ingredients/:ingredientId",
  authMiddleware,
  validateParams(commandIngredientParamsSchema),
  async (req, res, next) => {
    try {
      const params = req.params as unknown as CommandIngredientParams;
      const result = await commandHandler.removeIngredientFromCommand(
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
