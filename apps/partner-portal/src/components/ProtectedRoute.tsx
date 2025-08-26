import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@repo/shared-state/stores';
import { useModuleAuth } from '@repo/shared-state/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModuleAccess?: boolean;
}

export function ProtectedRoute({ children, requireModuleAccess = false }: ProtectedRouteProps) {
  const { isAuthenticated, setupData } = useAuthStore();
  const location = useLocation();
  const { moduleId } = useParams<{ moduleId: string }>();
  
  // Use moduleId from params if we're on a module route
  const targetModuleId = requireModuleAccess ? moduleId : undefined;
  const { hasAccess, modules } = useModuleAuth(targetModuleId);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're on a module route, check if the module exists and user has access
  if (moduleId) {
    const moduleExists = modules.some(m => m.module_id === moduleId);
    
    if (!moduleExists || !hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If requireModuleAccess is true but no moduleId, redirect to dashboard
  if (requireModuleAccess && !moduleId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}