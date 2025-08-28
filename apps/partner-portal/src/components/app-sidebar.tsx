import * as React from "react"
import { useAuthStore } from '@repo/shared-state/stores';
import {
  transformModulesToNavigation,
  transformUserForSidebar,
} from '@/utils/moduleTransformer';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setupData, user } = useAuthStore();
  
  // Transform module data for navigation
  const navItems = React.useMemo(() => {
    return transformModulesToNavigation(setupData?.module || null);
  }, [setupData?.module]);
  
  // Transform user data for sidebar
  const sidebarUser = React.useMemo(() => {
    return transformUserForSidebar(user);
  }, [user]);
  
  // Get tenant branding data
  const tenantLogo = setupData?.tenant?.TENANT_LOGO;
  const tenantName = setupData?.tenant?.TENANT_NAME;
  
  // Use navigation items as-is without forcing dropdown structure
  const mainNavItems = navItems;
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center">
          {tenantLogo && (
            <img 
              src={tenantLogo} 
              alt={tenantName || 'Tenant Logo'} 
              className="w-full h-14 rounded-sm object-contain"
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {mainNavItems.length > 0 && <NavMain items={mainNavItems} />}

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
