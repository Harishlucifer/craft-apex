import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const pkg = (p: string) => path.resolve(root, "../../packages", p);

// Workspace packages are consumed as source (no build step) via aliases.
// NOTE: @craft-apex/layout is deliberately absent — customers have no module
// tree, so this app does not use the module-driven app shell.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@craft-apex/ui/globals.css": pkg("ui/src/globals.css"),
      "@craft-apex/ui": pkg("ui/src/index.ts"),
      "@craft-apex/api": pkg("api/src/index.ts"),
      "@craft-apex/auth": pkg("auth/src/index.ts"),
      "@craft-apex/i18n": pkg("i18n/src/index.ts"),
      "@craft-apex/shared": pkg("shared/src/index.ts"),
    },
  },
  server: { port: 3002 },
});
