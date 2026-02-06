import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCategory } from "@/tests/helpers/factories";

vi.mock("../../src/repositories/category.repository.js", () => ({
  categoryRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  },
}));

import { categoryHandler } from "../../src/handlers/category.handler.js";
import { categoryRepository } from "../../src/repositories/category.repository.js";
import { NotFoundError, ConflictError } from "../../src/errors/api-error.js";

describe("Category Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories", () => {
    it("should return paginated categories", async () => {
      const mockData = {
        data: [
          {
            ...createMockCategory(),
            _count: { ingredient_categories: 0 },
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      vi.mocked(categoryRepository.findAll).mockResolvedValue(mockData);

      const result = await categoryHandler.getCategories({ page: 1, limit: 10 });

      expect(result).toEqual(mockData);
      expect(categoryRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe("getCategoryById", () => {
    it("should return category if found", async () => {
      const mockCategory = {
        ...createMockCategory(),
        ingredient_categories: [],
        _count: { ingredient_categories: 0 },
      };
      vi.mocked(categoryRepository.findById).mockResolvedValue(mockCategory);

      const result = await categoryHandler.getCategoryById(mockCategory.id);

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.findById).toHaveBeenCalledWith(mockCategory.id);
    });

    it("should throw NotFoundError if category not found", async () => {
      vi.mocked(categoryRepository.findById).mockResolvedValue(null);

      await expect(
        categoryHandler.getCategoryById("non-existent-id")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("createCategory", () => {
    it("should create category if name is unique", async () => {
      const mockCategory = createMockCategory();
      vi.mocked(categoryRepository.findByName).mockResolvedValue(null);
      vi.mocked(categoryRepository.create).mockResolvedValue(mockCategory);

      const result = await categoryHandler.createCategory({
        name: "Viandes",
        description: "Produits carnés",
      });

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.findByName).toHaveBeenCalledWith("Viandes");
      expect(categoryRepository.create).toHaveBeenCalled();
    });

    it("should throw ConflictError if name already exists", async () => {
      const existingCategory = createMockCategory();
      vi.mocked(categoryRepository.findByName).mockResolvedValue(
        existingCategory
      );

      await expect(
        categoryHandler.createCategory({
          name: "Viandes",
        })
      ).rejects.toThrow(ConflictError);

      expect(categoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateCategory", () => {
    it("should update category if exists", async () => {
      const mockCategory = createMockCategory();
      vi.mocked(categoryRepository.exists).mockResolvedValue(true);
      vi.mocked(categoryRepository.findByName).mockResolvedValue(null);
      vi.mocked(categoryRepository.update).mockResolvedValue(mockCategory);

      const result = await categoryHandler.updateCategory(mockCategory.id, {
        name: "Viandes Premium",
      });

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.exists).toHaveBeenCalledWith(mockCategory.id);
      expect(categoryRepository.update).toHaveBeenCalled();
    });

    it("should throw NotFoundError if category not found", async () => {
      vi.mocked(categoryRepository.exists).mockResolvedValue(false);

      await expect(
        categoryHandler.updateCategory("non-existent-id", {
          name: "New Name",
        })
      ).rejects.toThrow(NotFoundError);

      expect(categoryRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictError if new name already exists", async () => {
      const existingCategory = createMockCategory({ id: "different-id" });
      vi.mocked(categoryRepository.exists).mockResolvedValue(true);
      vi.mocked(categoryRepository.findByName).mockResolvedValue(
        existingCategory
      );

      await expect(
        categoryHandler.updateCategory("my-id", { name: "Viandes" })
      ).rejects.toThrow(ConflictError);

      expect(categoryRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteCategory", () => {
    it("should delete category if exists", async () => {
      const mockCategory = createMockCategory();
      vi.mocked(categoryRepository.exists).mockResolvedValue(true);
      vi.mocked(categoryRepository.delete).mockResolvedValue(mockCategory);

      const result = await categoryHandler.deleteCategory(mockCategory.id);

      expect(result).toEqual(mockCategory);
      expect(categoryRepository.delete).toHaveBeenCalledWith(mockCategory.id);
    });

    it("should throw NotFoundError if category not found", async () => {
      vi.mocked(categoryRepository.exists).mockResolvedValue(false);

      await expect(
        categoryHandler.deleteCategory("non-existent-id")
      ).rejects.toThrow(NotFoundError);

      expect(categoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});

