import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Toujours charger le .env du projet (évite d'utiliser celui d'un autre repo)
config({ path: path.join(__dirname, ".env") });

interface Env {
  DATABASE_URL: string;
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});
