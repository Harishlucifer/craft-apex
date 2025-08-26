import * as React from "react"
import { useAuthStore } from '@repo/shared-state/stores';
import {
  transformModulesToNavigation,
  transformUserForSidebar,
  transformTenantForSidebar,
} from '@/utils/moduleTransformer';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
  
  // Transform tenant data for team switcher
  const sidebarTeam = React.useMemo(() => {
    return transformTenantForSidebar(setupData);
  }, [setupData]);
  
  // Use navigation items as-is without forcing dropdown structure
  const mainNavItems = navItems;
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[sidebarTeam]} />
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
