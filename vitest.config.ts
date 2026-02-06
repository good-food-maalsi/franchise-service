import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["vitest.setup.ts"],
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/errors/**/*.ts",
        "src/handlers/**/*.ts",
        "src/validators/**/*.ts",
        "src/utils/**/*.ts",
      ],
      exclude: ["src/**/*.d.ts", "src/**/*.test.ts", "**/node_modules/**"],
    },
    // Désactiver le parallélisme pour éviter les deadlocks sur la DB partagée
    maxConcurrency: 1,
    fileParallelism: false,
  },
});
