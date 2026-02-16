import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { SEED_STOCK_IDS } from "./seed-constants.js";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting seed...");

  const franchiseId = process.env.SEED_FRANCHISE_ID;
  if (!franchiseId) {
    throw new Error(
      "SEED_FRANCHISE_ID must be set. Run: ./scripts/seed-dev.sh from project root"
    );
  }

  // Create or update demo franchise with specific ID (to link with auth-service users)
  const franchiseData = {
    name: "Franchise Demo Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    street: "123 Rue de la Demo",
    city: "Paris",
    state: "Île-de-France",
    zip: "75001",
    owner_id: "00000000-0000-0000-0000-000000000001",
    email: "demo@franchise.com",
    phone: "+33 1 23 45 67 89",
  };

  const franchise = await prisma.franchise.upsert({
    where: { id: franchiseId },
    create: { id: franchiseId, ...franchiseData },
    update: franchiseData,
  });

  console.log("✅ Franchise created/updated:", franchise.id);

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "UNION PRIMEURS",
      email: "contact@union-primeurs.fr",
      phone: "+33 1 11 11 11 11",
      latitude: 48.8,
      longitude: 2.3,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "BOUCHERIE MODERNE",
      email: "contact@boucherie-moderne.fr",
      phone: "+33 1 22 22 22 22",
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "FROMAGERIE ARTISANALE",
      email: "contact@fromagerie.fr",
      phone: "+33 1 33 33 33 33",
    },
  });

  console.log("✅ 3 Suppliers created");

  // Create categories
  const legumes = await prisma.category.create({
    data: {
      name: "Légumes",
      description: "Produits frais",
    },
  });

  const viandes = await prisma.category.create({
    data: {
      name: "Viandes",
      description: "Viandes et volailles",
    },
  });

  const produits_laitiers = await prisma.category.create({
    data: {
      name: "Produits laitiers",
      description: "Fromages et produits laitiers",
    },
  });

  console.log("✅ 3 Categories created");

  // Create ingredients with categories
  const tomate = await prisma.ingredient.create({
    data: {
      name: "Tomate",
      description: "Tomate fraîche",
      supplier_id: supplier1.id,
      unit_price: 2.5,
    },
  });

  await prisma.ingredientCategory.create({
    data: {
      ingredient_id: tomate.id,
      category_id: legumes.id,
    },
  });

  const salade = await prisma.ingredient.create({
    data: {
      name: "Salade",
      description: "Salade verte",
      supplier_id: supplier1.id,
      unit_price: 1.8,
    },
  });

  await prisma.ingredientCategory.create({
    data: {
      ingredient_id: salade.id,
      category_id: legumes.id,
    },
  });

  const boeuf = await prisma.ingredient.create({
    data: {
      name: "Bœuf haché",
      description: "Viande de bœuf hachée",
      supplier_id: supplier2.id,
      unit_price: 12.0,
    },
  });

  await prisma.ingredientCategory.create({
    data: {
      ingredient_id: boeuf.id,
      category_id: viandes.id,
    },
  });

  const poulet = await prisma.ingredient.create({
    data: {
      name: "Poulet",
      description: "Blanc de poulet",
      supplier_id: supplier2.id,
      unit_price: 8.5,
    },
  });

  await prisma.ingredientCategory.create({
    data: {
      ingredient_id: poulet.id,
      category_id: viandes.id,
    },
  });

  const fromage = await prisma.ingredient.create({
    data: {
      name: "Fromage râpé",
      description: "Mélange de fromages râpés",
      supplier_id: supplier3.id,
      unit_price: 5.5,
    },
  });

  await prisma.ingredientCategory.create({
    data: {
      ingredient_id: fromage.id,
      category_id: produits_laitiers.id,
    },
  });

  console.log("✅ 5 Ingredients created with categories");

  // Create one StockFranchise per ingredient (fixed ids for catalog seed reuse)
  await prisma.stockFranchise.create({
    data: {
      id: SEED_STOCK_IDS.tomate,
      franchise_id: franchise.id,
      ingredient_id: tomate.id,
      quantity: 50,
    },
  });
  await prisma.stockFranchise.create({
    data: {
      id: SEED_STOCK_IDS.salade,
      franchise_id: franchise.id,
      ingredient_id: salade.id,
      quantity: 30,
    },
  });
  await prisma.stockFranchise.create({
    data: {
      id: SEED_STOCK_IDS.boeuf,
      franchise_id: franchise.id,
      ingredient_id: boeuf.id,
      quantity: 20,
    },
  });
  await prisma.stockFranchise.create({
    data: {
      id: SEED_STOCK_IDS.poulet,
      franchise_id: franchise.id,
      ingredient_id: poulet.id,
      quantity: 25,
    },
  });
  await prisma.stockFranchise.create({
    data: {
      id: SEED_STOCK_IDS.fromage,
      franchise_id: franchise.id,
      ingredient_id: fromage.id,
      quantity: 15,
    },
  });

  console.log("✅ 5 Stock entries created for the franchise");

  console.log("\n🎉 Seed completed successfully!");
  console.log("📍 Franchise ID:", franchise.id);
  console.log(
    "\n💡 Remember to add this franchise_id in the user session to test the frontend"
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
