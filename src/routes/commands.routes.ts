import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food-maalsi/contracts/franchise";
import { commandHandler } from "../handlers/command.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { BadRequestError } from "../errors/api-error.js";

const router = Router();

router.use(authMiddleware);

/**
 * Resolves the franchise_id from body (admin) or user token (franchise user).
 */
function resolveFranchiseId(
  body: { franchise_id?: string },
  user?: { role?: string; franchise_id?: string },
): string {
  if (user?.role === "admin" && body.franchise_id) {
    return body.franchise_id;
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
    getAll: async ({ query }) => {
      const result = await commandHandler.getCommands(query);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: result as any };
    },
    getById: async ({ params }) => {
      const command = await commandHandler.getCommandById(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: command as any };
    },
    create: async ({ body, req }) => {
      const franchiseId = resolveFranchiseId(body, req.user);
      const command = await commandHandler.createCommand(body, { franchiseId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: command as any };
    },
    update: async ({ params, body }) => {
      const command = await commandHandler.updateCommand(params.id, body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: command as any };
    },
    delete: async ({ params }) => {
      await commandHandler.deleteCommand(params.id);
      return {
        status: 200 as const,
        body: { message: "Command deleted successfully" },
      };
    },
    getIngredients: async ({ params }) => {
      const ingredients = await commandHandler.getCommandIngredients(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: ingredients as any };
    },
    addIngredient: async ({ params, body }) => {
      const ingredient = await commandHandler.addIngredientToCommand(
        params.id,
        body,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: ingredient as any };
    },
    updateIngredient: async ({ params, body }) => {
      const ingredient = await commandHandler.updateCommandIngredient(
        params.id,
        params.ingredientId,
        body,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: ingredient as any };
    },
    removeIngredient: async ({ params }) => {
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
