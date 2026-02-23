import type {
  Category,
  Ingredient,
  Command,
  StockFranchise,
  Supplier,
  Franchise,
  CommandStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";

/**
 * Factory functions pour créer des données de test
 */

export const createMockCategory = (
  overrides?: Partial<Category>
): Category => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Viandes",
  description: "Produits carnés",
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

export const createMockSupplier = (
  overrides?: Partial<Supplier>
): Supplier => ({
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "Ferme Bio",
  logo_url: "https://example.com/logo.png",
  latitude: 48.8566,
  longitude: 2.3522,
  phone: "+33 1 23 45 67 89",
  email: "contact@fermebio.fr",
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

export const createMockIngredient = (
  overrides?: Partial<Ingredient>
): Ingredient => ({
  id: "550e8400-e29b-41d4-a716-446655440002",
  name: "Poulet fermier",
  description: "Poulet Label Rouge",
  supplier_id: "550e8400-e29b-41d4-a716-446655440001",
  unit_price: new Prisma.Decimal(12.5),
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

export const createMockFranchise = (
  overrides?: Partial<Franchise>
): Franchise => ({
  id: "550e8400-e29b-41d4-a716-446655440003",
  name: "Good Food Lyon",
  latitude: 45.764043,
  longitude: 4.835659,
  street: "45 Rue de la République",
  city: "Lyon",
  state: "Auvergne-Rhône-Alpes",
  zip: "69002",
  owner_id: "550e8400-e29b-41d4-a716-446655440010",
  email: "lyon@goodfood.com",
  phone: "+33 4 12 34 56 78",
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

export const createMockCommand = (overrides?: Partial<Command>): Command => ({
  id: "550e8400-e29b-41d4-a716-446655440004",
  franchise_id: "550e8400-e29b-41d4-a716-446655440003",
  status: "draft" as CommandStatus,
  user_id: "550e8400-e29b-41d4-a716-446655440010",
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

export const createMockStockFranchise = (
  overrides?: Partial<StockFranchise>
): StockFranchise => ({
  id: "550e8400-e29b-41d4-a716-446655440005",
  franchise_id: "550e8400-e29b-41d4-a716-446655440003",
  ingredient_id: "550e8400-e29b-41d4-a716-446655440002",
  quantity: 50,
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: new Date("2025-01-01T00:00:00.000Z"),
  ...overrides,
});

