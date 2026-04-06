/* ------------------------------------------------------------------ */
/*  Router – barrel export                                             */
/*  Since all portals use React Router, this is a simple re-export.    */
/* ------------------------------------------------------------------ */

// React Router adapter (only one needed now)
export { ReactRouterAdapter } from "./react-router-adapter";

// Keep the provider/hooks for backward compatibility during transition
export type { RouterAdapter } from "./router-context";
export {
  RouterAdapterProvider,
  useAdapterLink,
  useAdapterRouter,
  useAdapterPathname,
} from "./router-context";
