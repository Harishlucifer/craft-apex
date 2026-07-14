import { registerStepComponent, type StepComponentProps } from "@/features/workflow-runtime";
import { Button } from "@craft-apex/ui";
import { SubLoanTypesPanel } from "./sub-loan-types-panel";
import type { SubLoanRow } from "./loan-type-form.types";

export interface LoanTypeStepContext {
  facilityOptions: { value: string; label: string }[];
  subLoans: SubLoanRow[];
  onSubLoansChange: (next: SubLoanRow[]) => void;
  onSave: () => void;
  saving: boolean;
}

function SubLoanTypesStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<LoanTypeStepContext>;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">Sub Loan Types</h2>
      <SubLoanTypesPanel
        facilityOptions={ctx.facilityOptions ?? []}
        rows={ctx.subLoans ?? []}
        onChange={ctx.onSubLoansChange ?? (() => {})}
      />
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => ctx.onSave?.()}
          disabled={ctx.saving}
        >
          {ctx.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

registerStepComponent("SUB_LOAN_TYPES", SubLoanTypesStep);
