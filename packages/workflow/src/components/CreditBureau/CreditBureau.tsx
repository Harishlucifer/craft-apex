import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  CreditBureauAPI,
  BUREAU_ACCOUNT_STATUS,
  type BureauApplicant,
  type BureauAccount,
  type BureauEnquiry,
  type IndividualInformation,
} from "./CreditBureauAPI";
import type { StepComponentProps } from "../../types";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileSearch,
  Loader2,
  Phone,
  Play,
  RefreshCw,
  Shield,
  ShieldCheck,
  SkipForward,
  User,
  Wallet,
  Calendar,
  TrendingDown,
  Building2,
  Mail,
  MapPin,
  Cake,
  CircleDot,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  ChevronUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CreditBureauProps extends StepComponentProps {
  axiosInstance?: any;
  dataV1?: any;
}

interface AccountSummary {
  summaryMap: Record<
    string,
    {
      loan_type: string;
      total: number;
      active: number;
      closed: number;
      other: number;
    }
  >;
  totalActive: number;
  totalClosed: number;
  totalOther: number;
}

/* ------------------------------------------------------------------ */
/*  Utility Helpers                                                     */
/* ------------------------------------------------------------------ */

function formatCurrency(val: number | undefined): string {
  if (val == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDate(dateStr: string | undefined | number): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeStatus(status: string | undefined): string {
  if (!status) return "OTHER";
  return BUREAU_ACCOUNT_STATUS[status] ?? "OTHER";
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** Gauge-style credit score visualisation */
const CreditScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const maxScore = 900;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const rotation = -90 + (percentage / 100) * 180;

  const getColor = () => {
    if (score >= 750) return { main: "#10b981", bg: "#d1fae5", label: "Excellent" };
    if (score >= 650) return { main: "#f59e0b", bg: "#fef3c7", label: "Good" };
    if (score >= 550) return { main: "#f97316", bg: "#ffedd5", label: "Fair" };
    return { main: "#ef4444", bg: "#fee2e2", label: "Poor" };
  };
  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative" style={{ width: 180, height: 100 }}>
        {/* Background arc */}
        <svg
          viewBox="0 0 180 100"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke={color.main}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        {/* Pointer */}
        <div
          className="absolute"
          style={{
            bottom: "10px",
            left: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transition: "transform 1s ease",
          }}
        >
          <div
            style={{
              width: 4,
              height: 55,
              borderRadius: 2,
              background: `linear-gradient(to top, ${color.main}, transparent)`,
            }}
          />
        </div>
      </div>
      <div className="text-center -mt-2">
        <div
          className="text-3xl font-bold"
          style={{ color: color.main, letterSpacing: "-0.02em" }}
        >
          {score}
        </div>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1"
          style={{ background: color.bg, color: color.main }}
        >
          {color.label}
        </div>
      </div>
      <div className="flex justify-between w-full px-2 text-xs text-gray-400">
        <span>300</span>
        <span>900</span>
      </div>
    </div>
  );
};

/** Stat card for the Credit Standing section */
const StatCard: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = "#3b82f6" }) => (
  <div
    className="flex items-start gap-3 rounded-xl p-3"
    style={{
      background: `${color}08`,
      border: `1px solid ${color}18`,
      minWidth: 0,
    }}
  >
    <div
      className="shrink-0 flex items-center justify-center rounded-lg"
      style={{
        width: 36,
        height: 36,
        background: `${color}15`,
        color,
      }}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div
        className="text-xs text-gray-500 font-medium truncate"
        style={{ lineHeight: "1.4" }}
      >
        {label}
      </div>
      <div
        className="text-sm font-bold text-gray-800 truncate"
        style={{ lineHeight: "1.5" }}
      >
        {value}
      </div>
    </div>
  </div>
);

/** Expandable loan account row */
const LoanAccountRow: React.FC<{
  account: BureauAccount;
  index: number;
  isOpen: boolean;
  toggle: () => void;
}> = ({ account, index, isOpen, toggle }) => {
  const statusStr = normalizeStatus(account.status);
  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    ACTIVE: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
    CLOSED: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
    OTHER: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  };
  const sc = statusColors[statusStr] || statusColors.OTHER;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: isOpen ? "1px solid #dbeafe" : "1px solid #f1f5f9",
        background: isOpen ? "#fafbff" : "#fff",
        transition: "all 0.25s ease",
      }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50/50 transition-colors"
      >
        <span
          className="shrink-0 text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: "#f1f5f9", color: "#64748b" }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">
            {account.loan_type || "Unknown Loan"}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {account.account_number || "—"}
          </div>
        </div>
        <span
          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: sc.bg, color: sc.text }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
            style={{ background: sc.dot, verticalAlign: "middle" }}
          />
          {statusStr}
        </span>
        <span className="shrink-0 text-gray-400">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {isOpen && (
        <div
          className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          style={{ borderTop: "1px solid #f1f5f9" }}
        >
          <DetailCell label="Sanctioned" value={formatCurrency(account.sanctioned_amount)} />
          <DetailCell label="Current Balance" value={formatCurrency(account.current_balance)} />
          <DetailCell label="Overdue" value={formatCurrency(account.overdue_amount)} />
          <DetailCell label="EMI" value={formatCurrency(account.emi_amount)} />
          <DetailCell label="Opened" value={formatDate(account.opened_date)} />
          <DetailCell label="Closed" value={formatDate(account.closed_date)} />
          <DetailCell label="Last Payment" value={formatDate(account.last_payment_date)} />
        </div>
      )}
    </div>
  );
};

const DetailCell: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="pt-3">
    <div className="text-xs text-gray-400 font-medium">{label}</div>
    <div className="text-sm font-semibold text-gray-700">{value}</div>
  </div>
);

/** Enquiry row */
const EnquiryRow: React.FC<{ enquiry: BureauEnquiry; index: number }> = ({
  enquiry,
  index,
}) => (
  <div
    className="flex items-center gap-3 p-3 rounded-lg"
    style={{
      background: index % 2 === 0 ? "#fafbfc" : "#fff",
      border: "1px solid #f1f5f9",
    }}
  >
    <span
      className="shrink-0 w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center"
      style={{ background: "#ede9fe", color: "#7c3aed" }}
    >
      {index + 1}
    </span>
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-sm font-semibold text-gray-800 truncate flex-1">
        {enquiry.enquiry_purpose || "N/A"}
      </span>
      {enquiry.member_name && (
        <span className="text-xs text-gray-500 truncate">
          {enquiry.member_name}
        </span>
      )}
    </div>
    <span className="text-xs text-gray-500 shrink-0">
      {formatDate(enquiry.enquiry_date)}
    </span>
    {enquiry.enquiry_amount != null && (
      <span className="text-xs font-semibold text-gray-700 shrink-0">
        {formatCurrency(enquiry.enquiry_amount)}
      </span>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

const CreditBureau = forwardRef<any, CreditBureauProps>((props, ref) => {
  const { step, data, handleSubmitSuccess } = props;
  const api = useMemo(() => new CreditBureauAPI(), []);

  /* ── State ── */
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);
  const [applicants, setApplicants] = useState<BureauApplicant[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentApplicant, setCurrentApplicant] =
    useState<BureauApplicant | null>(null);
  const [bureauAnalysisId, setBureauAnalysisId] = useState<
    number | string | null
  >(null);
  const [skip, setSkip] = useState(0);
  const [oldData, setOldData] = useState(0);
  const [skipPrivilege] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [onlyScoreView, setOnlyScoreView] = useState(false);
  const [productCode, setProductCode] = useState<{
    title: string;
    label: string;
  } | null>(null);

  // Filters
  const [selectedLoanType, setSelectedLoanType] = useState("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState("ALL");
  const [activeRange, setActiveRange] = useState("ALL");
  const [filteredAccounts, setFilteredAccounts] = useState<BureauAccount[]>([]);
  const [filteredEnquirys, setFilteredEnquirys] = useState<BureauEnquiry[]>([]);
  const [loanTypes, setLoanTypes] = useState<string[]>([]);
  const [enquiryPurpose, setEnquiryPurpose] = useState<string[]>([]);
  const [summaryDetails, setSummaryDetails] = useState<AccountSummary | null>(
    null
  );
  const [enquirySummaryDetails, setEnquirySummary] = useState<
    Record<string, { total: number }>
  >({});
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const restrictMode = false;

  /* ── Derived computations ── */

  const extractSummary = useCallback(
    (accounts: BureauAccount[]) => {
      if (!accounts?.length) return;
      const map: AccountSummary["summaryMap"] = {};
      let totalActive = 0,
        totalClosed = 0,
        totalOther = 0;
      accounts.forEach((acc) => {
        const type = acc.loan_type || "UNKNOWN";
        if (!map[type])
          map[type] = { loan_type: type, total: 0, active: 0, closed: 0, other: 0 };
        map[type].total += 1;
        const st = normalizeStatus(acc.status);
        if (st === "ACTIVE") {
          map[type].active += 1;
          totalActive += 1;
        } else if (st === "CLOSED") {
          map[type].closed += 1;
          totalClosed += 1;
        } else {
          map[type].other += 1;
          totalOther += 1;
        }
      });
      setSummaryDetails({ summaryMap: map, totalActive, totalClosed, totalOther });
      setLoanTypes(
        accounts
          .map((a) => a.loan_type)
          .filter((v, i, s): v is string => !!v && s.indexOf(v) === i)
      );
    },
    []
  );

  const extractEnquirySummary = useCallback((enquiries: BureauEnquiry[]) => {
    if (!enquiries?.length) return;
    const map: Record<string, { total: number }> = {};
    enquiries.forEach((e) => {
      const p = e.enquiry_purpose || "UNKNOWN";
      if (!map[p]) map[p] = { total: 0 };
      map[p].total += 1;
    });
    setEnquirySummary(map);
    setEnquiryPurpose(
      enquiries
        .map((e) => e.enquiry_purpose)
        .filter((v, i, s): v is string => !!v && s.indexOf(v) === i)
    );
  }, []);

  const applyFilters = useCallback(
    (
      status: string = activeRange,
      loanType: string = selectedLoanType,
      src?: BureauApplicant | null
    ) => {
      const source = src ?? currentApplicant ?? applicants[0];
      const all =
        source?.bureau_details?.bureau_data?.computed_data?.accounts ?? [];
      const filtered = all.filter((acc) => {
        const matchLoan = loanType !== "ALL" ? acc.loan_type === loanType : true;
        const norm = normalizeStatus(acc.status);
        const upper = status.toUpperCase();
        const matchStatus =
          upper === "ALL" || !upper
            ? true
            : upper === "OTHER"
            ? !["ACTIVE", "CLOSED"].includes(norm)
            : norm === upper;
        return matchLoan && matchStatus;
      });
      setFilteredAccounts(filtered);
    },
    [activeRange, selectedLoanType, currentApplicant, applicants]
  );

  const enquiryFilter = useCallback(
    (type: string = selectedEnquiry, src?: BureauApplicant | null) => {
      const source = src ?? currentApplicant ?? applicants[0];
      const all =
        source?.bureau_details?.bureau_data?.computed_data?.enquiry ?? [];
      if (type === "ALL") {
        setFilteredEnquirys(all);
      } else {
        setFilteredEnquirys(all.filter((e) => e.enquiry_purpose === type));
      }
    },
    [selectedEnquiry, currentApplicant, applicants]
  );

  /* ── API calls ── */

  const fetchData = useCallback(
    async (callWorkflow?: boolean) => {
      try {
        setLoading(true);
        setProgress(true);
        const appId =
          data?.application?.onboarding_id ??
          data?.application?.application_id ??
          data?.application?.channel_id;
        if (!appId) {
          setLoading(false);
          setProgress(false);
          return;
        }

        const response = await api.fetchBureauPullList(String(appId));

        setLoading(false);
        setProgress(false);

        if (response?.cam_status === 2) {
          setSkip(response.cam_status);
          setOldData(response.cam_status);
        }

        const result: BureauApplicant[] | null = response?.result;
        if (result?.length) {
          setApplicants(result);
          setCurrentApplicant(result[0]);
          const accounts =
            result[0]?.bureau_details?.bureau_data?.computed_data?.accounts ?? [];
          const enquiries =
            result[0]?.bureau_details?.bureau_data?.computed_data?.enquiry ?? [];
          setFilteredAccounts(accounts);
          setFilteredEnquirys(enquiries);
          extractSummary(accounts);
          extractEnquirySummary(enquiries);

          const bid =
            result[0]?.bureau_details?.bureau_data?.bureau_analysis_id;
          if (bid) setBureauAnalysisId(bid);

          if (callWorkflow && result.length > 0) {
            await initiateWorkflow(result[0]);
          }
        }
      } catch (err) {
        console.error("Credit Bureau fetch error:", err);
        setLoading(false);
        setProgress(false);
      }
    },
    [data, api, extractSummary, extractEnquirySummary]
  );

  const initiateWorkflow = async (
    applicant: BureauApplicant,
    reProcess?: boolean
  ) => {
    try {
      if (reProcess && applicant.bureau_details?.bureau_data) {
        await api.updateApplicantData({
          type: "APPLICATION_BUREAU",
          reference_id:
            applicant.bureau_details.bureau_data.bureau_analysis_id!,
          product_code: applicant.product_code,
        });
      }
      setLoading(true);
      const payload: Record<string, any> = {
        application_id: data?.application?.onboarding_id,
      };
      if (applicant.applicant_category === "ENTITY")
        payload.entity_id = applicant.applicant_id;
      if (applicant.applicant_category === "PERSON")
        payload.person_id = applicant.applicant_id;
      payload.cam_application_id =
        applicant.bureau_details?.bureau_data?.cam_application_id;
      payload.work_order_id =
        applicant.bureau_details?.bureau_data?.work_order_id;

      let analysisId = bureauAnalysisId;
      if (analysisId) {
        payload.bureau_analysis_id =
          applicant.bureau_details?.bureau_data?.bureau_analysis_id?.toString();
      }
      const initResult = await api.bureauInit(payload);
      if (!analysisId) {
        analysisId = initResult?.bureau_analysis_id;
        setBureauAnalysisId(analysisId!);
      }

      const buildResult = await api.workflowBuild({
        source_id: String(analysisId),
        workflow_type: "CAM_BUREAU_FETCH",
      });

      const stepId =
        buildResult.last_active_step_id &&
        buildResult.last_active_step_id !== "0" &&
        buildResult.last_active_step_id !== ""
          ? buildResult.last_active_step_id
          : buildResult?.stages?.[0]?.steps?.[0]?.id;

      const execResult = await api.workflowExecution({
        execute_step_id: stepId,
        source_id: String(analysisId),
        workflow_type: "CAM_BUREAU_FETCH",
      });

      if (execResult) {
        setLoading(false);
        await fetchData(false);
      }
    } catch (err) {
      setLoading(false);
      setProgress(false);
      console.error("Bureau workflow error:", err);
    }
  };

  /* ── Lifecycle ── */

  useEffect(() => {
    const config = step?.configuration;
    if (config) {
      setShowDetails(config.show_details !== false);
      setOnlyScoreView(!!config.only_score_view);
    }
    fetchData(config?.trigger_bureau);
  }, [data]);

  /* ── Imperative handle for parent ── */

  useImperativeHandle(ref, () => ({
    submitStepExternally: () => {
      handleSubmitSuccess({ isValidForm: true, data: null });
    },
  }));

  /* ── Event handlers ── */

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
    const applicant = applicants[idx];
    setCurrentApplicant(applicant);
    const accounts =
      applicant?.bureau_details?.bureau_data?.computed_data?.accounts ?? [];
    const enquiries =
      applicant?.bureau_details?.bureau_data?.computed_data?.enquiry ?? [];
    setFilteredAccounts(accounts);
    setFilteredEnquirys(enquiries);
    extractSummary(accounts);
    extractEnquirySummary(enquiries);
    setSelectedLoanType("ALL");
    setSelectedEnquiry("ALL");
    setActiveRange("ALL");
  };

  const handleStatusFilter = (status: string) => {
    setActiveRange(status);
    applyFilters(status, selectedLoanType);
  };

  const handleLoanTypeFilter = (type: string) => {
    setSelectedLoanType(type);
    setActiveRange("ALL");
    applyFilters("ALL", type);
  };

  const handleEnquiryFilter = (purpose: string) => {
    setSelectedEnquiry(purpose);
    enquiryFilter(purpose);
  };

  /* ── Render helpers ── */

  const currentApp = currentApplicant ?? applicants[activeTab];
  const bureauData = currentApp?.bureau_details?.bureau_data;
  const computedData = bureauData?.computed_data;
  const individualInfo: IndividualInformation | undefined =
    computedData?.individual_information;
  const score = individualInfo?.score ?? 0;
  const hasReport = bureauData != null && bureauData.status === 3;
  const isError = bureauData?.status === -2;
  const isCompleted = bureauData?.status === 4;
  const needsGenerate =
    bureauData && bureauData.status !== 4 && bureauData.status !== -2 && bureauData.status !== 3;

  // Unique phone numbers from accounts
  const phoneNumbers = useMemo(() => {
    const accounts = computedData?.accounts ?? [];
    const all = accounts.flatMap(
      (acc) => acc.account_phone_number?.map((p) => p.number) ?? []
    );
    return [...new Set(all.filter(Boolean))];
  }, [computedData?.accounts]);

  /* ── Loading state ── */

  if (progress && !applicants.length) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Loading bureau data…
          </p>
        </div>
      </div>
    );
  }

  /* ── Main render ── */

  return (
    <div className="space-y-5">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HEADER                                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
          border: "1px solid rgba(99,102,241,0.1)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {productCode?.title || "Credit Bureau"}
              </h3>
              <p className="text-xs text-gray-500">
                {applicants.length} applicant
                {applicants.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {skipPrivilege && (
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-gray-600">
                {skip === 2 ? "Skipped" : "Skip"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={skip === 2}
                  onChange={(e) => setSkip(e.target.checked ? 2 : 1)}
                  className="sr-only"
                />
                <div
                  className="w-9 h-5 rounded-full transition-colors"
                  style={{
                    background: skip === 2 ? "#f59e0b" : "#d1d5db",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                    style={{
                      transform: `translateX(${skip === 2 ? "18px" : "2px"}) translateY(2px)`,
                    }}
                  />
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  APPLICANT TABS                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {applicants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {applicants.map((app, idx) => (
            <button
              key={idx}
              onClick={() => handleTabChange(idx)}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background:
                  activeTab === idx
                    ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                    : "#f8fafc",
                color: activeTab === idx ? "#fff" : "#64748b",
                border:
                  activeTab === idx
                    ? "none"
                    : "1px solid #e2e8f0",
                boxShadow:
                  activeTab === idx
                    ? "0 4px 12px rgba(59,130,246,0.3)"
                    : "none",
              }}
            >
              <User className="w-3.5 h-3.5 inline mr-1.5" />
              {app.applicant_name}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  BUREAU ERROR STATE                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isError && (
        <div
          className="rounded-xl p-6"
          style={{
            background: "linear-gradient(135deg, #fee2e2, #fff5f5)",
            border: "1px solid #fca5a5",
          }}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-red-800">
                Bureau Error
              </h4>
              <p className="text-sm text-red-600 mt-1 max-w-md">
                {bureauData?.response_data
                  ? typeof bureauData.response_data === "string"
                    ? bureauData.response_data
                    : JSON.stringify(bureauData.response_data, null, 2)
                  : "Error while fetching bureau data!"}
              </p>
              <p className="text-xs text-red-500 mt-2">
                Please fix the above error before re-processing.
              </p>
            </div>
            {!restrictMode && (
              <button
                onClick={() =>
                  initiateWorkflow(applicants[activeTab], true)
                }
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 12px rgba(239,68,68,0.3)",
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Re-Process Report
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  GENERATE REPORT STATE                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {needsGenerate && !isError && (
        <div
          className="rounded-xl p-8"
          style={{
            background:
              "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
            border: "1px solid #bfdbfe",
          }}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
              }}
            >
              <FileSearch className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">
                Generate Bureau Report
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Click below to fetch the credit bureau report for this
                applicant
              </p>
            </div>
            {!restrictMode && (
              <button
                onClick={() =>
                  initiateWorkflow(applicants[activeTab])
                }
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: loading
                    ? "none"
                    : "0 6px 20px rgba(59,130,246,0.35)",
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Generate Report
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  QUESTIONNAIRE (status === 4)                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isCompleted && bureauData?.questionnaire_data && (
        <div
          className="rounded-xl p-5"
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-800">
              Questionnaire Required
            </h4>
          </div>
          <p className="text-xs text-amber-700">
            A questionnaire needs to be answered to proceed with the
            bureau report.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  REPORT DATA (status === 3)                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {hasReport && (
        <>
          {/* ── Score + Profile ── */}
          <div
            className={`grid gap-5 ${onlyScoreView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}
          >
            {/* Score gauge */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="px-4 py-3 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #f0f4ff, #faf5ff)",
                  borderBottom: "1px solid #e8e0f0",
                }}
              >
                <h4 className="text-sm font-bold text-gray-700">
                  {productCode?.title || "Credit Score"}
                </h4>
              </div>
              <CreditScoreGauge score={score} />
            </div>

            {/* Profile details */}
            {!onlyScoreView && currentApp?.bureau_details && (
              <div
                className="lg:col-span-2 rounded-xl overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #f0fdf4, #f0f4ff)",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <h4 className="text-sm font-bold text-gray-700">
                    Profile Details
                  </h4>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileItem
                    icon={<User className="w-4 h-4" />}
                    label="First Name"
                    value={currentApp.bureau_details.first_name}
                  />
                  <ProfileItem
                    icon={<User className="w-4 h-4" />}
                    label="Last Name"
                    value={currentApp.bureau_details.last_name}
                  />
                  <ProfileItem
                    icon={<Cake className="w-4 h-4" />}
                    label="Date of Birth"
                    value={formatDate(currentApp.bureau_details.dob)}
                  />
                  <ProfileItem
                    icon={<Phone className="w-4 h-4" />}
                    label="Mobile"
                    value={currentApp.bureau_details.mobile}
                  />
                  <ProfileItem
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={
                      currentApp.bureau_details.email ||
                      individualInfo?.email
                    }
                  />
                  {currentApp.bureau_details.address && (
                    <ProfileItem
                      icon={<MapPin className="w-4 h-4" />}
                      label="Address"
                      value={[
                        currentApp.bureau_details.address.line_1,
                        currentApp.bureau_details.address.area,
                        currentApp.bureau_details.address.city,
                        currentApp.bureau_details.address.state,
                        currentApp.bureau_details.address.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                  )}
                  {individualInfo?.full_name && (
                    <ProfileItem
                      icon={<User className="w-4 h-4" />}
                      label={`Full Name (${productCode?.label || "Bureau"})`}
                      value={individualInfo.full_name}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Credit Standing ── */}
          {showDetails && (
            <>
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #eff6ff, #f0f4ff)",
                    borderBottom: "1px solid #dbeafe",
                  }}
                >
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Credit Standing
                  </h4>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <StatCard
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Total Loans"
                    value={computedData?.accounts?.length ?? 0}
                    color="#10b981"
                  />
                  <StatCard
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    label="Active"
                    value={summaryDetails?.totalActive ?? 0}
                    color="#f59e0b"
                  />
                  <StatCard
                    icon={<XCircle className="w-4 h-4" />}
                    label="Closed"
                    value={summaryDetails?.totalClosed ?? 0}
                    color="#3b82f6"
                  />
                  <StatCard
                    icon={<CircleDot className="w-4 h-4" />}
                    label="Other"
                    value={summaryDetails?.totalOther ?? 0}
                    color="#8b5cf6"
                  />
                  <StatCard
                    icon={<Shield className="w-4 h-4" />}
                    label="Secured Amount"
                    value={formatCurrency(
                      individualInfo?.total_secured_balance_amount
                    )}
                    color="#f59e0b"
                  />
                  <StatCard
                    icon={<Wallet className="w-4 h-4" />}
                    label="Unsecured Amount"
                    value={formatCurrency(
                      individualInfo?.total_unsecured_balance_amount
                    )}
                    color="#3b82f6"
                  />
                  <StatCard
                    icon={<Building2 className="w-4 h-4" />}
                    label="Zero Balance"
                    value={individualInfo?.zero_bal_accounts ?? 0}
                    color="#10b981"
                  />
                  <StatCard
                    icon={<AlertTriangle className="w-4 h-4" />}
                    label="Total Overdue"
                    value={formatCurrency(individualInfo?.overdue_amount)}
                    color="#ef4444"
                  />
                  <StatCard
                    icon={<Wallet className="w-4 h-4" />}
                    label="Total Pending"
                    value={formatCurrency(
                      individualInfo?.total_balance_amount
                    )}
                    color="#10b981"
                  />
                  <StatCard
                    icon={<Wallet className="w-4 h-4" />}
                    label="Sanctioned"
                    value={formatCurrency(individualInfo?.sanctioned_amount)}
                    color="#6366f1"
                  />
                  {/* DPD Cards */}
                  {[
                    { label: "1 Month DPD", val: individualInfo?.last_30_days_dpd, count: individualInfo?.account_one_month_dpd },
                    { label: "3 Month DPD", val: individualInfo?.last_90_days_dpd, count: individualInfo?.account_three_month_dpd },
                    { label: "6 Month DPD", val: individualInfo?.last_180_days_dpd, count: individualInfo?.account_six_month_dpd },
                    { label: "9 Month DPD", val: individualInfo?.last_9months_dpd, count: individualInfo?.account_nine_month_dpd },
                    { label: "1 Year DPD", val: individualInfo?.last_1year_dpd, count: individualInfo?.account_one_year_dpd },
                    { label: "2 Year DPD", val: individualInfo?.last_2year_dpd, count: individualInfo?.account_two_year_dpd },
                  ].map(({ label, val, count }) => (
                    <StatCard
                      key={label}
                      icon={<TrendingDown className="w-4 h-4" />}
                      label={
                        <span>
                          {label}
                          {count != null && count > 0 && (
                            <span className="text-blue-500 ml-1 text-[10px]">
                              ({count} acc)
                            </span>
                          )}
                        </span>
                      }
                      value={val ?? 0}
                      color="#f97316"
                    />
                  ))}
                  <StatCard
                    icon={<Calendar className="w-4 h-4" />}
                    label="Recent Opened"
                    value={formatDate(individualInfo?.recent_open_date)}
                    color="#10b981"
                  />
                  <StatCard
                    icon={<Calendar className="w-4 h-4" />}
                    label="Oldest Opened"
                    value={formatDate(individualInfo?.oldest_open_date)}
                    color="#6366f1"
                  />
                  <StatCard
                    icon={<Calendar className="w-4 h-4" />}
                    label="Recent Closed"
                    value={formatDate(individualInfo?.recent_closed_date)}
                    color="#ef4444"
                  />
                  {(individualInfo?.total_enquiry ?? 0) >= 1 && (
                    <>
                      <StatCard
                        icon={<Search className="w-4 h-4" />}
                        label="Total Enquiry"
                        value={individualInfo?.total_enquiry ?? 0}
                        color="#10b981"
                      />
                      <StatCard
                        icon={<Search className="w-4 h-4" />}
                        label="Last 1M Enquiry"
                        value={individualInfo?.past_30_days_enq ?? 0}
                        color="#3b82f6"
                      />
                      <StatCard
                        icon={<Search className="w-4 h-4" />}
                        label="Last 1Y Enquiry"
                        value={individualInfo?.past_12_months_enq ?? 0}
                        color="#f59e0b"
                      />
                      <StatCard
                        icon={<Calendar className="w-4 h-4" />}
                        label="Recent Enquiry"
                        value={formatDate(
                          individualInfo?.recent_enquiry_date
                        )}
                        color="#8b5cf6"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* ── Credit Summary with Filters ── */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #dbeafe",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    background:
                      "linear-gradient(135deg, #eff6ff, #e0e7ff)",
                    borderBottom: "1px solid #dbeafe",
                  }}
                >
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Credit Summary
                  </h4>
                </div>

                {/* Loan type filter chips */}
                <div className="p-4 flex flex-wrap gap-2">
                  <FilterChip
                    label="ALL"
                    count={computedData?.accounts?.length ?? 0}
                    active={selectedLoanType === "ALL"}
                    onClick={() => handleLoanTypeFilter("ALL")}
                  />
                  {loanTypes.map((lt) => (
                    <FilterChip
                      key={lt}
                      label={lt}
                      count={summaryDetails?.summaryMap?.[lt]?.total}
                      active={selectedLoanType === lt}
                      onClick={() => handleLoanTypeFilter(lt)}
                    />
                  ))}
                </div>

                {/* Status filter buttons */}
                <div className="px-4 pb-3 flex gap-1.5">
                  {["ALL", "Active", "Closed", "Other"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleStatusFilter(opt.toUpperCase())}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background:
                          activeRange === opt.toUpperCase()
                            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                            : "#f1f5f9",
                        color:
                          activeRange === opt.toUpperCase()
                            ? "#fff"
                            : "#64748b",
                        boxShadow:
                          activeRange === opt.toUpperCase()
                            ? "0 2px 8px rgba(59,130,246,0.25)"
                            : "none",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Account list */}
                <div className="px-4 pb-4 space-y-2">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc, idx) => (
                      <LoanAccountRow
                        key={idx}
                        account={acc}
                        index={idx}
                        isOpen={openIndex === idx}
                        toggle={() =>
                          setOpenIndex((prev) =>
                            prev === idx ? null : idx
                          )
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-400">
                      No loan accounts match the current filter
                    </div>
                  )}
                </div>
              </div>

              {/* ── Enquiry Summary ── */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid #e9d5ff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #faf5ff, #f0f4ff)",
                    borderBottom: "1px solid #e9d5ff",
                  }}
                >
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-purple-600" />
                    Enquiry Summary
                  </h4>
                </div>

                <div className="p-4 flex flex-wrap gap-2">
                  <FilterChip
                    label="ALL"
                    count={computedData?.enquiry?.length ?? 0}
                    active={selectedEnquiry === "ALL"}
                    onClick={() => handleEnquiryFilter("ALL")}
                    color="#8b5cf6"
                  />
                  {enquiryPurpose.map((ep) => (
                    <FilterChip
                      key={ep}
                      label={ep}
                      count={enquirySummaryDetails[ep]?.total}
                      active={selectedEnquiry === ep}
                      onClick={() => handleEnquiryFilter(ep)}
                      color="#8b5cf6"
                    />
                  ))}
                </div>

                <div className="px-4 pb-4 space-y-1.5">
                  {filteredEnquirys?.length ? (
                    filteredEnquirys.map((enq, idx) => (
                      <EnquiryRow key={idx} enquiry={enq} index={idx} />
                    ))
                  ) : (
                    <div className="text-center py-6 text-sm text-gray-400">
                      No enquiries found
                    </div>
                  )}
                </div>
              </div>

              {/* ── Phone Numbers ── */}
              {phoneNumbers.length > 0 && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0fdf4, #eff6ff)",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      Phone Numbers
                    </h4>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {phoneNumbers.map((num, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                          background: "#f0fdf4",
                          color: "#15803d",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <Phone className="w-3 h-3" />
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
});

CreditBureau.displayName = "CreditBureau";
export default CreditBureau;

/* ── Helper sub-components ── */

const ProfileItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}> = ({ icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-3">
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "#eff6ff", color: "#3b82f6" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        <div className="text-sm font-semibold text-gray-700 break-words">
          {value}
        </div>
      </div>
    </div>
  ) : null;

const FilterChip: React.FC<{
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  color?: string;
}> = ({ label, count, active, onClick, color = "#3b82f6" }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
    style={{
      background: active ? color : "#f8fafc",
      color: active ? "#fff" : "#475569",
      border: active ? "none" : "1px solid #e2e8f0",
      boxShadow: active ? `0 2px 8px ${color}40` : "none",
    }}
  >
    {label}
    {count != null && (
      <span
        className="inline-flex items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          minWidth: 18,
          height: 18,
          padding: "0 4px",
          background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0",
          color: active ? "#fff" : "#64748b",
        }}
      >
        {count}
      </span>
    )}
  </button>
);
