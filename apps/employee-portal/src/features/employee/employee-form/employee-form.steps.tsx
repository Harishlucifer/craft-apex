import {
  registerStepComponent,
  type StepComponentProps,
} from "@craft-apex/workflow-runtime";
import EmployeeAddressStep from "./employee-address.step";
import EmployeeTerritoryMapStep from "./employee-territory-map.step";
import EmployeeAllocationStep from "./employee-allocation.step";

export interface EmployeeStepContext {
  employeeId: string;
  employeeName?: string;
  employee?: { username?: string; id?: string | number };
  onAllocationSave: () => void;
  /** Execute the current workflow step (create its Task) + resume. Bespoke
   *  steps persist their own sub-entity, then call this so the step is tracked
   *  and the server advances the stepper. */
  advance?: (payload?: object) => Promise<unknown>;
}

// These bespoke steps persist their own sub-entity, then signal completion via
// `onNext` — which we route through `context.advance` so the step also executes
// (creating its Task) and the server resumes to the next step.
function AddressStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<EmployeeStepContext>;
  return (
    <EmployeeAddressStep
      employeeId={ctx.employeeId ?? ""}
      onBack={onBack}
      onNext={() => ctx.advance?.()}
    />
  );
}

function TerritoryStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<EmployeeStepContext>;
  return (
    <EmployeeTerritoryMapStep
      employeeId={ctx.employeeId ?? ""}
      employeeName={ctx.employeeName}
      onBack={onBack}
      onNext={() => ctx.advance?.()}
    />
  );
}

function AllocationStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<EmployeeStepContext>;
  return (
    <EmployeeAllocationStep
      employeeId={ctx.employeeId ?? ""}
      employee={ctx.employee ?? {}}
      onBack={onBack}
      onSave={ctx.onAllocationSave ?? (() => {})}
    />
  );
}

registerStepComponent("EMPLOYEE_ADDRESS", AddressStep);
registerStepComponent("TERRITORY_LOAN_MAP", TerritoryStep);
registerStepComponent("EMPLOYEE_ALLOCATION", AllocationStep);
