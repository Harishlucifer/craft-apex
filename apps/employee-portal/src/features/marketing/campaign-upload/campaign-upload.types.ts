// Campaign Upload list — GET /alpha/v1/marketing/campaign/upload?attribution=…
// Response: { result: CampaignUploadRow[] }

export interface CampaignUploadRow {
  upload_id?: string;
  campaign_id?: string;
  data_source?: string;
  /** Public download URL of the uploaded file. */
  uploaded_file?: string | null;
  /** Name of the employee/user who uploaded (backend uploaded_by). */
  uploaded_by?: string;
  /** Upload timestamp, "YYYY-MM-DD HH:mm:ss". */
  uploaded_at?: string;
  /** QUEUED | IN_PROGRESS | COMPLETED | FAILED (backend UploadStatusToString). */
  status?: string;
}
