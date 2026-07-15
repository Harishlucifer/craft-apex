import { registerStepComponent, type StepComponentProps } from "@craft-apex/workflow-runtime";
import type { ApplicationDetail } from "../application-detail/application-detail.types";

export interface ConsumerLenderApplyStepContext {
  applicationId: string;
  applicationDetail?: ApplicationDetail;
}

// Custom step components for the lender apply workflow will be registered here.
// Example:
// registerStepComponent("OFFER_DETAIL_CAPTURE", OfferDetailCaptureStep);
