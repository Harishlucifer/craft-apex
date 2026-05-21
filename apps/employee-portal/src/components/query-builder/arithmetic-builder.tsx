import { Plus, X } from "lucide-react";
import { Button, Label } from "@craft-apex/ui";
import { ArithmeticLeafRow } from "./arithmetic-leaf";
import {
  isArithmeticLeaf,
  type ArithmeticAny,
  type ArithmeticGroup,
  type ArithmeticLeaf,
  type FieldOption,
} from "./types";

const OPERATORS = [
  { value: "+", label: "+" },
  { value: "-", label: "-" },
  { value: "*", label: "*" },
  { value: "/", label: "/" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
];

const selectClass =
  "h-9 w-full max-w-[180px] rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  condition: ArithmeticGroup;
  fieldOptions: FieldOption[];
  isGroupVisible?: boolean;
  disabled?: boolean;
  onChange: (next: ArithmeticGroup) => void;
  onRemove?: () => void;
  level?: number;
}

export function ArithmeticBuilder({
  condition,
  fieldOptions,
  isGroupVisible,
  disabled,
  onChange,
  onRemove,
  level = 0,
}: Props) {
  const updateChild = (index: number, next: ArithmeticAny) => {
    const conditions = [...condition.conditions];
    conditions[index] = next;
    onChange({ ...condition, conditions });
  };

  const removeChild = (index: number) => {
    onChange({
      ...condition,
      conditions: condition.conditions.filter((_, i) => i !== index),
    });
  };

  const addLeaf = () => {
    const leaf: ArithmeticLeaf = { field: "", value: "", field_type: "" };
    onChange({ ...condition, conditions: [...condition.conditions, leaf] });
  };

  const addGroup = () => {
    const group: ArithmeticGroup = { operator: "+", conditions: [] };
    onChange({ ...condition, conditions: [...condition.conditions, group] });
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-slate-600">
            Arithmetic Expression
          </Label>
          <select
            className={selectClass}
            disabled={disabled}
            value={condition.operator}
            onChange={(e) =>
              onChange({ ...condition, operator: e.target.value })
            }
          >
            {OPERATORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={addLeaf}
        >
          <Plus className="h-3.5 w-3.5" /> Add Row
        </Button>
        {isGroupVisible && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={addGroup}
          >
            <Plus className="h-3.5 w-3.5" /> Add Group
          </Button>
        )}
        <span className="ml-auto" />
        {onRemove && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            aria-label="Remove group"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {condition.conditions.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-4 text-center text-xs text-slate-400">
          No expressions yet.
        </p>
      ) : (
        <div className="space-y-3">
          {condition.conditions.map((child, idx) => (
            <div key={idx}>
              {isArithmeticLeaf(child) ? (
                <ArithmeticLeafRow
                  condition={child}
                  fieldOptions={fieldOptions}
                  disabled={disabled}
                  onChange={(next) => updateChild(idx, next)}
                  onRemove={() => removeChild(idx)}
                />
              ) : (
                <div className="ml-3 border-l-2 border-slate-200 pl-3">
                  <ArithmeticBuilder
                    condition={child as ArithmeticGroup}
                    fieldOptions={fieldOptions}
                    isGroupVisible
                    disabled={disabled}
                    onChange={(next) => updateChild(idx, next)}
                    onRemove={() => removeChild(idx)}
                    level={level + 1}
                  />
                </div>
              )}
              {idx !== condition.conditions.length - 1 && (
                <div className="my-2 flex items-center gap-2 pl-3 text-xs">
                  <span className="text-slate-300">│</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                    {condition.operator}
                  </span>
                  <span className="text-slate-300">│</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
