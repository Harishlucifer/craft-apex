import { useMemo, useEffect } from "react";
import { Input, Label } from "@craft-apex/ui";
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

  // Seed default values on mount
  useEffect(() => {
    console.log("FIELDS IN RENDERER:", formJson.fields?.map(f => f.name));
    let changed = false;
    const nextValue = { ...value };
    const allFields = sections.flatMap((s) => s.fields);

    allFields.forEach((field) => {
      const defVal = field.defaultValue;
      if (defVal !== undefined && (nextValue[field.name] === undefined || nextValue[field.name] === "")) {
        if (typeof defVal === "string" && defVal.startsWith("$")) {
          const sourceKey = defVal.slice(1);
          if (nextValue[sourceKey] !== undefined && nextValue[sourceKey] !== "") {
            nextValue[field.name] = nextValue[sourceKey];
            changed = true;
          }
        } else {
          nextValue[field.name] = defVal;
          changed = true;
        }
      }
    });

    if (changed) {
      onChange(nextValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formJson]);

  const setField = (name: string, next: unknown, fieldDef?: FormFieldDef, option?: FormFieldOption) => {
    let newValues = { ...value, [name]: next };

    // Process autoFill definitions
    const autofills = fieldDef?.autoFill;
    if (autofills && Array.isArray(autofills)) {
      autofills.forEach((af: any) => {
        let conditionMet = true;
        if (af.condition) {
          conditionMet = matchesCondition(af.condition, newValues);
        }
        if (conditionMet && af.mappings) {
          af.mappings.forEach((mapping: any) => {
            if (mapping.type === "option" && option?.item) {
              newValues[mapping.targetField] = (option.item as Record<string, any>)[mapping.sourceField];
            } else if (mapping.type === "value") {
              newValues[mapping.targetField] = newValues[mapping.sourceField];
            } else if (mapping.type === "constant") {
              newValues[mapping.targetField] = mapping.sourceValue;
            }
          });
        }
      });
    }

    onChange(newValues);
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
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          {section.title && (
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
              <i className="ri-list-check text-blue-500 text-xl"></i>
              <h5 className="text-[13px] font-extrabold uppercase tracking-widest text-slate-700">
                {section.title}
              </h5>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {section.fields.map((field) => (
              <FieldSlot
                key={field.name}
                field={field}
                value={value[field.name]}
                allValues={value}
                onChange={(next, option) => setField(field.name, next, field, option)}
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
  onChange: (next: unknown, option?: FormFieldOption) => void;
}

function FieldSlot({ field, value, allValues, onChange }: FieldSlotProps) {
  // Always call the hook so React's order-stable rules are satisfied. The hook
  // self-disables when the field has no `source.api`.
  const async = useAsyncFieldOptions(field, allValues);

  if (field.hidden) return null;
  if (field.conditionalOn && !matchesCondition(field.conditionalOn, allValues)) {
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
      <Label htmlFor={id} className="mb-1.5 inline-block text-[13px] font-semibold text-slate-700">
        {field.label ?? field.name}
        {required && <span className="ml-0.5 text-rose-500 text-base leading-none relative top-[2px]">*</span>}
        {async.isLoading && (
          <span className="ml-2 text-[11px] text-blue-500 font-medium">
            <i className="ri-loader-4-line animate-spin inline-block mr-1"></i>loading…
          </span>
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
  onChange: (next: unknown, option?: FormFieldOption) => void;
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
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
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
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, ""))
          }
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
          step={fieldType === "amount" || fieldType === "decimal" ? "0.01" : "1"}
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
      const opts = resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
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
      const opts = resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
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

    case "text-auto-complete": {
      const opts = resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
      return (
        <>
          <Input
            id={id}
            type="text"
            list={`${id}-options`}
            value={stringValue}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => {
              const val = e.target.value;
              const matchingOpt = opts.find((o) => String(o.value) === val || String(o.label) === val);
              const finalVal = matchingOpt ? matchingOpt.value : val;
              onChange(finalVal, matchingOpt);
            }}
          />
          <datalist id={`${id}-options`}>
            {opts.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </datalist>
        </>
      );
    }

    case "dropdown":
    case "dropdown-search": {
      const opts = resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);

      let matchedValue = stringValue;
      if (stringValue && !opts.some((o) => String(o.value) === stringValue)) {
        const byLabel = opts.find((o) => String(o.label) === stringValue);
        if (byLabel) matchedValue = String(byLabel.value);
      }

      return (
        <select
          id={id}
          value={matchedValue}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            const matchedOpt = opts.find((o) => String(o.value) === val);
            onChange(val, matchedOpt);
          }}
          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-900 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
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
      const opts = resolvedOptions.length > 0 ? resolvedOptions : resolveOptions(field);
      const arr = Array.isArray(value)
        ? (value as (string | number)[]).map((v) => String(v))
        : [];
      return (
        <select
          id={id}
          multiple
          value={arr}
          disabled={disabled}
          onChange={(e) =>
            onChange(
              Array.from(e.target.selectedOptions).map((opt) => opt.value)
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-900 shadow-sm transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        >
          {opts.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

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
  values: Record<string, unknown>
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
    return target.some((t) =>
      cond.values.map(String).includes(String(t))
    );
  }
  return cond.values.map(String).includes(String(target ?? ""));
}
