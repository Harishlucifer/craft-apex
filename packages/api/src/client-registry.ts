import type { AxiosInstance } from "axios";

/**
 * The app creates the configured axios instance (lib/api.ts) and registers
 * it here so shared package components (e.g. the header search) can make
 * verified calls without importing the app.
 */
let client: AxiosInstance | null = null;

export function setApiClient(instance: AxiosInstance) {
  client = instance;
}

export function getApiClient(): AxiosInstance {
  if (!client) {
    throw new Error(
      "API client not registered — call setApiClient() at app startup."
    );
  }
  return client;
}
