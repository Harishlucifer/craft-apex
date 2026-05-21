import { Plus, X } from "lucide-react";
import { Button, Label } from "@craft-apex/ui";
import { LeafConditionRow } from "./leaf-condition";
import {
  isLeaf,
  type AnyCondition,
  type FieldOption,
  type GroupCondition,
  type LeafCondition,
} from "./types";

interface Props {
  condition: GroupCondition;
  fieldOptions: FieldOption[];
  isGroupVisible?: boolean;
  isOperatorDisabled?: boolean;
  disabled?: boolean;
  onChange: (next: GroupCondition) => void;
  onRemove?: () => void;
  level?: number;
}

const selectClass =
  "h-9 w-full max-w-[180px] rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export function QueryBuilder({
  condition,
  fieldOptions,
  isGroupVisible,
  isOperatorDisabled,
  disabled,
  onChange,
  onRemove,
  level = 0,
}: Props) {
  const updateChild = (index: number, next: AnyCondition) => {
    const conditions = [...condition.conditions];
    conditions[index] = next;
    onChange({ ...condition, conditions });
  };

  const removeChild = (index: number) => {
    const conditions = condition.conditions.filter((_, i) => i !== index);
    onChange({ ...condition, conditions });
  };

  const addLeaf = () => {
    const leaf: LeafCondition = { field: "", operator: "eq", value: "" };
    onChange({ ...condition, conditions: [...condition.conditions, leaf] });
  };

  const addGroup = () => {
    const group: GroupCondition = { operator: "AND", conditions: [] };
    onChange({ ...condition, conditions: [...condition.conditions, group] });
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-end gap-3">
        {!isOperatorDisabled && (
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-600">Operator</Label>
            <select
              className={selectClass}
              disabled={disabled}
              value={condition.operator}
              onChange={(e) =>
                onChange({ ...condition, operator: e.target.value })
              }
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={addLeaf}
        >
          <Plus className="h-3.5 w-3.5" /> Add Condition
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
          No conditions yet.
        </p>
      ) : (
        <div className="space-y-3">
          {condition.conditions.map((child, idx) => (
            <div key={idx}>
              {isLeaf(child) ? (
                <LeafConditionRow
                  condition={child}
                  fieldOptions={fieldOptions}
                  disabled={disabled}
                  onChange={(next) => updateChild(idx, next)}
                  onRemove={() => removeChild(idx)}
                />
              ) : (
                <div className="ml-3 border-l-2 border-slate-200 pl-3">
                  <QueryBuilder
                    condition={child}
                    fieldOptions={fieldOptions}
                    isGroupVisible={isGroupVisible}
                    isOperatorDisabled={isOperatorDisabled}
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
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-600">
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
