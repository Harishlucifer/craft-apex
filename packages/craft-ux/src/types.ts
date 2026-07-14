// types.ts

// Define the Field interface
export interface Field {
    fieldStyle?: string | undefined;
    name: string;
    dataType?: string | undefined;
    label?: string;
    placeholder?: string;
    formatter?: string;
    fieldType?: string;
    hidden?: boolean | undefined;
    defaultValue?: string | number | undefined;
    disabledOn?: ConditionalOn;
    disabled?: boolean | undefined;
    dependentOn?: string[];
    validation?: {
        conditionalOn?: ConditionalOn,
        required?: boolean;
        message?: string;
        regex?: {
            pattern: string;
            message?: string;
        };
        minLength?: number;
        maxLength?: number;
        min?: string;
        max?: string;
    };
    autoFill?: AutoFill[];
    options?: Option[];
    source?: {
        api?: string;
        alwayRefresh?: boolean;
        labelKey?: string;
        valueKey?: string;
        options?: Option[];
    };
    conditionalOn?: ConditionalOn,
    addMore?: FormDefinition
}

export interface AutoFill {
    condition?: ConditionalOn;
    mappings: {
        dataType?: string;
        sourceValue?: any;
        sourceField?: string;
        targetField: string;
        type: string;
    }[];
}

export interface RequestAction {
    endpoint?: string;
    method?: string;
    deleteKey?: string;
    payload?: object
}

export interface ConditionalOn {
    field: string,
    values: (string | number)[],
    conditionalValueKey?: string
    operator?: string,
    regex?: {
        pattern: string;
        message?: string;
    },
}

// Define the FormState interface
export interface FormState {
    values: Record<string, Record<string, any>>;
    options: Record<string, any>;
    errors: Record<string, Record<string, string>>;
    allFields: Field[];
    touched: Record<string, Record<string, boolean>>;
    submitted: Record<string, boolean>;
    formDefinitions: Record<string, any>;
    dependentValues: Record<string, Record<string, any>>;
    fieldsDisabled: Record<string, boolean>;
    existingDataFlat: Record<string, any>;
    loading?: boolean;
    nestedObject?: Record<string, any> | null;
    optionsLoading: Record<string, any>, // Track options loading state for each field
    autoFillInProgress: Record<string, any>, // Track auto-fill in progress state for each field
    componentName: string
}

export interface Section {
    title: string;
    fields: Field[];
}

export interface Option {
    label: string;
    value: string | number;
}

export interface FormDefinition {
    title?: string;
    sections?: Section[];
    globalSectionStyle?: string | undefined;
    sectionStyle?: string | undefined;
    formStyle?: string | undefined;
    fields?: Field[];
    repeatable?: boolean;
    startWithIndex?: number;
    formValidation?: string;
    requestAction?: RequestAction
}

export interface DynamicFormProps {
    componentName: string;
    formJson: FormDefinition;
    existingObject?: any;
    includeSubmit?: boolean;
    onSubmitSuccess?: (data: any) => void;
}

export interface DynamicFieldProps {
    fieldKey: string;
    field: Field;
    value?: any;
    onChange: (value: string | number | (string | number)[] | undefined) => void;  // The function to call when input changes
    error?: string;  // Validation error message
    disabled?: boolean;
    options?: Option[];
    componentName?: string;
}