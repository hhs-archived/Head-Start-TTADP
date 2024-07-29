import { defineWorkspace } from "vitest/config";
import react from '@vitejs/plugin-react';

export default defineWorkspace([
  {
    resolve: {
      mainFields: ["module"],
    },
    test: {
      include: ["src/**/*.{test,spec}.ts", "src/**/*.{test,spec}.js"],
      name: "backend",
      environment: "node",
      globals: true,
    },
  },
  // {
  //   plugins: [react()],
  //   test: {
  //     include: ["frontend/src/**/__tests__/**/*.{test,spec}.ts", "frontend/src/**/__tests__/**/*.{test,spec}.js"],
  //     name: "frontend",
  //     environment: "happy-dom",
  //     globals: true,
  //   },
  // },
]);
