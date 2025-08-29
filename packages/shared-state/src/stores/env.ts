import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface EnvironmentConfig {
  apiEndpoint: string;
  // Add other environment variables as needed
}

interface EnvironmentStore {
  // State
  config: EnvironmentConfig | null;
  isInitialized: boolean;
  
  // Actions
  initialize: (config: EnvironmentConfig) => void;
  getApiEndpoint: () => string;
  getConfig: () => EnvironmentConfig;
  reset: () => void;
}

export const useEnvironmentStore = create<EnvironmentStore>()(  
  devtools(
    (set, get) => ({
      // Initial state
      config: null,
      isInitialized: false,
      
      // Actions
      initialize: (config: EnvironmentConfig) => {
        set({ config, isInitialized: true }, false, 'env/initialize');
      },
      
      getApiEndpoint: () => {
        const { config } = get();
        if (!config) {
          throw new Error('Environment not initialized. Call initialize() first with environment configuration.');
        }
        return config.apiEndpoint;
      },
      
      getConfig: () => {
        const { config } = get();
        if (!config) {
          throw new Error('Environment not initialized. Call initialize() first with environment configuration.');
        }
        return config;
      },
      
      reset: () => {
        set({ config: null, isInitialized: false }, false, 'env/reset');
      }
    }),
    {
      name: 'environment-store'
    }
  )
);

export type { EnvironmentConfig };