import { JWTPayload } from "../middleware/auth.middleware.js";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
