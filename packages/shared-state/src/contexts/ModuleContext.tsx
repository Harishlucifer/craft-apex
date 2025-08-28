import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { ModuleData } from '@repo/types/setup';

interface ModuleContextType {
  currentModule: ModuleData | null;
  parentModule: ModuleData | null;
  breadcrumbs: Array<{ title: string; url: string; moduleId?: string }>;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { setupData } = useAuthStore();
  
  const moduleData = useMemo(() => {
    if (!setupData?.module || !location.pathname) {
      return {
        currentModule: null,
        parentModule: null,
        breadcrumbs: []
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
          // Find all ancestors of this module
          const findAncestors = (targetModule: ModuleData, moduleList: ModuleData[], ancestors: ModuleData[] = []): ModuleData[] => {
            // Find parent of target module
            for (const mod of moduleList) {
              if (mod.child_module && mod.child_module.length > 0) {
                const hasChild = mod.child_module.some(child => child.module_id === targetModule.module_id);
                if (hasChild) {
                  // Found parent, now find its ancestors
                  const parentAncestors = findAncestors(mod, modules, []);
                  return [...parentAncestors, mod, ...ancestors];
                }
                
                // Recursively check nested children
                const nestedResult = findAncestors(targetModule, mod.child_module, ancestors);
                if (nestedResult.length > 0) {
                  return [mod, ...nestedResult];
                }
              }
            }
            return ancestors;
          };
          
          const ancestors = findAncestors(module, modules);
          return [...ancestors, module];
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

    return {
      currentModule,
      parentModule,
      breadcrumbs
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