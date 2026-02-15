import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food-maalsi/contracts/franchise";
import { stockFranchiseHandler } from "../handlers/stock-franchise.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { BadRequestError } from "../errors/api-error.js";

const router = Router();

router.use(authMiddleware);

/**
 * Resolves the franchise_id from query/body (admin) or user token (franchise user).
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
    throw new BadRequestError("Admin must provide franchise_id in request");
  }
  throw new BadRequestError("Unable to determine franchise_id");
}

createExpressEndpoints(
  franchiseContract.stocks,
  {
    getAll: async ({ query, req }) => {
      const franchiseId = resolveFranchiseId(
        { franchise_id: query.franchise_id },
        req.user,
      );
      const result = await stockFranchiseHandler.getStocks({
        ...query,
        franchise_id: franchiseId,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: result as any };
    },
    getById: async ({ params }) => {
      const stock = await stockFranchiseHandler.getStockById(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: stock as any };
    },
    create: async ({ body, req }) => {
      const franchiseId = resolveFranchiseId(body, req.user);
      const stock = await stockFranchiseHandler.createStock({
        ...body,
        franchise_id: franchiseId,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: stock as any };
    },
    update: async ({ params, body }) => {
      const stock = await stockFranchiseHandler.updateStock(params.id, body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: stock as any };
    },
    delete: async ({ params }) => {
      await stockFranchiseHandler.deleteStock(params.id);
      return {
        status: 200 as const,
        body: { message: "Stock deleted successfully" },
      };
    },
  },
  router,
  { responseValidation: false },
);

export default router;
