import type { Config } from "tailwindcss";
import preset from "@craft-apex/tailwind-config/tailwind.preset";

export default {
  presets: [preset as unknown as Config],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/layout/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
