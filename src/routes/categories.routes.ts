import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food/contracts/franchise";
import { categoryHandler } from "../handlers/category.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

createExpressEndpoints(
  franchiseContract.categories,
  {
    getAll: async ({ query }) => {
      const result = await categoryHandler.getCategories(query);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: result as any };
    },
    getById: async ({ params }) => {
      const category = await categoryHandler.getCategoryById(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: category as any };
    },
    create: async ({ body }) => {
      const category = await categoryHandler.createCategory(body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: category as any };
    },
    update: async ({ params, body }) => {
      const category = await categoryHandler.updateCategory(params.id, body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: category as any };
    },
    delete: async ({ params }) => {
      await categoryHandler.deleteCategory(params.id);
      return {
        status: 200 as const,
        body: { message: "Category deleted successfully" },
      };
    },
  },
  router,
  { responseValidation: false },
);

export default router;
