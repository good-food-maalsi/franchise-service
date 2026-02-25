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
    next: NextFunction,
): Promise<void> {
    try {
        // Get token from Authorization header OR cookies
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : req.cookies?.accessToken || null;

        if (!token) {
            throw new UnauthorizedError("No access token provided");
        }

        // Import RSA public key
        const publicKeyStr = env.JWT_PUBLIC_KEY_BASE64;
        if (!publicKeyStr) {
            throw new UnauthorizedError("JWT public key not configured");
        }

        const publicKey = await importSPKI(
            decodeBase64Key(publicKeyStr),
            "RS256",
        );

        // Verify and decode token
        const { payload } = await jwtVerify(token, publicKey);

        // Normalize role: auth-service stores an array of Prisma UserRole objects
        const roleRaw = payload.role;
        let normalizedRole: string | undefined;
        if (Array.isArray(roleRaw)) {
            const first = (roleRaw as Record<string, unknown>[])[0];
            const roleStr =
                (first?.role as Record<string, unknown>)?.role ?? first?.role;
            if (typeof roleStr === "string")
                normalizedRole = roleStr.toLowerCase();
        } else if (typeof roleRaw === "string") {
            normalizedRole = roleRaw.toLowerCase();
        }

        // Normalize franchise_id: auth-service uses camelCase "franchiseId"
        const franchiseId =
            (payload.franchise_id as string | undefined) ??
            ((payload as Record<string, unknown>).franchiseId as
                | string
                | undefined);

        req.user = {
            sub: payload.sub as string,
            email: payload.email as string,
            role: normalizedRole,
            franchise_id: franchiseId,
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
    next: NextFunction,
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
