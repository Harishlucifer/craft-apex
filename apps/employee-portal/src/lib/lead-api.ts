"use client";

/* ------------------------------------------------------------------ */
/*  Lead API — extends WorkflowAPI for lead-specific operations         */
/*  Located in the employee-portal since it's app-level logic           */
/* ------------------------------------------------------------------ */

import {
  WorkflowAPI,
  setAuthProvider,
  setApiEndpoint,
} from "@craft-apex/workflow";

/**
 * LeadAPI — Domain-specific API service for Lead management.
 *
 * Extends WorkflowAPI to add:
 *  - `fetchLead(id)` — fetch a single lead by ID
 *  - `createUpdate(data)` — create or update a lead record
 *
 * Uses the same singleton pattern as the original Lead/api/LeadAPI.ts.
 */
export class LeadAPI extends WorkflowAPI {
  private static leadInstance: LeadAPI;

  protected constructor() {
    super();
  }

  public static getInstance(): LeadAPI {
    if (!LeadAPI.leadInstance) {
      LeadAPI.leadInstance = new LeadAPI();
    }
    return LeadAPI.leadInstance;
  }

  /** Fetch a single lead by ID */
  async fetchLead(
    id: string,
    version: "V1" | "V2" = "V2"
  ): Promise<any> {
    const versionPath =
      version === "V2" ? "/alpha/v2/application/" : "/alpha/v1/application/";
    const response = await this.get(`${versionPath}${id}`);
    return response.data ?? response;
  }

  /** Create or update a lead (called by DynamicStagesAndSteps on form submit) */
  async createUpdate(data: any, version?: string): Promise<any> {
    const ver = version || "v2";
    const response = await this.post(`/alpha/${ver}/application/create`, data);
    return response?.data ?? response;
  }
}

/* ------------------------------------------------------------------ */
/*  Bootstrap — wire up AuthProvider and API endpoint                   */
/*  This runs once when the module is imported                          */
/* ------------------------------------------------------------------ */

if (typeof window !== "undefined") {
  // Set the API endpoint from env
  const apiUrl = process.env.APP_API_URL || "";
  if (apiUrl) {
    setApiEndpoint(apiUrl);
  }

  // Wire up AuthProvider using localStorage tokens (same as the auth package)
  setAuthProvider({
    getAccessToken: () => localStorage.getItem("accessToken"),
    getPlatform: () =>
      process.env.NEXT_PUBLIC_PLATFORM ??
      localStorage.getItem("platform") ??
      "EMPLOYEE_PORTAL",
    getTenantDomain: () => window.location.origin,
    refreshToken: async () => {
      // The auth package handles refresh via axios interceptor
      // This is a fallback — shouldn't normally be reached
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");
      const res = await fetch(`${apiUrl}/alpha/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const json = await res.json();
      if (json?.data?.access_token) {
        localStorage.setItem("accessToken", json.data.access_token);
        return json.data.access_token;
      }
      throw new Error("Token refresh failed");
    },
  });
}
