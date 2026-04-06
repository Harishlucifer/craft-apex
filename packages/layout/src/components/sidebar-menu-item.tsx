import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import type { MenuItem } from "../types";

/* ------------------------------------------------------------------ */
/*  SidebarMenuItem – recursive collapsible menu item                  */
/* ------------------------------------------------------------------ */

interface SidebarMenuItemProps {
  item: MenuItem;
  depth?: number;
  collapsed?: boolean;
}

export function SidebarMenuItem({
  item,
  depth = 0,
  collapsed = false,
}: SidebarMenuItemProps) {
  const { pathname } = useLocation();
  const isCurrentPath = item.href ? pathname === item.href : false;
  const [open, setOpen] = useState(item.isActive ?? isCurrentPath ?? false);
  const hasChildren = item.children && item.children.length > 0;

  const content = (
    <>
      {item.icon && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-inherit">
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-[13px]">{item.label}</span>
          {hasChildren && (
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                open && "rotate-90"
              )}
            />
          )}
        </>
      )}
    </>
  );

  const activeStyle = isCurrentPath
    ? { backgroundColor: "rgba(45, 84, 131, 0.10)", color: "#2d5483" }
    : undefined;

  const baseClasses = cn(
    "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-medium transition-all text-left no-underline",
    "hover:bg-slate-100 hover:text-slate-800 hover:no-underline",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2d5483]/30",
    isCurrentPath
      ? "font-semibold"
      : "text-slate-600",
    depth > 0 && "ml-3 border-l border-slate-200 pl-3 text-[12px]",
    depth > 1 && "ml-6 text-[12px]"
  );

  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={baseClasses}
          style={activeStyle}
          title={collapsed ? item.label : undefined}
        >
          {content}
        </button>
      ) : item.href ? (
        <Link
          to={item.href}
          className={baseClasses}
          style={activeStyle}
          title={collapsed ? item.label : undefined}
        >
          {content}
        </Link>
      ) : (
        <span className={baseClasses} style={activeStyle}>{content}</span>
      )}

      {/* Children */}
      {hasChildren && !collapsed && (
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <ul className="mt-0.5 space-y-0.5 overflow-hidden">
            {item.children!.map((child) => (
              <SidebarMenuItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
