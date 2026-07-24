export interface BatchDetail {
  id: string;
  file_name: string;
  template_name?: string;
  template_version?: number;
  status: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  skip_rows: number;
  rows_processed?: number;
  requires_typed_confirmation?: boolean;
  typed_confirmation_threshold?: number;
  undo_window_expires_at?: string;
}

export interface FieldError {
  field: string;
  reason: string;
}

export interface BatchRowResult {
  row_number: number;
  raw_data: Record<string, unknown>;
  result: "VALID" | "ERROR" | "SKIP_DUPLICATE";
  field_errors?: FieldError[];
  dedupe_match_type?: string;
  dedupe_match_row_number?: number;
}
