"use client";

import { useState } from "react";
import { PanelLeft, X } from "lucide-react";
import { cn } from "../lib/utils";
import { SidebarMenuItem } from "./sidebar-menu-item";
import type { LayoutConfig } from "../types";

/* ------------------------------------------------------------------ */
/*  Type 1 – Single collapsible sidebar                                */
/*  Like shadcn sidebar-07: brand + grouped parent→child menus         */
/* ------------------------------------------------------------------ */

interface SidebarLayoutProps {
  config: LayoutConfig;
  children: React.ReactNode;
}

export function SidebarLayout({ config, children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ---- Mobile overlay ---- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative lg:z-0",
          collapsed ? "w-[52px]" : "w-[260px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ---- Brand ---- */}
        {config.brand && (
          <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
            {config.brand.icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {config.brand.icon}
              </span>
            )}
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  {config.brand.title}
                </span>
                {config.brand.subtitle && (
                  <span className="truncate text-xs text-muted-foreground">
                    {config.brand.subtitle}
                  </span>
                )}
              </div>
            )}

            {/* Collapse toggle (desktop) */}
            <button
              type="button"
              onClick={() => setCollapsed((p) => !p)}
              className="ml-auto hidden rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {/* Close (mobile) */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ---- Menu groups ---- */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {config.menuGroups.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.label && !collapsed && (
                <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ---- Footer ---- */}
        {config.footer && !collapsed && (
          <div className="border-t border-sidebar-border p-3">
            {config.footer}
          </div>
        )}
      </aside>

      {/* ---- Main content ---- */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header bar */}
        <header className="flex h-14 items-center gap-2 border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          {config.brand && (
            <span className="text-sm font-semibold">
              {config.brand.title}
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
