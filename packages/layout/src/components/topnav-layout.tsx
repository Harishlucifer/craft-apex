"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "../lib/utils";
import type { LayoutConfig, MenuItem } from "../types";

/* ------------------------------------------------------------------ */
/*  Type 3 – Top navigation bar with dropdowns                        */
/*  parent → child menus rendered as hover/click dropdowns             */
/* ------------------------------------------------------------------ */

interface TopNavLayoutProps {
  config: LayoutConfig;
  children: React.ReactNode;
}

export function TopNavLayout({ config, children }: TopNavLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ---- Top navbar ---- */}
      <header className="relative z-30 flex h-14 shrink-0 items-center border-b border-border bg-sidebar px-4">
        {/* Brand */}
        {config.brand && (
          <div className="mr-6 flex items-center gap-2">
            {config.brand.icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {config.brand.icon}
              </span>
            )}
            <span className="text-sm font-semibold text-sidebar-foreground">
              {config.brand.title}
            </span>
          </div>
        )}

        {/* Desktop menu */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {config.menuGroups.flatMap((group) =>
            group.items.map((item) => (
              <TopNavItem key={item.id} item={item} />
            ))
          )}
        </nav>

        {/* Right side (footer slot) */}
        {config.footer && (
          <div className="ml-auto hidden lg:flex">{config.footer}</div>
        )}

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* ---- Mobile dropdown ---- */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-14 z-20 max-h-[70vh] overflow-y-auto border-b border-border bg-sidebar shadow-lg lg:hidden">
          <nav className="p-3">
            {config.menuGroups.map((group, gi) => (
              <div key={gi} className="mb-3">
                {group.label && (
                  <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <MobileNavItem
                      key={item.id}
                      item={item}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* ---- Main content ---- */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop top-nav item with dropdown                                 */
/* ------------------------------------------------------------------ */

function TopNavItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasChildren = item.children && item.children.length > 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!hasChildren) {
    return item.href ? (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          item.isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
      >
        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
        {item.label}
      </Link>
    ) : (
      <span className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-sidebar-foreground">
        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
        {item.label}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          open && "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
      >
        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
        {item.label}
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[200px] rounded-md border border-border bg-popover p-1 shadow-lg">
          {item.children!.map((child) => (
            <DropdownItem
              key={child.id}
              item={child}
              onSelect={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropdown item (for desktop top-nav)                                */
/* ------------------------------------------------------------------ */

function DropdownItem({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: () => void;
}) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onSelect}
        className={cn(
          "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          item.isActive && "bg-accent text-accent-foreground"
        )}
      >
        {item.icon && (
          <span className="flex h-4 w-4 items-center justify-center">
            {item.icon}
          </span>
        )}
        {item.label}
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground">
      {item.icon && (
        <span className="flex h-4 w-4 items-center justify-center">
          {item.icon}
        </span>
      )}
      {item.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile nav item (collapsible)                                      */
/* ------------------------------------------------------------------ */

function MobileNavItem({
  item,
  onNavigate,
}: {
  item: MenuItem;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const baseClasses = cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    item.isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
  );

  if (!hasChildren && item.href) {
    return (
      <li>
        <Link href={item.href} className={baseClasses} onClick={onNavigate}>
          {item.icon && <span className="h-4 w-4">{item.icon}</span>}
          {item.label}
        </Link>
      </li>
    );
  }

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className={baseClasses}
        >
          {item.icon && <span className="h-4 w-4">{item.icon}</span>}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
            {item.children!.map((child) => (
              <MobileNavItem
                key={child.id}
                item={child}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <span className={baseClasses}>
        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
        {item.label}
      </span>
    </li>
  );
}
