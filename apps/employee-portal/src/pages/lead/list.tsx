

/* ------------------------------------------------------------------ */
/*  Lead List Page                                                     */
/*  Uses the DynamicTable with configurable columns & dynamic actions  */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance, useSetupStore } from "@craft-apex/auth";
import { useModuleData, useModulePermissions, useModuleConfiguration } from "@/hooks/use-module-data";
import { DynamicTable } from "@craft-apex/ui/components/dynamic-table";
import type {
  DynamicColumn,
  DynamicAction,
  PaginationInfo,
} from "@craft-apex/ui/components/dynamic-table-types";
import {
  Eye,
  FileText,
  Landmark,
  UserPlus,
  ClipboardList,
  Users,
  Activity,
  CreditCard,
  FileBarChart,
  RotateCcw,
  Filter,
  Download,
  Loader2,
} from "lucide-react";
import { Badge } from "@craft-apex/ui/components/badge";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface LeadData {
  application_id: number;
  code: string;
  loan_code: string;
  name: string;
  contact_name: string;
  mobile: string;
  loan_type_name: string;
  loan_amount: number;
  territory_type: string;
  territory_name: string;
  territory_id: number;
  type: string;
  external_journey_type: string;
  external_lead_type: string;
  submission_mode: string;
  status: number;
  application_status: string;
  loan_status: string;
  workflow_instance_id: number;
  pending_ask_count: number;
  resolved_ask_count: number;
  createdAt: string;
  updatedAt: string;
  sourced_by: {
    user_name: string;
    user_role: string;
    user_type: string;
    channel_name: string;
    supervisor_username: string;
  };
  represented_by: {
    user_name: string;
    user_id: number;
  };
  serviced_by: {
    user_name: string;
    user_id: number;
  };
  active_task: {
    task_name: string;
    stage_name: string;
    user_detail: {
      username: string;
      user_type: string;
    };
  };
  apply_capacity: string;
  onboarding_id: number;
  loan_type_code: string;
  originPlatform: string;
  data: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatAmount(value: unknown): string {
  if (value === null || value === undefined) return "—";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  try {
    return new Date(String(value)).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return String(value);
  }
}

function getStatusColor(status: number | string): {
  bg: string;
  text: string;
  label: string;
} {
  const s = Number(status);
  switch (s) {
    case 1:
      return { bg: "bg-blue-50", text: "text-blue-700", label: "Active" };
    case 2:
      return { bg: "bg-amber-50", text: "text-amber-700", label: "In Progress" };
    case 3:
      return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Fulfilled" };
    case -1:
      return { bg: "bg-red-50", text: "text-red-700", label: "Archived" };
    case -2:
      return { bg: "bg-orange-50", text: "text-orange-700", label: "Dedupe" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-700", label: "Pending" };
  }
}

const JOURNEY_TYPE_MAP: Record<string, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold",
  LEAD: "Lead",
};

/* ------------------------------------------------------------------ */
/*  Column Definitions                                                 */
/* ------------------------------------------------------------------ */

function getLeadColumns(isTerritoryEnabled: boolean): DynamicColumn[] {
  const columns: DynamicColumn[] = [
    {
      header: "Lead ID",
      key: "lead_id",
      minWidth: "120px",
      fields: [
        {
          label: "Code",
          accessor: "code",
          hideLabel: true,
          valueClassName: "font-bold text-[13px] text-slate-800",
        },
        {
          label: "Loan Code",
          accessor: "loan_code",
          format: (val) =>
            val ? (
              <span className="text-[11px] text-slate-500 font-mono">{String(val)}</span>
            ) : null,
          hideLabel: false,
        },
      ],
    },
    {
      header: "Loan Details",
      key: "loan_details",
      minWidth: "180px",
      fields: [
        {
          label: "Loan Type",
          accessor: "loan_type_name",
        },
        {
          label: "Requested Amount",
          accessor: "loan_amount",
          format: (val) => (
            <span className="font-semibold text-emerald-700">
              {formatAmount(val)}
            </span>
          ),
        },
      ],
    },
    {
      header: "Lead Details",
      key: "lead_details",
      minWidth: "200px",
      fields: [
        {
          label: "Application Name",
          accessor: "name",
          valueClassName: "font-semibold text-slate-800",
        },
        {
          label: "Contact Person",
          accessor: "contact_name",
          format: (val, row) =>
            row.apply_capacity === "ENTITY" && val ? String(val) : null,
        },
        {
          label: "Mobile Number",
          accessor: "mobile",
          format: (val) => {
            if (!val) return null;
            const mobile = String(val);
            return <span className="font-mono text-slate-600">{mobile}</span>;
          },
        },
      ],
    },
    {
      header: "Source Details",
      key: "source_details",
      minWidth: "200px",
      fields: [],
      render: (row) => {
        const sourcedBy = row.sourced_by as LeadData["sourced_by"];
        const journeyType = JOURNEY_TYPE_MAP[String(row.type)] ?? String(row.type || "");
        return (
          <div className="flex flex-col gap-1 py-1">
            {sourcedBy && (
              <Badge
                variant="default"
                className="text-[10px] max-w-fit bg-blue-600 text-white"
              >
                {sourcedBy.supervisor_username && sourcedBy.user_role !== "EMPLOYEE"
                  ? `${sourcedBy.supervisor_username} - `
                  : ""}
                {sourcedBy.channel_name || sourcedBy.user_name} - {sourcedBy.user_role}
              </Badge>
            )}
            <div className="flex items-start gap-1.5 py-0.5">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">
                Journey Type :
              </span>
              <span className="text-[12px] text-slate-700 font-medium">
                {journeyType}
              </span>
            </div>
            {sourcedBy?.user_type && (
              <div className="flex items-start gap-1.5 py-0.5">
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  User Type :
                </span>
                <span className="text-[12px] text-slate-700 font-medium">
                  {sourcedBy.user_type}
                </span>
              </div>
            )}
            {row.external_lead_type ? (
              <div className="flex items-start gap-1.5 py-0.5">
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  Lead Type :
                </span>
                <span className="text-[12px] text-slate-700 font-medium">
                  {String(row.external_lead_type)}
                </span>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      header: "Status",
      key: "status",
      minWidth: "220px",
      fields: [],
      render: (row) => {
        const activeTask = row.active_task as LeadData["active_task"];
        const servicedBy = row.serviced_by as LeadData["serviced_by"];
        const statusColor = getStatusColor(row.status as number);

        return (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-start gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">
                Pending in :
              </span>
              <span className="text-[12px] text-slate-700 font-medium">
                {activeTask?.task_name || "—"}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">
                Pending with :
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold bg-amber-100 text-amber-700 border-amber-200"
              >
                {activeTask?.user_detail?.username || "—"}
              </Badge>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 shrink-0">
                Status :
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold border",
                  statusColor.bg,
                  statusColor.text
                )}
              >
                {String(row.application_status || statusColor.label)}
              </Badge>
            </div>
            {servicedBy?.user_name && (
              <div className="flex items-start gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  Assigned to :
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold bg-sky-100 text-sky-700"
                >
                  {servicedBy.user_name}
                </Badge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Ask Details",
      key: "ask_details",
      minWidth: "120px",
      fields: [
        {
          label: "Pending",
          accessor: "pending_ask_count",
          format: (val) => (
            <span className={cn("font-semibold", Number(val) > 0 ? "text-amber-600" : "text-slate-400")}>
              {String(val ?? 0)}
            </span>
          ),
        },
        {
          label: "Resolved",
          accessor: "resolved_ask_count",
          format: (val) => (
            <span className={cn("font-semibold", Number(val) > 0 ? "text-emerald-600" : "text-slate-400")}>
              {String(val ?? 0)}
            </span>
          ),
        },
      ],
    },
    {
      header: "Date",
      key: "date",
      minWidth: "180px",
      fields: [
        {
          label: "Created On",
          accessor: "createdAt",
          format: (val) => (
            <span className="text-[11px] text-slate-600 tabular-nums">
              {formatDate(val)}
            </span>
          ),
        },
        {
          label: "Updated On",
          accessor: "updatedAt",
          format: (val) => (
            <span className="text-[11px] text-slate-600 tabular-nums">
              {formatDate(val)}
            </span>
          ),
        },
      ],
    },
  ];

  // Insert territory column after Lead Details if enabled
  if (isTerritoryEnabled) {
    const leadDetailsIdx = columns.findIndex((c) => c.key === "lead_details");
    columns.splice(leadDetailsIdx + 1, 0, {
      header: "Territory",
      key: "territory",
      minWidth: "180px",
      fields: [
        { label: "Territory Type", accessor: "territory_type" },
        { label: "Territory Name", accessor: "territory_name" },
        {
          label: "RM Name",
          accessor: "represented_by.user_name",
        },
      ],
    });
  }

  return columns;
}

/* ------------------------------------------------------------------ */
/*  Action Definitions                                                 */
/* ------------------------------------------------------------------ */

function getLeadActions(
  navigate: (path: string) => void,
  permissions: Record<string, boolean>
): DynamicAction[] {
  const actions: DynamicAction[] = [];

  if (permissions.view) {
    actions.push({
      key: "view",
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => {
        const appId = String(row.application_id);
        const type = String(row.type || "");
        navigate(`/lead/create/${appId}#${type}`);
      },
    });
  }

  if (permissions.summary) {
    actions.push({
      key: "workflow-summary",
      label: "Workflow Summary",
      icon: <FileText className="h-4 w-4" />,
      onClick: (row) => {
        // Placeholder – trigger summary modal
        console.log("Workflow summary for", row.application_id);
      },
      visible: (row) => Number(row.workflow_instance_id) !== 0,
    });
  }

  if (permissions.lender_status) {
    actions.push({
      key: "lender-status",
      label: "Lender Status",
      icon: <Landmark className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Lender status for", row.application_id);
      },
      separator: true,
    });
  }

  if (permissions.assign) {
    actions.push({
      key: "assign",
      label: "Assign",
      icon: <UserPlus className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Assign", row.application_id);
      },
    });
  }

  if (permissions.ask_details) {
    actions.push({
      key: "ask-details",
      label: "Ask Details",
      icon: <ClipboardList className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Ask details for", row.application_id);
      },
      separator: true,
    });
  }

  if (permissions.participant_details) {
    actions.push({
      key: "participant-details",
      label: "Participant Details",
      icon: <Users className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Participant details for", row.application_id);
      },
    });
  }

  if (permissions.bank_statement) {
    actions.push({
      key: "bank-statement",
      label: "Bank Statement Parser",
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Bank statement for", row.application_id);
      },
      separator: true,
    });
  }

  if (permissions.credit_bureau) {
    actions.push({
      key: "credit-bureau",
      label: "Credit Bureau",
      icon: <FileBarChart className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Credit bureau for", row.application_id);
      },
    });
  }

  if (permissions.activity_stream) {
    actions.push({
      key: "activity-stream",
      label: "Activity Stream",
      icon: <Activity className="h-4 w-4" />,
      onClick: (row) => {
        console.log("Activity stream for", row.application_id);
      },
      separator: true,
    });
  }

  return actions;
}

/* ------------------------------------------------------------------ */
/*  Lead List Page Component                                           */
/* ------------------------------------------------------------------ */

export default function LeadListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tenant } = useSetupStore();

  /* ── Module data from route matching (mirrors routeHandle/WithModule.js) ── */
  const module = useModuleData();
  const modulePermissions = useModulePermissions();
  const moduleConfig = useModuleConfiguration();

  /* ── State ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ── Configuration from tenant ── */
  const isTerritoryEnabled = (tenant as Record<string, unknown>)?.TERRITORY_ENABLED === true;

  /* ── Permissions from module data ── */
  const permissions = useMemo(
    () => ({
      view: modulePermissions.view ?? true,
      summary: modulePermissions.summary ?? false,
      export: modulePermissions.export ?? false,
      assign: modulePermissions.assign ?? false,
      ask_details: modulePermissions.ask_details ?? false,
      participant_details: modulePermissions.partcipant_details ?? false,
      bank_statement: modulePermissions.bank_statement ?? false,
      credit_bureau: modulePermissions.credit_bureau ?? false,
      activity_stream: modulePermissions.activity_stream ?? false,
      lender_status: modulePermissions.lender_status ?? false,
    }),
    [modulePermissions]
  );

  /* ── Columns ── */
  const columns = useMemo(
    () => getLeadColumns(isTerritoryEnabled),
    [isTerritoryEnabled]
  );

  /* ── Actions ── */
  const actions = useMemo(
    () => getLeadActions(navigate, permissions),
    [navigate, permissions]
  );

  /* ── API Fetch ── */
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["lead-list", currentPage, searchValue, module?.module_id],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(currentPage),
      };
      if (searchValue) params.keyword = searchValue;

      // Merge any URL search params (from dashboard navigation)
      searchParams.forEach((val, key) => {
        if (key !== "page" && key !== "keyword") {
          params[key] = val;
        }
      });

      // Apply module configuration filters (mirrors routeHandle/LeadList.js)
      if (moduleConfig?.status) {
        params.status = moduleConfig.status;
      }
      if (moduleConfig?.include_journey_types) {
        params.journey_type = moduleConfig.include_journey_types;
      }
      if (moduleConfig?.exclude_journey_types) {
        params.exclude_journey_type = moduleConfig.exclude_journey_types;
      }

      // Pass X-Module header for module-aware API calls
      const headers: Record<string, string> = {};
      if (module?.map_id != null) {
        headers["X-Module"] = String(module.map_id);
      }

      const res = await axiosInstance.get("/alpha/v1/application", {
        params,
        headers,
        // Prevent axios from encoding | to %7C — the API expects raw pipe characters
        paramsSerializer: (p) => {
          const searchParams = new URLSearchParams(p as Record<string, string>);
          return searchParams.toString().replace(/%7C/gi, "|");
        },
      });
      // res.data is the response body: { application_status, data: [...], pagination }
      const body = res.data as {
        application_status?: Record<string, string>;
        data: LeadData[] | null;
        pagination?: { total: number; page: number; per_page: number };
      };
      return body;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });

  const leadData = (apiResponse?.data ?? []) as unknown as Record<string, unknown>[];
  const paginationRaw = apiResponse?.pagination;

  const pagination: PaginationInfo | undefined = paginationRaw
    ? {
        currentPage: paginationRaw.page || currentPage,
        totalPages: Math.ceil(
          (paginationRaw.total || 0) / (paginationRaw.per_page || 10)
        ),
        totalItems: paginationRaw.total || 0,
        pageSize: paginationRaw.per_page || 10,
      }
    : undefined;

  /* ── Reset pagination when module changes ── */
  useEffect(() => {
    setCurrentPage(1);
  }, [module?.module_id]);

  /* ── Search debounce ── */
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(debouncedSearch);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  /* ── Page change ── */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="p-6 space-y-5">
      {/* ═══════════════ Page Header ═══════════════ */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Lead List
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage and track all your leads in one place
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {isFetching && !isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      </div>

      {/* ═══════════════ Dynamic Table ═══════════════ */}
      <DynamicTable
        columns={columns}
        data={leadData}
        actions={actions}
        loading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchValue={debouncedSearch}
        onSearchChange={setDebouncedSearch}
        searchPlaceholder="Search by name, code, mobile…"
        showSearch={true}
        rowKey="application_id"
        emptyMessage="No leads found"
        toolbarActions={
          <div className="flex items-center gap-2">
            {permissions.export && (
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                  "text-xs font-medium text-slate-600 bg-white",
                  "border border-slate-200 shadow-sm",
                  "transition-all duration-200",
                  "hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                )}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            )}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                "text-xs font-medium",
                "border shadow-sm transition-all duration-200",
                isFilterOpen
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        }
      />
    </div>
  );
}
