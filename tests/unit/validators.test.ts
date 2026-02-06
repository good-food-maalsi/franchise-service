import { describe, it, expect } from "vitest";
import {
  validateGPSCoordinates,
  validateGPSCoordinatesPair,
} from "../../src/utils/validators.js";
import { BadRequestError } from "../../src/errors/api-error.js";

describe("validators", () => {
  describe("validateGPSCoordinates", () => {
    it("should accept valid coordinates", () => {
      expect(() => validateGPSCoordinates(48.8566, 2.3522)).not.toThrow();
      expect(() => validateGPSCoordinates(0, 0)).not.toThrow();
      expect(() => validateGPSCoordinates(-90, -180)).not.toThrow();
      expect(() => validateGPSCoordinates(90, 180)).not.toThrow();
    });

    it("should reject invalid latitude", () => {
      expect(() => validateGPSCoordinates(91, 0)).toThrow(BadRequestError);
      expect(() => validateGPSCoordinates(-91, 0)).toThrow(BadRequestError);
    });

    it("should reject invalid longitude", () => {
      expect(() => validateGPSCoordinates(0, 181)).toThrow(BadRequestError);
      expect(() => validateGPSCoordinates(0, -181)).toThrow(BadRequestError);
    });
  });

  describe("validateGPSCoordinatesPair", () => {
    it("should accept valid coordinate pairs", () => {
      expect(() => validateGPSCoordinatesPair(48.8566, 2.3522)).not.toThrow();
    });

    it("should accept null/undefined pairs", () => {
      expect(() => validateGPSCoordinatesPair(null, null)).not.toThrow();
      expect(() =>
        validateGPSCoordinatesPair(undefined, undefined)
      ).not.toThrow();
    });

    it("should reject mismatched pairs", () => {
      expect(() => validateGPSCoordinatesPair(48.8566, null)).toThrow(
        BadRequestError
      );
      expect(() => validateGPSCoordinatesPair(null, 2.3522)).toThrow(
        BadRequestError
      );
    });
  });
});
