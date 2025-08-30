import React, {useEffect, useState, useRef, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useLocation, useParams, useSearchParams} from 'react-router-dom';
import {
    resetApplication,
    setApplicationData
} from '../redux/application/applicationSlice';
import {useNavigate} from 'react-router-dom';
import {
    Accordion, AccordionItem, Button,
    Card,
    CardBody, CardHeader, Col, Collapse,
    Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Modal,
    ModalBody, ModalFooter, ModalHeader,
    Nav,
    NavItem,
    NavLink, Offcanvas, OffcanvasBody, OffcanvasHeader, Row,
    TabContent,
    TabPane
} from "reactstrap";
import BreadCrumb from "../Common/BreadCrumb";
import classnames from "classnames";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import {Provider} from "craft-ux";
import StepComponentLoader from "../Common/StepComponentLoader";
import {
    leadType,
    noteScope,
    pageCode,
    TaskStatus,
    workflowType,
    userTypeConstant
} from "../constants/constant";
import Swal from "sweetalert2";
import {fetchJourneyTypes} from "../redux/Masters/masterSlice";
import JourneyTypeSelection from "./JourneyTypeSelection";
import {BrowserView, isBrowser, isMobile, MobileView} from "react-device-detect";
import ParticipantDetails from "./ParticipantDetails";
import {useTenantConfiguration} from "../Common/TenantConfigurationProvider";
import {APIENDPOINTS, getModuleObj} from "../helper/ApiEndPoint";
import {GetCall} from "../helper/ApiProvider";
import ArchiveStatus from "../PartnerOnboarding/Archive/archive";
import FullFilledStatus from "../PartnerOnboarding/FullFilled/fullfilled";
import Ask from "../PartnerOnboarding/Ask";
import RuleList from "./RuleList";
import ActivityStream from "../Common/ActivityStream";
import AddNotes from "../Common/AddNotes";
import ComponentLoader from "../Common/ComponentLoader";
import {
    handleNextStep,
    handleBackStep,
    setCurrentStageIndex,
    setCurrentStepIndex,
    setLoading, resetState
} from '../redux/Workflow/workflowSlice';
import {executeWorkflow, fetchWorkflow} from "../redux/Workflow/workflowThunk";
import {createUpdateApplication, handleApplicationData} from "../redux/application/applicationThunk";
import DispositionStream from "./DispositionStream";
import {updateColumnWidth} from "../helper/utility";
import UtilityFloatingButton from "./UtilityFloatingButton";
import axios from "axios";
import Jsonb from "json-bigint";

const DynamicStepper = ({userType, user,module,workflow_type,listUrl}) => {
    const {id: applicationId} = useParams();
    const [onSelect,setOnSelect]=useState("FORM");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigateUrl= listUrl ? listUrl : "/lead/list";
    const initiatedWorkflowType = workflow_type ? workflow_type : workflowType.LeadCreation

    const configuration = useTenantConfiguration()
    const tenantCode = configuration?.tenant?.TENANT_CODE;

    // Redux selectors
    const workflow = useSelector((state) => state.workflow.workflow);
    const currentStageIndex = useSelector((state) => state.workflow.currentStageIndex);
    const currentStepIndex = useSelector((state) => state.workflow.currentStepIndex);
    let applicationData = useSelector((state) => state.application.applicationData);
    let v1ApplicationData = useSelector((state) => state.application.v1ApplicationData);
    const utilities = (workflow?.configuration != null && workflow?.configuration?.utilities) ? workflow?.configuration?.utilities.filter(item => item.enable_display && !item?.is_mobile) : []
    console.log("applicationData", applicationData);

    const loading = useSelector((state) => state.workflow.loading);
    const error = useSelector((state) => state.workflow.error);
    const journeyType = useSelector(state => state.master.journeyType)
    let sliceApplicationId = useSelector((state) => state.application.applicationId);
    const askAvailableStage = useSelector(state => state.workflow.askAvailableWorkflowStages)
    const hasWorkflow = workflow && workflow.stages && workflow.stages.length > 0;
    const currentStage = hasWorkflow ? workflow.stages[currentStageIndex] : null;
    const currentStep = currentStage?.steps?.[currentStepIndex];
    //get the values from URL
    const location = useLocation()
    const type = location.hash.substring(1)
    const currentURL = window.location.href
    const [searchParams] = useSearchParams();

    const [selectJourneyTypeModal, setSelectJourneyTypeModal] = useState(false)
    //to submitting the Data
    const formDataRef = useRef(null)
    // TODO:Need check where its used

    console.log(location, 'location')
    console.log(type, 'type')


    // Disposition Stream modal state
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModal = () => setModalOpen(!modalOpen);

    useEffect(() => {
        dispatch(resetState())
    }, []);

    useEffect(() => {
        getPrivileges()
        if (!applicationId) {
            dispatch(resetApplication())
            if (!currentURL.includes("journey_type")) {
                getJourney()
            } else {
                const journey_type = searchParams.get("journey_type")
                const loan_type = searchParams.get("loan_type")
                console.log("journey_type ----", journey_type, " ||loan_type ----", loan_type)
                handleJourneyType(initiatedWorkflowType, journey_type, loan_type)
            }
        } else {
            const response = dispatch(fetchWorkflow({
                sourceId: applicationId,
                workflowType: initiatedWorkflowType,
            }))
            console.log("Lead workflow ::", response)
        }
    }, [applicationId]);

    console.log('configuration :::', configuration)

    const [stickStep, setStickyStep] = useState(null)
    useEffect(() => {
        if (workflow) {
            if (workflow.stages != null) {
                workflow.stages.forEach((stage, index) => {
                    stage.steps.forEach((step, stepIndex) => {
                        if (step.configuration != null && step.configuration?.sticky) {
                            setStickyStep(step)
                        }
                    })
                })
            }
        }
        if (currentStage?.configuration?.show_utilities && workflow?.configuration?.utility_mode !== "GLOBAL") {
            console.log(currentStage,'TEST------')
            dispatch(setCurrentStepIndex(currentStage?.steps?.length))
        }
    }, [workflow,currentStage]);

    const getJourney = async () => {
        dispatch(setLoading(true))
        const result = await dispatch(fetchJourneyTypes({
            workflowType: initiatedWorkflowType,
            userType: configuration?.user?.user_type
        })).unwrap()
        if (result) {
            let loan_type_find = Object.keys(result)
            if (loan_type_find.length === 1) {
                let journey_type_find = result[loan_type_find]
                if (journey_type_find.length === 1) {
                    setSelectJourneyTypeModal(false)
                    await handleJourneyType(initiatedWorkflowType, journey_type_find[0].code, loan_type_find[0])
                } else {
                    setSelectJourneyTypeModal(true)
                }
            } else {
                setSelectJourneyTypeModal(true)
            }
            dispatch(setLoading(false))
        }
    }

    console.log("Select Modal :::", selectJourneyTypeModal)

    const getUserLeastTerritory = async () => {
        try {
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/alpha/v1/user/least/territory?status=3", {
                    transformResponse: (response) => Jsonb.parse(response)
                }
            )
            if (response && response.data) {
                console.log('data territory::', response.data)
                console.log('data territory::', response.data[0])
                if (response.data.length === 1) {
                    return response.data[0]?.id
                }
            }
        } catch (error) {
            console.log(error)
        }
        return null
    }
    console.log('configuration :::', configuration)
    const handleJourneyType = async (workflow_type, journey_type, loan_type, utm_tags) => {
        setSelectJourneyTypeModal(false)
        console.log("workflow_type ---", workflow_type, " ||journey_type ----", journey_type, "||loan_type ----", loan_type)
        const territoryID = await getUserLeastTerritory()
        let applicationData = {
            application: {
                loan_type_code: loan_type,
                type: journey_type
            }
        }
        console.log("territoryID --->",territoryID)
        territoryID != null && configuration?.user?.user_type === "EMPLOYEE" && (applicationData.application.territory_id = territoryID)
        if (user != null && user?.user_type === userTypeConstant.Customer) {
            applicationData.application.mobile = user.mobile
        }
        if (searchParams.has("cu_id") || searchParams.has("ct_id")) {
            let utmTags = {};
            if (searchParams.has("cu_id")) utmTags.cu_id = searchParams.get("cu_id")
            if (searchParams.has("ct_id")) utmTags.ct_id = searchParams.get("ct_id")
            applicationData.application.utm_tags = utmTags
        }
        //dispatch the default application data with loan and journey type
        await dispatch(setApplicationData({applicationData}))
        const hashValue=type ? `#${type}` : "";
        if (isMobile || currentURL.includes("mobile")) {
            navigate(`${location.pathname}${hashValue}?journey_type=${journey_type}&loan_type=${loan_type}`)
        } else {
            navigate(`${location.pathname}${hashValue}?journey_type=${journey_type}&loan_type=${loan_type}`)
        }
        if (!applicationId) {
            if ( type === 'short_lead' || type === 'SHORT_APPLICATION') {
                await dispatch(fetchWorkflow({
                    sourceId: applicationId,
                    workflowType: initiatedWorkflowType,
                    data: {
                        application: {
                            type: leadType.ShortLead,
                        },
                        loan_type: loan_type,
                        journey_type: leadType.ShortLead,
                    }
                }))
            } else {
                await dispatch(fetchWorkflow({
                    sourceId: applicationId,
                    workflowType: initiatedWorkflowType,
                    data: {
                        application: {
                            type: journey_type,
                        },
                        loan_type: loan_type,
                        journey_type: journey_type,
                    }
                }))
            }
        }
    }

    useEffect(() => {
        if (applicationId) {
            dispatch(handleApplicationData({applicationId, version: "v2"}));
            dispatch(handleApplicationData({applicationId, version: "v1"}));
        }
        // applicationId && dispatch(fetchWorkflow({applicationId,workflowType:initiatedWorkflowType}))
    }, [dispatch, applicationId]);



    const backStep = () => {
        dispatch(handleBackStep({workflow}));
        dispatch(handleApplicationData({applicationId, version: "v1"}));
    };

    const moveForward = async (currentStep, submittedData, version) => {
        //TODO: Need to change this dynamically
        const shouldSubmitForm = currentStep.edit_mode && formDataRef.current != null && (currentStep?.task_status === TaskStatus.InProgress ||
            currentStep?.task_status === TaskStatus.Reassigned ||
            currentStep?.task_id === null || (currentStep?.task_status === TaskStatus.Completed));
        console.log('submitted ::', shouldSubmitForm, 'data :::', submittedData)
        if (shouldSubmitForm) {
            dispatch(setLoading(true));
            // Handle form submission
            try {
                const submitResult = await dispatch(createUpdateApplication({
                    data: submittedData,
                    version: version
                })).unwrap();
                console.log('submit result :::', submitResult)
                if (submitResult) {
                    await dispatch(handleApplicationData({applicationId, version:version === "v1" ? "v2" :"v1"}));
                    if (!applicationId && submitResult?.application?.application_id) {
                        Swal.fire({
                            title: `Application Reference No : ${submitResult?.application?.application_code}`,
                            text: `Your Application Created Successfully`,
                            icon: 'success',
                        });
                        if (window.SOURCE_ID && typeof window.SOURCE_ID.postMessage === 'function') {
                            window.SOURCE_ID.postMessage(`${submitResult?.application?.application_id}`);
                        } else {
                            // window.flutter_inappwebview?.callHandler("SOURCE_ID", JSON.stringify(submitResult?.application?.application_id));
                            console.log('Flutter link not found !!')
                        }
                        const hashValue=type ? `#${type}` : "";
                        isMobile
                            ? navigate(`${location.pathname}/${submitResult?.application?.application_id}#${submitResult?.application?.type}`)
                            : navigate(`${location.pathname}/${submitResult?.application?.application_id}#${submitResult?.application?.type}`);
                    } else if (applicationId) {
                        Swal.fire({
                            title: `Application Saved`,
                            text: `Updated`,
                            icon: 'success',
                        });
                    }
                }
                // redirectToList()
                if (submitResult?.error) {
                    await Swal.fire(`Error ❌ ${submitResult.errorMessage}`, 'error');
                    console.error('Form submission error:', submitResult.errorMessage);
                    return; // Stop if submission fails
                }
                // Execute the next step in the Workflow
                await workflowExecution(submitResult?.application?.application_id , currentStep)
            } catch (submissionError) {
                console.error('Form submission error:', submissionError);
                // await Swal.fire('An unexpected error occurred during form submission. Please try again.', "", 'error');
                await Swal.fire({
                    title: 'Error',
                    text: JSON.stringify(submissionError),
                    icon: 'error',
                })

            } finally {
                dispatch(setLoading(false));
            }
        } else {
            // Proceed to the next step if form submission is not required
            try {
                if (!formDataRef.current) {
                    dispatch(handleNextStep({workflow}));
                } else {
                    console.log("Please check the applied details ::: ")
                }
            } catch (error) {
                console.error('Error while moving to the next step:', error);
                await Swal.fire('An error occurred while moving to the next step. Please try again.', "", 'error');
            }
        }
    };

    //submitting the form and get the data
    const handleFormSubmitSuccess = (data) => {
        console.log('Form submitted successfully with data:', data, "From ref ::", formDataRef);
        // TODO : Need to change this dynamically
        if(data?.optional){
            data.data != null && dispatch(setApplicationData({applicationData:{...applicationData,application:{...applicationData?.application,...data?.data?.application}}}))
            dispatch(handleNextStep(workflow))
        } else if (data.data != null && data.isValidForm) {
            if (data?.version && data?.version === "v1") {
                moveForward(currentStep, data?.data, "v1")
            } else {
                moveForward(currentStep, data?.data, "v2").then(_ => console.log("Application move forward "))
            }
        } else if (data.isValidForm) {
            workflowExecution(sliceApplicationId , data?.step)
        } else {
            console.log('Application data not found !!')
        }
    };

    const redirectToList = () => {

        if (workflowLastStep?.id === currentStep.id) {
            Swal.fire({
                icon: "success",
                title: applicationData?.application?.type === "FULLFILMENT" || applicationData?.application?.type === "BULK_API_SHARE"
                    ? `Loan Code : ${applicationData?.application?.loan_code}`
                    : `APP ID : ${applicationData ? applicationData?.application?.application_code : v1ApplicationData?.application?.application_code}`,
                text: "Application submitted Successfully",
                confirmButtonText: "OK",
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {


                    const path =
                        userType === userTypeConstant.Customer
                            ? "/dashboard"
                            : applicationData?.application?.type === "FULLFILMENT" ||
                            applicationData?.application?.type === "BULK_API_SHARE"
                                ? "/fulfillment/list"
                                : navigateUrl;

                    if (theme) {
                        // full‐window redirect
                        window.top.location.href = `${window.location.origin}${path}`;
                    } else {
                        // in‐iframe React Router navigation
                        navigate(path);
                    }
                }
            });
        }
    }

    const workflowExecution = async (id , step = null) => {
        console.log(step,'currentStep')
        const executionPayload = {
            executeStepId: step ? step?.id : currentStep?.id,
            workflowType: initiatedWorkflowType,
            sourceId: id ? id : applicationId
        }
        try {
            dispatch(setLoading(true));
            const workflowResult = await dispatch(executeWorkflow(executionPayload)).unwrap();
            redirectToList()
            if (workflowResult?.error) {
                await Swal.fire(`Error ❌ ${workflowResult.errorMessage}`, "", 'error');
                console.error('Workflow execution error:', workflowResult.errorMessage);
                // Stop if Workflow execution fails
            }
        } catch (error) {
            console.log('Error on execution from trigger ::', error)
            await dispatch(fetchWorkflow({sourceId: id, workflowType: initiatedWorkflowType}));
        } finally {
            dispatch(setLoading(false))
            dispatch(handleApplicationData({
                applicationId: id ? id : applicationId,
                version: "v1",
            }));
            dispatch(handleApplicationData({
                applicationId: id ? id : applicationId,
                version: "v2",
            }));
        }
    }

    //trigger the submit form in form builder
    const triggerFormSubmit = async () => {

        console.log('form ref :: ', formDataRef)
        if (formDataRef.current != null) {
            formDataRef.current.submitFormExternally();  // Trigger submission from outside
        } else {
            if ((currentStep?.configuration?.form_builder?.formValidation === "optional" && formDataRef.current == null) || currentStep?.ui_component !== "FORM_BUILDER") {
                console.log("if 2-------------")
                await workflowExecution()
            } else if (!currentStep?.edit_mode || currentStep?.task_status === TaskStatus.Completed) {
                dispatch(handleNextStep({workflow}))
            }
        }

    };

    const workflowLastStep = workflow?.stages != null ? workflow?.stages[workflow?.stages?.length - 1]?.steps[workflow?.stages[workflow?.stages?.length - 1]?.steps?.length - 1] : {}

    const [showRule, setShowRule] = useState(false)
    const [showPurge, setShowPurge] = useState(false)
    const [showArchive, setShowArchive] = useState(false)
    const [showFulfilled, setShowFulfilled] = useState(false)
    const [showAddNotes, setShowAddNotes] = useState(true)
    const [title, setTitle] = useState("Lead Creation")
    const [pageTitle, setPageTitle] = useState('Lead')
    const pageCodeValue = pageCode.EmployeePortal.AddLead
    const customerPageCode = pageCode.CustomerPortal.Dashboard
    const [theme, setTheme] = useState(false)

    const getPrivileges = () => {

        let myModuleList = getModuleObj(pageCodeValue);
        console.log("Previlage::", myModuleList);
        if (myModuleList.allowedPermission?.raise_ask) {
            setIsRaiseAsk(true)
        }
        if (myModuleList.allowedPermission?.rule_result) {
            setShowRule(true);
        }
        if (myModuleList.allowedPermission?.purge_bureau) {
            setShowPurge(true);
        }
        if (myModuleList.allowedPermission?.archived) {
            setShowArchive(true);
        }
        if (myModuleList.allowedPermission?.add_notes) {
            setShowAddNotes(true);
        }
        if (myModuleList.allowedPermission?.fulfilled) {
            setShowFulfilled(true);
        }
        if (myModuleList?.childname) {
            setTitle(myModuleList.childname)
        }
        if (myModuleList?.parentname) {
            setPageTitle(myModuleList.parentname)
        }
        setParticipantAccordionEnable(myModuleList?.allowedPermission?.lead_participant_accordion)

        let customerDashboard = getModuleObj(customerPageCode)
        console.log(customerDashboard, 'customer')
        if (customerDashboard?.allowedPermission?.enable_mobile_view) {
            setTheme(true)
        }

    }
    const [setParticipantAccordion, setParticipantAccordionEnable] = useState(true);
    const [accordionOpen, setAccordionOpen] = useState(false);
    const [notesModal, setNotesModal] = useState(false);
    const [isAsk, setIsAsk] = useState(location.state?.ask)
    const [togAskModal, setTogAskModal] = useState(isAsk)
    const [isActivityStreamView, setIsActivityStreamView] = useState(false);
    const getActivityStream = () => {
        setIsActivityStreamView(!isActivityStreamView)
    }
    const toggleAskModal = () => {
        setTogAskModal(!togAskModal)
        setIsAsk(false)
    }
    const [togRuleModal, setTogRuleModal] = useState(false)

    const toggleRuleModal = () => {
        setTogRuleModal(!togRuleModal)
        // setIsRule(false)
    }

    const toggleAddNotes = () => {
        setNotesModal(!notesModal)
        // setIsRule(false)
    }

    const [togActionModal, setTogActionModal] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null);

    const toggleActionModal = (option) => {
        setTogActionModal(!togActionModal)
        setSelectedOption(option);
    }

    const toggleJourneyModal = () => setSelectJourneyTypeModal(!selectJourneyTypeModal)

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = (e) => {
        e.stopPropagation()
        setDropdownOpen(!dropdownOpen)
    };
    const toggleAccordion = () => {
        if (setParticipantAccordion) {
            setAccordionOpen(!accordionOpen);
        }
    };


    const fetchPurgeBureau = async () => {
        console.log("OnboardingId", applicationData?.application?.onboarding_id)
        let url = APIENDPOINTS.APPLICATION_PURGE_BUREAU
        const purgeResponse = await GetCall(url.replace(":onboardingId", applicationData?.application?.onboarding_id));
        if (purgeResponse.data.status === 1) {
            await Swal.fire({
                title: "Success!",
                text: `${purgeResponse.data.message}`,
                icon: "success",
            });
        } else {
            await Swal.fire({
                title: "Error!",
                text: `${purgeResponse.data.message}`,
                icon: "error",
            });
        }
    }

    const [copiedText, setCopiedText] = useState('');
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedText(text);
            setTimeout(() => setCopiedText(''), 2000);
        });
    };

    const getHoverMessage = (text) => {
        return copiedText === text ? 'Copied!' : 'Click to Copy';
    };
    const [isRaiseAsk, setIsRaiseAsk] = useState("")

    const moveToNextStep = () => {
        if (currentStep.id === workflowLastStep.id) {
            redirectToList()
        } else {
            dispatch(handleNextStep({workflow}))
            dispatch(handleApplicationData({applicationId, version: "v1"}));
        }
    }
    const moveBack = () => {
        dispatch(handleBackStep({workflow}))
        dispatch(handleApplicationData({applicationId, version: "v1"}));
    }

    const stepProps = useMemo(() => ({
        step: onSelect === "CHAT" ?{...currentStep,ui_component: "CHAT"} :currentStep,
        V2ResponseData: applicationData,
        V1ResponseData: v1ApplicationData,
        formDataRef: formDataRef,
        workflowLastStep: workflowLastStep,
        moveToNextStep: moveToNextStep,
        moveBack: moveBack,
        theme: theme,
        navigateUrl: navigateUrl,
        handleFormSubmitSuccess: handleFormSubmitSuccess,
        workflowType: initiatedWorkflowType
    }), [
        currentStep,
        applicationData,
        v1ApplicationData,
        formDataRef,
        workflowLastStep,
        moveToNextStep,
        moveBack,
        theme,
        onSelect,
        handleFormSubmitSuccess,
    ]);
    const setOnSelectValue = (selectedValue)=>{
        setOnSelect(selectedValue)
    }
    return (
        <React.Fragment>
            <Provider>
                {loading && <ComponentLoader/>}
                {!workflow ?
                    <div className='page-content '>
                        <p className='d-flex align-items-center justify-content-center p-4'>
                            <ComponentLoader message={"Workflow loading..."}/>
                        </p>
                    </div>
                    : !hasWorkflow ?
                        <div className='page-content'>
                            <p className='d-flex align-items-center justify-content-center p-4'>
                                No workflow available
                            </p>
                        </div>
                        : error ? <div className='page-content'>
                                <p className='d-flex align-items-center justify-content-center p-4'>
                                    Error loading workflow: {error}
                                </p>
                            </div> :
                            <>
                                {
                                    (theme || isMobile) &&
                                    <div className={`${!isMobile && 'page-content'} ${theme && 'card'}`}>
                                        <Container fluid>
                                            <div className={'mx-auto mt-2'}><Nav
                                                    className={'nav-pills custom-nav nav-justified overflow-x-scroll px-3'}>
                                                    <NavItem className={'d-flex mt-4'}>
                                                        {workflow?.stages.map((stage, index) => (
                                                            <NavLink key={index}
                                                                     href={'#'}
                                                                     id={`steparrow-gen-info-tab-${index}`}
                                                                     className={classnames('border-bottom border-5  pb-1 fs-6 ', {
                                                                         'border-primary': currentStageIndex + 1 === index + 1,
                                                                         'text-dark border-success': currentStageIndex > index,
                                                                         'border-dark-subtle': currentStageIndex < index
                                                                     })}
                                                                     onClick={() => {
                                                                         stage?.task_start_date != null && dispatch(setCurrentStageIndex(index))
                                                                     }}
                                                            >
                                                                {stage.name}
                                                            </NavLink>
                                                        ))}
                                                    </NavItem>
                                                </Nav>
                                                <Stepper activeStep={currentStepIndex}
                                                         className={'justify-content-center bg-bl mt-3'}>
                                                    {workflow?.stages[currentStageIndex].steps?.length > 1 && workflow?.stages[currentStageIndex]?.steps.map((step, index) => (
                                                        <Step key={index} style={{
                                                            minWidth: '30px',
                                                            minHeight: "30px",
                                                            borderRadius: "100%",
                                                            paddingTop: '5px'
                                                        }} className={`rounded-pill text-center  ${classnames({
                                                            'text-white bg-primary': index === currentStepIndex,
                                                            'bg-success text-white': currentStepIndex + 1 > index + 1,
                                                            'border border-1 border-dark-subtle': currentStepIndex + 1 < index + 1
                                                        })}`}
                                                              onClick={() => {
                                                                  step?.task_id != null && dispatch(setCurrentStepIndex(index))
                                                              }}
                                                        >
                                                            {currentStepIndex + 1 > index + 1 ? (
                                                                <span><i
                                                                    className="ri-check-line"></i></span>) : index + 1}
                                                        </Step>
                                                    ))}
                                                </Stepper>
                                            </div>
                                            <div className={'card p-2 rounded-top-5 mt-4'}>
                                                {/*<h5 className={'my-1 mx-2'}>{currentStep?.name}</h5>*/}
                                                <div>
                                                    <StepComponentLoader {...stepProps}/>
                                                </div>
                                                {/*TODO : Need to change this dynamically*/}
                                                <div
                                                    className={`card position-fixed bottom-0 start-0 w-100 z-2 px-2 mb-0 p-2`}>
                                                    <div className={`d-flex justify-content-between `}>
                                                        <button className={`btn btn-primary rounded-5`}
                                                                type={'button'}
                                                                disabled={currentStageIndex === 0 && currentStepIndex === 0}
                                                                onClick={() => {
                                                                    backStep()
                                                                }}><i
                                                            className={"ri-arrow-left-line label-icon align-middle"}></i>
                                                        </button>
                                                        <button
                                                            className={`btn btn-primary w-100 ms-1 rounded-4 fs-5 `}
                                                            type={'button'}
                                                            disabled={loading || (applicationData?.application?.status?.toString() === "-2" || v1ApplicationData?.application?.status?.toString() === "-2")}
                                                            onClick={(e) => {
                                                                if (currentStep?.edit_mode) {
                                                                    triggerFormSubmit()
                                                                } else {
                                                                    redirectToList()
                                                                    dispatch(handleNextStep(workflow))
                                                                }
                                                            }}>
                                                            {loading ? (
                                                                <>
                                                                    <div
                                                                        className="spinner-border spinner-border-sm text-light me-2"
                                                                        role="status"></div>
                                                                    <span>Loading...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                        <span className='mx-2'>
                                                    {workflowLastStep?.id === currentStep.id
                                                        ? 'Submit'
                                                        : currentStep.edit_mode
                                                            ? 'Save & Next'
                                                            : 'Next'}
                                                </span>
                                                                    {workflowLastStep?.id === currentStep.id
                                                                        ?
                                                                        <i className={'ri-check-fill'}></i>
                                                                        :
                                                                        <i className="ri-arrow-right-line label-icon align-middle "></i>}
                                                                </>

                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                {/*this div for showing the last dropdown's values in components*/}
                                                <div style={{marginBottom: "100px"}}></div>
                                            </div>

                                        </Container>
                                    </div>
                                }
                                {
                                    (!theme && isBrowser) &&
                                    <div className={"page-content"}>
                                        <Container fluid>
                                            {
                                                userType !== userTypeConstant.Customer &&
                                                <>
                                                    <BreadCrumb title={module?.name} pageTitle={module?.parent_module}/>
                                                    {applicationId ?
                                                        <Card className={''}>
                                                            <Row className={'g-0'}>
                                                                <Col lg={tenantCode !== 'FLEXILOAN' ? 11 : 12}>
                                                                    <div className="live-preview">
                                                                        <Accordion id="default-accordion-example ">
                                                                            <AccordionItem className={'card mb-0 p-1'}>
                                                                                <h2 className="accordion-header "
                                                                                    id="headingOne">
                                                                                    <button
                                                                                        className={`p-1 accordion-button ${accordionOpen ? '' : 'collapsed'}`}
                                                                                        type="button"
                                                                                        onClick={toggleAccordion}
                                                                                        style={{cursor: "pointer"}}>
                                                                                        {applicationId ? (
                                                                                            <div
                                                                                                className={'d-flex justify-content-between w-100 px-2'}>
                                                                                                <p className="card-title mt-2">
                                                                                                    {v1ApplicationData?.application?.loan_code !== "" ? (
                                                                                                        <span
                                                                                                            title={getHoverMessage(v1ApplicationData?.application?.loan_code)}
                                                                                                            style={{cursor: 'pointer'}}
                                                                                                            onClick={() => copyToClipboard(v1ApplicationData?.application?.loan_code)}
                                                                                                            className={'fw-semibold'}>Loan Code : {v1ApplicationData?.application?.loan_code}</span>
                                                                                                    ) : (
                                                                                                        <span
                                                                                                            title={getHoverMessage(v1ApplicationData?.application?.application_code)}
                                                                                                            style={{cursor: 'pointer'}}
                                                                                                            onClick={() => copyToClipboard(v1ApplicationData?.application?.application_code)}
                                                                                                            className={'fw-semibold'}>{tenantCode !== "FLEXILOAN" ? "Lead ID" : "Portal ID"} : {v1ApplicationData?.application?.application_code}</span>
                                                                                                    )}
                                                                                                </p>
                                                                                                <div
                                                                                                    className={'d-flex'}>
                                                                                                    <p className="card-title mt-2 me-1">
                                                                            <span
                                                                                title={getHoverMessage(v1ApplicationData?.application?.applicant_name)}
                                                                                style={{cursor: 'pointer'}}
                                                                                onClick={() => copyToClipboard(v1ApplicationData?.application?.applicant_name)}
                                                                                className={'fw-semibold'}>{tenantCode !== 'FLEXILOAN' ? 'Lead Name : ' : 'Business Name : '} {v1ApplicationData?.application?.applicant_name}</span>
                                                                                                    </p>
                                                                                                </div>

                                                                                            </div>
                                                                                        ) : (
                                                                                            <h4 className="card-title mb-0">{'Add Lead'}</h4>)}
                                                                                    </button>
                                                                                </h2>

                                                                                <Collapse isOpen={accordionOpen}
                                                                                          className="accordion-collapse"
                                                                                          id="collapseOne">
                                                                                    <div className="accordion-body">
                                                                                        <Row>
                                                                                            <Col xl={4}>
                                                                                                <Card
                                                                                                    className={'border border-1'}>
                                                                                                    <CardHeader>
                                                                                                        <p className="card-title mb-0">
                                                                                                        <span
                                                                                                            className={'fw-semibold'}>
                                                                                                            Lead Info
                                                                                                        </span>
                                                                                                        </p>
                                                                                                    </CardHeader>
                                                                                                    <CardBody>
                                                                                                        <Row>
                                                                                                            <Col
                                                                                                                className={'p-1'}
                                                                                                                xl={12}><b>Lead
                                                                                                                Id</b> : {v1ApplicationData?.application?.application_code}
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                className={'p-1'}
                                                                                                                xl={12}><b>Business
                                                                                                                Name </b> : {v1ApplicationData?.application?.applicant_name}
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                className={'p-1'}
                                                                                                                xl={12}><b>Contact
                                                                                                                Person
                                                                                                            </b> : {v1ApplicationData?.application?.contact_name}
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                className={'p-1'}
                                                                                                                xl={12}><b>Contact
                                                                                                                Mobile
                                                                                                                No </b> :{v1ApplicationData?.application?.mobile}
                                                                                                            </Col>
                                                                                                            <Col
                                                                                                                className={'p-1'}
                                                                                                                xl={12}><b>Loan
                                                                                                                Type</b> : {v1ApplicationData?.application?.loan_type_code}
                                                                                                            </Col>
                                                                                                        </Row>
                                                                                                    </CardBody>
                                                                                                </Card>
                                                                                            </Col>
                                                                                            <Col xl={8}>
                                                                                                {v1ApplicationData && Object.keys(v1ApplicationData).length !== 0 &&
                                                                                                    <ParticipantDetails
                                                                                                        applicationDetails={v1ApplicationData}
                                                                                                        applicationId={applicationId}></ParticipantDetails>
                                                                                                }
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </div>
                                                                                </Collapse>
                                                                            </AccordionItem>
                                                                        </Accordion>
                                                                    </div>
                                                                </Col>
                                                                {tenantCode !== 'FLEXILOAN' && (
                                                                    <Col lg={1} className={''}>
                                                                        <Dropdown className={'mt-2 ms-2'}
                                                                                  isOpen={dropdownOpen}
                                                                                  toggle={toggleDropdown}
                                                                                  direction={"down"}>
                                                                            <DropdownToggle
                                                                                className={'bg-primary px-4'}
                                                                                caret> <span
                                                                                className={''}>Action</span></DropdownToggle>
                                                                            <DropdownMenu>
                                                                                {showPurge &&
                                                                                    <DropdownItem
                                                                                        onClick={fetchPurgeBureau}>Purge
                                                                                        Bureau</DropdownItem>}

                                                                                <DropdownItem
                                                                                    onClick={toggleAskModal}>Ask</DropdownItem>
                                                                                {showRule &&
                                                                                    <DropdownItem
                                                                                        onClick={toggleRuleModal}>Rule
                                                                                        Result</DropdownItem>}
                                                                                {showArchive &&
                                                                                    <DropdownItem
                                                                                        onClick={() => toggleActionModal('Archive')}>Archive</DropdownItem>}
                                                                                {showFulfilled &&
                                                                                    <DropdownItem
                                                                                        onClick={() => toggleActionModal('Full filled')}>Full
                                                                                        filled</DropdownItem>}
                                                                                {showAddNotes &&
                                                                                    <DropdownItem
                                                                                        onClick={() => toggleAddNotes()}>Add
                                                                                        Notes</DropdownItem>
                                                                                }
                                                                                <DropdownItem
                                                                                    onClick={() => getActivityStream()}>Activity
                                                                                    Stream</DropdownItem>

                                                                                {/*Disposition Stream Dropdown Button*/}
                                                                                <DropdownItem onClick={toggleModal}>
                                                                                    Disposition Stream
                                                                                </DropdownItem>
                                                                            </DropdownMenu>
                                                                        </Dropdown>
                                                                    </Col>
                                                                )}
                                                            </Row>
                                                        </Card>
                                                        : ""
                                                    }
                                                </>
                                            }
                                            <div className=" p-1">
                                                <Card className={'w-100'}>
                                                    <CardBody>
                                                        <div className="row">
                                                            {/* Top Stages Navigation */}
                                                            <div className="col-12 step-arrow-nav mb-4">
                                                                <Nav className="nav-pills custom-nav nav-justified"
                                                                     role="tablist">
                                                                    {workflow.stages.map((stage, stageIndex) => (
                                                                        <NavItem key={stageIndex}>
                                                                            <NavLink
                                                                                key={stage.id}
                                                                                id="steparrow-gen-info-tab"
                                                                                className={` ${classnames({
                                                                                    'bg-primary text-white': currentStageIndex + 1 === (stageIndex + 1),
                                                                                    "bg-primary-subtle text-primary": currentStageIndex > stageIndex,
                                                                                })}`}
                                                                                onClick={() => {
                                                                                    stage?.task_start_date != null && dispatch(setCurrentStageIndex(stageIndex))
                                                                                }}
                                                                            >
                                                                                {stage.name}
                                                                            </NavLink>
                                                                        </NavItem>

                                                                    ))}
                                                                </Nav>
                                                            </div>
                                                            {/*Tab content and stepper*/}
                                                            <TabContent activeTab={currentStageIndex}>
                                                                {workflow.stages.map((stageElement, index) => (
                                                                    <TabPane key={index} tabId={index}
                                                                             className={'w-100'}>
                                                                        {(stageElement?.configuration != null && stageElement?.configuration?.show_utilities && workflow?.configuration?.utility_mode === "STEP") ?
                                                                            <Row>
                                                                                <Col lg={3}
                                                                                     className="px-0 overflow-y-scroll"
                                                                                     style={{height: "90vh"}}>
                                                                                    <Card className="border-1 mb-1"
                                                                                          style={{height: "90vh"}}>
                                                                                        <CardBody className={'p-2'}>
                                                                                            <Nav pills
                                                                                                 className="flex-column custom-nav"
                                                                                                 id="v-pills-tab">
                                                                                                {/*Utilities*/}
                                                                                                {stageElement?.configuration?.show_utilities && workflow?.configuration?.utility_mode === "STEP" &&
                                                                                                    <>
                                                                                                        <h5 className={'text-muted'}>Utilities</h5>
                                                                                                        <div>{
                                                                                                            utilities
                                                                                                                .filter(item => item.enable_display).map((step, stepIndex) => (
                                                                                                                <NavItem
                                                                                                                    key={stepIndex + stageElement?.steps.length}
                                                                                                                    className="">
                                                                                                                    <NavLink
                                                                                                                        style={{cursor: "pointer"}}
                                                                                                                        className={`card-animate ${classnames({
                                                                                                                            "mb-2": true,
                                                                                                                            active: currentStepIndex === stepIndex + stageElement?.steps.length,
                                                                                                                        })}`}
                                                                                                                        onClick={() => {
                                                                                                                            dispatch(setCurrentStepIndex(stepIndex + stageElement?.steps.length));
                                                                                                                            // toggleVertical(`${stageIndex}-${stepIndex}`)
                                                                                                                        }}
                                                                                                                    >
                                                                                                    <span
                                                                                                        className="d-flex align-items-center">
                                                                                                     <i className={`${step?.icon} fs-3 me-2`}></i>
                                                                                                        {step.name}
                                                                                                 </span>
                                                                                                                    </NavLink>
                                                                                                                </NavItem>
                                                                                                            ))}</div>
                                                                                                    </>

                                                                                                    }
                                                                                                    {/*Workflow Step*/}
                                                                                                    {stageElement?.configuration?.show_utilities && workflow?.configuration?.utility_mode === "STEP" &&
                                                                                                        <h5 className={'text-muted'}>Workflow steps</h5>}
                                                                                                    {/*Handle the sticky component for showing in last . So filter this step without sticky*/}
                                                                                                    {stageElement?.steps?.
                                                                                                    filter(item => !item?.configuration?.sticky).
                                                                                                    map((step, stepIndex) => (
                                                                                                        <NavItem key={stepIndex}
                                                                                                                 className="">
                                                                                                            <NavLink
                                                                                                                style={{cursor: "pointer"}}
                                                                                                                className={`card-animate ${classnames({
                                                                                                                    "mb-2": true,
                                                                                                                    active: currentStepIndex === stepIndex,
                                                                                                                })}`}
                                                                                                                onClick={() => {
                                                                                                                    dispatch(setCurrentStepIndex(stepIndex))
                                                                                                                    // toggleVertical(`${stageIndex}-${stepIndex}`)
                                                                                                                }}
                                                                                                            >
                                                                                                                <div
                                                                                                                    className="d-flex align-items-center">
                                                                                                                    <i className={`${step?.configuration?.icon} fs-3 me-2`}></i>
                                                                                                                    {step.name}
                                                                                                                    <span
                                                                                                                        className={`fs-12 ms-1 text-muted`}>{step?.configuration?.optional && '(optional)'}</span>
                                                                                                                </div>
                                                                                                            </NavLink>
                                                                                                        </NavItem>
                                                                                                    ))}
                                                                                                </Nav>
                                                                                            </CardBody>
                                                                                        </Card>
                                                                                    </Col>
                                                                                    <Col md={9} style={{maxHeight:"80vh"}}>
                                                                                        <Card className="border-1">
                                                                                            <CardBody>
                                                                                                <TabContent
                                                                                                    activeTab={currentStepIndex}
                                                                                                    className="text-muted mt-4 mt-md-0"
                                                                                                    id="v-pills-tabContent"
                                                                                                >
                                                                                                    {/*Utilities*/}
                                                                                                    {utilities.map((step, stepIndex) => (
                                                                                                        <TabPane className="overflow-y-scroll" style={{maxHeight:"75vh"}}
                                                                                                                 tabId={stepIndex + stageElement.steps?.length}
                                                                                                                 key={stepIndex + stageElement.steps?.length}
                                                                                                        >
                                                                                                            {stepIndex + stageElement.steps?.length === currentStepIndex &&
                                                                                                                <StepComponentLoader
                                                                                                                    step={step}
                                                                                                                    V2ResponseData={applicationData}
                                                                                                                    V1ResponseData={v1ApplicationData}
                                                                                                                    formDataRef={formDataRef}
                                                                                                                    workflowLastStep={workflowLastStep}
                                                                                                                    moveToNextStep={moveToNextStep}
                                                                                                                    moveBack={moveBack}
                                                                                                                    navigateUrl={"/enquiry/customer/list"}
                                                                                                                    handleFormSubmitSuccess={handleFormSubmitSuccess}
                                                                                                                    workflowType={initiatedWorkflowType}
                                                                                                                />
                                                                                                            }
                                                                                                        </TabPane>
                                                                                                    ))}
                                                                                                    {/*Workflow steps*/}
                                                                                                    {stageElement?.steps?.map((step,
                                                                                                                        stepIndex) => (
                                                                                                        <TabPane
                                                                                                            tabId={stepIndex}
                                                                                                            key={stepIndex}
                                                                                                        >{stepIndex === currentStepIndex &&
                                                                                                            <div className="overflow-y-scroll" style={{maxHeight:"70vh"}}>
                                                                                                                <StepComponentLoader {...stepProps}/>
                                                                                                            </div>
                                                                                                        }
                                                                                                            <div
                                                                                                                className={`mt-4 d-flex justify-content-between`}>
                                                                                                                <button
                                                                                                                    className="btn btn-primary rounded-pill"
                                                                                                                    disabled={currentStageIndex === 0 && currentStepIndex === 0}
                                                                                                                    onClick={backStep}
                                                                                                                ><i
                                                                                                                    className={"ri-arrow-left-line label-icon align-middle"}></i>
                                                                                                                    <span
                                                                                                                        className='mx-2'>Back</span>
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    className="btn btn-primary rounded-pill"
                                                                                                                    type={'button'}
                                                                                                                    disabled={loading}
                                                                                                                    onClick={(e) => {
                                                                                                                        currentStep?.edit_mode ? triggerFormSubmit() : dispatch(handleNextStep(workflow))
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {loading ? (
                                                                                                                        <>
                                                                                                                            <div
                                                                                                                                className="spinner-border spinner-border-sm text-light me-2"
                                                                                                                                role="status"></div>
                                                                                                                            <span>Loading...</span>
                                                                                                                        </>
                                                                                                                    ) : (
                                                                                                                        <>
                                                                                                 <span className='mx-2'>
                                                                                                    {workflowLastStep?.id === step.id
                                                                                                        ? 'Submit'
                                                                                                        : currentStep?.edit_mode
                                                                                                            ? 'Save & Next'
                                                                                                            : 'Next'}
                                                                                                </span>{workflowLastStep?.id === step.id
                                                                                                                        ?
                                                                                                                        <i className={'ri-check-fill'}></i>
                                                                                                                        :
                                                                                                                        <i className="ri-arrow-right-line label-icon align-middle "></i>}
                                                                                                                    </>

                                                                                                                )}
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    </TabPane>
                                                                                                ))}
                                                                                            </TabContent>
                                                                                        </CardBody>
                                                                                    </Card>
                                                                                </Col>

                                                                                {(stickStep && currentStage?.configuration?.show_utilities) &&
                                                                                    <Col lg={12} className={'my-4'}>
                                                                                        <StepComponentLoader
                                                                                            step={stickStep}
                                                                                            V2ResponseData={applicationData}
                                                                                            V1ResponseData={v1ApplicationData}
                                                                                            formDataRef={formDataRef}
                                                                                            workflowLastStep={workflowLastStep}
                                                                                            moveToNextStep={moveToNextStep}
                                                                                            moveBack={moveBack}
                                                                                            navigateUrl={"/enquiry/customer/list"}
                                                                                            handleFormSubmitSuccess={handleFormSubmitSuccess}
                                                                                            worflowType={initiatedWorkflowType}
                                                                                        />
                                                                                    </Col>}
                                                                            </Row>
                                                                            :<Stepper activeStep={currentStepIndex}
                                                                                  orientation="vertical">
                                                                            {stageElement?.steps.map((stepElement, stepIndex) => (
                                                                                <Step key={stepIndex}>
                                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                        <div>
                                                                                            <StepLabel onClick={() => {
                                                                                                stepElement?.task_id != null && dispatch(setCurrentStepIndex(stepIndex))
                                                                                            }}>
                                                                                                {stepElement.name}
                                                                                            </StepLabel>
                                                                                        </div>
                                                                                        { stepElement?.configuration?.enable_chat && (
                                                                                            <div className="d-flex bg-white border rounded shadow-sm p-1 gap-2 align-items-center">
                                                                                                {/* Form Button */}
                                                                                                <button
                                                                                                    onClick={() => setOnSelectValue("FORM")}
                                                                                                    type="button"
                                                                                                    className={`btn btn-sm d-flex align-items-center gap-1 px-3 py-1 ${
                                                                                                        onSelect === "FORM" ? "btn-success text-white" : "btn-outline-primary"
                                                                                                    }`}
                                                                                                    data-bs-toggle="tooltip"
                                                                                                    title="Choose your preferred interaction"
                                                                                                >
                                                                                                    <i className="ri-file-text-line fs-6"></i>
                                                                                                    <span className="fw-bold">Form</span>
                                                                                                </button>
                                                                                                {/* Chat Button */}
                                                                                                <button
                                                                                                    onClick={() => setOnSelectValue("CHAT")}
                                                                                                    type="button"
                                                                                                    className={`btn btn-sm d-flex align-items-center gap-1 px-3 py-1 ${
                                                                                                        onSelect === "CHAT" ? "btn-success text-white" : "btn-outline-secondary"
                                                                                                    }`}
                                                                                                    data-bs-toggle="tooltip"
                                                                                                    title="Choose your preferred interaction"
                                                                                                >
                                                                                                    <i className="ri-chat-3-line fs-6"></i>
                                                                                                    <span className="fw-bold">Chat</span>
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <StepContent className={'w-100'}>
                                                                                        <StepComponentLoader {...stepProps}/>
                                                                                        <div
                                                                                            className={`mt-4 d-flex justify-content-between`}>
                                                                                            <button
                                                                                                id={'back-step'}
                                                                                                className="btn btn-primary rounded-pill"
                                                                                                disabled={currentStageIndex === 0 && currentStepIndex === 0}
                                                                                                onClick={backStep}
                                                                                            ><i
                                                                                                className={"ri-arrow-left-line label-icon align-middle"}></i>
                                                                                                <span
                                                                                                    className='mx-2'>Back</span>
                                                                                            </button>
                                                                                            <button
                                                                                                id={'trigger-form-submit'}
                                                                                                className="btn btn-primary rounded-pill"
                                                                                                type={'button'}
                                                                                                disabled={loading || (applicationData?.application?.status?.toString() === "-2" || v1ApplicationData?.application?.status?.toString() === "-2")}
                                                                                                onClick={(e) => {
                                                                                                    if (currentStep?.edit_mode) {
                                                                                                        triggerFormSubmit()
                                                                                                    } else {
                                                                                                        console.log("triggered")
                                                                                                        redirectToList()
                                                                                                        dispatch(handleNextStep(workflow))
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                {loading ? (
                                                                                                    <>
                                                                                                        <div
                                                                                                            className="spinner-border spinner-border-sm text-light me-2"
                                                                                                            role="status"></div>
                                                                                                        <span>Loading...</span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                 <span className='mx-2'>
                                                                                                    {workflowLastStep?.id === stepElement.id
                                                                                                        ? 'Submit'
                                                                                                        : currentStep?.edit_mode
                                                                                                            ? 'Save & Next'
                                                                                                            : 'Next'}
                                                                                                </span>{workflowLastStep?.id === stepElement.id
                                                                                                            ?
                                                                                                            <i className={'ri-check-fill'}></i>
                                                                                                            :
                                                                                                            <i className="ri-arrow-right-line label-icon align-middle "></i>}
                                                                                                        </>

                                                                                                    )}
                                                                                                </button>
                                                                                            </div>
                                                                                        </StepContent>
                                                                                    </Step>
                                                                                ))}
                                                                            </Stepper>}
                                                                    </TabPane>
                                                                ))}
                                                            </TabContent>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                            {(workflow?.configuration?.utility_mode === "GLOBAL" && currentStage?.configuration?.show_utilities) &&
                                                <UtilityFloatingButton
                                                utilities={utilities}
                                                V2ResponseData={applicationData}
                                                V1ResponseData={v1ApplicationData}
                                                formDataRef={formDataRef}
                                                workflowLastStep={workflowLastStep}
                                                moveToNextStep={moveToNextStep}
                                                moveBack={moveBack}
                                                theme={theme}
                                                navigateUrl={navigateUrl}
                                                handleFormSubmitSuccess={handleFormSubmitSuccess}
                                                workflowType={workflowType.LeadCreation}
                                            />}
                                        </Container>
                                    </div>
                                }

                            </>}
                {isMobile
                    ? <Offcanvas toggle={toggleJourneyModal} style={{height: '85vh'}} className={'rounded-top-5'}
                                 direction="bottom" isOpen={selectJourneyTypeModal}>
                        <OffcanvasHeader toggle={toggleJourneyModal}>Select Loan Type</OffcanvasHeader>
                        <OffcanvasBody>
                            <JourneyTypeSelection journeyTypeGroup={journeyType} handleJourney={handleJourneyType}
                                                  setSelectJourneyTypeModal={setSelectJourneyTypeModal}/>
                        </OffcanvasBody>
                    </Offcanvas>
                    : <Modal isOpen={selectJourneyTypeModal} size={'lg'}>
                        <ModalBody>
                            <JourneyTypeSelection journeyTypeGroup={journeyType} handleJourney={handleJourneyType}
                                                  setSelectJourneyTypeModal={setSelectJourneyTypeModal}/>
                        </ModalBody>
                    </Modal>}
            </Provider>

            <Modal isOpen={togActionModal} size={"lg"}>
                <ModalHeader toggle={() => toggleActionModal(selectedOption)}><h4>{selectedOption}</h4></ModalHeader>
                <ModalBody>
                    {selectedOption === 'Archive' ? (
                        <ArchiveStatus
                            navigateUrl={'/lead/list'}
                            appId={v1ApplicationData ? v1ApplicationData?.application?.application_id : applicationData?.application?.application_id}
                            toggleActionModal={toggleActionModal}
                        />
                    ) : (
                        selectedOption === 'Full filled' && (
                            <FullFilledStatus
                                appId={v1ApplicationData ? v1ApplicationData?.application?.application_id : applicationData?.application?.application_id}
                                toggleActionModal={toggleActionModal}/>
                        )
                    )}
                </ModalBody>
            </Modal>
            <Modal isOpen={togAskModal} size={"xl"}>
                <ModalHeader toggle={toggleAskModal}><h4>Ask</h4></ModalHeader>
                <ModalBody>
                    <Ask isRaiseAsk={isRaiseAsk} toggleAskModal={toggleAskModal} stages={askAvailableStage}
                         workflow={workflow}/>
                </ModalBody>
            </Modal>

            <Modal isOpen={togRuleModal} size={"xl"}>
                <ModalHeader toggle={toggleRuleModal}><h4>Rule Result</h4></ModalHeader>
                <ModalBody>
                    <RuleList applicationId={applicationId}></RuleList>
                </ModalBody>
            </Modal>
            {
                isActivityStreamView && (
                    <ActivityStream
                        show={isActivityStreamView}
                        applicationId={applicationId}
                        onCloseClick={() => setIsActivityStreamView(false)}
                    />
                )
            }
            {
                notesModal && (
                    <AddNotes
                        show={notesModal}
                        referenceId={applicationId}
                        scope={noteScope.applicationNotes}
                        onCloseClick={() => setNotesModal(false)}
                    />
                )
            }
            {/*Disposition Stream Modal*/
            }
            <Modal isOpen={modalOpen} toggle={toggleModal} size='lg'>
                <ModalHeader toggle={toggleModal}>Disposition Stream</ModalHeader>
                <ModalBody>
                    <DispositionStream
                        onboardingId={v1ApplicationData ? v1ApplicationData?.application?.onboarding_id : applicationData?.application?.onboarding_id} workflowType={initiatedWorkflowType}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    )
        ;
};
export default DynamicStepper;
