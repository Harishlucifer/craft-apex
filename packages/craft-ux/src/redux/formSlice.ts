// src/redux/formSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  flattenObject, setNestedValue, isRecordNotEmpty, AmountExtractor, removeFieldAtIndex,
  updateFieldIndex, replacePayloadValues, convertDataType, getNestedValue, hasNullValue
} from '../utils/utils';
// import axiosInstance from '../utils/axiosInstance'
import { Field, FormDefinition, FormState, RequestAction } from '../types'
import { AxiosInstance } from 'axios';
import cloneDeep from 'lodash.clonedeep';

// Initial state
const initialState: FormState = {
  values: {},
  options: {},
  errors: {},
  allFields: [],
  touched: {},
  submitted: {},
  formDefinitions: {},
  dependentValues: {},
  fieldsDisabled: {},
  existingDataFlat: {},
  nestedObject: null,
  optionsLoading: {}, // Track options loading state for each field
  autoFillInProgress: {}, // Track auto-fill in progress state for each field
  componentName: ""
};

export const processFieldLogic = createAsyncThunk(
  'form/processFieldLogic',
  async ({ axiosInstance, field, formValues }: { axiosInstance: AxiosInstance | null; field: Field; formValues: Record<string, any> }, { getState, dispatch }) => {
    const state = (getState() as { form: FormState }).form;

    if (field.fieldType?.includes("dropdown") || field.fieldType === 'text-auto-complete') {
      if (!state.optionsLoading[field.name]) {
        await dispatch(fetchFieldOptions({ axiosInstance, field, formValues }));
      }
    }

    if (field.autoFill && state.values[state.componentName]![field.name] && !state.autoFillInProgress[field.name]) {
      dispatch(handleAutoFill({ field }));
    }

    dispatch(validateField({ field }));
    dispatch(setDisable({ field }));
  }
);

export const fetchFieldOptions = createAsyncThunk(
  'form/fetchFieldOptions',
  async ({ axiosInstance, field, formValues }: { axiosInstance: AxiosInstance | null, field: Field; formValues: Record<string, any> }, { getState, dispatch }) => {
    const { api, labelKey = 'name', valueKey = 'id', options, alwayRefresh } = field.source || {};
    let url = api;
    const state = (getState() as { form: FormState }).form;

    let shouldFetch = !(state.options[field.name] && state.options[field.name].length > 0);
    let dependenciesMissing = false;

    if (field.dependentOn && field.dependentOn.length > 0) {
      field.dependentOn.forEach((dependency) => {
        const dependentValue = formValues[dependency];
        const lastValue = state.dependentValues[field.name]?.[dependency];

        if (!dependentValue) {
          dependenciesMissing = true;
        }

        if (dependentValue !== lastValue) {
          shouldFetch = true;
          dispatch(setDependentValue({ fieldName: field.name, dependencyName: dependency, value: dependentValue }));
        }
      });

      Object.keys(formValues).forEach((key) => {
        if (url && url.includes(`{{${key}}}`)) {
          url = url.replace(`{{${key}}}`, formValues[key]);
        }
      });
    }

    if (dependenciesMissing) {
      // console.log(`Skipping fetch for ${field.name} due to missing dependent values.`);
      return;
    }

    if (!shouldFetch && !alwayRefresh) {
      // console.log(`Skipping fetch for ${field.name} as options already exist and no dependencies changed.`);
      return;
    }

    if (url) {
      try {
        const response = await axiosInstance?.get<{ result?: any[]; data?: any[], results?: any[] }>(url);

        // Since the interceptor returns `response.data`, we now check for result in response itself
        const responseData = response?.data.result ?? response?.data.data ?? response?.data?.results ?? [];

        const optionsData = responseData.map((item: Record<string, any>) => ({
          label: item[labelKey],
          value: item[valueKey],
          item,
        }));

        dispatch(setFieldOptions({ name: field.name, options: optionsData }));
        // If the field has auto-fill logic, run it after fetching options
        if (field.autoFill) {
          dispatch(handleAutoFill({ field }));
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
        dispatch(setFieldOptions({ name: field.name, options: [] }));
      }
    } else if (options) {
      dispatch(setFieldOptions({ name: field.name, options }));
      // If the field has auto-fill logic, run it after fetching options
      if (field.autoFill) {
        dispatch(handleAutoFill({ field }));
      }
    }
  }
);

export const shouldRenderField = createAsyncThunk(
  'form/shouldRenderField',
  async (
    { field }: { field: Field },
    { getState, dispatch }
  ) => {
    const state = (getState() as { form: FormState }).form;

    if (field.hidden) {
      return false; // Skip rendering hidden fields
    }

    if (field.conditionalOn) {
      const { field: conditionalField, values, conditionalValueKey = 'value' } = field.conditionalOn;
      const selectedValue = state.values[conditionalField];
      const fieldOptions = state.options[conditionalField] || [];

      // Find the selected option for the conditional field
      const selectedOption = fieldOptions.find((option: any) => option.value == selectedValue);

      if (selectedOption) {

        // Check if the value (like `code` for loan_type) matches the condition
        return values.includes(selectedOption.item?.[conditionalValueKey]) || values.includes(selectedOption[conditionalValueKey]);
      }

      return false;
    }

    return true;
  }
);


export const submitAddMore = createAsyncThunk(
  'form/submitAddMore',
  async (
    { axiosInstance, data, requestAction, componentName }: { axiosInstance: AxiosInstance | null; data: any; requestAction: RequestAction; componentName: string },
    { getState, dispatch }
  ) => {
    const state = (getState() as { form: FormState }).form;
    let formValues = state.values[componentName]
    let url = requestAction.endpoint || ""; // Ensure url is initialized to an empty string if undefined
    Object.entries(formValues || {}).forEach(([key, value]) => {
      if (typeof value !== "undefined" && value !== null) {
        url = url.replace(`{{${key}}}`, String(value)); // Ensure value is a string before replacing
      }
    });

    if (url.length == 0 || url.includes("{{")) {
      return { status: 'failure', message: 'invalid endpoint ' + url };
    }

    try {
      const response = await axiosInstance?.post<{ status?: number; message?: string }>(url, data);

      if (response?.data.status) {
        return { status: 'success', message: response?.data.message || 'Item removed successfully.' };
      } else {
        return { status: 'failure', message: 'Failed to remove item.' };
      }
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      return { status: 'failure', message: error.message || 'An error occurred while removing the item.' };
    }
  }
);


export const removeMore = createAsyncThunk(
  'form/removeMore',
  async ({ axiosInstance, componentName, index }: { axiosInstance: AxiosInstance | null, componentName: string; index: number }, { getState, dispatch }) => {


    const state = (getState() as { form: FormState }).form;
    const requestAction = (state.formDefinitions[componentName] as FormDefinition).requestAction

    if (requestAction?.deleteKey) {
      const check = replacePayloadValues(requestAction?.deleteKey, index, state.values[state.componentName]!)
      if (check === null) {
        dispatch(handleRemoveMore({ componentName: componentName, indexToRemove: index }))
        return
      }
    }

    let payload = replacePayloadValues(requestAction?.payload, index, state.values[state.componentName]!)

    if (hasNullValue(payload)) {
      dispatch(handleRemoveMore({ componentName: componentName, indexToRemove: index }))
      return
    }

    try {
      const response = await axiosInstance?.delete<{ status?: number }>(requestAction?.endpoint!, {
        data: payload,
      });

      if (response?.data.status) {
        dispatch(handleRemoveMore({ componentName: componentName, indexToRemove: index }))
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  }
);

const extractFields = (formDefinition: any, index?: number): Field[] => {
  if (formDefinition.sections) {
    return formDefinition.sections.flatMap((section: any) => {
      if (formDefinition.repeatable) {
        return section.fields.map((field: Field) => {
          // Create a deep copy of the field
          // console.log("Field is frozen:", Object.isFrozen(field));
          const fieldCopy: Field = {
            ...field,
            name: field.name.includes("{index}")
              ? field.name.replace("{index}", (index ?? formDefinition.startWithIndex).toString())
              : field.name,
            source: field.source
              ? {
                ...field.source,
                api: field.source.api?.includes("{index}")
                  ? field.source.api.replace("{index}", (index ?? formDefinition.startWithIndex).toString())
                  : field.source.api,
              }
              : field.source,
            dependentOn: Array.isArray(field.dependentOn)
              ? field.dependentOn.map((dependency) =>
                dependency.includes("{index}")
                  ? dependency.replace("{index}", (index ?? formDefinition.startWithIndex).toString())
                  : dependency
              )
              : field.dependentOn,
            conditionalOn: field.conditionalOn
              ? {
                ...field.conditionalOn,
                field: field.conditionalOn.field.includes("{index}")
                  ? field.conditionalOn.field.replace("{index}", (index ?? formDefinition.startWithIndex).toString())
                  : field.conditionalOn.field,
              }
              : field.conditionalOn,
            autoFill: field.autoFill
              ? field.autoFill.map((autoFill) => ({
                ...autoFill, // Clone the autoFill object
                mappings: autoFill.mappings.map((mapping) => ({
                  ...mapping, // Clone each mapping object
                  sourceField: mapping.sourceField?.includes("{index}")
                    ? mapping.sourceField.replace("{index}", (index ?? formDefinition.startWithIndex).toString())
                    : mapping.sourceField,
                  targetField: mapping.targetField?.includes("{index}")
                    ? mapping.targetField.replace("{index}", (index ?? formDefinition.startWithIndex).toString())
                    : mapping.targetField,
                })),
                condition: autoFill.condition?.field?.includes("{index}")
                  ? {
                    ...autoFill.condition, // Clone the condition object
                    field: autoFill.condition.field.replace("{index}", (index ?? formDefinition.startWithIndex).toString()),
                  }
                  : autoFill.condition,
              }))
              : field.autoFill,
          };
          return fieldCopy;
        });
      }
      return section.fields;
    });
  }
  return formDefinition.fields || [];
};

const _setDisabled = (field: Field, state: FormState) => {
  let isDisabled = false;

  if (field.disabledOn) {
    const dependentFieldValue = state.values[state.componentName]?.[field.disabledOn.field];
    if (dependentFieldValue && field.disabledOn.values.includes(dependentFieldValue)) {
      isDisabled = true;
    }
  }

  if (field.disabled) {
    isDisabled = state.existingDataFlat?.[field.name] !== undefined;
    if (!isDisabled) {
      isDisabled = field?.defaultValue !== undefined;
    }
  }

  state.fieldsDisabled[field.name] = isDisabled;
};

const setDefaultValue = (field: Field, state: FormState) => {
  if (typeof field.defaultValue === 'string' && field.defaultValue.startsWith('$')) {
    const key = field.defaultValue.slice(1);
    if (state.values[state.componentName]![key]) {
      state.values[state.componentName]![field.name] = state.values[state.componentName]![key];
    }
  } else {
    state.values[state.componentName]![field.name] = field.defaultValue;
  }
};


const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    initializeForm(state, action: PayloadAction<{ formDefinition: any; existingData?: any; componentName: string }>) {
      const { formDefinition, existingData, componentName } = action.payload;
      // Use lodash.clonedeep for deep cloning
      state.componentName = componentName
      state.formDefinitions[componentName] = cloneDeep(formDefinition);

      if (formDefinition.startWithIndex > 0) {
        for (let index = 0; index <= formDefinition.startWithIndex; index++) {
          let _formDefinition = cloneDeep(formDefinition);
          let newFields = extractFields(_formDefinition, index);
          state.allFields.push(...newFields)
        }
      } else {
        let _formDefinition = cloneDeep(formDefinition);
        state.allFields = extractFields(_formDefinition);
      }

      if (!state.touched[state.componentName]) {
        state.touched[state.componentName] = {}
      }

      const isTouchedEmpty = Object.keys(state.touched[state.componentName]!).length === 0;

      if (!state.values[componentName]) {
        // state.values = {};
        state.values[componentName] = {};
      }

      if (existingData) {
        const flatData = flattenObject(existingData);
        state.existingDataFlat = flatData;

        Object.keys(flatData).forEach((key) => {
          state.values[state.componentName]![key] = flatData[key];
        });

        formDefinition.sections?.forEach((section: any) => {
          const sectionKey = section.fields[0]?.name.split('[')[0];

          const result = getNestedValue<any>(existingData, sectionKey);
          if (formDefinition?.repeatable && result) {
            const repeatableData = result;

            if (repeatableData && repeatableData.length > 0) {
              repeatableData.forEach((_: any, index: number) => {
                let clonedFormDefinition = cloneDeep(state.formDefinitions[componentName]);
                clonedFormDefinition.startWithIndex = index;

                let _clonedFormDefinition = cloneDeep(clonedFormDefinition);
                let newFields = extractFields(_clonedFormDefinition);
                state.formDefinitions[componentName] = clonedFormDefinition;
                state.allFields.push(...newFields);
              });
            }
          }
        });

        state.allFields.forEach((field) => {
          if (field.defaultValue !== undefined && !state.values[field.name]) {
            setDefaultValue(field, state);
          }
          _setDisabled(field, state);
        });
      } else {
        state.allFields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            setDefaultValue(field, state);
          }
          _setDisabled(field, state);
        });
      }
    },

    setFieldValue(state, action: PayloadAction<{ name: string; value: any }>) {
      const { name, value } = action.payload;
      state.values[name] = value;
    },

    setFieldOptions(state, action: PayloadAction<{ name: string; options: any[] }>) {
      const { name, options } = action.payload;
      state.options[name] = options;
    },

    setFieldError(state, action: PayloadAction<{ name: string; error: string }>) {
      const { name, error } = action.payload;
      state.errors[state.componentName]![name] = error;
    },

    clearValidationError(state) {
      state.errors[state.componentName] = {};
      state.touched[state.componentName] = {};
      state.submitted[state.componentName] = false;
    },

    setDisable(state, action: PayloadAction<{ field: Field }>) {
      const { field } = action.payload;
      _setDisabled(field, state);
    },

    validateField(state, action: PayloadAction<{ field: Field }>) {
      const { field } = action.payload;
      const formValues = state.values[state.componentName]!
      const value = formValues[field.name];
      const validation = field.validation;
      let error = '';
      if (!state.errors[state.componentName]) {
        state.errors[state.componentName] = {}
      }

      if (!state.touched[state.componentName]![field.name] && !state.submitted[state.componentName]) {
        return;
      }

      if (validation) {
        if (Array.isArray(value) && value.length === 0) {
          error = validation.message || `Please select at least one ${field.name}`;
        } else if (validation.required && (!value || value === '' || value === 0 || value === null)) {
          error = validation.message || `${field.label} is required`;
        }

        if (validation?.conditionalOn != undefined) {
          let _conditionalOn = validation?.conditionalOn;
          const conditionValue = state.values[state.componentName]![_conditionalOn.field];
          if (_conditionalOn.values.includes(conditionValue)) {
            if (_conditionalOn.regex != undefined) {
              const regex = new RegExp(_conditionalOn.regex?.pattern!);
              if (!regex.test(value)) {
                error = _conditionalOn?.regex.message! || `${field.label} is not valid`;
              }
            } else if (value === undefined || value?.length === 0) {
              error = validation.message || `${field.label} is required`;
            }
          } else if (validation.regex && value) {
            const regex = new RegExp(validation.regex.pattern);
            if (!regex.test(value)) {
              error = validation.regex.message || `${field.label} is not valid`;
            }
          }
        } else if (validation.regex && value) {
          const regex = new RegExp(validation.regex.pattern);
          if (!regex.test(value)) {
            error = validation.regex.message || `${field.label} is not valid`;
          }
        }

        if (validation.minLength && value && value.length < validation.minLength) {
          error = validation.message || `${field.label} must be at least ${validation.minLength} characters`;
        }

        if (validation.maxLength && value && value.length > validation.maxLength) {
          error = validation.message || `${field.label} must not exceed ${validation.maxLength} characters`;
        }

        let max = validation.max
        let min = validation.min
        Object.entries(formValues || {}).forEach(([key, value]) => {
          if (typeof value !== "undefined" && value !== null && validation.min !== undefined && min?.includes("{{")) {
            min = min?.replace(`{{${key}}}`, String(value)); // Ensure value is a string before replacing
          }
          if (typeof value !== "undefined" && value !== null && validation.max !== undefined && max?.includes("{{")) {
            max = max?.replace(`{{${key}}}`, String(value)); // Ensure value is a string before replacing
          }
        });

        if (min !== undefined && value && Number(value) < Number(min)) {
          error = validation.message || `${field.label} must be at least ${field.fieldType === "amount" ? AmountExtractor(Number(min)) : min}`;
        }

        if (max !== undefined && value && Number(value) > Number(max)) {
          error = validation.message || `${field.label} must not exceed ${field.fieldType === "amount" ? AmountExtractor(Number(max)) : max}`;
        }
      }

      state.errors[state.componentName]![field.name] = error;
    },

    handleChange(state, action: PayloadAction<{ field: Field; value: any }>) {
      const { field, value } = action.payload;
      console.log("value :: ", value)
      state.values[state.componentName]![field.name] = convertDataType(field.dataType!, value);
      state.touched[state.componentName]![field.name] = true;
      formSlice.caseReducers.validateField(state, {
        type: 'form/validateField',
        payload: { field }
      });
    },

    validateAllFields(state) {
      state.submitted[state.componentName] = true;
      state.errors[state.componentName] = {};
      state.allFields.forEach((field) => {
        formSlice.caseReducers.validateField(state, {
          type: 'form/validateField',
          payload: { field }
        });
      });
    },

    handleDynamicFormSubmit(state) {
      console.log("inside :: handleDynamicFormSubmit")
      formSlice.caseReducers.validateAllFields(state);

      const formErrors = state.errors[state.componentName]!;
      const formValues = state.values[state.componentName]!;

      // If there are any validation errors, return early
      if (Object.values(formErrors).some(error => error)) {
        console.log('Form has validation errors.');
        state.nestedObject = null
      } else {
        // Create a nested object from form values
        let nestedObject: Record<string, any> = {};
        Object.entries(formValues).forEach(([key, value]) => {
          setNestedValue(nestedObject, key, value);
        });

        console.log("formValues :: ", formValues)
        console.log("nestedObject :: ", nestedObject)

        if (isRecordNotEmpty(nestedObject)) {
          // Update Redux state with the constructed nested object
          state.nestedObject = nestedObject;

          console.log("nestedObject :: ", state.nestedObject)

          // Clear validation errors after form submission
          formSlice.caseReducers.clearValidationError(state)
        }
      }
    },

    handleAutoFill(state, action: PayloadAction<{ field: Field }>) {
      const { field } = action.payload;
      if (field.autoFill) {
        if (state.autoFillInProgress[field.name]) {
          // Skip if already in progress
          return;
        }

        state.autoFillInProgress[field.name] = true;

        field.autoFill.forEach((autoFill) => {
          const { condition, mappings } = autoFill;

          let move = true;
          if (condition?.values != undefined) {
            const conditionValue = state.values[state.componentName]![condition.field];
            move = condition.values.includes(conditionValue);
          }

          if (move) {
            mappings.forEach((mapping) => {
              let sourceValue;
              switch (mapping.type) {
                case 'option':
                  const selectedOption = state.options[field.name]?.find((option: any) => option.value == state.values[state.componentName]![field.name]);
                  if (selectedOption) {
                    sourceValue = selectedOption.item[mapping.sourceField!];
                  }
                  break;
                case 'constant':
                  sourceValue = mapping.sourceValue
                  break;
                case 'value':
                  sourceValue = state.values[state.componentName]![mapping.sourceField!];
                  break
                default:
                  console.log("auto file options not found :: ", mapping.type)
                  break;
              }

              sourceValue = convertDataType(mapping.dataType!, sourceValue)

              if (state.values[state.componentName]![mapping.targetField] !== sourceValue) {
                state.values[state.componentName]![mapping.targetField] = sourceValue;
              }
            });
          }
        })

        state.autoFillInProgress[field.name] = false;
      }
    },

    handleAddMore(state, action: PayloadAction<{ componentName: string; startWithIndex: number }>) {
      const { componentName, startWithIndex } = action.payload;

      // Clone the form definition immutably
      const formDefinition = state.formDefinitions[componentName];
      const clonedFormDefinition = {
        ...formDefinition,
        startWithIndex: startWithIndex + 1, // Increment the index immutably
      };

      // Extract new fields using the updated form definition
      const newFields = extractFields(clonedFormDefinition);

      // Update values for new fields with default values, if any
      const updatedValues = { ...state.values[state.componentName]! };
      newFields.forEach((field) => {
        if (field.defaultValue !== undefined && !updatedValues[field.name]) {
          updatedValues[field.name] = field.defaultValue;
        }
      });

      // Update state immutably
      state.formDefinitions[componentName] = clonedFormDefinition;
      state.values[state.componentName] = updatedValues;
      state.allFields = [...state.allFields, ...newFields];
    },

    handleRemoveMore(state, action: PayloadAction<{ componentName: string; indexToRemove: number }>) {
      const { componentName, indexToRemove } = action.payload;
      let _formDefinition = cloneDeep(state.formDefinitions[componentName]);
      let _fieldsToBeDeleted = extractFields(_formDefinition)
      let deletedFieldArray: string[] = [];
      _fieldsToBeDeleted.forEach((field) => {
        deletedFieldArray.push(field.name);

        if (field.autoFill && Array.isArray(field.autoFill)) {
          field.autoFill.forEach((autoFill) => {
            autoFill.mappings.forEach((mapping) => {
              if (mapping.targetField) {
                deletedFieldArray.push(mapping.targetField);
              }
            });
          });
        }
      });
      // return
      _formDefinition.startWithIndex = _formDefinition.startWithIndex - 1
      state.formDefinitions[componentName] = _formDefinition;
      // Update allFields using the removeFieldAtIndex function
      state.allFields = removeFieldAtIndex(state.allFields, indexToRemove);

      // Helper function to update state properties
      const updateStateKeys = (stateObj: Record<string, any>) => {
        Object.keys(stateObj).forEach((key) => {
          const updatedKey = updateFieldIndex(key, indexToRemove);
          if (updatedKey === null && deletedFieldArray.includes(key)) {
            delete stateObj[key]; // Remove the field if its index matches indexToRemove
          } else if (updatedKey !== null && updatedKey !== key) {
            stateObj[updatedKey] = stateObj[key];
            delete stateObj[key];
          }
        });
      };

      // Update values, options, errors, touched, dependentValues, fieldsDisabled, and existingDataFlat
      updateStateKeys(state.values[state.componentName]!);
      updateStateKeys(state.options);
      updateStateKeys(state.errors[state.componentName]!);
      updateStateKeys(state.touched[state.componentName]!);
      updateStateKeys(state.dependentValues);
      updateStateKeys(state.fieldsDisabled);
      updateStateKeys(state.existingDataFlat);
    },

    setDependentValue(
      state,
      action: PayloadAction<{ fieldName: string; dependencyName: string; value: any }>
    ) {
      const { fieldName, dependencyName, value } = action.payload;
      if (!state.dependentValues[fieldName]) {
        state.dependentValues[fieldName] = {};
      }
      state.dependentValues[fieldName][dependencyName] = value;
    }


  },
  extraReducers: (builder) => {
    builder.addCase(fetchFieldOptions.pending, (state, action) => {
      state.loading = true;
      const fieldName = action.meta.arg.field.name;
      state.optionsLoading[fieldName] = true;
    });

    builder.addCase(fetchFieldOptions.fulfilled, (state, action) => {
      state.loading = false;
      const fieldName = action.meta.arg.field.name;
      state.optionsLoading[fieldName] = false;
    });

    builder.addCase(fetchFieldOptions.rejected, (state, action) => {
      state.loading = false;
      const fieldName = action.meta.arg.field.name;
      state.optionsLoading[fieldName] = false;
    });
  },
});



export const {
  initializeForm,
  setFieldValue,
  setFieldOptions,
  validateField,
  validateAllFields,
  handleAutoFill,
  handleChange,
  handleAddMore,
  handleRemoveMore,
  setDependentValue,
  clearValidationError,
  setDisable,
  handleDynamicFormSubmit
} = formSlice.actions;
export default formSlice.reducer;


