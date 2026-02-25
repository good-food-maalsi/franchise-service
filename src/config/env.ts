import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3010),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    JWT_PUBLIC_KEY_BASE64: z.string().optional(),
    CORS_ORIGINS: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(",").map((s) => s.trim()) : [])),
    RABBITMQ_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
