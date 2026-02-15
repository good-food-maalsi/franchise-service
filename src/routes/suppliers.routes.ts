import { Router } from "express";
import { createExpressEndpoints } from "@ts-rest/express";
import { franchiseContract } from "@good-food-maalsi/contracts/franchise";
import { supplierHandler } from "../handlers/supplier.handler.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

createExpressEndpoints(
  franchiseContract.suppliers,
  {
    getAll: async ({ query }) => {
      const result = await supplierHandler.getSuppliers(query);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: result as any };
    },
    getById: async ({ params }) => {
      const supplier = await supplierHandler.getSupplierById(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: supplier as any };
    },
    create: async ({ body }) => {
      const supplier = await supplierHandler.createSupplier(body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 201 as const, body: supplier as any };
    },
    update: async ({ params, body }) => {
      const supplier = await supplierHandler.updateSupplier(params.id, body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 200 as const, body: supplier as any };
    },
    delete: async ({ params }) => {
      await supplierHandler.deleteSupplier(params.id);
      return {
        status: 200 as const,
        body: { message: "Supplier deleted successfully" },
      };
    },
  },
  router,
  { responseValidation: false },
);

export default router;
