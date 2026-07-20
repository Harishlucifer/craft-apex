import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  Badge,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@craft-apex/ui";
import type {
  ConditionalOn,
  FormDefinition,
  FormFieldDef,
  FormFieldOption,
} from "./form-builder.types";
import { useAsyncFieldOptions } from "./form-builder-options";

interface Props {
  formJson: FormDefinition;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

/**
 * Structured renderer for `step.configuration.form_builder` (FORM_BUILDER
 * ui_component). Walks sections/fields and renders inputs by `fieldType`,
 * honoring `conditionalOn` visibility, `disabledOn` disabling, and the
 * `validation.required` marker.
 *
 * Field type vocabulary mirrors legacy `craft-formbuilder`. Async option
 * sources (`source.api`) ARE supported via `useAsyncFieldOptions` — see
 * form-builder-options.ts for the verbatim port (default labelKey "name" /
 * valueKey "id", `{{dep}}` URL substitution, `dependentOn` refetch). Still
 * deferred: `addMore` nested forms, `autoFill` cross-field mappings, and
 * `repeatable` form-as-list mode.
 */
export function FormBuilderRenderer({ formJson, value, onChange }: Props) {
  const sections = useMemo(() => {
    if (formJson.sections && formJson.sections.length > 0) {
      return formJson.sections;
    }
    return [{ title: undefined, fields: formJson.fields ?? [] }];
  }, [formJson]);

  const setField = (name: string, next: unknown) => {
    onChange({ ...value, [name]: next });
  };

  return (
    <div className="space-y-5">
      {formJson.title && (
        <h4 className="text-sm font-semibold text-slate-800">
          {formJson.title}
        </h4>
      )}

      {sections.map((section, si) => (
        <section
          key={section.title ?? `section-${si}`}
          className="rounded-md border border-slate-200 bg-slate-50/30 p-4"
        >
          {section.title && (
            <h5 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {section.title}
            </h5>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <FieldSlot
                key={field.name}
                field={field}
                value={value[field.name]}
                allValues={value}
                onChange={(next) => setField(field.name, next)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface FieldSlotProps {
  field: FormFieldDef;
  value: unknown;
  allValues: Record<string, unknown>;
  onChange: (next: unknown) => void;
}

function FieldSlot({ field, value, allValues, onChange }: FieldSlotProps) {
  // Always call the hook so React's order-stable rules are satisfied. The hook
  // self-disables when the field has no `source.api`.
  const async = useAsyncFieldOptions(field, allValues);

  if (field.hidden) return null;
  if (
    field.conditionalOn &&
    !matchesCondition(field.conditionalOn, allValues)
  ) {
    return null;
  }

  const disabled =
    field.disabled === true ||
    (field.disabledOn ? matchesCondition(field.disabledOn, allValues) : false);
  const required = field.validation?.required === true;
  const placeholder = field.placeholder ?? field.label ?? field.name;
  const id = `field-${field.name}`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-slate-700">
        {field.label ?? field.name}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
        {async.isLoading && (
          <span className="ml-2 text-[10px] text-slate-400">loading…</span>
        )}
      </Label>
      <FieldInput
        id={id}
        field={field}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        resolvedOptions={async.options}
      />
    </div>
  );
}

interface FieldInputProps {
  id: string;
  field: FormFieldDef;
  value: unknown;
  disabled: boolean;
  placeholder: string;
  onChange: (next: unknown) => void;
  /** Pre-resolved options from useAsyncFieldOptions; takes priority over field.options. */
  resolvedOptions: FormFieldOption[];
}

function FieldInput({
  id,
  field,
  value,
  disabled,
  placeholder,
  onChange,
  resolvedOptions,
}: FieldInputProps) {
  const fieldType = field.fieldType ?? "text";
  const stringValue =
    value == null ? "" : typeof value === "string" ? value : String(value);

  switch (fieldType) {
    case "textarea":
      return (
        <textarea
          id={id}
          rows={4}
          value={stringValue}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-100 disabled:text-slate-500"
        />
      );

    case "password":
      return (
        <Input
          id={id}
          type="password"
          value={stringValue}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={field.validation?.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "mobile":
      return (
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          value={stringValue}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={field.validation?.maxLength ?? 10}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        />
      );

    case "amount":
    case "decimal":
    case "number":
      return (
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={
            fieldType === "amount" || fieldType === "decimal" ? "0.01" : "1"
          }
          value={stringValue}
          disabled={disabled}
          placeholder={placeholder}
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      );

    case "date":
    case "date-picker":
      return (
        <Input
          id={id}
          type="date"
          value={stringValue}
          disabled={disabled}
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "datetime-local":
      return (
        <Input
          id={id}
          type="datetime-local"
          value={stringValue}
          disabled={disabled}
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "month":
      return (
        <Input
          id={id}
          type="month"
          value={stringValue}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "checkbox":
      return (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            id={id}
            type="checkbox"
            checked={value === true || value === "true"}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#4C7DF0] focus:ring-[#4C7DF0]/30"
          />
          <span>{placeholder}</span>
        </label>
      );

    case "checkbox-group": {
      const opts =
        resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
      const arr = Array.isArray(value) ? (value as (string | number)[]) : [];
      const toggle = (v: string | number) =>
        onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
      return (
        <div className="flex flex-wrap gap-3">
          {opts.map((o) => (
            <label
              key={String(o.value)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={arr.includes(o.value)}
                disabled={disabled}
                onChange={() => toggle(o.value)}
                className="h-4 w-4 rounded border-slate-300 text-[#4C7DF0] focus:ring-[#4C7DF0]/30"
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    }

    case "radio": {
      const opts =
        resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
      return (
        <div className="flex flex-wrap gap-3">
          {opts.map((o) => (
            <label
              key={String(o.value)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-700"
            >
              <input
                type="radio"
                name={field.name}
                value={String(o.value)}
                checked={String(value ?? "") === String(o.value)}
                disabled={disabled}
                onChange={() => onChange(o.value)}
                className="h-4 w-4 border-slate-300 text-[#4C7DF0] focus:ring-[#4C7DF0]/30"
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    }

    case "dropdown":
    case "dropdown-search":
    case "text-auto-complete": {
      const opts =
        resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
      return (
        <select
          id={id}
          value={stringValue}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="">{placeholder}</option>
          {opts.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    case "dropdown-multi-select": {
      const opts =
        resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
      return (
        <MultiSelectFieldInput
          id={id}
          options={opts}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
        />
      );
    }

    case "file":
      return (
        <FileFieldInput
          id={id}
          value={stringValue}
          disabled={disabled}
          maxFileSizeKB={field.validation?.maxFileSizeKB}
          onChange={onChange}
        />
      );

    case "text":
    default:
      return (
        <Input
          id={id}
          type="text"
          value={stringValue}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={field.validation?.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

interface MultiSelectFieldInputProps {
  id: string;
  options: FormFieldOption[];
  /** Current value — an array of selected option values (string|number). */
  value: unknown;
  disabled: boolean;
  placeholder: string;
  onChange: (next: (string | number)[]) => void;
}

/**
 * Styled multi-select — replaces the raw native `<select multiple>` listbox
 * (which the browser renders as an ugly always-open grey box). Shows the
 * selected options as removable chips in a trigger, and a checkbox dropdown
 * (Popover) for picking. Values are stored as an array of the options' own
 * values, so the payload shape (e.g. loan-type `apply_capacity: string[]`) is
 * unchanged from the old native control.
 */
function MultiSelectFieldInput({
  id,
  options,
  value,
  disabled,
  placeholder,
  onChange,
}: MultiSelectFieldInputProps) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? (value as (string | number)[]) : [];
  const selectedStr = new Set(selected.map(String));

  const labelFor = (v: string | number) =>
    options.find((o) => String(o.value) === String(v))?.label ?? String(v);

  const toggle = (v: string | number) => {
    if (selectedStr.has(String(v))) {
      onChange(selected.filter((x) => String(x) !== String(v)));
    } else {
      onChange([...selected, v]);
    }
  };

  const remove = (v: string | number) =>
    onChange(selected.filter((x) => String(x) !== String(v)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className="flex min-h-[38px] w-full flex-wrap items-center gap-1 rounded-md border border-input bg-white px-2 py-1.5 text-left text-sm outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-100 disabled:text-slate-500"
        >
          {selected.length === 0 ? (
            <span className="px-1 text-slate-400">
              {placeholder || "Select…"}
            </span>
          ) : (
            selected.map((v) => (
              <Badge
                key={String(v)}
                variant="secondary"
                className="gap-1 pr-1 font-normal"
              >
                {labelFor(v)}
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${labelFor(v)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(v);
                    }}
                    className="rounded-sm p-0.5 hover:bg-slate-300/60"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </Badge>
            ))
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-64 w-[var(--radix-popover-trigger-width)] overflow-auto p-1"
      >
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-slate-400">No options</div>
        ) : (
          options.map((o) => {
            const checked = selectedStr.has(String(o.value));
            return (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => toggle(o.value)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-slate-100"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? "border-[#4C7DF0] bg-[#4C7DF0] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
                {o.label}
              </button>
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
}

interface FileFieldInputProps {
  id: string;
  /** Data-URI string once a file's been read, else "". */
  value: string;
  disabled: boolean;
  /** Reject files larger than this (KB); no limit when unset. */
  maxFileSizeKB?: number;
  onChange: (dataUri: string) => void;
}

/**
 * Reads a picked file as a base64 data URI (matches legacy's inline
 * FileReader pattern — e.g. Lender's Logo upload) and shows a small preview.
 * Kept as its own component (not inlined in the switch like other cases)
 * because it needs local state for the size-limit error message, which
 * FormBuilderRenderer has no other mechanism to surface per-field.
 */
function FileFieldInput({
  id,
  value,
  disabled,
  maxFileSizeKB,
  onChange,
}: FileFieldInputProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            setError(null);
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (maxFileSizeKB && file.size > maxFileSizeKB * 1024) {
              setError(`File size exceeds ${maxFileSizeKB}KB limit`);
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => onChange(String(reader.result ?? ""));
            reader.readAsDataURL(file);
          }}
          className="text-sm text-slate-600"
        />
        {value ? (
          <img
            src={value}
            alt="preview"
            className="h-12 rounded border border-slate-200 bg-white object-contain p-1"
          />
        ) : (
          <span className="text-xs text-slate-400">No file selected.</span>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function resolveOptions(field: FormFieldDef): FormFieldOption[] {
  return field.options ?? field.source?.options ?? [];
}

/**
 * Evaluate a ConditionalOn against the current form values. Mirrors legacy
 * craft-formbuilder semantics: the field is shown when the referenced
 * field's value is included in `values` (or matches `regex` if provided).
 */
function matchesCondition(
  cond: ConditionalOn,
  values: Record<string, unknown>,
): boolean {
  const target = values[cond.field];
  if (cond.regex?.pattern) {
    try {
      return new RegExp(cond.regex.pattern).test(String(target ?? ""));
    } catch {
      return false;
    }
  }
  if (Array.isArray(target)) {
    return target.some((t) => cond.values.map(String).includes(String(t)));
  }
  return cond.values.map(String).includes(String(target ?? ""));
}
