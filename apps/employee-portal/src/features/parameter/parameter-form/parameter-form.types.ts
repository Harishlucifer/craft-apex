// Legacy craft-frontend/src/pages/Parameter/AddParameter.js
// POST /alpha/v1/parameter         -> save (body shape below)
// GET  /alpha/v1/parameter/?id=X   -> { data: { data: [ParameterDetail] } }
// GET  /alpha/v1/parameter/table   -> { data: { data: Record<table, ColumnDef[]> } }
// GET  /alpha/v1/parameter/struct  -> { data: { data: Record<source, string[]> } }
// GET  /alpha/v1/lookup/group      -> { data: { data: Record<group_code, ...> } }
// Lookups: PARAMETER_TYPE, AGGREGATE_OPERATOR, PROGRAMMED_PARAMETER

import type {
  ArithmeticGroup,
  GroupCondition,
} from "@/components/query-builder";

export const ParameterRuleType = {
  Arithmetic: "ARITHMETIC",
  Aggregate: "AGGREGATE",
  Programmed: "PROGRAMMED",
} as const;

export interface ParameterDetail {
  id?: string | number;
  parameter_id?: string | number;
  name?: string;
  code?: string;
  type?: string;
  source_type?: string;
  source?: string;
  param_field?: string;
  status?: number;
  tags?: string[];
  reference_table?: string;
  reference_column?: string;
  reference_label?: string;
  reference_condition?: string;
  api_url?: string;
  token?: string;
  param_value?: string;
  conditions?: GroupCondition | ArithmeticGroup | null;
  query?: string | null;
  computed_params?: unknown;
  aggregate_operator?: string;
  operation?: string;
}

export interface ParameterSavePayload {
  id?: string | number;
  name: string;
  type: string;
  code?: string;
  source_type?: string;
  source?: string;
  param_field?: string;
  reference_table?: string;
  reference_column?: string;
  reference_label?: string;
  reference_condition?: string;
  api_url?: string;
  token?: string;
  param_value?: string;
  status: number;
  query?: string | null;
  conditions?: GroupCondition | ArithmeticGroup | null;
  computed_params?: Record<string, unknown>;
  aggregate_operator?: string;
  operation?: string | null;
}

export interface TableColumnDef {
  column: string;
  field: string;
}

export type TableSchema = Record<string, TableColumnDef[]>;
export type JsonStructSchema = Record<string, string[]>;
export type GroupCodeMap = Record<string, unknown>;

export interface ParameterLookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}
