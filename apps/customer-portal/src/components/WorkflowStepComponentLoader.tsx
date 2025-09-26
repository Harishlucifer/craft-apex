import { forwardRef } from "react";
import { MobileEmailOTP } from './MobileEmailOTP';
import { EligibilityResults } from './EligibilityResults';
import { ApplicationStatus } from './ApplicationStatus';
import { ApplicationData } from './workflow/DynamicStagesAndSteps';
import RecommendedOffers from "@/components/RecommendedOffers.tsx";
import FormBuilderRenderPage from "@/components/FormBuilderRenderPage.tsx";
import DocumentVerification from "@/components/DocumentVerification.tsx";

export interface Step {
    id: string;
    name: string;
    description: string;
    ui_component: string;
    sequence: number;
    [key: string]: any;
}

export interface StepComponentProps {
    step: Step;
    handleBack?: () => void;
    handleSubmitSuccess: (data: any) => any;
    data: any;
    isReturningCustomer?: boolean;
    onNext?: () => void;
    onBack?: () => void;
    onVerified?: () => void;
    onApplyNew?: () => void;
    onContinueApplication?: () => void;
}

const WorkflowStepComponentLoader = forwardRef<any, StepComponentProps>((props, ref) => {
    console.log('props', props);

    const stepProps = {
        step: props.step,
        handleSubmitSuccess: props.handleSubmitSuccess,
        handleBack: props.handleBack,
        ref: ref,
        data: props.data,
        onNext: props.onNext,
        onBack: props.onBack,
        onVerified: props.onVerified,
        onApplyNew: props.onApplyNew,
        onContinueApplication: props.onContinueApplication
    };

    switch (props.step.ui_component) {
        case "FORM_BUILDER":
            return <FormBuilderRenderPage {...stepProps} />
        case "MOBILE_EMAIL_OTP_VERIFICATION":
            return (
                <MobileEmailOTP
                    {...stepProps}
                />
            );
        case "ELIGIBILITY_RESULTS":
            return (
                <EligibilityResults 
                    applicationData={props.data || {} as ApplicationData}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "DOCUMENT_VERIFICATION":
            return (
                <DocumentVerification {...stepProps}/>
            );
        case "LENDER_RECOMMENDATION_OFFER_SELECTION":
            return (
                <RecommendedOffers {...stepProps} />
            );
        case "APPLICATION_STATUS":
            return (
                <ApplicationStatus 
                    applicationData={props.data || {} as ApplicationData}
                    onBack={props.onBack || (() => {})}
                />
            );
        default:
            return (
                <div className='flex align-middle justify-center my-60'>
                    <h3>{props.step.ui_component} - Component not found</h3>
                </div>
            );
    }
});

export default WorkflowStepComponentLoader;