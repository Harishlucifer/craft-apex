export type BatchStatus =
  | "UPLOADED"
  | "VALIDATING"
  | "VALIDATED"
  | "COMMITTING"
  | "COMMITTED"
  | "COMMIT_FAILED"
  | "UNDONE"
  | "DISCARDED"
  | "EXPIRED";

export interface BatchRow {
  id: string;
  file_name: string;
  template_name?: string;
  template_version?: number;
  status: BatchStatus;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  skip_rows: number;
  uploaded_at: string;
  committed_at?: string;
  undo_window_expires_at?: string;
}
