import React from "react";
import { registerStepComponent, type StepComponentProps } from "../step-component-registry";
import { Card, CardContent } from "@craft-apex/ui";

const SanctionDetailsStep = ({ step, context, value }: StepComponentProps) => {
  // Use data from context.workflow.source or value if available, else fallback to mock data to match the design.
  const source = context?.workflow?.source as any;
  const application = source?.application || {};

  const dealerName = application?.dealer_name || "Sri Balaji Motors, Trichy";
  const dealerContact = application?.dealer_contact || "+91 422-234-5678";

  const loanSummary = {
    accountNo: application?.loan_account_no || "LT-TW-2026-00842",
    approvedAmount: application?.approved_amount ? `₹${application.approved_amount.toLocaleString()}` : "₹72,300",
    netDisbursement: application?.net_disbursement ? `₹${application.net_disbursement.toLocaleString()}` : "₹71,061",
    interestRate: application?.interest_rate ? `${application.interest_rate}% p.a.` : "14.25% p.a.",
    firstEmi: application?.first_emi_amount && application?.first_emi_date
      ? `₹${application.first_emi_amount.toLocaleString()} on ${application.first_emi_date}`
      : "₹3,480 on 10-Jun-2026"
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Top Blue Card */}
      <Card className="border-0 shadow-sm  overflow-hidden bg-[#3446C4] text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6 border-b border-white/20 pb-6">
            <div className="text-4xl leading-none opacity-90 text-yellow-400">
              <i className="ri-motorbike-fill"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Vehicle Delivery Instructions Sent to Dealer</h3>
              <p className="text-blue-100 text-[15px] leading-relaxed">
                Delivery instructions have been sent to your Dealer — <span className="font-bold text-white">{dealerName}</span>.<br />
                Please contact your Dealer for further proceedings regarding vehicle delivery and registration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-2xl opacity-70">
              <i className="ri-phone-fill"></i>
            </div>
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-0.5">Dealer Contact</p>
              <p className="text-white font-bold text-[15px]">{dealerName.split(',')[0]} — {dealerContact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Account Summary Card */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="p-6">
          <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4">Loan Account Summary</h4>

          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
              <span className="text-slate-500 text-sm font-medium">Loan Account No.</span>
              <span className="text-slate-900 font-bold font-mono text-sm">{loanSummary.accountNo}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
              <span className="text-slate-500 text-sm font-medium">Approved Amount</span>
              <span className="text-slate-900 font-bold text-sm">{loanSummary.approvedAmount}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 bg-blue-50/50">
              <span className="text-[#3446C4] text-sm font-bold">Net Disbursement to Dealer</span>
              <span className="text-[#3446C4] font-bold text-sm">{loanSummary.netDisbursement}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
              <span className="text-slate-500 text-sm font-medium">Interest Rate</span>
              <span className="text-slate-900 font-bold font-mono text-sm">{loanSummary.interestRate}</span>
            </div>

            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-slate-500 text-sm font-medium">First EMI</span>
              <span className="text-slate-900 font-bold font-mono text-sm">{loanSummary.firstEmi}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SanctionDetailsStep;

registerStepComponent("CUSTOMER_LOAN_SANCTION", SanctionDetailsStep);
