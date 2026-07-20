import { Field, FormState } from "../types";

// Utility to set nested value in an object given a path
export const setNestedValue = (obj: Record<string, any>, path: string, value: any): Record<string, any> => {
    if (!path || typeof path !== 'string') {
        return obj;
    }

    const keys = path.split('.');

    return keys.reduce((acc, key, index) => {
        if (key.includes('[')) {
            const [arrayKey, arrayIndex] = key.replace(']', '').split('[') as [string, string];
            if (!acc[arrayKey]) acc[arrayKey] = [];
            if (!acc[arrayKey][arrayIndex]) acc[arrayKey][arrayIndex] = {};

            if (index === keys.length - 1) {
                acc[arrayKey][arrayIndex] = value;
                return obj;
            }

            return acc[arrayKey][arrayIndex];
        }

        if (index !== keys.length - 1 && (typeof acc[key] !== 'object' || acc[key] === null)) {
            acc[key] = {};
        }

        if (index === keys.length - 1) {
            acc[key] = value;
        }

        return acc[key];
    }, obj);
};

export const flattenObject = (
    data: Record<string, any>,
    parentKey: string = '',
    res: Record<string, any> = {}
): Record<string, any> => {
    if (!data || typeof data !== 'object') return res;

    for (let key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const newKey = parentKey ? `${parentKey}.${key}` : key;

            if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
                flattenObject(data[key], newKey, res);
            } else if (Array.isArray(data[key])) {
                if (data[key].length > 0 && data[key].every((item: any) => typeof item === 'object' && item !== null)) {
                    data[key].forEach((item: any, index: number) => {
                        flattenObject(item, `${newKey}[${index}]`, res);
                    });
                } else {
                    res[newKey] = data[key];
                }
            } else {
                res[newKey] = data[key];
            }
        }
    }
    return res;
};

// Utility to get all fields from a form JSON structure
interface FormSection {
    fields: any[];
}

interface FormJson {
    sections?: FormSection[];
    fields?: any[];
}

export const getAllFields = (formJson: FormJson): any[] => {
    if (formJson.sections) {
        return formJson.sections.reduce((acc: any[], section: FormSection) => acc.concat(section.fields), []);
    }
    return formJson.fields || [];
};

export const isRecordNotEmpty = (record: Record<string, any>): boolean => {
    return Object.keys(record).length > 0;
}

export const AmountExtractor = (amount: number) => {
    return amount >= 1000
        ? Intl.NumberFormat('en-IN').format(amount)
        : amount.toString();
};

export const replacePayloadValues = (payload: any, index: number, values: Record<string, any>): any => {
    if (typeof payload === 'string') {
        // Replace {index} if present
        payload = payload.replace('{index}', index.toString());

        // If the payload starts with $, replace it with the corresponding value from `values`
        if (payload.startsWith('$')) {
            const key = payload.slice(1);
            return values[key] !== undefined ? values[key] : null;
        }
        return payload;
    } else if (Array.isArray(payload)) {
        // Recursively handle arrays
        return payload.map(item => replacePayloadValues(item, index, values));
    } else if (typeof payload === 'object' && payload !== null) {
        // Recursively handle objects
        const updatedPayload: any = {};
        for (const key in payload) {
            if (payload.hasOwnProperty(key)) {
                updatedPayload[key] = replacePayloadValues(payload[key], index, values);
            }
        }
        return updatedPayload;
    }
    // Return the value as-is if it is neither string, array, nor object
    return payload;
};

export const updateFieldIndex = (key: string, indexToRemove: number): string | null => {
    const match = key.match(/(\w+)\[(\d+)\]/);
    if (match) {
        let fieldIndex = parseInt(match[2]!, 10);
        const fieldName = match[1];

        if (fieldIndex === indexToRemove) {
            return null; // Remove this field
        } else if (fieldIndex > indexToRemove) {
            fieldIndex -= 1; // Decrease the index of subsequent fields
            return key.replace(/(\w+)\[\d+\]/, `${fieldName}[${fieldIndex}]`);
        }
    }
    return key; // Keep the key unchanged if no match is found
};

export const convertDataType = (dataType: string, value: any): any => {
    let _value = value
    if (Array.isArray(value)) {
        // Check if it's an array of primitives (string/number) or objects
        if (value.every((item) => typeof item === "string" || typeof item === "number")) {
            _value = value.map((item) => {
                switch (dataType) {
                    case "int":
                        return parseInt(item as string); // Convert string to number
                    case "string":
                        return item.toString(); // Convert number to string
                    default:
                        return item;
                }
            });
        }
    } else {
        // Handle single value conversion
        switch (dataType) {
            case "int":
                _value = parseInt(value);
                break;
            case "string":
                _value = value.toString();
                break;
        }
    }

    return _value
}

export const getNestedValue = <T>(obj: Record<string, any>, path: string): T | undefined => {
    return path.split('.').reduce((acc: any, key: string) => {
        return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
};

export const removeFieldAtIndex = (allFields: Field[], indexToRemove: number): Field[] => {
    return allFields
        .filter((field) => {
            const match = field.name.match(/(\w+)\[(\d+)\]/);
            if (match) {
                const fieldIndex = parseInt(match[2]!, 10);
                return fieldIndex !== indexToRemove;
            }
            return true;
        })
        .map((field) => {
            const fieldCopy = { ...field };
            const match = field.name.match(/(\w+)\[(\d+)\]/);
            if (match) {
                let fieldIndex = parseInt(match[2]!, 10);
                const key = match[1]!;
                if (fieldIndex > indexToRemove) {
                    fieldIndex -= 1;
                    fieldCopy.name = field.name.replace(/(\w+)\[\d+\]/, `${key}[${fieldIndex}]`);

                    if (fieldCopy?.dependentOn && Array.isArray(fieldCopy?.dependentOn)) {
                        fieldCopy.dependentOn = fieldCopy.dependentOn.map((dependency) =>
                            dependency.replace(/(\w+)\[\d+\]/, `${key}[${fieldIndex}]`)
                        );
                    }

                    if (fieldCopy?.conditionalOn) {
                        if (fieldCopy.conditionalOn.field.includes(key)) {
                            fieldCopy.conditionalOn.field = fieldCopy.conditionalOn.field.replace(/(\w+)\[\d+\]/, `${key}[${fieldIndex}]`);
                        }
                    }
                }
            }
            return fieldCopy;
        });
};

export const hasNullValue = (obj: Record<string, any>): boolean => {
    if (!obj || typeof obj !== 'object') return false;

    for (const key in obj) {
        if (obj[key] === null) {
            return true; // Found a null value
        }
        if (typeof obj[key] === 'object' && hasNullValue(obj[key])) {
            return true; // Recursively check nested objects
        }
    }

    return false; // No null values found
};
