import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const pkg = (p: string) => path.resolve(root, "../../packages", p);

// Workspace packages are consumed as source (no build step) via aliases,
// so Vite/esbuild transpiles their TSX along with the app.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      "@craft-apex/ui/globals.css": pkg("ui/src/globals.css"),
      "@craft-apex/ui": pkg("ui/src/index.ts"),
      "@craft-apex/api": pkg("api/src/index.ts"),
      "@craft-apex/auth": pkg("auth/src/index.ts"),
      "@craft-apex/layout": pkg("layout/src/index.ts"),
    },
  },
  server: { port: 3002 },
});
