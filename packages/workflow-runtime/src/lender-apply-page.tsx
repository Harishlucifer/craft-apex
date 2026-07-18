import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@craft-apex/ui";
import { WorkflowRuntime } from "./workflow-runtime";
import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@craft-apex/api";

const APPLICATION_URL = "/alpha/v2/application";

export function useApplicationDetail(id?: string) {
  return useQuery({
    queryKey: ["consumer-application-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async () => {
      const body = await getApiClient().get<unknown, any>(
        `${APPLICATION_URL}/${encodeURIComponent(id!)}`
      );
      return (body?.data ?? body?.result ?? body ?? {});
    },
  });
}

interface Props {
  title: string;
  workflowType: string;
  listPath: string;
}

export function LenderApply({ title, workflowType, listPath }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  // Legacy supports ?partner_type=... if needed, or lenderCode
  const partnerType = searchParams.get("partner_type") ?? undefined;

  const { data: applicationDetail } = useApplicationDetail(id);

  // Safely extract values
  const appCore = applicationDetail?.application || {};
  const applicant = applicationDetail?.applicants?.[0]?.personal || applicationDetail?.applicants?.[0]?.business || {};

  const name = appCore.applicant_name || applicant.full_name || applicant.name || "N/A";
  const contact = appCore.mobile || applicant.mobile || "N/A";
  const email = appCore.email || applicant.email || "N/A";
  const amount = appCore.loan_amount ? `₹${appCore.loan_amount}` : "N/A";
  const type = appCore.loan_type_name || appCore.type || "Loan";

  return (
    <div className="w-full space-y-5">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-6">
        <div className="flex flex-col xl:flex-row items-center gap-10">

          {/* Left section: Lender Branding & Back Button */}
          <div className="flex flex-col items-center xl:items-start justify-center shrink-0 w-[260px]">
            <div className="bg-[#FFCC00] rounded-xl px-5 py-3.5 mb-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0">
                <span className="font-bold text-slate-900 text-[11px] leading-none" style={{ fontFamily: "serif" }}>L&T</span>
              </div>
              <span className="font-black text-slate-900 text-[22px] tracking-tight italic pr-2">L&T Finance</span>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200 font-semibold h-10 px-5 w-fit">
              <Link to={listPath}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Applications
              </Link>
            </Button>
          </div>

          {/* Divider */}
          <div className="hidden xl:block w-[1px] h-24 bg-slate-100 shrink-0"></div>

          {/* Right section: Application Details */}
          <div className="flex-1 w-full flex flex-row flex-wrap xl:flex-nowrap justify-between items-center gap-y-6">

            {/* Detail Item: Name */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <i className="ri-user-line text-[24px]"></i>
              </div>
              <span className="text-slate-900 font-black text-[15px] w-24 truncate text-center" title={name}>{name}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Name</span>
            </div>

            {/* Detail Item: Contact */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-green-50 text-emerald-500 flex items-center justify-center mb-3">
                <i className="ri-phone-line text-[24px]"></i>
              </div>
              <span className="text-slate-900 font-black text-[15px] w-24 truncate text-center" title={contact}>{contact}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Contact</span>
            </div>

            {/* Detail Item: Email */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                <i className="ri-mail-line text-[24px]"></i>
              </div>
              <span className="text-slate-900 font-black text-[15px] w-24 truncate text-center" title={email}>{email}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Email</span>
            </div>

            {/* Detail Item: Amount */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <i className="ri-money-rupee-circle-line text-[24px]"></i>
              </div>
              <span className="text-slate-900 font-black text-[15px] w-24 truncate text-center" title={amount.toString()}>{amount}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Amount</span>
            </div>

            {/* Detail Item: Type */}
            <div className="flex flex-col items-center text-center">
              <div className="w-[52px] h-[52px] rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                <i className="ri-bank-card-line text-[24px]"></i>
              </div>
              <span className="text-slate-900 font-black text-[15px] w-24 truncate text-center" title={type}>{type}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Type</span>
            </div>

          </div>
        </div>
      </div>
      <WorkflowRuntime
        workflowType={workflowType}
        sourceId={id}
        partnerType={partnerType}
        title={title}
        onClose={() => navigate(listPath)}
        orientation={"vertical"}
      />
    </div>
  );
}

