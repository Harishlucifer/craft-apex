/* ------------------------------------------------------------------ */
/*  @craft-apex/auth – barrel export                                   */
/* ------------------------------------------------------------------ */

// Axios instance
export { default as axiosInstance } from "./axios-instance";

// Zustand store
export { useSetupStore } from "./store/setup-store";

// TanStack Query hooks
export { useSetupQuery, useSetupMutation, SetupInitializer } from "./hooks/use-setup";

// Auth hooks
export { useAuth } from "./hooks/use-auth";

// Auth guard component
export { AuthProtected } from "./components/auth-protected";

// Login components
export { LoginPage, LoginPassword, LoginOtp, LoginMfa, LoginMfaMobile, ForgotPassword } from "./components/login";

// Types – setup
export type {
  SetupResponse,
  SetupData,
  SetupSystem,
  SetupTenant,
  SetupUser,
  SetupOtherData,
} from "./types/setup";

// Types – login
export { LOGIN_TYPE } from "./types/login";
export type { LoginConfig, LoginTypeValue, LoginSuccessPayload } from "./types/login";

// Types – routes
export type { AppRoute, RouteSection } from "./types/routes";
