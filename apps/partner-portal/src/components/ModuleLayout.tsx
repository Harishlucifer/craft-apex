import React from 'react';
import { AppSidebar } from '@/components/ModuleSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/ui/sidebar';
import { Separator } from '@repo/ui/components/ui/separator';
import { ModuleBreadcrumb } from '@/components/ModuleBreadcrumb';
import { ModuleProvider } from '@/contexts/ModuleContext';

interface ModuleLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ModuleLayout({ children, className = '' }: ModuleLayoutProps) {
  return (
    <ModuleProvider>
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
    </ModuleProvider>
  );
}

// Simplified layout without ModuleProvider for pages that already have context
export function ModuleLayoutSimple({ children, className = '' }: ModuleLayoutProps) {
  return (
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
  );
}