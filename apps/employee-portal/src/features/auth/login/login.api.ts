import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  LoginResult,
} from "./login.types";

// Legacy: axios.post(`/alpha/${version}/auth/login-with-password`, { email, password })
const LOGIN_URL = "/alpha/v1/auth/login-with-password";

async function login(body: LoginRequest): Promise<LoginResult> {
  // The shared interceptor returns response.data (json-bigint parsed body).
  const res = await api.post<unknown, LoginResponse>(LOGIN_URL, body);

  // Payload may be top-level or under `data` (legacy unwrapped the same way).
  const payload =
    res?.data && (res.data.user || res.data.module) ? res.data : res;

  return {
    user: payload?.user,
    module: payload?.module,
    change_password: payload?.change_password,
    sessionConflict:
      res?.status === "ACTIVE_SESSION_CONFLICT" || res?.http_status === 409,
    message: res?.message,
  };
}

export function useLogin() {
  return useMutation({ mutationFn: login });
}
