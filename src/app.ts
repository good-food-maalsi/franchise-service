import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import routes from "./routes/index.js";

const app: Application = express();

// Security middlewares
app.use(helmet());
const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];
const allowedOrigins = env.CORS_ORIGINS?.length
  ? env.CORS_ORIGINS
  : env.NODE_ENV === "production"
    ? []
    : defaultOrigins;
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  }),
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Health check endpoint (sous le préfixe ingress /franchise)
app.get("/franchise/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "franchise-service",
    timestamp: new Date().toISOString(),
  });
});

// Auth pour /franchise/franchises* sauf GET liste et GET détail (publics pour visiteurs)
app.use((req, res, next) => {
  const path = req.path || req.originalUrl?.split("?")[0] || "";
  const isFranchisePath =
    path === "/franchise/franchises" ||
    path.startsWith("/franchise/franchises/");
  const isPublicGet =
    req.method === "GET" &&
    (path === "/franchise/franchises" || /^\/franchise\/franchises\/[^/]+$/.test(path));
  if (isFranchisePath && !isPublicGet) {
    return authMiddleware(req, res, next);
  }
  next();
});

// API routes (préfixe /franchise pour correspondre à l'ingress)
app.use("/franchise", routes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
