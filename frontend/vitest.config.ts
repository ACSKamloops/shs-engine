import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    watch: false,
    reporters: ["default"],
    globals: true,
    pool: "threads",
    maxThreads: 1,
    minThreads: 1,
  },
});
