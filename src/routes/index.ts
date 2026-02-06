import { Router } from "express";
import categoriesRoutes from "./categories.routes.js";
import ingredientsRoutes from "./ingredients.routes.js";
import suppliersRoutes from "./suppliers.routes.js";
import franchisesRoutes from "./franchises.routes.js";
import stocksRoutes from "./stocks.routes.js";
import commandsRoutes from "./commands.routes.js";

const router = Router();

// Mount all routes
router.use("/categories", categoriesRoutes);
router.use("/ingredients", ingredientsRoutes);
router.use("/suppliers", suppliersRoutes);
router.use("/franchises", franchisesRoutes);
router.use("/stocks", stocksRoutes);
router.use("/commands", commandsRoutes);

export default router;
