/* ------------------------------------------------------------------ */
/*  Customer Portal – Route Configuration                              */
/*  Subset of routes relevant to the Customer Portal                   */
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

  // ─── Lead / Application ───────────────────────────────────────────
  { path: "/lead/create", title: "Apply Now", section: "application", requiresAuth: true },
  { path: "/lead/create/[id]", title: "Application Detail", section: "application", requiresAuth: true },
  { path: "/lead/list", title: "My Applications", section: "application", requiresAuth: true },
  { path: "/lead/list/tracking-q", title: "Track Application", section: "application", requiresAuth: true },
  { path: "/lead/list/disbursed-q", title: "Disbursed", section: "application", requiresAuth: true },
  { path: "/lead/lender-view", title: "Lender Details", section: "application", requiresAuth: true },

  // ─── Loan Management ─────────────────────────────────────────────
  { path: "/loan-management/view", title: "My Loans", section: "loans", requiresAuth: true },
  { path: "/loan-management/repayment/[id]", title: "Repayment", section: "loans", requiresAuth: true },
  { path: "/loan-management/repayment-new/[id]", title: "Repayment Details", section: "loans", requiresAuth: true },
  { path: "/loan-management/loan-account-statement", title: "Account Statement", section: "loans", requiresAuth: true },
  { path: "/add-service-request", title: "Service Request", section: "loans", requiresAuth: true },
  { path: "/add-service-request/[id]", title: "Service Request Detail", section: "loans", requiresAuth: true },
  { path: "/service-request/queue", title: "Service Requests", section: "loans", requiresAuth: true },

  // ─── Collections ──────────────────────────────────────────────────
  { path: "/collection/follow-up", title: "Payment Follow-up", section: "collection", requiresAuth: true },
  { path: "/collection/follow-up/[id]", title: "Payment Detail", section: "collection", requiresAuth: true },

  // ─── Enquiry ──────────────────────────────────────────────────────
  { path: "/enquiry/customer/list", title: "My Enquiries", section: "enquiry", requiresAuth: true },
  { path: "/enquiry/customer/lead", title: "New Enquiry", section: "enquiry", requiresAuth: true },
  { path: "/enquiry/customer/lead/[id]", title: "Enquiry Detail", section: "enquiry", requiresAuth: true },

  // ─── Profile ──────────────────────────────────────────────────────
  { path: "/profile", title: "My Profile", section: "profile", requiresAuth: true },
  { path: "/change-password", title: "Change Password", section: "profile", requiresAuth: true },
  { path: "/customer360-relationship", title: "Customer 360", section: "profile", requiresAuth: true },
  { path: "/customer360-relationship/[id]", title: "Customer 360 Detail", section: "profile", requiresAuth: true },

  // ─── Verification ─────────────────────────────────────────────────
  { path: "/verification/enach-setup", title: "eNACH Setup", section: "verification", requiresAuth: true },
];

/** All routes for the Customer Portal */
export const allRoutes = [...publicRoutes, ...protectedRoutes];
