import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { useModule } from '../contexts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModuleAccess?: boolean;
}

export function ProtectedRoute({ children, requireModuleAccess = false }: ProtectedRouteProps) {
  const { isAuthenticated, setupData } = useAuthStore();
  const location = useLocation();
  
  // Only use module context when module access is required
  let currentModule = null;
  if (requireModuleAccess) {
    try {
      const moduleContext = useModule();
      console.log('Module Context:', moduleContext);
      currentModule = moduleContext.currentModule;
    } catch (error) {
      // If useModule fails (not within ModuleProvider), redirect to dashboard
      if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      return <Navigate to="/partner/dashboard" replace />;
    }
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If requireModuleAccess is true, check if user has access to any modules
  if (requireModuleAccess) {
    // Check if user has access to any modules in the system
    if (setupData?.module && setupData.module.length > 0) {
      const hasAnyModuleAccess = setupData.module.some(m => 
        m.display_mode !== 'HIDDEN'
      );

      console.log('Has Any Module Access:', hasAnyModuleAccess);
      
      // If user has no module access at all, redirect to dashboard
      if (!hasAnyModuleAccess) {
        return <Navigate to="/partner/dashboard" replace />;
      }
      
      // If no current module found but user has module access, allow access
      // This handles cases where URL doesn't perfectly match module URLs
    } else {
      // Allow access to specific routes even without module data
    }
  }

  return <>{children}</>;
}