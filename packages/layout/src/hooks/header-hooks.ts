import { useQuery } from "@tanstack/react-query";
import { useHeaderStore } from "../store/header-store";
import type {
  NotificationResponse,
  SearchTypeLookupResponse,
} from "../types/header";

/* ------------------------------------------------------------------ */
/*  Helper – get the shared axios instance from @craft-apex/auth       */
/*  We import dynamically to avoid a hard dependency from layout → auth */
/* ------------------------------------------------------------------ */

let _axiosInstance: any = null;

/**
 * Call this once from the app's provider layer to inject the shared
 * axios instance so the header hooks can make authenticated requests.
 */
export function setHeaderAxios(instance: any) {
  _axiosInstance = instance;
}

function getAxios() {
  if (!_axiosInstance) {
    throw new Error(
      "[header-hooks] axios instance not set. Call setHeaderAxios() in your provider."
    );
  }
  return _axiosInstance;
}

/* ------------------------------------------------------------------ */
/*  GET /alpha/v1/user/notifications                                   */
/* ------------------------------------------------------------------ */

export const NOTIFICATIONS_QUERY_KEY = ["user-notifications"] as const;

async function fetchNotifications(): Promise<NotificationResponse> {
  const axios = getAxios();
  const res = await axios.get("/alpha/v1/user/notifications");
  return res.data as NotificationResponse;
}

/**
 * Fetches notifications and syncs with the Zustand header store.
 * Only enabled when a valid auth token exists.
 */
export function useNotificationsQuery() {
  const { setNotifications } = useHeaderStore();

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetchNotifications();
      setNotifications(response.result ?? []);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // poll every 60s
    refetchOnWindowFocus: true,
    retry: 1,
    enabled:
      typeof window !== "undefined" &&
      !!(
        localStorage.getItem("accessToken") ||
        localStorage.getItem("guestToken")
      ),
  });
}

/* ------------------------------------------------------------------ */
/*  GET /alpha/v1/lookup?group_code=SEARCH_TYPE                        */
/* ------------------------------------------------------------------ */

export const SEARCH_TYPES_QUERY_KEY = ["search-types"] as const;

async function fetchSearchTypes(): Promise<SearchTypeLookupResponse> {
  const axios = getAxios();
  const res = await axios.get("/alpha/v1/lookup", {
    params: { group_code: "SEARCH_TYPE" },
  });
  return res.data as SearchTypeLookupResponse;
}

/**
 * Fetches available search types and syncs with the Zustand header store.
 */
export function useSearchTypesQuery() {
  const { setSearchTypes, setSelectedSearchType, selectedSearchType } =
    useHeaderStore();

  return useQuery({
    queryKey: [...SEARCH_TYPES_QUERY_KEY],
    queryFn: async () => {
      const response = await fetchSearchTypes();
      const types = response.data ?? [];
      setSearchTypes(types);
      // Auto-select the first type if none is selected
      if (!selectedSearchType && types.length > 0) {
        setSelectedSearchType(types[0]!);
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes – search types don't change often
    retry: 1,
    enabled:
      typeof window !== "undefined" &&
      !!(
        localStorage.getItem("accessToken") ||
        localStorage.getItem("guestToken")
      ),
  });
}
