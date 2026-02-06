import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../errors/api-error.js";

/**
 * Validates GPS coordinates
 * @param lat - Latitude value
 * @param lon - Longitude value
 * @throws {BadRequestError} If coordinates are invalid
 */
export function validateGPSCoordinates(lat: number, lon: number): void {
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new BadRequestError(
      "Invalid GPS coordinates: latitude must be between -90 and 90, longitude must be between -180 and 180"
    );
  }
}

/**
 * Validates that both GPS coordinates are provided together or both are null/undefined
 * @param lat - Latitude value or null/undefined
 * @param lon - Longitude value or null/undefined
 * @throws {BadRequestError} If only one coordinate is provided
 */
export function validateGPSCoordinatesPair(
  lat: number | null | undefined,
  lon: number | null | undefined
): void {
  const hasLat = lat !== null && lat !== undefined;
  const hasLon = lon !== null && lon !== undefined;

  if (hasLat !== hasLon) {
    throw new BadRequestError(
      "Both latitude and longitude must be provided together or both set to null"
    );
  }

  // If both are provided, validate ranges
  if (hasLat && hasLon) {
    validateGPSCoordinates(lat as number, lon as number);
  }
}

/**
 * Ensures a resource exists in the database
 * @param repository - Repository with exists method
 * @param id - Resource ID
 * @param resourceName - Name of the resource for error message
 * @throws {NotFoundError} If resource doesn't exist
 */
export async function ensureExists(
  repository: { exists: (id: string) => Promise<boolean> },
  id: string,
  resourceName: string
): Promise<void> {
  const exists = await repository.exists(id);
  if (!exists) {
    throw new NotFoundError(`${resourceName} with ID ${id} not found`);
  }
}

/**
 * Validates email uniqueness for create operations
 * @param repository - Repository with findByEmail method
 * @param email - Email to validate
 * @param resourceName - Name of the resource for error message
 * @throws {ConflictError} If email already exists
 */
export async function validateEmailUniqueness(
  repository: {
    findByEmail: (email: string) => Promise<{ id: string } | null>;
  },
  email: string,
  resourceName: string
): Promise<void> {
  const existing = await repository.findByEmail(email);
  if (existing) {
    throw new ConflictError(
      `A ${resourceName} with email ${email} already exists`
    );
  }
}

/**
 * Validates email uniqueness for update operations
 * @param repository - Repository with findByEmail method
 * @param email - Email to validate
 * @param currentId - Current resource ID to exclude from check
 * @param resourceName - Name of the resource for error message
 * @throws {ConflictError} If email already exists for a different resource
 */
export async function validateEmailUniquenessForUpdate(
  repository: {
    findByEmail: (email: string) => Promise<{ id: string } | null>;
  },
  email: string,
  currentId: string,
  resourceName: string
): Promise<void> {
  const existing = await repository.findByEmail(email);
  if (existing && existing.id !== currentId) {
    throw new ConflictError(
      `A ${resourceName} with email ${email} already exists`
    );
  }
}

/**
 * Validates name uniqueness for create operations
 * @param repository - Repository with findByName method
 * @param name - Name to validate
 * @param resourceName - Name of the resource for error message
 * @throws {ConflictError} If name already exists
 */
export async function validateNameUniqueness(
  repository: { findByName: (name: string) => Promise<{ id: string } | null> },
  name: string,
  resourceName: string
): Promise<void> {
  const existing = await repository.findByName(name);
  if (existing) {
    throw new ConflictError(
      `A ${resourceName} with name "${name}" already exists`
    );
  }
}

/**
 * Validates name uniqueness for update operations
 * @param repository - Repository with findByName method
 * @param name - Name to validate
 * @param currentId - Current resource ID to exclude from check
 * @param resourceName - Name of the resource for error message
 * @throws {ConflictError} If name already exists for a different resource
 */
export async function validateNameUniquenessForUpdate(
  repository: { findByName: (name: string) => Promise<{ id: string } | null> },
  name: string,
  currentId: string,
  resourceName: string
): Promise<void> {
  const existing = await repository.findByName(name);
  if (existing && existing.id !== currentId) {
    throw new ConflictError(
      `A ${resourceName} with name "${name}" already exists`
    );
  }
}
