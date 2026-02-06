import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidationTarget = "body" | "query" | "params";

/**
 * Generic Zod validation middleware factory.
 * Validates the specified part of the request against the provided schema.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates request body
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, "body");
}

/**
 * Validates request query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, "query");
}

/**
 * Validates request URL parameters
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, "params");
}
