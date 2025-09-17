import {Step} from "@/stores/workflow.js";
import FormBuilderRenderPage from "@/pages/FormBuilderRenderPage";
import {forwardRef} from "react";

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
        default:
            return (<div className='flex align-middle justify-center my-60'>
                <h3>{props.step.ui_component} - Component not found</h3>
            </div>)

    }

})


export default WorkflowStepComponentLoader;