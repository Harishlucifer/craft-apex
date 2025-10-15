import { ModuleData } from '@repo/types/setup';
import { LucideIcon } from 'lucide-react';
import { Building } from 'lucide-react';
import { convertIconToLucideName } from '@repo/ui/utils/iconConverter';
import { DynamicIcon } from 'lucide-react/dynamic';
import React from 'react';

// Transform ModuleData to sidebar navigation format
export interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SidebarNavItem[];
  moduleId?: string;
  permissions?: Record<string, any> | null;
}

// Interface for projects (simple navigation items)
export interface SidebarProject {
  name: string;
  url: string;
  icon: LucideIcon;
}

// Check if user has permission to access a module
function hasModuleAccess(module: ModuleData): boolean {
  // If no permissions are set, assume access is allowed
  if (!module.allowed_permission) {
    return true;
  }

  // Check if the module has view permission
  const permissions = module.allowed_permission;
  
  // If permissions is an object with view property
  if (typeof permissions === 'object' && permissions !== null) {
    // Check for view permission specifically
    if ('view' in permissions) {
      return Boolean(permissions.view);
    }
    
    // Check for any truthy permission as fallback
    return Object.values(permissions).some(permission => Boolean(permission));
  }
  
  // If permissions is a boolean or truthy value
  return Boolean(permissions);
}

// Check specific permission for a module
export function hasModulePermission(
  module: ModuleData | null, 
  permission: 'view' | 'add' | 'edit' | 'export'
): boolean {
  if (!module || !module.allowed_permission) {
    return false;
  }

  const permissions = module.allowed_permission;
  
  if (typeof permissions === 'object' && permissions !== null) {
    return Boolean(permissions[permission]);
  }
  
  // If permissions is a boolean, only allow view permission
  return permission === 'view' && Boolean(permissions);
}

// Get all available permissions for a module
export function getModulePermissions(module: ModuleData | null): Record<string, boolean> {
  if (!module || !module.allowed_permission) {
    return { view: false, add: false, edit: false, export: false };
  }

  const permissions = module.allowed_permission;
  
  if (typeof permissions === 'object' && permissions !== null) {
    return {
      view: Boolean(permissions.view),
      add: Boolean(permissions.add),
      edit: Boolean(permissions.edit),
      export: Boolean(permissions.export),
    };
  }
  
  // If permissions is a boolean, only grant view permission
  const hasAccess = Boolean(permissions);
  return {
    view: hasAccess,
    add: false,
    edit: false,
    export: false,
  };
}

export function transformModulesToNavigation(modules: ModuleData[] | null): SidebarNavItem[] {
  if (!modules || modules.length === 0) {
    return [];
  }

  // Filter modules with more permissive logic
  const accessibleModules = modules.filter(module => {
    // Must have a name
    if (!module.name) return false;
    
    // Skip hidden modules
    if (module.display_mode === 'HIDDEN') return false;
    
    return hasModuleAccess(module);
  });

  // Group modules by parent reference (can be name or ID depending on API)
  const childrenByParentId = new Map<string, ModuleData[]>();
  const childrenByParentName = new Map<string, ModuleData[]>();
  const rootModules: ModuleData[] = [];

  accessibleModules.forEach(module => {
    if (!module.parent_module || module.parent_module === '0' || module.parent_module === '') {
      rootModules.push(module);
    } else {
      // parent_module may carry a name or an id; store in both maps
      const parentKey = String(module.parent_module);
      if (!childrenByParentName.has(parentKey)) childrenByParentName.set(parentKey, []);
      childrenByParentName.get(parentKey)!.push(module);

      // Also store by explicit parent id if available
      if (module.parent_module && typeof module.parent_module === 'string') {
        // nothing more we can infer
      }
    }
  });

  // Transform modules to navigation items
  function transformModule(module: ModuleData): SidebarNavItem {
    // Use the module's URL if it exists, otherwise fall back to module code pattern
    const moduleCode = module.code || module.name.toLowerCase().replace(/\s+/g, '-');
    const basePath = module.system === 'PARTNER_PORTAL' ? '/partner' : '';
    const moduleUrl = module.url || `${basePath}/${moduleCode}`;
    
    const iconName = convertIconToLucideName(module.icon || 'default');
    const IconComponent = React.forwardRef<SVGSVGElement, any>((props, ref) => 
      React.createElement(DynamicIcon, { name: iconName as any, ref, ...props })
    ) as LucideIcon;
    
    const navItem: SidebarNavItem = {
      title: module.name,
      url: moduleUrl,
      icon: IconComponent,
      moduleId: module.module_id,
      permissions: module.allowed_permission,
    };

    // Add child modules if they exist
    // Prefer direct child_module array, but also merge any external references by name/id
    let childModules: ModuleData[] = [];
    if (module.child_module && module.child_module.length > 0) {
      childModules = module.child_module;
    }

    // Merge children looked up by name (API often sets parent_module to parent's name)
    const byName = childrenByParentName.get(module.name) || [];
    // Merge children by id if present
    const byId = childrenByParentId.get(String(module.module_id)) || [];
    childModules = [...childModules, ...byName, ...byId];

    // Deduplicate by module_id
    const seen = new Set<string>();
    childModules = childModules.filter((m) => {
      const id = String(m.module_id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    
    if (childModules.length > 0) {
      navItem.items = childModules.map(transformModule);
    }

    return navItem;
  }

  return rootModules.map(transformModule);
}

// Transform user data for sidebar
export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
}

export function transformUserForSidebar(user: any): SidebarUser {
  return {
    name: user?.business_name || user?.username || 'User',
    email: user?.email || '',
    avatar: user?.avatar || '/avatars/default.jpg',
  };
}

// Transform modules to projects format
export function transformModulesToProjects(modules: ModuleData[] | null): SidebarProject[] {
  if (!modules || modules.length === 0) {
    return [];
  }

  const accessibleModules = modules.filter(module => 
    module.display_mode !== 'HIDDEN' && 
    module.url && 
    module.name &&
    hasModuleAccess(module) &&
    (!module.parent_module || module.parent_module === '0' || module.parent_module === '') &&
    (!module.child_module || module.child_module.length === 0)
  );

  return accessibleModules.map(module => {
    const moduleCode = module.code || module.name.toLowerCase().replace(/\s+/g, '-');
    const iconName = convertIconToLucideName(module.icon || 'default');
    const IconComponent = React.forwardRef<SVGSVGElement, any>((props, ref) => 
      React.createElement(DynamicIcon, { name: iconName as any, ref, ...props })
    ) as LucideIcon;
    
    return {
      name: module.name,
      url: `/partner/${moduleCode}`,
      icon: IconComponent,
    };
  });
}

// Transform tenant/system data for team switcher
export interface SidebarTeam {
  name: string;
  logo: LucideIcon;
  plan: string;
}

export function transformTenantForSidebar(setupData: any): SidebarTeam {
  return {
    name: setupData?.tenant?.TENANT_NAME || 'Organization',
    logo: Building,
    plan: setupData?.tenant?.TENANT_TYPE || 'Standard',
  };
}