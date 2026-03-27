"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useHeaderStore } from "../../store/header-store";
import { useNotificationsQuery } from "../../hooks/header-hooks";
import { cn } from "../../lib/utils";

/* ------------------------------------------------------------------ */
/*  NotificationDropdown – shared across all portals                   */
/* ------------------------------------------------------------------ */

export function NotificationDropdown() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const { notifications, unreadNotifications, unreadCount } = useHeaderStore();

  // Fetch notifications via TanStack Query
  useNotificationsQuery();

  // Auto-switch to "unread" tab if there are unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      setActiveTab("unread");
    }
  }, [unreadCount]);

  // Close dropdown when clicking outside
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

  const displayedNotifications =
    activeTab === "all" ? notifications : unreadNotifications;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDate(dateStr);
    } catch {
      return formatDate(dateStr);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="rounded-t-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
            <h6 className="text-sm font-semibold text-white">
              Notifications
            </h6>
            {unreadCount > 0 && (
              <p className="text-[10px] text-white/80 mt-0.5">
                {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors",
                activeTab === "all"
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={cn(
                "flex-1 py-2 text-xs font-medium transition-colors",
                activeTab === "unread"
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-[300px] overflow-y-auto">
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 cursor-pointer",
                    notification.viewed === -1 && "bg-primary/[0.03]"
                  )}
                >
                  {/* Unread indicator */}
                  <div className="flex shrink-0 items-start pt-0.5">
                    {notification.viewed === -1 ? (
                      <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {notification.medium?.[0] ?? "PUSH"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {getTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-6 w-6 text-slate-300" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500">
                  No notifications
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {activeTab === "unread"
                    ? "You're all caught up!"
                    : "You have no notifications yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
