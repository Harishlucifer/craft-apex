/* ------------------------------------------------------------------ */
/*  Partner Portal – Route Configuration                               */
/*  Subset of routes relevant to the Partner Portal                    */
/* ------------------------------------------------------------------ */

import type { AppRoute } from "@craft-apex/auth";

/* ------------------------------------------------------------------ */
/*  Public Routes (no auth required)                                   */
/* ------------------------------------------------------------------ */
export const publicRoutes: AppRoute[] = [
  { path: "/login", title: "Login", section: "auth", requiresAuth: false },
  { path: "/logout", title: "Logout", section: "auth", requiresAuth: false },
  { path: "/forgot-password", title: "Forgot Password", section: "auth", requiresAuth: false },
  { path: "/reset-password/[id]", title: "Reset Password", section: "auth", requiresAuth: false },
  { path: "/default/route", title: "Default Route", section: "auth", requiresAuth: false },
];

/* ------------------------------------------------------------------ */
/*  Auth-Protected Routes                                              */
/* ------------------------------------------------------------------ */
export const protectedRoutes: AppRoute[] = [
  // ─── Dashboard ────────────────────────────────────────────────────
  { path: "/dashboard", title: "Dashboard", section: "dashboard", requiresAuth: true },
  { path: "/summary", title: "Summary", section: "dashboard", requiresAuth: true },

  // ─── Lead Management ─────────────────────────────────────────────
  { path: "/lead/list", title: "Lead List", section: "leads", requiresAuth: true },
  { path: "/lead/create", title: "Create Lead", section: "leads", requiresAuth: true },
  { path: "/lead/create/[id]", title: "Edit Lead", section: "leads", requiresAuth: true },
  { path: "/lead/dedupe-q", title: "Dedupe Queue", section: "leads", requiresAuth: true },
  { path: "/lead/list/login-q", title: "Login Queue", section: "leads", requiresAuth: true },
  { path: "/lead/list/tracking-q", title: "Tracking Queue", section: "leads", requiresAuth: true },
  { path: "/lead/list/disbursed-q", title: "Disbursed Queue", section: "leads", requiresAuth: true },
  { path: "/lead/list/rejected-q", title: "Rejected Queue", section: "leads", requiresAuth: true },
  { path: "/lead/list/approval-q", title: "Approval Queue", section: "leads", requiresAuth: true },
  { path: "/lead/list/fulfilled", title: "Fulfilled Leads", section: "leads", requiresAuth: true },
  { path: "/lead/list/archived", title: "Archived Leads", section: "leads", requiresAuth: true },
  { path: "/lead/lender-view", title: "Lender View", section: "leads", requiresAuth: true },
  { path: "/lead/bulk-upload", title: "Lead Bulk Upload", section: "leads", requiresAuth: true },
  { path: "/fulfillment/list", title: "Fulfillment List", section: "leads", requiresAuth: true },
  { path: "/check-bureau/lead/list", title: "Check Bureau", section: "leads", requiresAuth: true },

  // ─── Enquiry Management ───────────────────────────────────────────
  { path: "/enquiry/lead/list", title: "Enquiry Lead List", section: "enquiry", requiresAuth: true },
  { path: "/enquiry/customer/list", title: "Customer Enquiry", section: "enquiry", requiresAuth: true },
  { path: "/enquiry/customer/lead", title: "Customer Lead", section: "enquiry", requiresAuth: true },
  { path: "/enquiry/customer/lead/[id]", title: "Customer Lead Detail", section: "enquiry", requiresAuth: true },
  { path: "/enquiry/bulk-upload", title: "Enquiry Bulk Upload", section: "enquiry", requiresAuth: true },

  // ─── Partner Management ───────────────────────────────────────────
  { path: "/partner/onboarding", title: "Partner Onboarding", section: "partner", requiresAuth: true },
  { path: "/partner/onboarding/[id]", title: "Partner Detail", section: "partner", requiresAuth: true },
  { path: "/partner/onboarding/child-partner", title: "Child Partners", section: "partner", requiresAuth: true },
  { path: "/partner/onboarding/child-partner/approval", title: "Child Partner Approval", section: "partner", requiresAuth: true },
  { path: "/partner/renewal/[id]", title: "Partner Renewal", section: "partner", requiresAuth: true },
  { path: "/partner/renewal/list/[Status]", title: "Renewals List", section: "partner", requiresAuth: true },
  { path: "/partner/user/list", title: "Partner Users", section: "partner", requiresAuth: true },
  { path: "/partner-view", title: "Partner View", section: "partner", requiresAuth: true },

  // ─── Collections ──────────────────────────────────────────────────
  { path: "/collection/follow-up", title: "Collection Follow-up", section: "collection", requiresAuth: true },
  { path: "/collection/follow-up/[id]", title: "Follow-up Detail", section: "collection", requiresAuth: true },
  { path: "/collection/summary", title: "Collection Summary", section: "collection", requiresAuth: true },

  // ─── Finance ──────────────────────────────────────────────────────
  { path: "/finance/incentive-statement", title: "Incentive Statement", section: "finance", requiresAuth: true },
  { path: "/finance/sales-incentive/earnings", title: "Sales Earnings", section: "finance", requiresAuth: true },
  { path: "/finance/sales-payable/earnings", title: "Payable Earnings", section: "finance", requiresAuth: true },

  // ─── Sales ────────────────────────────────────────────────────────
  { path: "/sales/shareable-link", title: "Shareable Links", section: "sales", requiresAuth: true },
  { path: "/sales/payout-document", title: "Payout Document", section: "sales", requiresAuth: true },
  { path: "/sales/invoice-view", title: "Invoice View", section: "sales", requiresAuth: true },
  { path: "/sales/incentive-statement", title: "Incentive Statement", section: "sales", requiresAuth: true },
  { path: "/sales/tele-audience-q", title: "Tele Audience", section: "sales", requiresAuth: true },
  { path: "/sales/tele-audience/create", title: "Create Audience", section: "sales", requiresAuth: true },
  { path: "/sales/tele-audience/create/[id]", title: "Edit Audience", section: "sales", requiresAuth: true },

  // ─── Reports ──────────────────────────────────────────────────────
  { path: "/reports/leads", title: "Lead Reports", section: "reports", requiresAuth: true },
  { path: "/reports/bank-analyser", title: "Bank Analyser", section: "reports", requiresAuth: true },
  { path: "/reports/bureau-analyser", title: "Bureau Analyser", section: "reports", requiresAuth: true },
  { path: "/reports/mis/process-status", title: "Process Status", section: "reports", requiresAuth: true },
  { path: "/reports/mis/bank-performance", title: "Bank Performance", section: "reports", requiresAuth: true },
  { path: "/reports/mis/source-productivity", title: "Source Productivity", section: "reports", requiresAuth: true },

  // ─── Activity ─────────────────────────────────────────────────────
  { path: "/activity/live-tracking", title: "Live Tracking", section: "activity", requiresAuth: true },
  { path: "/activity/daily-activity", title: "Daily Activity", section: "activity", requiresAuth: true },
  { path: "/activity/lead-disposition", title: "Lead Disposition", section: "activity", requiresAuth: true },

  // ─── Market Place ─────────────────────────────────────────────────
  { path: "/market-place/manual/list", title: "Manual List", section: "marketplace", requiresAuth: true },
  { path: "/market-place/stp/list", title: "STP List", section: "marketplace", requiresAuth: true },

  // ─── Profile ──────────────────────────────────────────────────────
  { path: "/profile", title: "My Profile", section: "profile", requiresAuth: true },
  { path: "/change-password", title: "Change Password", section: "profile", requiresAuth: true },
  { path: "/shareable-links", title: "Shareable Links", section: "profile", requiresAuth: true },
  { path: "/customer360-relationship", title: "Customer 360", section: "profile", requiresAuth: true },
  { path: "/customer360-relationship/[id]", title: "Customer 360 Detail", section: "profile", requiresAuth: true },

  // ─── Verification ─────────────────────────────────────────────────
  { path: "/verification/enach-setup", title: "eNACH Setup", section: "verification", requiresAuth: true },
];

/** All routes for the Partner Portal */
export const allRoutes = [...publicRoutes, ...protectedRoutes];
