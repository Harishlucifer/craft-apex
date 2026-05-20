// Legacy craft-frontend/src/Components/Collections/Upload/index.js
// GET /alpha/v1/collection/upload -> { data: CollectionUploadRow[] }

export interface CollectionUploadRow {
  upload_id?: string | number;
  filename?: string;
  lender?: { name?: string } | string;
  lender_name?: string;
  is_processed?: boolean | number;
  uploaded_at?: string;
}
