import { registerStepComponent, type StepComponentProps } from "@/features/workflow-runtime";
import EmployeeAddressStep from "./employee-address.step";
import EmployeeTerritoryMapStep from "./employee-territory-map.step";
import EmployeeAllocationStep from "./employee-allocation.step";

export interface EmployeeStepContext {
  employeeId: string;
  employeeName?: string;
  employee?: { username?: string; id?: string | number };
  onAllocationSave: () => void;
}

function AddressStep({ onNext, onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<EmployeeStepContext>;
  return (
    <EmployeeAddressStep
      employeeId={ctx.employeeId ?? ""}
      onBack={onBack}
      onNext={onNext}
    />
  );
}

function TerritoryStep({ onNext, onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<EmployeeStepContext>;
  return (
    <EmployeeTerritoryMapStep
      employeeId={ctx.employeeId ?? ""}
      employeeName={ctx.employeeName}
      onBack={onBack}
      onNext={onNext}
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
