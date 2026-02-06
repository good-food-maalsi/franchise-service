import type { Response } from "express";

/**
 * Pagination metadata for collection responses
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API response wrapper for single resource
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Standard API response wrapper for collections with pagination
 */
export interface ApiCollectionResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard API response for success messages
 */
export interface ApiMessageResponse {
  message: string;
}

/**
 * Creates a standardized JSON response for a single resource
 * @param res - Express response object
 * @param data - The resource data
 * @param status - HTTP status code (default: 200)
 */
export function sendApiResponse<T>(
  res: Response,
  data: T,
  status: number = 200
): void {
  res.status(status).json({ data });
}

/**
 * Creates a standardized JSON response for a collection with pagination
 * @param res - Express response object
 * @param data - Array of resources
 * @param meta - Pagination metadata
 * @param status - HTTP status code (default: 200)
 */
export function sendApiCollectionResponse<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  status: number = 200
): void {
  res.status(status).json({ data, meta });
}

/**
 * Creates a standardized JSON response for success messages
 * @param res - Express response object
 * @param message - Success message
 * @param status - HTTP status code (default: 200)
 */
export function sendApiMessageResponse(
  res: Response,
  message: string,
  status: number = 200
): void {
  res.status(status).json({ message });
}

/**
 * Creates a standardized JSON response for resource creation
 * @param res - Express response object
 * @param data - The created resource data
 */
export function sendApiCreatedResponse<T>(res: Response, data: T): void {
  sendApiResponse(res, data, 201);
}

/**
 * Creates a standardized JSON response for resource deletion
 * @param res - Express response object
 * @param resourceName - Name of the deleted resource
 */
export function sendApiDeletedResponse(
  res: Response,
  resourceName: string
): void {
  sendApiMessageResponse(res, `${resourceName} deleted successfully`, 200);
}
