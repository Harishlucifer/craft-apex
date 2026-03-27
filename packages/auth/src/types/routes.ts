/* ------------------------------------------------------------------ */
/*  Route types for the application                                    */
/* ------------------------------------------------------------------ */

export interface AppRoute {
  /** URL path (Next.js compatible, no dynamic :id — use [id] instead) */
  path: string;
  /** Human-readable title for the page */
  title: string;
  /** Module/section this route belongs to */
  section: string;
  /** Whether this route requires authentication */
  requiresAuth: boolean;
  /** Whether to render without the app header/layout */
  withoutHeader?: boolean;
}

export interface RouteSection {
  /** Section name (e.g., "Dashboard", "Settings", "Finance") */
  name: string;
  /** Routes in this section */
  routes: AppRoute[];
}
