import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? false : "*",
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "franchise-service",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(routes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
