import { forwardRef } from "react";
import { MobileEmailOTP } from './MobileEmailOTP';
import { PersonalDetails } from './PersonalDetails';
import { IncomeDetails } from './IncomeDetails';
import { DocumentVerification } from './DocumentVerification';
import { ApplicationData } from './workflow/DynamicStagesAndSteps';
import FormBuilderRenderPage from "./FormBuilderRenderPage";
import LenderSelection from "@/components/LenderSelection.tsx";
import EligibilityResults from "@/components/EligibilityResults.tsx";

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
            return <FormBuilderRenderPage {...stepProps}  />
        case "MOBILE_EMAIL_OTP_VERIFICATION":
            return (
                <MobileEmailOTP
                    step={props.step}
                    handleSubmitSuccess={props.handleSubmitSuccess}
                    handleBack={props.handleBack}
                    data={props.data}
                    isReturningCustomer={props.isReturningCustomer}
                    onNext={props.onNext}
                    onBack={props.onBack}
                    onVerified={props.onVerified}
                    onApplyNew={props.onApplyNew}
                    onContinueApplication={props.onContinueApplication}
                />
            );
        case "PERSONAL_DETAILS":
            return (
                <PersonalDetails 
                    applicationData={props.data || {} as ApplicationData}
                    updateApplicationData={() => {}}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "INCOME_DETAILS":
            return (
                <IncomeDetails 
                    applicationData={props.data || {} as ApplicationData}
                    updateApplicationData={() => {}}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "DOCUMENT_VERIFICATION":
            return (
                <DocumentVerification
                    applicationData={props.data || {} as ApplicationData}
                    updateApplicationData={() => {}}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "CREDIT_BUREAU_CONSUMER":
            return (
            <EligibilityResults {...stepProps}/>
            );
        case "":
            return (
                <LenderSelection {...stepProps}/>
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