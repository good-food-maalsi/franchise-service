import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQueryParams,
} from "../validators/supplier.validator.js";

export const supplierRepository = {
  /**
   * Get all suppliers with pagination and filters
   */
  async findAll(params: SupplierQueryParams) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.SupplierWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          _count: {
            select: {
              ingredients: true,
            },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a supplier by ID
   */
  async findById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        ingredients: {
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            ingredients: true,
          },
        },
      },
    });
  },

  /**
   * Get a supplier by email
   */
  async findByEmail(email: string) {
    return prisma.supplier.findUnique({
      where: { email },
    });
  },

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierInput) {
    return prisma.supplier.create({
      data,
    });
  },

  /**
   * Update a supplier
   */
  async update(id: string, data: UpdateSupplierInput) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a supplier
   */
  async delete(id: string) {
    return prisma.supplier.delete({
      where: { id },
    });
  },

  /**
   * Check if a supplier exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.supplier.count({
      where: { id },
    });
    return count > 0;
  },
};
