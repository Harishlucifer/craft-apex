import { useMemo } from "react";
import { Input, Label } from "@craft-apex/ui";
import type {
  ConditionalOn,
  FormDefinition,
  FormFieldDef,
  FormFieldOption,
} from "./form-builder.types";

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
 * sources (`source.api`), `addMore` nested forms, `autoFill`, and `repeatable`
 * form mode are not yet supported — those fall back to the inputs they nest
 * under (e.g. an api-sourced dropdown shows its static `options` only).
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
      <Label htmlFor={id} className="text-xs font-medium text-slate-700">
        {field.label ?? field.name}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      <FieldInput
        id={id}
        field={field}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
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
}

function FieldInput({
  id,
  field,
  value,
  disabled,
  placeholder,
  onChange,
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
      const opts = resolveOptions(field);
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
      const opts = resolveOptions(field);
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
      const opts = resolveOptions(field);
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
      const opts = resolveOptions(field);
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
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-100 disabled:text-slate-500"
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
