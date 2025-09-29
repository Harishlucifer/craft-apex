// Initialization file to set up dependency injection after all modules are loaded
import { setAuthStateGetter } from './api/base';
import { useAuthStore } from './stores/auth';

// Initialize the dependency injection for BaseApiService
export const initializeDependencyInjection = () => {
  setAuthStateGetter(() => {
    const state = useAuthStore.getState();
    return {
      user: state.user,
      platform: state.platform,
      tenantDomain: state.tenantDomain,
      refreshToken: state.refreshToken,
    };
  });
};

// Auto-initialize when this module is imported
initializeDependencyInjection();