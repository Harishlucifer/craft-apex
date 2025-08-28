import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@repo/shared-state/stores';
import { useModuleAuth } from '@repo/shared-state/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModuleAccess?: boolean;
  moduleCode?: string; // Optional module code for specific routes
}

export function ProtectedRoute({ children, requireModuleAccess = false, moduleCode }: ProtectedRouteProps) {
  const { isAuthenticated, setupData } = useAuthStore();
  const location = useLocation();
  const { moduleId } = useParams<{ moduleId: string }>();
  
  // Map specific routes to module codes
  const getModuleCodeFromPath = (pathname: string): string | undefined => {
    if (pathname.startsWith('/ask/')) return 'ask';
    if (pathname.startsWith('/lead/')) return 'lead';
    if (pathname.startsWith('/task/')) return 'task';
    return undefined;
  };
  
  // Use provided moduleCode, or derive from URL path, or use moduleId from params
  const targetModuleCode = moduleCode || getModuleCodeFromPath(location.pathname) || moduleId;
  const { hasAccess, modules } = useModuleAuth(targetModuleCode);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're on a module route, check if the module exists and user has access
  if (targetModuleCode) {
    const moduleExists = modules.some(m => m.module_id === targetModuleCode);
    
    if (!moduleExists || !hasAccess) {
      return <Navigate to="/partner/dashboard" replace />;
    }
  }

  // If requireModuleAccess is true but no module code found, redirect to dashboard
  if (requireModuleAccess && !targetModuleCode) {
    return <Navigate to="/partner/dashboard" replace />;
  }

  return <>{children}</>;
}