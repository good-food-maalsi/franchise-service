import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { CommandStatus } from "@prisma/client";
import {
  connectTestDatabase,
  disconnectTestDatabase,
  cleanDatabase,
} from "@/tests/helpers/db-test-helper";
import { testDataFactory } from "@/tests/helpers/seed-test-data";

describe("Command Repository Integration Tests", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("create command with items (atomic)", () => {
    it("should create command with multiple items atomically", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient1 = await testDataFactory.createIngredient(
        prisma,
        supplier.id,
        { name: "Poulet" }
      );
      const ingredient2 = await testDataFactory.createIngredient(
        prisma,
        supplier.id,
        { name: "Tomates" }
      );

      // Create command with items in transaction
      const command = await prisma.$transaction(async (tx) => {
        const cmd = await tx.command.create({
          data: {
            franchise_id: franchise.id,
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            status: CommandStatus.draft,
          },
        });

        await tx.commandIngredient.createMany({
          data: [
            {
              command_id: cmd.id,
              ingredient_id: ingredient1.id,
              quantity: 10,
            },
            {
              command_id: cmd.id,
              ingredient_id: ingredient2.id,
              quantity: 5,
            },
          ],
        });

        return tx.command.findUnique({
          where: { id: cmd.id },
          include: {
            command_ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        });
      });

      expect(command).toBeDefined();
      expect(command?.command_ingredients).toHaveLength(2);
      expect(command?.command_ingredients[0].quantity).toBe(10);
      expect(command?.command_ingredients[1].quantity).toBe(5);
    });

    it("should rollback if item creation fails", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);

      await expect(
        prisma.$transaction(async (tx) => {
          const cmd = await tx.command.create({
            data: {
              franchise_id: franchise.id,
              user_id: "550e8400-e29b-41d4-a716-446655440000",
              status: CommandStatus.draft,
            },
          });

          // Try to create item with non-existent ingredient
          await tx.commandIngredient.create({
            data: {
              command_id: cmd.id,
              ingredient_id: "550e8400-e29b-41d4-a716-446655440000", // Doesn't exist
              quantity: 10,
            },
          });

          return cmd;
        })
      ).rejects.toThrow();

      // Verify command was not created (rollback)
      const commands = await prisma.command.findMany();
      expect(commands).toHaveLength(0);
    });
  });

  describe("findAll with filters", () => {
    it("should filter commands by franchise_id", async () => {
      const franchise1 = await testDataFactory.createFranchise(prisma);
      const franchise2 = await testDataFactory.createFranchise(prisma);

      await testDataFactory.createCommand(prisma, franchise1.id);
      await testDataFactory.createCommand(prisma, franchise1.id);
      await testDataFactory.createCommand(prisma, franchise2.id);

      const results = await prisma.command.findMany({
        where: { franchise_id: franchise1.id },
      });

      expect(results).toHaveLength(2);
    });

    it("should filter commands by status", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);

      await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.draft,
      });
      await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.confirmed,
      });
      await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.draft,
      });

      const draftCommands = await prisma.command.findMany({
        where: { status: CommandStatus.draft },
      });

      expect(draftCommands).toHaveLength(2);
    });

    it("should filter by multiple criteria", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);
      const userId = "550e8400-e29b-41d4-a716-446655440000";

      await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.confirmed,
        user_id: userId,
      });
      await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.draft,
        user_id: userId,
      });

      const results = await prisma.command.findMany({
        where: {
          franchise_id: franchise.id,
          status: CommandStatus.confirmed,
          user_id: userId,
        },
      });

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe(CommandStatus.confirmed);
    });
  });

  describe("command ingredients management", () => {
    it("should add ingredient to command", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );
      const command = await testDataFactory.createCommand(prisma, franchise.id);

      await prisma.commandIngredient.create({
        data: {
          command_id: command.id,
          ingredient_id: ingredient.id,
          quantity: 10,
        },
      });

      const items = await prisma.commandIngredient.findMany({
        where: { command_id: command.id },
      });

      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(10);
    });

    it("should update ingredient quantity", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );
      const command = await testDataFactory.createCommand(prisma, franchise.id);

      const item = await prisma.commandIngredient.create({
        data: {
          command_id: command.id,
          ingredient_id: ingredient.id,
          quantity: 10,
        },
      });

      const updated = await prisma.commandIngredient.update({
        where: { id: item.id },
        data: { quantity: 20 },
      });

      expect(updated.quantity).toBe(20);
    });

    it("should remove ingredient from command", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );
      const command = await testDataFactory.createCommand(prisma, franchise.id);

      await prisma.commandIngredient.create({
        data: {
          command_id: command.id,
          ingredient_id: ingredient.id,
          quantity: 10,
        },
      });

      await prisma.commandIngredient.deleteMany({
        where: {
          command_id: command.id,
          ingredient_id: ingredient.id,
        },
      });

      const items = await prisma.commandIngredient.findMany({
        where: { command_id: command.id },
      });

      expect(items).toHaveLength(0);
    });
  });

  describe("cascade delete", () => {
    it("should delete command ingredients when command is deleted", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma);
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id
      );
      const command = await testDataFactory.createCommand(prisma, franchise.id);

      await prisma.commandIngredient.create({
        data: {
          command_id: command.id,
          ingredient_id: ingredient.id,
          quantity: 10,
        },
      });

      await prisma.command.delete({
        where: { id: command.id },
      });

      const items = await prisma.commandIngredient.findMany({
        where: { command_id: command.id },
      });

      expect(items).toHaveLength(0);
    });

    it("should delete commands when franchise is deleted", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);
      await testDataFactory.createCommand(prisma, franchise.id);
      await testDataFactory.createCommand(prisma, franchise.id);

      await prisma.franchise.delete({
        where: { id: franchise.id },
      });

      const commands = await prisma.command.findMany({
        where: { franchise_id: franchise.id },
      });

      expect(commands).toHaveLength(0);
    });
  });

  describe("update command status", () => {
    it("should update command status through workflow", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);
      const command = await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.draft,
      });

      // Draft -> Confirmed
      let updated = await prisma.command.update({
        where: { id: command.id },
        data: { status: CommandStatus.confirmed },
      });
      expect(updated.status).toBe(CommandStatus.confirmed);

      // Confirmed -> In Progress
      updated = await prisma.command.update({
        where: { id: command.id },
        data: { status: CommandStatus.in_progress },
      });
      expect(updated.status).toBe(CommandStatus.in_progress);

      // In Progress -> Delivered
      updated = await prisma.command.update({
        where: { id: command.id },
        data: { status: CommandStatus.delivered },
      });
      expect(updated.status).toBe(CommandStatus.delivered);
    });

    it("should allow canceling command", async () => {
      const franchise = await testDataFactory.createFranchise(prisma);
      const command = await testDataFactory.createCommand(prisma, franchise.id, {
        status: CommandStatus.confirmed,
      });

      const updated = await prisma.command.update({
        where: { id: command.id },
        data: { status: CommandStatus.canceled },
      });

      expect(updated.status).toBe(CommandStatus.canceled);
    });
  });

  describe("include relations", () => {
    it("should include franchise and ingredients", async () => {
      const supplier = await testDataFactory.createSupplier(prisma);
      const franchise = await testDataFactory.createFranchise(prisma, {
        name: "Test Franchise",
      });
      const ingredient = await testDataFactory.createIngredient(
        prisma,
        supplier.id,
        { name: "Poulet" }
      );
      const command = await testDataFactory.createCommand(prisma, franchise.id);

      await prisma.commandIngredient.create({
        data: {
          command_id: command.id,
          ingredient_id: ingredient.id,
          quantity: 10,
        },
      });

      const result = await prisma.command.findUnique({
        where: { id: command.id },
        include: {
          franchise: true,
          command_ingredients: {
            include: {
              ingredient: {
                include: {
                  supplier: true,
                },
              },
            },
          },
        },
      });

      expect(result?.franchise.name).toBe("Test Franchise");
      expect(result?.command_ingredients).toHaveLength(1);
      expect(result?.command_ingredients[0].ingredient.name).toBe("Poulet");
      expect(result?.command_ingredients[0].ingredient.supplier).toBeDefined();
    });
  });
});

