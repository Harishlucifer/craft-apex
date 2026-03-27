"use client";

import type { LayoutConfig } from "../types";
import { SidebarLayout } from "./sidebar-layout";
import { DualSidebarLayout } from "./dual-sidebar-layout";
import { TopNavLayout } from "./topnav-layout";

/* ------------------------------------------------------------------ */
/*  AppLayout – single entry point for all layout variants             */
/*                                                                     */
/*  Usage:                                                             */
/*    <AppLayout config={layoutConfig}>{children}</AppLayout>          */
/* ------------------------------------------------------------------ */

interface AppLayoutProps {
  config: LayoutConfig;
  children: React.ReactNode;
}

export function AppLayout({ config, children }: AppLayoutProps) {
  switch (config.variant) {
    case "sidebar":
      return <SidebarLayout config={config}>{children}</SidebarLayout>;

    case "dual-sidebar":
      return (
        <DualSidebarLayout config={config}>{children}</DualSidebarLayout>
      );

    case "topnav":
      return <TopNavLayout config={config}>{children}</TopNavLayout>;

    default:
      return <SidebarLayout config={config}>{children}</SidebarLayout>;
  }
}
