import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Two-project vitest workspace:
 * - `node` (default): pure logic tests in `*.test.ts` run in Node.
 * - `dom`: component tests in `*.dom-test.tsx` run in jsdom with RTL.
 *
 * Splitting by extension means logic tests keep their fast Node env while
 * component tests get a DOM + the @testing-library/jest-dom matchers.
 */
export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        // Unit / logic tests — fast Node environment.
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        // Component tests — jsdom + React Testing Library.
        extends: true,
        plugins: [react()],
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.dom-test.tsx"],
          globals: true,
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "src"),
          },
        },
      },
    ],
  },
});
