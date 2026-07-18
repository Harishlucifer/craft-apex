import type { Config } from "tailwindcss";
import preset from "@craft-apex/tailwind-config/tailwind.preset";

export default {
  presets: [preset as unknown as Config],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/layout/src/**/*.{ts,tsx}",
    "../../packages/i18n/src/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}",
    "../../packages/workflow-runtime/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
