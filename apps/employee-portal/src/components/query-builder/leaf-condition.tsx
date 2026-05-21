import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input, Label } from "@craft-apex/ui";
import {
  fetchReferenceOptions,
  useOperators,
  type ReferenceOption,
} from "./api";
import type { FieldOption, LeafCondition } from "./types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

interface Props {
  condition: LeafCondition;
  fieldOptions: FieldOption[];
  disabled?: boolean;
  onChange: (next: LeafCondition) => void;
  onRemove?: () => void;
}

const isContainsOp = (op: string) => op.toLowerCase().includes("contains");

export function LeafConditionRow({
  condition,
  fieldOptions,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const { data: operators = [] } = useOperators();
  const [refOptions, setRefOptions] = useState<ReferenceOption[]>([]);
  const [isReference, setIsReference] = useState(false);

  const refreshReference = async (paramCode: string) => {
    setRefOptions([]);
    const paramData = fieldOptions.find((f) => f.value === paramCode);
    if (paramData?.type === "REFERENCE_MASTER" && paramData.reference_table) {
      setIsReference(true);
      try {
        const list = await fetchReferenceOptions({
          table: paramData.reference_table,
          label: paramData.reference_label ?? "",
          column: paramData.reference_column ?? "",
          condition: paramData.reference_condition,
        });
        setRefOptions(list);
      } catch {
        setRefOptions([]);
      }
    } else {
      setIsReference(false);
    }
  };

  useEffect(() => {
    if (condition.field) {
      refreshReference(condition.field);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition.field]);

  const handleField = (code: string) => {
    const hit = fieldOptions.find((f) => f.value === code);
    onChange({
      ...condition,
      field: code,
      param_name: hit?.label ?? hit?.param_name,
    });
  };

  const handleOperator = (op: string) => {
    onChange({ ...condition, operator: op || "eq" });
  };

  const handleValueText = (v: string) => {
    const next: LeafCondition = { ...condition };
    delete next.values;
    next.value = v;
    onChange(next);
  };

  const handleSingleSelect = (v: string) => {
    const next: LeafCondition = { ...condition };
    delete next.values;
    next.value = v;
    onChange(next);
  };

  const handleMultiSelect = (values: string[]) => {
    const next: LeafCondition = { ...condition };
    delete next.value;
    next.values = values;
    onChange(next);
  };

  const contains = isContainsOp(condition.operator || "");

  return (
    <div className="grid grid-cols-12 items-end gap-3 rounded-md bg-slate-50/40 p-3">
      <div className="col-span-12 sm:col-span-4 lg:col-span-3">
        <Label className="text-xs font-medium text-slate-600">
          Field Name <span className="text-rose-500">*</span>
        </Label>
        <select
          className={selectClass}
          disabled={disabled}
          value={condition.field ?? ""}
          onChange={(e) => handleField(e.target.value)}
        >
          <option value="">Select</option>
          {fieldOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-12 sm:col-span-4 lg:col-span-3">
        <Label className="text-xs font-medium text-slate-600">
          Operator <span className="text-rose-500">*</span>
        </Label>
        <select
          className={selectClass}
          disabled={disabled}
          value={condition.operator ?? "eq"}
          onChange={(e) => handleOperator(e.target.value)}
        >
          {operators.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-10 sm:col-span-3 lg:col-span-5">
        <Label className="text-xs font-medium text-slate-600">
          Value <span className="text-rose-500">*</span>
        </Label>
        {isReference ? (
          contains ? (
            <select
              multiple
              disabled={disabled}
              value={condition.values ?? []}
              onChange={(e) =>
                handleMultiSelect(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="h-24 w-full rounded-md border border-input bg-white px-3 py-1 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            >
              {refOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              className={selectClass}
              disabled={disabled}
              value={condition.value ?? ""}
              onChange={(e) => handleSingleSelect(e.target.value)}
            >
              <option value="">Select</option>
              {refOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )
        ) : (
          <Input
            disabled={disabled}
            value={condition.value ?? ""}
            onChange={(e) => handleValueText(e.target.value)}
            placeholder="Value"
          />
        )}
      </div>

      {onRemove && (
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            aria-label="Remove condition"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
