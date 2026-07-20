// Field-master form schema. Verbatim port of legacy `craft-formbuilder`
// (node_modules/craft-formbuilder/dist/types/types.d.ts), exposed on
// `step.configuration.form_builder` for FORM_BUILDER ui_component steps.

export interface FormFieldOption {
  label: string;
  value: string | number;
  item?: unknown;
}

export interface ConditionalOn {
  field: string;
  values: (string | number)[];
  conditionalValueKey?: string;
  operator?: string;
  regex?: { pattern: string; message?: string };
}

export interface FieldValidation {
  conditionalOn?: ConditionalOn;
  required?: boolean;
  message?: string;
  regex?: { pattern: string; message?: string };
  minLength?: number;
  maxLength?: number;
  min?: string;
  max?: string;
  /** `fieldType: "file"` only — reject files larger than this (KB). */
  maxFileSizeKB?: number;
}

export interface AutoFillMapping {
  dataType?: string;
  sourceValue?: unknown;
  sourceField?: string;
  targetField: string;
  type: "option" | "constant" | "value";
}

export interface AutoFill {
  condition?: ConditionalOn;
  mappings: AutoFillMapping[];
}

export interface FormFieldDef {
  fieldStyle?: string;
  name: string;
  dataType?: string;
  label?: string;
  placeholder?: string;
  formatter?: string;
  /**
   * Legacy vocabulary (extracted from craft-formbuilder.es.js):
   * "text" | "textarea" | "password" | "mobile" | "amount" | "decimal"
   * | "number" | "date" | "date-picker" | "datetime-local" | "month"
   * | "checkbox" | "checkbox-group" | "radio"
   * | "dropdown" | "dropdown-multi-select" | "dropdown-search"
   * | "text-auto-complete"
   *
   * Plus one addition beyond legacy, since this renderer's own base64
   * file-read logic didn't exist upstream: "file" (see
   * FieldValidation.maxFileSizeKB for its size-limit knob).
   */
  fieldType?: string;
  hidden?: boolean;
  defaultValue?: string | number;
  disabledOn?: ConditionalOn;
  disabled?: boolean;
  dependentOn?: string[];
  validation?: FieldValidation;
  autoFill?: AutoFill[];
  options?: FormFieldOption[];
  source?: {
    api?: string;
    alwayRefresh?: boolean;
    labelKey?: string;
    valueKey?: string;
    options?: FormFieldOption[];
  };
  conditionalOn?: ConditionalOn;
  addMore?: FormDefinition;
}

export interface FormSection {
  title?: string;
  fields: FormFieldDef[];
}

export interface FormDefinition {
  title?: string;
  sections?: FormSection[];
  globalSectionStyle?: string;
  sectionStyle?: string;
  formStyle?: string;
  fields?: FormFieldDef[];
  repeatable?: boolean;
  startWithIndex?: number;
  formValidation?: string;
  mandatoryFirstIndex?: boolean;
  maxIndex?: number;
  includeIndexCount?: boolean;
}

/**
 * Shape of `step.configuration` when `step.ui_component === "FORM_BUILDER"`.
 * Legacy: PartnerFlowWithDynamic passes `configuration?.form_builder` straight
 * into <DynamicForm formJson={…}/>.
 */
export interface FormBuilderStepConfiguration {
  form_builder?: FormDefinition;
  [key: string]: unknown;
}
