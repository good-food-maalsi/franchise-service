import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food/contracts/franchise";
import { ingredientHandler } from "../handlers/ingredient.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

createExpressEndpoints(
  franchiseContract.ingredients,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAll: async ({ query }) => {
      const result = await ingredientHandler.getIngredients(query);
      return { status: 200 as const, body: result as any };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getById: async ({ params }) => {
      const ingredient = await ingredientHandler.getIngredientById(params.id);
      return { status: 200 as const, body: ingredient as any };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async ({ body }) => {
      const ingredient = await ingredientHandler.createIngredient(body);
      return { status: 201 as const, body: ingredient as any };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async ({ params, body }) => {
      const ingredient = await ingredientHandler.updateIngredient(
        params.id,
        body,
      );
      return { status: 200 as const, body: ingredient as any };
    },
    delete: async ({ params }) => {
      await ingredientHandler.deleteIngredient(params.id);
      return {
        status: 200 as const,
        body: { message: "Ingredient deleted successfully" },
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCategories: async ({ params }) => {
      const categories = await ingredientHandler.getIngredientCategories(
        params.id,
      );
      return { status: 200 as const, body: categories as any };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCategories: async ({ params, body }) => {
      const ingredient = await ingredientHandler.addCategoriesToIngredient(
        params.id,
        body,
      );
      return { status: 201 as const, body: ingredient as any };
    },
  },
  router,
  { responseValidation: false },
);

export default router;
