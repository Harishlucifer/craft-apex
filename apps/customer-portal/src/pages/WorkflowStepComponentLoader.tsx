import {Step} from "@/stores/workflow.js";
import FormBuilderRenderPage from "@/pages/FormBuilderRenderPage";
import {forwardRef} from "react";
import MobileEmailOtpVerification from "@/components/stepComponents/MobileEmailOTPVerirfication";
import LenderRecommendationwithOffer from "@/components/stepComponents/LenderRecommendationwithOffer";

export interface StepComponentProps {
    step: Step;
    handleSubmitSuccess: (data:any) => any;
    data: any;
}

const WorkflowStepComponentLoader = forwardRef((props: StepComponentProps, ref) => {

    console.log('props', props)

    const stepProps = {
        step: props.step,
        handleSubmitSuccess: props.handleSubmitSuccess,
        ref:ref,
        data:props.data
    }

    switch (props.step.ui_component) {
        case "FORM_BUILDER":
            return <FormBuilderRenderPage {...stepProps}  />
            case "MOBILE_EMAIL_OTP_VERIFICATION":
                return <MobileEmailOtpVerification {...stepProps} />
                case "LENDER_RECOMMENDATION_OFFER_SELECTION":
                    return <LenderRecommendationwithOffer {...stepProps} />
        default:
            return (<div className='flex align-middle justify-center my-60'>
                <h3>{props.step.ui_component} - Component not found</h3>
            </div>)

    }

})


export default WorkflowStepComponentLoader;