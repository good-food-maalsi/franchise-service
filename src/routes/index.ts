import { Router } from "express";
import categoriesRoutes from "./categories.routes.js";
import ingredientsRoutes from "./ingredients.routes.js";
import suppliersRoutes from "./suppliers.routes.js";
import franchisesRoutes from "./franchises.routes.js";
import stocksRoutes from "./stocks.routes.js";
import commandsRoutes from "./commands.routes.js";

const router = Router();

// Mount all routes without prefix: paths are already defined in the ts-rest contracts
// (e.g. franchiseContract.suppliers.getAll has path '/suppliers')
router.use(categoriesRoutes);
router.use(ingredientsRoutes);
router.use(suppliersRoutes);
router.use(franchisesRoutes);
router.use(stocksRoutes);
router.use(commandsRoutes);

export default router;
