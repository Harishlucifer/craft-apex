import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { ModuleData } from '@repo/types/setup';

interface ModuleContextType {
  currentModule: ModuleData | null;
  parentModule: ModuleData | null;
  breadcrumbs: Array<{ title: string; url: string; moduleId?: string }>;
  // New: child expansion and navigation helpers
  expandedModuleId: string | null;
  getChildren: (moduleId: string | null) => ModuleData[];
  setExpandedModuleId: (moduleId: string | null) => void;
  navigateToModule: (moduleOrId: ModuleData | string) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setupData } = useAuthStore();
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  
  const moduleData = useMemo(() => {
    if (!setupData?.module || !location.pathname) {
      return {
        currentModule: null,
        parentModule: null,
        breadcrumbs: [],
        expandedModuleId: null,
        getChildren: () => [],
        setExpandedModuleId: () => {},
        navigateToModule: () => {}
      };
    }

    const modules = setupData.module;
    const currentPath = location.pathname;

    // Find the current module by matching URL
    let currentModule: ModuleData | null = null;
    let parentModule: ModuleData | null = null;

    // Helper function to find module by URL recursively
    const findModuleByUrl = (moduleList: ModuleData[], path: string): ModuleData | null => {
      for (const module of moduleList) {
        // Generate expected URL for this module
        const moduleCode = module.code || module.name.toLowerCase().replace(/\s+/g, '-');
        const expectedUrl = module.url || `/partner/${moduleCode}`;
        
        // Check if current module URL matches
        if (expectedUrl === path || path.startsWith(expectedUrl + '/')) {
          return module;
        }
        
        // Check child modules
        if (module.child_module && module.child_module.length > 0) {
          const childMatch = findModuleByUrl(module.child_module, path);
          if (childMatch) {
            return childMatch;
          }
        }
      }
      return null;
    };

    // Helper function to find parent of a module
    const findParentModule = (moduleList: ModuleData[], targetModuleId: string): ModuleData | null => {
      for (const module of moduleList) {
        if (module.child_module && module.child_module.length > 0) {
          const hasChild = module.child_module.some(child => child.module_id === targetModuleId);
          if (hasChild) {
            return module;
          }
          
          // Recursively check nested children
          const nestedParent = findParentModule(module.child_module, targetModuleId);
          if (nestedParent) {
            return nestedParent;
          }
        }
      }
      return null;
    };

    currentModule = findModuleByUrl(modules, currentPath);
    
    if (currentModule) {
      parentModule = findParentModule(modules, currentModule.module_id);
    }

    // Build breadcrumbs - create full module hierarchy path
    const breadcrumbs: Array<{ title: string; url: string; moduleId?: string }> = [];
    
    if (currentModule) {
      // For standalone modules (no parent), show only the module itself
      if (!parentModule) {
        const moduleCode = currentModule.code || currentModule.name.toLowerCase().replace(/\s+/g, '-');
        breadcrumbs.push({
          title: currentModule.name,
          url: currentModule.url || `/partner/${moduleCode}`,
          moduleId: currentModule.module_id
        });
      } else {
        // For modules with parents, build full hierarchy
        const buildModuleHierarchy = (module: ModuleData): ModuleData[] => {
          // Robust ancestor path finder that supports additional nested levels
          const findPath = (list: ModuleData[], targetId: string, path: ModuleData[] = []): ModuleData[] => {
            for (const m of list) {
              const nextPath = [...path, m];
              if (m.module_id === targetId) return nextPath;
              if (m.child_module && m.child_module.length > 0) {
                const childPath = findPath(m.child_module, targetId, nextPath);
                if (childPath.length > 0) return childPath;
              }
            }
            return [];
          };
          const fullPath = findPath(modules, module.module_id);
          return fullPath.length > 0 ? fullPath : [module];
        };
        
        const moduleHierarchy = buildModuleHierarchy(currentModule);
        
        // Convert hierarchy to breadcrumbs
        moduleHierarchy.forEach(module => {
          const moduleCode = module.code || module.name.toLowerCase().replace(/\s+/g, '-');
          breadcrumbs.push({
            title: module.name,
            url: module.url || `/partner/${moduleCode}`,
            moduleId: module.module_id
          });
        });
      }
    }

    // Helpers: children resolver and navigation
    const findModuleById = (list: ModuleData[], id: string): ModuleData | null => {
      for (const m of list) {
        if (m.module_id === id) return m;
        if (m.child_module && m.child_module.length > 0) {
          const found = findModuleById(m.child_module, id);
          if (found) return found;
        }
      }
      return null;
    };

    const getModuleUrl = (m: ModuleData): string => {
      const moduleCode = m.code || m.name.toLowerCase().replace(/\s+/g, '-');
      return m.url || `/partner/${moduleCode}`;
    };

    const getChildren = (moduleId: string | null): ModuleData[] => {
      if (!moduleId) return [];
      const target = findModuleById(modules, moduleId);
      return target?.child_module || [];
    };

    const navigateToModule = (moduleOrId: ModuleData | string) => {
      const target = typeof moduleOrId === 'string' ? findModuleById(modules, moduleOrId) : moduleOrId;
      if (target) {
        const url = getModuleUrl(target);
        navigate(url);
      }
    };

    return {
      currentModule,
      parentModule,
      breadcrumbs,
      expandedModuleId,
      getChildren,
      setExpandedModuleId,
      navigateToModule,
    };
  }, [location.pathname, setupData?.module]);

  return (
    <ModuleContext.Provider value={moduleData}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModule must be used within a ModuleProvider');
  }
  return context;
}

export function useCurrentModule() {
  const { currentModule } = useModule();
  return currentModule;
}

export function useBreadcrumbs() {
  const { breadcrumbs } = useModule();
  return breadcrumbs;
}