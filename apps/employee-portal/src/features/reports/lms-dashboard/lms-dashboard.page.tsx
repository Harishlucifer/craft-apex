import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Book,
  Wallet,
  AlertCircle,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Mail,
  FileBarChart,
  Download,
  Bell,
  Smartphone,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
} from "@craft-apex/ui";
import {
  LEGACY_LMS_CATEGORIES,
  LEGACY_LMS_STATS,
} from "./lms-dashboard.api";
import type {
  LmsCategory,
  LmsReportLink,
  LmsStat,
} from "./lms-dashboard.types";

// Legacy: craft-frontend/src/pages/Reports/LMS/LmsDashboard.js
//
// LEGACY IS MOCK-ONLY. The legacy file is a static landing page — KPI
// stats, six report category cards, and the Quick Actions row are all
// hard-coded in-component arrays. No useEffect, no API calls, nothing in
// ApiEndPoint.js backs this page.
//
// This page mirrors the legacy layout verbatim against that mock data so
// the route renders identically. Once a backend exists, replace the
// imports from lms-dashboard.api with React Query hooks.

// DEFERRED:
//   - Quick Action buttons (Schedule Report, Create Custom Report, Export
//     All, Configure Alerts, Email Subscriptions) — legacy has no onClick
//     handlers.
//   - Most "report link" entries point nowhere (no `link` field). Only
//     four of the 35 reports have URLs in legacy.

const ICON_MAP: Record<LmsCategory["icon"], React.ReactNode> = {
  book: <Book className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
  alert: <AlertCircle className="h-5 w-5" />,
  trending: <TrendingUp className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  shield: <ShieldCheck className="h-5 w-5" />,
};

const STAT_TONE: Record<LmsStat["color"], string> = {
  primary: "border-l-indigo-500",
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  danger: "border-l-rose-500",
};

const STAT_TEXT: Record<LmsStat["color"], string> = {
  primary: "text-emerald-600",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
};

const BADGE_TONE: Record<NonNullable<LmsReportLink["badgeColor"]>, string> = {
  info: "bg-sky-100 text-sky-700",
  danger: "bg-rose-100 text-rose-700",
};

export default function LmsDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            LMS Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Reports &amp; analytics hub — portfolio, collections, NPA, income,
            accounting and regulatory.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Legacy is mock-only — this is a static landing page with no
            backend. Only four of the 35 report tiles have real
            destinations; the rest are placeholders preserved verbatim from
            legacy until per-report endpoints ship.
          </p>
        </CardContent>
      </Card>

      {/* Hero banner — legacy: "Reports & Analytics Dashboard" */}
      <Card className="border-0 bg-indigo-600 text-white shadow-sm">
        <CardContent className="p-6">
          <h2 className="mb-2 text-xl font-bold">
            Reports &amp; Analytics Dashboard
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm opacity-80">
            <span>Fingrid.ai Lending Platform</span>
            <span>As of: February 02, 2026 | Last Updated: 09:30 AM</span>
          </div>
        </CardContent>
      </Card>

      {/* KPI stats */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {LEGACY_LMS_STATS.map((s) => (
          <Card
            key={s.label}
            className={`border-l-4 shadow-sm ${STAT_TONE[s.color]}`}
          >
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {s.value}
              </p>
              <p className={`mt-1 text-xs ${STAT_TEXT[s.color]}`}>
                {s.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LEGACY_LMS_CATEGORIES.map((cat) => (
          <Card key={cat.title} className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 border-b p-4">
                <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
                  {ICON_MAP[cat.icon] ?? null}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500">{cat.subtitle}</p>
                </div>
              </div>
              <ul className="divide-y">
                {cat.reports.map((r) => (
                  <li
                    key={r.name}
                    className="flex items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    {r.link ? (
                      <Link
                        to={r.link}
                        className="flex-1 text-slate-700 hover:text-indigo-600"
                      >
                        {r.name}
                      </Link>
                    ) : (
                      <span
                        className="flex-1 text-slate-500"
                        title="Deferred — no legacy route"
                      >
                        {r.name}
                      </span>
                    )}
                    <Badge
                      className={
                        r.badgeColor
                          ? BADGE_TONE[r.badgeColor]
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {r.badge}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions — DEFERRED: legacy buttons have no onClick */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled
              title="Deferred — legacy has no handler"
            >
              <Mail className="mr-1 h-4 w-4" /> Schedule Report
            </Button>
            <Button
              size="sm"
              disabled
              title="Deferred — legacy has no handler"
            >
              <FileBarChart className="mr-1 h-4 w-4" /> Create Custom Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Deferred — legacy has no handler"
            >
              <Download className="mr-1 h-4 w-4" /> Export All Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Deferred — legacy has no handler"
            >
              <Bell className="mr-1 h-4 w-4" /> Configure Alerts
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Deferred — legacy has no handler"
            >
              <Smartphone className="mr-1 h-4 w-4" /> Email Subscriptions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
