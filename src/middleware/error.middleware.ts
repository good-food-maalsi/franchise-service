import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors/api-error.js";
import { Prisma } from "../generated/prisma/client.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation Error",
      code: "VALIDATION_ERROR",
      details: error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  // Custom API errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        res.status(409).json({
          error: "A record with this unique field already exists",
          code: "UNIQUE_CONSTRAINT_VIOLATION",
          field: error.meta?.target,
        });
        return;
      case "P2025":
        res.status(404).json({
          error: "Record not found",
          code: "NOT_FOUND",
        });
        return;
      case "P2003":
        res.status(400).json({
          error: "Foreign key constraint failed",
          code: "FOREIGN_KEY_CONSTRAINT",
        });
        return;
      default:
        res.status(500).json({
          error: "Database error",
          code: "DATABASE_ERROR",
        });
        return;
    }
  }

  // Generic errors
  if (error instanceof Error) {
    res.status(500).json({
      error: error.message,
      code: "INTERNAL_ERROR",
    });
    return;
  }

  // Unknown errors
  res.status(500).json({
    error: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  });
}
