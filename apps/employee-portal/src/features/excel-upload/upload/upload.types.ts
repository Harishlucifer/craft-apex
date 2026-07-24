export interface ActiveTemplateOption {
  id: string;
  name: string;
  version: number;
}

export interface UploadBatchResult {
  id: string;
  batch_uuid: string;
  status: string;
}
