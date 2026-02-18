import { Router } from "express";
import categoriesRoutes from "./categories.routes.js";
import ingredientsRoutes from "./ingredients.routes.js";
import suppliersRoutes from "./suppliers.routes.js";
import franchisesRoutes from "./franchises.routes.js";
import stocksRoutes from "./stocks.routes.js";
import commandsRoutes from "./commands.routes.js";

const router = Router();

// Franchises en premier pour que GET /franchises et GET /franchises/:id (publics) soient traités
// avant tout router protégé par auth (sinon 401 avant d’atteindre franchises)
router.use(franchisesRoutes);
router.use(categoriesRoutes);
router.use(ingredientsRoutes);
router.use(suppliersRoutes);
router.use(stocksRoutes);
router.use(commandsRoutes);

export default router;
