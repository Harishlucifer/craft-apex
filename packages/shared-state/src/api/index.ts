export * from './setup';
export * from './auth';
export * from './leads';
export * from './base';
export * from './TerritoryApi'
export { TerritoryApiService } from './TerritoryApi';

// Export specific classes to avoid conflicts
export { WorkflowAPI } from './WorkflowAPI';
export { LeadAPI } from './LeadAPI';
export { NotificationAPI } from './NotificationAPI';
export { ChecklistAPI } from './ChecklistAPI';
export { CreditBureauAPI } from './CreditBureauAPI';
export { LenderOfferAPI } from './LenderAPI';
export { UtilityAPI, utilityAPI } from './utility';

// Re-export workflow types from stores
export type {
  Step,
  Stage,
  Workflow,
  WorkflowInstance,
  StepComponentData,
  WorkflowState
} from '../stores';

export type {
  OtpRequest,
  OtpSendRequest,
  OtpVerifyRequest
} from './NotificationAPI';

export type {
    ChecklistItem,
    UploadDocumentResponse
} from './ChecklistAPI';

export type {
    CreditResponse
} from './CreditBureauAPI';

export type {
    OfferResponse,
    ApplyResponse
} from './LenderAPI';