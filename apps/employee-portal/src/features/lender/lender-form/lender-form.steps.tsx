import { registerStepComponent, type StepComponentProps } from "@craft-apex/workflow-runtime";
import { Button } from "@craft-apex/ui";
import { LenderLoanTypesPanel } from "./lender-loan-types-panel";
import { LenderContractsPanel } from "./lender-contracts-panel";
import type {
  LenderContractRow,
  LenderLoanTypeRow,
  LoanTypeMasterOption,
} from "./lender-form.types";

export interface LenderStepContext {
  loanTypeOptions: LoanTypeMasterOption[];
  loanTypes: LenderLoanTypeRow[];
  onLoanTypesChange: (next: LenderLoanTypeRow[]) => void;
  contracts: LenderContractRow[];
  onContractsChange: (next: LenderContractRow[]) => void;
  applyMethodOptions: { value: string; label: string }[];
  statusFetchMethodOptions: { value: string; label: string }[];
  contractTypeOptions: { value: string; label: string }[];
  linkTypeOptions: { value: string; label: string }[];
  onSaveLoanTypes: () => void;
  onSaveContracts: () => void;
  saving: boolean;
}

function LenderLoanTypesStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<LenderStepContext>;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">
        Lender Loan Types
      </h2>
      <LenderLoanTypesPanel
        loanTypeOptions={ctx.loanTypeOptions ?? []}
        rows={ctx.loanTypes ?? []}
        onChange={ctx.onLoanTypesChange ?? (() => {})}
      />
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => ctx.onSaveLoanTypes?.()}
          disabled={ctx.saving}
        >
          {ctx.saving ? "Saving…" : "Save & Next"}
        </Button>
      </div>
    </div>
  );
}

function LenderContractsStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<LenderStepContext>;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">
        Lender Contracts
      </h2>
      <LenderContractsPanel
        loanTypeOptions={ctx.loanTypeOptions ?? []}
        applyMethodOptions={ctx.applyMethodOptions ?? []}
        statusFetchMethodOptions={ctx.statusFetchMethodOptions ?? []}
        contractTypeOptions={ctx.contractTypeOptions ?? []}
        linkTypeOptions={ctx.linkTypeOptions ?? []}
        rows={ctx.contracts ?? []}
        onChange={ctx.onContractsChange ?? (() => {})}
      />
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => ctx.onSaveContracts?.()}
          disabled={ctx.saving}
        >
          {ctx.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

registerStepComponent("LENDER_LOAN_TYPES", LenderLoanTypesStep);
registerStepComponent("LENDER_CONTRACTS", LenderContractsStep);
