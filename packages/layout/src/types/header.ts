/* ------------------------------------------------------------------ */
/*  Types for Header-related APIs                                      */
/* ------------------------------------------------------------------ */

/** Notification item from GET /alpha/v1/user/notifications */
export interface Notification {
  id: string;
  template_id: string;
  mobile: string;
  fcm_token: string;
  email: string;
  medium: string[];
  content: string;
  /** -1 = unread, 1 = viewed */
  viewed: number;
  created_at: string;
  updated_at: string;
}

/** Response from GET /alpha/v1/user/notifications */
export interface NotificationResponse {
  result: Notification[];
  status: number;
}

/** Lookup item from GET /alpha/v1/lookup?group_code=SEARCH_TYPE */
export interface SearchType {
  id: number;
  lu_key: string;
  lu_name: string;
  lu_value: string;
  group_code: string;
  created_by: string;
  configuration: unknown | null;
  status: number;
  created_at: string;
  updated_at: string;
}

/** Response from GET /alpha/v1/lookup?group_code=SEARCH_TYPE */
export interface SearchTypeLookupResponse {
  data: SearchType[];
}
