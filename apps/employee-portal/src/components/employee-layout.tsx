"use client";

import { useMemo, useEffect } from "react";
import { AppLayout, modulesToRailItems, getIconForName } from "@craft-apex/layout";
import type { LayoutConfig, MenuItem } from "@craft-apex/layout";
import { useSetupStore } from "@craft-apex/auth";
import { EmployeeHeader } from "./employee-header";
import "remixicon/fonts/remixicon.css";

/* ------------------------------------------------------------------ */
/*  Employee Portal – Dynamic Dual Sidebar Layout                      */
/* ------------------------------------------------------------------ */

export function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { module, tenant, user } = useSetupStore();

  const layoutConfig: LayoutConfig = useMemo(() => {
    const apiModules = (module as any[]) ?? [];
    const rawRailItems = modulesToRailItems(apiModules);

    // Attach Remix Icons from the API icon field
    const railItems: MenuItem[] = rawRailItems.map((item: any) => ({
      ...item,
      icon: getIconForName(
        apiModules.find((m: any) => m.code === item.id)?.icon,
        "text-lg"
      ),
    }));

    const year = new Date().getFullYear();
    const tenantName = (tenant?.TENANT_NAME as string) ?? "LendingStack";
    const companyName =
      (tenant?.COMPANY_NAME as string) ?? "Inforvio Technologies Pvt Ltd";

    return {
      variant: "dual-sidebar" as const,

      brand: {
        title: tenantName,
        subtitle: user?.username ?? "",
        icon: tenant?.TENANT_ICON ? (
          <img
            src={tenant.TENANT_ICON as string}
            alt="Logo"
            className="h-6 w-6 rounded object-contain"
          />
        ) : (
          <span className="text-sm font-bold text-primary">
            {tenantName[0]}
          </span>
        ),
      },

      railItems,
      menuGroups: [],

      header: <EmployeeHeader />,

      footer: (
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{year} © {tenantName}.</span>
          <span className="hidden sm:inline">
            Designed &amp; Developed by {companyName}
          </span>
        </div>
      ),
    };
  }, [module, tenant, user]);

  // Dynamically set favicon from TENANT_FAVICON
  useEffect(() => {
    const faviconUrl = tenant?.TENANT_FAVICON as string | undefined;
    if (!faviconUrl) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
    link.type = "image/x-icon";
  }, [tenant?.TENANT_FAVICON]);

  if (!module || (Array.isArray(module) && module.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-primary" />
          <span className="text-sm text-slate-400">Loading modules…</span>
        </div>
      </div>
    );
  }

  return <AppLayout config={layoutConfig}>{children}</AppLayout>;
}
