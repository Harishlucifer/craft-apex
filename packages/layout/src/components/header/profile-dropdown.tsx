"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  User,
  Link2,
  KeyRound,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/*  ProfileDropdown – shared user profile menu                         */
/* ------------------------------------------------------------------ */

export interface ProfileMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  /** If true, only show for user_type === "EMPLOYEE" */
  employeeOnly?: boolean;
}

interface ProfileDropdownProps {
  /** User display name */
  username?: string;
  /** User email */
  email?: string;
  /** User type label (e.g. "EMPLOYEE") */
  userType?: string;
  /** Business name (shown for non-admin users) */
  businessName?: string;
  /** Whether the user is admin */
  isAdmin?: boolean;
  /** Custom menu items (overrides the defaults) */
  menuItems?: ProfileMenuItem[];
  /** Called when a menu item is clicked */
  onNavigate?: (href: string) => void;
  /** Called when logout is clicked */
  onLogout?: () => void;
}

const DEFAULT_MENU_ITEMS: ProfileMenuItem[] = [
  {
    icon: <User className="h-3.5 w-3.5" />,
    label: "Profile",
    href: "/profile",
  },
  {
    icon: <Link2 className="h-3.5 w-3.5" />,
    label: "Shareable Links",
    href: "/shareable-links",
  },
  {
    icon: <KeyRound className="h-3.5 w-3.5" />,
    label: "Change Password",
    href: "/change-password",
    employeeOnly: true,
  },
];

export function ProfileDropdown({
  username = "User",
  email,
  userType,
  businessName,
  isAdmin = false,
  menuItems,
  onNavigate,
  onLogout,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = menuItems ?? DEFAULT_MENU_ITEMS;
  const filteredItems = items.filter((item) => {
    if (item.employeeOnly && userType !== "EMPLOYEE") return false;
    return true;
  });

  const displayName = username;
  const initials = (displayName ?? "U")[0]!.toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100"
        id="profile-dropdown-btn"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
          <span className="text-xs font-bold">{initials}</span>
        </div>
        <div className="hidden flex-col text-left sm:flex">
          <span className="text-xs font-semibold text-slate-700 leading-tight">
            {displayName}
          </span>
          {(userType || (!isAdmin && businessName)) && (
            <span className="text-[10px] text-slate-400 leading-tight">
              {!isAdmin && businessName ? businessName : userType}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "hidden h-3 w-3 text-slate-400 transition-transform sm:block",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Welcome header */}
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="text-xs font-semibold text-slate-700">
              Welcome {displayName}!
            </p>
            {email && (
              <p className="text-[10px] text-slate-400 mt-0.5">{email}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            {filteredItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.(item.href);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                <span className="text-slate-400">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
