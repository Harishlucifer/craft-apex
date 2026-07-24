import { Link, useLocation } from "react-router-dom";
import { FileSpreadsheet, UploadCloud, History } from "lucide-react";

const TABS = [
  { to: "/settings/excel-upload/templates", label: "Templates", icon: FileSpreadsheet },
  { to: "/settings/excel-upload/upload", label: "Upload File", icon: UploadCloud },
  { to: "/settings/excel-upload/batches", label: "Batch History", icon: History },
];

/**
 * Cross-links the three Excel Upload screens. Only EXU_TEMPLATE_LIST is
 * SHOW-visible in the sidebar (see 20260722164018_EXCEL_UPLOAD_MODULES.sql) —
 * Upload and Batch History are reachable only through this nav, so every
 * screen in the feature renders it, not just the templates list.
 */
export function ExcelUploadNav() {
  const { pathname } = useLocation();
  return (
    <div className="flex gap-2">
      {TABS.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-[#4C7DF0] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
