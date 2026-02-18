import type { JWTPayload } from "../middleware/auth.middleware.js";
import { ForbiddenError } from "../errors/api-error.js";

/**
 * User context for authorization (subset of JWTPayload).
 */
export type AuthUser = Pick<JWTPayload, "role" | "franchise_id">;

/**
 * Asserts that the current user can access a resource belonging to the given franchise.
 * - Admin: allowed for any franchise.
 * - Franchise user: allowed only if resourceFranchiseId === user.franchise_id.
 */
export function assertFranchiseAccess(
  resourceFranchiseId: string,
  user: AuthUser | undefined,
): void {
  if (!user) {
    throw new ForbiddenError("Authentication required");
  }
  if (user.role === "admin") {
    return;
  }
  if (user.franchise_id !== resourceFranchiseId) {
    throw new ForbiddenError("Access denied to this resource");
  }
}

/**
 * Asserts that the current user can act on a franchise (by id).
 * - Admin: allowed for any franchise.
 * - Franchise user: allowed only if franchiseId === user.franchise_id.
 */
export function assertFranchiseOrAdmin(
  franchiseId: string,
  user: AuthUser | undefined,
): void {
  assertFranchiseAccess(franchiseId, user);
}

/**
 * Asserts that the current user has the admin role.
 */
export function assertAdmin(user: AuthUser | undefined): void {
  if (!user) {
    throw new ForbiddenError("Authentication required");
  }
  if (user.role !== "admin") {
    throw new ForbiddenError("Admin role required");
  }
}
