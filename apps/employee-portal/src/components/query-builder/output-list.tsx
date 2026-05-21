import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { Button, Input, Label } from "@craft-apex/ui";
import { useOutputKeys } from "./api";
import { QueryBuilder } from "./query-builder";
import type { FieldOption, GroupCondition } from "./types";

// Legacy AccordionRuleItem hardcoded dropdowns.
const MODE_OPTIONS = [
  { value: "VIEW", label: "View" },
  { value: "EDIT", label: "Edit" },
  { value: "HIDE", label: "Hide" },
];
const ELIGIBILITY_OPTIONS = [
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  /** Whole rule object — root group's conditions[] are the "outputs". */
  value: GroupCondition;
  onChange: (next: GroupCondition) => void;
  fieldOptions: FieldOption[];
  /** Lookup group_code for the output keys; defaults to RULE_OUTPUT_PARAMETERS. */
  outputType?: string;
  /** Mode === "CHOOSE" disables editing (legacy). */
  mode?: "ADD" | "EDIT" | "CHOOSE" | "" | string;
}

export function OutputList({
  value,
  onChange,
  fieldOptions,
  outputType,
  mode,
}: Props) {
  const disabled = mode === "CHOOSE";
  const { data: outputKeys = [] } = useOutputKeys(outputType);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Each top-level child is one "output". Initialise with one if empty.
  useEffect(() => {
    if (value.conditions.length === 0) {
      onChange({
        ...value,
        conditions: [{ operator: "AND", output: {}, conditions: [] }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addOutput = () => {
    const next = [
      ...value.conditions,
      { operator: "AND", output: {}, conditions: [] } as GroupCondition,
    ];
    onChange({ ...value, conditions: next });
    setOpenIndex(next.length - 1);
  };

  const updateOutput = (index: number, next: GroupCondition) => {
    const conditions = [...value.conditions];
    conditions[index] = next;
    onChange({ ...value, conditions });
  };

  const removeOutput = (index: number) => {
    onChange({
      ...value,
      conditions: value.conditions.filter((_, i) => i !== index),
    });
    if (openIndex === index) setOpenIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          onClick={addOutput}
        >
          <Plus className="h-4 w-4" /> Add Output
        </Button>
      </div>

      <div className="space-y-2">
        {value.conditions.map((child, index) => {
          if (!("conditions" in child)) return null;
          const isOpen = openIndex === index;
          return (
            <OutputAccordion
              key={index}
              index={index}
              group={child as GroupCondition}
              isOpen={isOpen}
              disabled={disabled}
              outputKeys={outputKeys}
              fieldOptions={fieldOptions}
              onToggle={() => setOpenIndex(isOpen ? null : index)}
              onChange={(next) => updateOutput(index, next)}
              onRemove={() => removeOutput(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

function OutputAccordion({
  index,
  group,
  isOpen,
  disabled,
  outputKeys,
  fieldOptions,
  onToggle,
  onChange,
  onRemove,
}: {
  index: number;
  group: GroupCondition;
  isOpen: boolean;
  disabled?: boolean;
  outputKeys: { value: string; label: string }[];
  fieldOptions: FieldOption[];
  onToggle: () => void;
  onChange: (next: GroupCondition) => void;
  onRemove: () => void;
}) {
  // Output is stored as { [key]: value } — one pair max.
  const [keyName, valueName] = useMemo(() => {
    const entries = Object.entries(group.output ?? {});
    return entries[0] ?? ["", ""];
  }, [group.output]);

  const setOutputPair = (key: string, val: string) => {
    onChange({
      ...group,
      output: key ? { [key]: val } : {},
    });
  };

  const isModeOrEligibility = keyName === "MODE" || keyName === "ELIGIBILITY";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/40 px-4 py-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium text-slate-700"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Output {index + 1}
        </button>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-xs text-slate-500">Set</span>
          <select
            className={selectClass}
            disabled={disabled}
            value={keyName}
            onChange={(e) => setOutputPair(e.target.value, "")}
          >
            <option value="">Select</option>
            {outputKeys.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">As</span>
          {isModeOrEligibility ? (
            <select
              className={selectClass}
              disabled={disabled}
              value={valueName}
              onChange={(e) => setOutputPair(keyName, e.target.value)}
            >
              <option value="">Select</option>
              {(keyName === "MODE" ? MODE_OPTIONS : ELIGIBILITY_OPTIONS).map(
                (o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                )
              )}
            </select>
          ) : (
            <Input
              disabled={disabled || !keyName}
              value={valueName}
              onChange={(e) => setOutputPair(keyName, e.target.value)}
              className="max-w-xs"
            />
          )}
        </div>
        {index !== 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            aria-label="Remove output"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="p-4">
          <Label className="mb-2 block text-xs font-medium text-slate-600">
            Conditions
          </Label>
          <QueryBuilder
            condition={group}
            fieldOptions={fieldOptions}
            isGroupVisible
            disabled={disabled}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
