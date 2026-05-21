import { X } from "lucide-react";
import { Input, Label } from "@craft-apex/ui";
import type { ArithmeticLeaf, FieldOption } from "./types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

const FIELD_TYPES = [
  { value: "Parameter", label: "Parameter" },
  { value: "Value", label: "Value" },
];

interface Props {
  condition: ArithmeticLeaf;
  fieldOptions: FieldOption[];
  disabled?: boolean;
  onChange: (next: ArithmeticLeaf) => void;
  onRemove?: () => void;
}

export function ArithmeticLeafRow({
  condition,
  fieldOptions,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const fieldType = condition.field_type ?? "";

  return (
    <div className="grid grid-cols-12 items-end gap-3 rounded-md bg-slate-50/40 p-3">
      <div className="col-span-12 sm:col-span-4">
        <Label className="text-xs font-medium text-slate-600">Field</Label>
        <select
          className={selectClass}
          disabled={disabled}
          value={fieldType}
          onChange={(e) =>
            onChange({
              ...condition,
              field_type: e.target.value as ArithmeticLeaf["field_type"],
            })
          }
        >
          <option value="">Select</option>
          {FIELD_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-10 sm:col-span-7">
        <Label className="text-xs font-medium text-slate-600">
          Value <span className="text-rose-500">*</span>
        </Label>
        {fieldType === "Parameter" ? (
          <select
            className={selectClass}
            disabled={disabled}
            value={condition.field ?? ""}
            onChange={(e) => onChange({ ...condition, field: e.target.value })}
          >
            <option value="">Select</option>
            {fieldOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            disabled={disabled}
            value={condition.value ?? ""}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder="Enter Value"
          />
        )}
      </div>

      {onRemove && (
        <div className="col-span-2 sm:col-span-1 flex justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            aria-label="Remove"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
