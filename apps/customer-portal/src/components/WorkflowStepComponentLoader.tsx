import { forwardRef } from "react";
// import { LandingPage } from './LandingPage';
import { OTPVerification } from './OTPVerification';
import { PersonalDetails } from './PersonalDetails';
import { IncomeDetails } from './IncomeDetails';
import { DocumentVerification } from './DocumentVerification';
// import { ApplicationStatus } from './ApplicationStatus';
import { ApplicationData } from './workflow/DynamicStagesAndSteps';
import RecommendedOffers from "@/components/RecommendedOffers.tsx";
import CreditBureauConsumer from "@/components/CreditBureauConsumer.tsx";
import LenderApply from "@/components/LenderApply.tsx";

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
    handleSubmitSuccess: (data: any) => any;
    data: any;
    isReturningCustomer?: boolean;
    applicationData?: ApplicationData;
    updateApplicationData?: (data: Partial<ApplicationData>) => void;
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
        ref: ref,
        data: props.data,
        isReturningCustomer: props.isReturningCustomer,
        applicationData: props.applicationData,
        updateApplicationData: props.updateApplicationData,
        onNext: props.onNext,
        onBack: props.onBack,
        onVerified: props.onVerified,
        onApplyNew: props.onApplyNew,
        onContinueApplication: props.onContinueApplication
    };

    switch (props.step.ui_component) {
        case "":
            return (
                <OTPVerification 
                    isReturningCustomer={props.isReturningCustomer || false}
                    applicationData={props.applicationData || {} as ApplicationData}
                    updateApplicationData={props.updateApplicationData || (() => {})}
                    onVerified={props.onVerified || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "PERSONAL_DETAILS":
            return (
                <PersonalDetails 
                    applicationData={props.applicationData || {} as ApplicationData}
                    updateApplicationData={props.updateApplicationData || (() => {})}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "INCOME_DETAILS":
            return (
                <IncomeDetails 
                    applicationData={props.applicationData || {} as ApplicationData}
                    updateApplicationData={props.updateApplicationData || (() => {})}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );
        case "CREDIT_BUREAU_CONSUMER":
            return (
               <CreditBureauConsumer applicationData={props.applicationData || {} as ApplicationData}
                                     onNext={props.onNext || (() => {})}
                                     onBack={props.onBack || (() => {})}/>
            );
        case "LENDER_RECOMMENDATION_OFFER_SELECTION":
            return (
                <RecommendedOffers
                    applicationData={props.updateApplicationData || (() => {})}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})} />
            );
        case "DOCUMENT_VERIFICATION":
            return (
                <DocumentVerification 
                    applicationData={props.applicationData || {} as ApplicationData}
                    updateApplicationData={props.updateApplicationData || (() => {})}
                    onNext={props.onNext || (() => {})}
                    onBack={props.onBack || (() => {})}
                />
            );

        case "MOBILE_EMAIL_OTP_VERIFICATION":
            return (
                // <ApplicationStatus
                //     applicationData={props.applicationData || {} as ApplicationData}
                //     onBack={props.onBack || (() => {})}
                // />
                <LenderApply applicationData={props.applicationData || {} as ApplicationData}
                             onBack={props.onBack || (() => {})}
                             onNext={props.onNext || (() => {})}
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