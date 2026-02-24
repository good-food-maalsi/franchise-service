import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food/contracts/franchise";
import { franchiseHandler } from "../handlers/franchise.handler.js";
import {
  assertAdmin,
  assertFranchiseOrAdmin,
} from "../utils/authorization.js";

const router = Router();

// Auth géré au niveau app (voir app.ts) : GET /franchises et GET /franchises/:id sont publics

createExpressEndpoints(
  franchiseContract.franchises,
  {
    getAll: async ({ query }) => {
      const result = await franchiseHandler.getFranchises(query);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: result as any };
    },
    getById: async ({ params }) => {
      const franchise = await franchiseHandler.getFranchiseById(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: franchise as any };
    },
    create: async ({ body, req }) => {
      assertAdmin(req.user);
      const franchise = await franchiseHandler.createFranchise(body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: franchise as any };
    },
    update: async ({ params, body, req }) => {
      assertFranchiseOrAdmin(params.id, req.user);
      const franchise = await franchiseHandler.updateFranchise(params.id, body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: franchise as any };
    },
    delete: async ({ params, req }) => {
      assertFranchiseOrAdmin(params.id, req.user);
      await franchiseHandler.deleteFranchise(params.id);
      return {
        status: 200 as const,
        body: { message: "Franchise deleted successfully" },
      };
    },
    getStock: async ({ params, req }) => {
      assertFranchiseOrAdmin(params.id, req.user);
      const stock = await franchiseHandler.getFranchiseStock(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: stock as any };
    },
    upsertStock: async ({ params, body, req }) => {
      assertFranchiseOrAdmin(params.id, req.user);
      const stock = await franchiseHandler.upsertFranchiseStock(
        params.id,
        body,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: stock as any };
    },
    updateStockQuantity: async ({ params, body, req }) => {
      assertFranchiseOrAdmin(params.id, req.user);
      const stock = await franchiseHandler.updateFranchiseStockQuantity(
        params.id,
        params.ingredientId,
        body,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: stock as any };
    },
    deleteStock: async ({ params, req }) => {
      assertFranchiseOrAdmin(params.id, req.user);
      await franchiseHandler.deleteFranchiseStock(
        params.id,
        params.ingredientId,
      );
      return {
        status: 200 as const,
        body: { message: "Stock entry deleted successfully" },
      };
    },
  },
  router,
  { responseValidation: false },
);

export default router;
