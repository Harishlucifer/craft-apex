import * as React from "react"
import { useAuthStore } from '@repo/shared-state/stores';
import {
  transformModulesToNavigation,
  transformUserForSidebar,
} from '@repo/ui/utils/moduleTransformer';

import { NavMain } from "@repo/ui/components/ui/nav-main"
import { NavUser } from "@repo/ui/components/ui/nav-user"
import { NavLogo } from "@repo/ui/components/ui/nav-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/ui/sidebar"



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
  const tenantIcon = setupData?.tenant?.TENANT_ICON;
  const tenantLogo = setupData?.tenant?.TENANT_LOGO;
  const tenantName = setupData?.tenant?.TENANT_NAME;
  
  // Use navigation items as-is without forcing dropdown structure
  const mainNavItems = navItems;
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo 
          tenantLogo={tenantLogo}
          tenantIcon={tenantIcon}
          tenantName={tenantName}
        />
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