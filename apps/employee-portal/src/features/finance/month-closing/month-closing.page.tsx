import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  PieChart,
  Folder,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@craft-apex/ui";
import {
  LEGACY_CHECKLIST,
  LEGACY_ENTITY_OPTIONS,
  LEGACY_PERIOD_OPTIONS,
  computeStats,
} from "./month-closing.api";
import type {
  MonthClosingChecklistCategory,
} from "./month-closing.types";

// Legacy: craft-frontend/src/Components/Accounting/MonthClosing.js
//
// LEGACY IS MOCK-ONLY. The legacy component renders entirely from local
// useState — there are no API calls, no endpoints, no real persistence.
// Period / Entity / Closing Date are static option lists, the checklist
// is an in-memory array, and the "Close Month End" button has no onClick
// wired to any backend.
//
// This page mirrors the legacy columns/inputs verbatim against that mock
// data so the route renders. Once a backend exists, replace the imports
// from month-closing.api with React Query hooks wrapping api.get / api.post.

// DEFERRED:
//   - "Close Month End" submit flow (legacy has no handler / no endpoint).
//   - "Cancel" reset flow (legacy has no handler).
//   - Period / Entity option sources (legacy hard-codes them inline).

export default function MonthClosingPage() {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const [closingDate, setClosingDate] = useState<string>(today);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    LEGACY_PERIOD_OPTIONS[0] ?? "",
  );
  const [selectedEntity, setSelectedEntity] = useState<string>(
    LEGACY_ENTITY_OPTIONS[0] ?? "",
  );
  const [checklist, setChecklist] =
    useState<MonthClosingChecklistCategory[]>(LEGACY_CHECKLIST);

  const stats = useMemo(() => computeStats(checklist), [checklist]);

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    setChecklist((prev) => {
      const next = prev.map((cat) => ({
        ...cat,
        items: cat.items.map((it) => ({ ...it })),
      }));
      const item = next[categoryIndex]?.items[itemIndex];
      if (item) item.checked = !item.checked;
      return next;
    });
  };

  const progressColor = (() => {
    if (stats.progress >= 80) return "bg-emerald-500";
    if (stats.progress >= 50) return "bg-sky-500";
    if (stats.progress >= 30) return "bg-amber-500";
    return "bg-rose-500";
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Month Closing
          </h1>
          <p className="text-sm text-slate-500">
            Complete the closing checklist before locking the accounting
            period.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-6 p-6">
          {/* Filters — legacy: Period / Entity / Closing Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Period <span className="text-rose-600">*</span>
              </Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {LEGACY_PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Entity <span className="text-rose-600">*</span>
              </Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
              >
                {LEGACY_ENTITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Closing Date</Label>
              <Input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>
          </div>

          {/* Stats — legacy: Total / Completed / Pending / Progress */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Total Items"
              value={String(stats.total)}
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Completed"
              value={String(stats.completed)}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Pending"
              value={String(stats.pending)}
            />
            <StatCard
              icon={<PieChart className="h-5 w-5" />}
              label="Progress"
              value={`${stats.progress}%`}
            />
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Overall Completion
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {stats.progress}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${progressColor} transition-all`}
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-5">
            {checklist.map((cat, catIdx) => (
              <div key={cat.category}>
                <div className="mb-3 flex items-center gap-2 rounded-md border-l-4 border-indigo-500 bg-slate-50 p-3">
                  <Folder className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-900">
                    {cat.category}
                  </h2>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => {
                    const containerCls = item.checked
                      ? "border-emerald-200 bg-emerald-50"
                      : item.isDue
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-white";
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(catIdx, itemIdx)}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${containerCls}`}
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer rounded"
                          checked={item.checked}
                          onChange={() => toggleItem(catIdx, itemIdx)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span
                          className={`flex-1 text-sm font-medium ${
                            item.checked ? "text-emerald-700" : "text-slate-700"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.checked ? (
                          <Badge className="bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Done
                          </Badge>
                        ) : item.isDue ? (
                          <Badge className="bg-amber-100 text-[10px] uppercase tracking-wide text-amber-700">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Due
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-[10px] uppercase tracking-wide text-slate-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Actions — DEFERRED: no legacy onClick / endpoint */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" size="sm" disabled>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={stats.completed < stats.total}
              title="Deferred — legacy has no submit handler / endpoint"
            >
              <Lock className="mr-1 h-4 w-4" />
              Close Month End
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-indigo-600 p-4 text-white shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase text-white/70">
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="rounded-full bg-white/20 p-2">{icon}</div>
    </div>
  );
}
