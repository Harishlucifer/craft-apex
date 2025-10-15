import React from 'react';
import { AppSidebar } from '../ModuleSidebar';
import { ModuleTopNav } from '../ModuleTopNav';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/ui/sidebar';
import { Separator } from '@repo/ui/components/ui/separator';
import { ModuleBreadcrumb } from '../ModuleBreadcrumb';
import { ModuleProvider } from '@repo/shared-state/contexts';
import { usePlatformConfig } from '@repo/shared-state/hooks';

interface ModuleLayoutProps {
  children: React.ReactNode;
  className?: string;
  layoutType?: 'SINGLE_COLUMN_LAYOUT' | 'TWO_COLUMN_LAYOUT';
  direction?: 'vertical' | 'horizontal';
}

export function ModuleLayout({ children, className = '', layoutType = 'SINGLE_COLUMN_LAYOUT', direction }: ModuleLayoutProps) {
  // Derive direction from platform configuration if not explicitly provided
  const platformConfig = usePlatformConfig('EMPLOYEE_PORTAL');
  const configDirection = (platformConfig as any)?.ui?.navigation?.direction
    || (platformConfig as any)?.navigation?.direction
    || (platformConfig as any)?.layout?.direction;
  const finalDirection: 'vertical' | 'horizontal' = direction ?? (configDirection === 'horizontal' ? 'horizontal' : 'vertical');

  return (
    <ModuleProvider>
      {finalDirection === 'horizontal' ? (
        // Horizontal navigation layout (single column for content)
        <div className="flex min-h-svh flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4 w-full">
              <ModuleTopNav />
            </div>
          </header>
          <div className={`flex flex-1 flex-col gap-4 p-4 ${className}`}>
            {children}
          </div>
        </div>
      ) : (
        // Vertical sidebar layout
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <ModuleBreadcrumb />
              </div>
            </header>
            <div className={`flex flex-1 flex-col gap-4 p-4 pt-0 ${className}`}>
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </ModuleProvider>
  );
}

// Simplified layout without ModuleProvider for pages that already have context
export function ModuleLayoutSimple({ children, className = '', layoutType = 'SINGLE_COLUMN_LAYOUT', direction }: ModuleLayoutProps) {
  const platformConfig = usePlatformConfig('EMPLOYEE_PORTAL');
  const configDirection = (platformConfig as any)?.ui?.navigation?.direction
    || (platformConfig as any)?.navigation?.direction
    || (platformConfig as any)?.layout?.direction;
  const finalDirection: 'vertical' | 'horizontal' = direction ?? (configDirection === 'horizontal' ? 'horizontal' : 'vertical');
  return (
    finalDirection === 'horizontal' ? (
      <div className="flex min-h-svh flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4 w-full">
            <ModuleTopNav />
          </div>
        </header>
        <div className={`flex flex-1 flex-col gap-4 p-4 ${className}`}>
          {children}
        </div>
      </div>
    ) : (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <ModuleBreadcrumb />
            </div>
          </header>
          <div className={`flex flex-1 flex-col gap-4 p-4 pt-0 ${className}`}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  );
}