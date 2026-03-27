import axios from "axios";

// ---------------------------------------------------------------------------
// Axios instance – shared across the monorepo via @craft-apex/auth/axios
// ---------------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: process.env.APP_API_URL,
  timeout: 5000000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---- helpers ------------------------------------------------------------- */

const redirectToLogout = () => {
  window.location.href = "/logout";
};

const redirectToLogin = () => {
  localStorage.removeItem("authUser");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("module");
  localStorage.removeItem("privilege");
  localStorage.removeItem("guestToken");
  localStorage.removeItem("tenant");
  window.location.href = "/login";
};

/* ---- request interceptor ------------------------------------------------- */

axiosInstance.interceptors.request.use(
  async (config) => {
    // ── Inject X-Platform header ──────────────────────────────────────
    // Determined by the running app via NEXT_PUBLIC_PLATFORM env var
    const platform =
      process.env.NEXT_PUBLIC_PLATFORM ??
      (typeof window !== "undefined"
        ? localStorage.getItem("platform") ?? "EMPLOYEE_PORTAL"
        : "EMPLOYEE_PORTAL");
    config.headers["X-Platform"] = platform;

    // ── Inject X-Tenant-Domain header ────────────────────────────────
    // Always use the current browser URL so the API knows which domain
    // the request originates from.
    const tenantDomain =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? "";
    if (tenantDomain) {
      config.headers["X-Tenant-Domain"] = tenantDomain;
    }

    // Setup endpoint – only add auth if a token exists (post-login),
    // otherwise let it through unauthenticated (pre-login / guest).
    if (config.url === "/alpha/v1/setup") {
      const existingToken = typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
      if (existingToken) {
        config.headers["Authorization"] = `Bearer ${existingToken}`;
      } else {
        delete config.headers["Authorization"];
      }
      return config;
    }

    let token = localStorage.getItem("accessToken");
    const guestToken = localStorage.getItem("guestToken");

    if (!token && !guestToken) {
      try {
        const tokenResponse = await axiosInstance.post("/alpha/v1/setup", {});
        token = tokenResponse?.data?.data?.user?.access_token;

        if (token) {
          if (tokenResponse?.data?.data?.user?.user_type === "GUEST") {
            localStorage.setItem("guestToken", token);
          } else {
            localStorage.setItem("accessToken", token);
          }
        }
      } catch (error) {
        console.error("Error fetching token request:", error);
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (guestToken) {
      config.headers["Authorization"] = `Bearer ${guestToken}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---- response interceptor ------------------------------------------------ */

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?.url?.includes("/auth/refresh") &&
      !originalRequest?.url?.includes("/logout")
    ) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("No refresh token found, redirecting to logout.");
        redirectToLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post("/alpha/v1/auth/refresh", {
          refresh_token: refreshToken,
        });

        if (response?.data?.status) {
          const { data } = response.data;

          if (data?.access_token) {
            axios.defaults.headers.common["Authorization"] =
              `Bearer ${data.access_token}`;
            originalRequest.headers["Authorization"] =
              `Bearer ${data.access_token}`;

            if (originalRequest?.method === "post") {
              originalRequest.data = JSON.parse(originalRequest.data);
            }

            localStorage.setItem("accessToken", data.access_token);
            return axios(originalRequest);
          } else {
            console.error(
              "Access token missing in refresh response, redirecting to logout."
            );
            redirectToLogout();
          }
        } else {
          console.error("Failed to refresh token, redirecting to logout.");
          redirectToLogout();
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        redirectToLogout();
        return Promise.reject(refreshError);
      }
    } else if (
      error.response &&
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      redirectToLogout();
    } else if (
      error.response &&
      error.response.status === 401 &&
      originalRequest?.url?.includes("/logout")
    ) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
