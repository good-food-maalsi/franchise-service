import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3010),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_PUBLIC_KEY: z.string().optional(),
  DISABLE_AUTH: z
    .string()
    .transform((val) => val === "true")
    .default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
