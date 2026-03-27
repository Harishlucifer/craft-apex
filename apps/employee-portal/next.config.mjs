import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@craft-apex/ui", "@craft-apex/auth", "@craft-apex/layout", "@craft-apex/workflow"],
    env: {
        APP_API_URL: process.env.APP_API_URL,
        NEXT_PUBLIC_PLATFORM: process.env.NEXT_PUBLIC_PLATFORM || "EMPLOYEE_PORTAL",
        NEXT_PUBLIC_TENANT_DOMAIN: process.env.NEXT_PUBLIC_TENANT_DOMAIN || "",
    },
};

export default nextConfig;
