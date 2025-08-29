import { useEnvironmentStore, EnvironmentConfig } from '../stores/env';

/**
 * Initialize the shared-state package with environment configuration.
 * This should be called once at the application startup before using any API services.
 * 
 * @param config - Environment configuration object
 * @example
 * ```typescript
 * import { initializeSharedState } from '@repo/shared-state/config';
 * 
 * // In your app's main file (e.g., main.tsx)
 * initializeSharedState({
 *   apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5050'
 * });
 * ```
 */
export function initializeSharedState(config: EnvironmentConfig): void {
  useEnvironmentStore.getState().initialize(config);
}

/**
 * Check if the shared-state package has been initialized
 * @returns true if initialized, false otherwise
 */
export function isSharedStateInitialized(): boolean {
  return useEnvironmentStore.getState().isInitialized;
}

export type { EnvironmentConfig };
export { useEnvironmentStore };

/**
 * Get the current environment configuration
 * @returns Environment configuration object
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return useEnvironmentStore.getState().getConfig();
}

/**
 * Get the API endpoint from environment configuration
 * @returns API endpoint URL
 */
export function getApiEndpoint(): string {
  return useEnvironmentStore.getState().getApiEndpoint();
}