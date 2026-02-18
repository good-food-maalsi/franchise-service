import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food-maalsi/contracts/franchise";
import { commandHandler } from "../handlers/command.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { BadRequestError } from "../errors/api-error.js";
import { assertFranchiseAccess } from "../utils/authorization.js";

const router = Router();

router.use(authMiddleware);

/**
 * Resolves the franchise_id from body (admin) or user token (franchise user).
 */
function resolveFranchiseId(
  data: { franchise_id?: string },
  user?: { role?: string; franchise_id?: string },
): string {
  if (user?.role === "admin" && data.franchise_id) {
    return data.franchise_id;
  }
  if (user?.franchise_id) {
    return user.franchise_id;
  }
  if (user?.role === "admin") {
    throw new BadRequestError(
      "Admin must provide franchise_id in request body",
    );
  }
  throw new BadRequestError("Unable to determine franchise_id");
}

createExpressEndpoints(
  franchiseContract.commands,
  {
    getAll: async ({ query, req }) => {
      const franchiseId = resolveFranchiseId(
        { franchise_id: query.franchise_id },
        req.user,
      );
      const result = await commandHandler.getCommands({
        ...query,
        franchise_id: franchiseId,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: result as any };
    },
    getById: async ({ params, req }) => {
      const command = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(command.franchise_id, req.user);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: command as any };
    },
    create: async ({ body, req }) => {
      const franchiseId = resolveFranchiseId(body, req.user);
      const command = await commandHandler.createCommand(body, { franchiseId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: command as any };
    },
    update: async ({ params, body, req }) => {
      const existing = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(existing.franchise_id, req.user);
      const command = await commandHandler.updateCommand(params.id, body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: command as any };
    },
    delete: async ({ params, req }) => {
      const existing = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(existing.franchise_id, req.user);
      await commandHandler.deleteCommand(params.id);
      return {
        status: 200 as const,
        body: { message: "Command deleted successfully" },
      };
    },
    getIngredients: async ({ params, req }) => {
      const command = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(command.franchise_id, req.user);
      const ingredients = await commandHandler.getCommandIngredients(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: ingredients as any };
    },
    addIngredient: async ({ params, body, req }) => {
      const command = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(command.franchise_id, req.user);
      const ingredient = await commandHandler.addIngredientToCommand(
        params.id,
        body,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: ingredient as any };
    },
    updateIngredient: async ({ params, body, req }) => {
      const command = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(command.franchise_id, req.user);
      const ingredient = await commandHandler.updateCommandIngredient(
        params.id,
        params.ingredientId,
        body,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: ingredient as any };
    },
    removeIngredient: async ({ params, req }) => {
      const command = await commandHandler.getCommandById(params.id);
      assertFranchiseAccess(command.franchise_id, req.user);
      await commandHandler.removeIngredientFromCommand(
        params.id,
        params.ingredientId,
      );
      return {
        status: 200 as const,
        body: { message: "Ingredient removed successfully" },
      };
    },
  },
  router,
  { responseValidation: false },
);

export default router;
