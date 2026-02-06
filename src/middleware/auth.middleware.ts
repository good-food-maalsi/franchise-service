import type { Request, Response, NextFunction } from "express";
import { jwtVerify, importSPKI } from "jose";
import { UnauthorizedError } from "../errors/api-error.js";
import { decodeBase64Key } from "../utils/token.utils.js";
import { env } from "../config/env.js";

/**
 * Interface representing the JWT payload.
 * This type will be extracted into a shared npm package between all micro-services.
 */
export interface JWTPayload {
  sub: string;
  email: string;
  role?: string;
  franchise_id?: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication middleware for Express.
 * Validates JWT from Authorization header and attaches payload to request.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Skip authentication if DISABLE_AUTH is set to "true"
    if (env.DISABLE_AUTH) {
      req.user = {
        sub: "test-user",
        email: "test@example.com",
        role: "admin",
        franchise_id: undefined,
      };
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      throw new UnauthorizedError("No access token provided");
    }

    // Import RSA public key
    const publicKeyStr = env.JWT_PUBLIC_KEY;
    if (!publicKeyStr) {
      throw new UnauthorizedError("JWT public key not configured");
    }

    const publicKey = await importSPKI(decodeBase64Key(publicKeyStr), "RS256");

    // Verify and decode token
    const { payload } = await jwtVerify(token, publicKey);

    req.user = {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string | undefined,
      franchise_id: payload.franchise_id as string | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        return next(new UnauthorizedError("Token expired"));
      }
    }
    next(new UnauthorizedError("Invalid token"));
  }
}

/**
 * Optional authentication middleware.
 * Returns the payload if the token is valid, otherwise continues without user.
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authMiddleware(req, res, (error) => {
      if (error) {
        // Ignore auth errors for optional auth
        req.user = undefined;
      }
      next();
    });
  } catch {
    req.user = undefined;
    next();
  }
}
