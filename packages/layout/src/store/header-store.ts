import { create } from "zustand";
import type { Notification, SearchType } from "../types/header";

/* ------------------------------------------------------------------ */
/*  Zustand store – shared header state (notifications + search)       */
/* ------------------------------------------------------------------ */

interface HeaderStoreState {
  /* ---- notifications ---- */
  notifications: Notification[];
  unreadNotifications: Notification[];
  unreadCount: number;
  isNotificationOpen: boolean;

  /* ---- search ---- */
  searchTypes: SearchType[];
  selectedSearchType: SearchType | null;
  searchQuery: string;

  /* ---- actions: notifications ---- */
  setNotifications: (notifications: Notification[]) => void;
  setNotificationOpen: (open: boolean) => void;
  markAllAsRead: () => void;

  /* ---- actions: search ---- */
  setSearchTypes: (types: SearchType[]) => void;
  setSelectedSearchType: (type: SearchType | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useHeaderStore = create<HeaderStoreState>((set, get) => ({
  /* ---- initial state ---- */
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  isNotificationOpen: false,

  searchTypes: [],
  selectedSearchType: null,
  searchQuery: "",

  /* ---- notifications ---- */
  setNotifications: (notifications) => {
    const unread = notifications.filter((n) => n.viewed === -1);
    set({
      notifications,
      unreadNotifications: unread,
      unreadCount: unread.length,
    });
  },

  setNotificationOpen: (open) => set({ isNotificationOpen: open }),

  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map((n) => ({ ...n, viewed: 1 }));
    set({
      notifications: updated,
      unreadNotifications: [],
      unreadCount: 0,
    });
  },

  /* ---- search ---- */
  setSearchTypes: (types) => set({ searchTypes: types }),

  setSelectedSearchType: (type) => set({ selectedSearchType: type }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
