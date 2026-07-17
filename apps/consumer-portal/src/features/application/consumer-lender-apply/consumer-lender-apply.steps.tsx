import { registerStepComponent, type StepComponentProps } from "@craft-apex/workflow-runtime";
import type { ApplicationDetail } from "../application-detail/application-detail.types";
import { KycVerification, SelfieVerification, AALinkBankDataFetch, TentativeKFS, FieldInvestigationRCU, Enach, FinalOfferSelection, PennyDrop, KFSAcceptance } from "@craft-apex/ui";

export interface ConsumerLenderApplyStepContext {
  applicationId: string;
  applicationDetail?: ApplicationDetail;
  lenderData?: any;
}

// Custom step components for the lender apply workflow will be registered here.
registerStepComponent("KYC_VERIFICATION", (props: StepComponentProps) => (
  <KycVerification {...props} />
));

registerStepComponent("SELFIE_VERIFICATION", (props: StepComponentProps) => (
  <SelfieVerification {...props} />
));

registerStepComponent("AA_LINK_BANK_DATA_FETCH", (props: StepComponentProps) => (
  <AALinkBankDataFetch {...props} />
));

registerStepComponent("TENTATIVE_KFS", (props: StepComponentProps) => (
  <TentativeKFS {...props} />
));

registerStepComponent("FIELD_INVESTIGATION_RCU", (props: StepComponentProps) => (
  <FieldInvestigationRCU {...props} />
));

registerStepComponent("CONSUMER_ENACH", (props: StepComponentProps) => (
  <Enach {...props} />
));

registerStepComponent("FINAL_OFFER_SELECTION", (props: StepComponentProps) => (
  <FinalOfferSelection {...props} />
));

registerStepComponent("PENNY_DROP", (props: StepComponentProps) => (
  <PennyDrop {...props} />
));

registerStepComponent("KFS_ACCEPTANCE", (props: StepComponentProps) => (
  <KFSAcceptance {...props} />
));
