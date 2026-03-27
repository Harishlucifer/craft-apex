import React, {useEffect, useState, useMemo} from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Input,
    Label,
    ButtonGroup,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane
} from "reactstrap";
import ReportChart from "../Common/ReportChart";
import BureauEnquiryList from '../LeadCreation/BureauEnquiryList'
import {GetCall, PostCall} from "../helper/ApiProvider";
import {APIENDPOINTS, getModuleObj} from "../helper/ApiEndPoint";
import classnames from "classnames";
import Swal from "sweetalert2";
import {formatDateMMDDYYYY, formatIndianCurrency} from "../helper/utility"
import Loader from "../Common/Loader";
import {applicationStatusInt,bureauAccountStatus,productCodeLabels, pageCode, theme} from "../constants/constant";
import {useParams} from "react-router-dom";
import PlainWidgets from "../Common/Widgets/PlainWidgets";
import BureauLoanAccountDetails from "./BureauLoanAccountDetails";
import Questionnaire from './Questionnaire'
import ComponentLoader from "../Common/ComponentLoader";
import {isMobile} from "react-device-detect";
import {isEqual} from "lodash";
import CardWidgets from "../Common/Widgets/CardWidgets";

const CreditBureau = (props) => {
    const {id} = useParams();
    const [openIndex, setOpenIndex] = useState(null);
    const [applicantData, setApplicant] = useState([])
    const [activeTab, setActiveTab] = useState(0);
    const [Loading, setLoading] = useState(false);
    const [bureauAnalysisId, setBureauAnalysisId] = useState("");
    const [restrictMode, setRestrictMode] = useState()
    const [progress, setProgress] = useState(false)
    const [showDetails, setShowDetails] = useState(true)
    const[onlyScoreView,setOnlyScoreView]=useState(false)
    const [skipPrivilege, setSkipPrivilege] = useState(false);
    const [pageCodeValue, setPageCodeValue] = useState(pageCode.EmployeePortal.AddLead)
    const [skip, setSkip] = useState(0);
    const [oldData, setOldData] = useState(0)

    const [productCode,setProductCode] = useState(false)

    const [selectedLoanType, setSelectedLoanType] = useState("ALL");
    const [selectedEnquiry,setSelectedEnquiry] = useState("ALL")
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [filteredEnquirys, setFilteredEnquirys] = useState([])
    const [loanTypes, setLoanTypes] = useState([])
    const [enquiryPurpose,setEnquiryPurpose] = useState([])

    const [ApplicationBureauResult,setApplicationBureauResult] = useState([])
    const [CurrentApplicant,setCurrentApplicant]= useState({})

    const [activeRange, setActiveRange] = useState('ALL');
    const [summaryDetails,setSummaryDetails] = useState({})
    const [enquirySummaryDetails,setEnquirySummary] = useState({})





    console.log("credit bureau :::", productCode)

    console.log("Enquiry Details :::",applicantData[0]?.bureau_details?.bureau_data?.computed_data?.enquiry)

    console.log("Cibil Details :::", applicantData[0]?.bureau_details?.bureau_data?.computed_data?.accounts)
    useEffect(() => {
        applyFilters();
    }, []);
    const applyFilters = (status = activeRange, loanType = selectedLoanType) => {

        const dataSource = CurrentApplicant || applicantData[0]



        const allAccounts = dataSource?.bureau_details?.bureau_data?.computed_data?.accounts || [];


        const filtered = allAccounts?.filter(account => {
            const matchesLoanType = loanType !== "ALL"
                ? account?.loan_type === loanType
                : true;
            let normalizedStatus = bureauAccountStatus[account?.status]
            console.log(normalizedStatus)
            const matchesStatus = (() => {
                const upperStatus = status?.toUpperCase();
                if (upperStatus === "ALL" || !upperStatus) return true;
                if (upperStatus === "OTHER") return !["ACTIVE", "CLOSED"].includes(normalizedStatus);
                return normalizedStatus === upperStatus;
            })();

            return matchesLoanType && matchesStatus;
        });
        setFilteredAccounts(filtered);
    };

    const enquiryFilter = (enquiryType = selectedEnquiry) => {

        const dataSource = CurrentApplicant || applicantData[0]


        const allEnquirys = dataSource?.bureau_details?.bureau_data?.computed_data?.enquiry
        if (enquiryType === "ALL"){
            setFilteredEnquirys(allEnquirys)
        }else{
            const filtered = allEnquirys?.filter(enquiry => enquiry?.enquiry_purpose === enquiryType)
            setFilteredEnquirys(filtered)
        }
    }
    const handleStatusChange = (status) => {
        setActiveRange(status);
        if (status === "ALL"){
            status = ""
        }
        applyFilters(status, selectedLoanType);
    };
    const filterLoanType = (loanType = "") => {
        console.log("loan type ::",loanType)
        setSelectedLoanType(loanType);
        setActiveRange("ALL")
        applyFilters('', loanType);
    };

    const filterEnquiryPurpose = (enquiry) => {
        setSelectedEnquiry(enquiry)
        enquiryFilter(enquiry)
    }

    const extractUniqueLoanTypes = (data) => {
        if (data?.length){
            let summaryMap = {}
            let totalActive = 0;
            let totalClosed = 0;
            let totalOther = 0;
            data.forEach(account => {
                const type = account?.loan_type || "UNKNOWN";
                if (!summaryMap[type]) {
                    summaryMap[type] = {
                        loan_type: type,
                        total: 0,
                        active: 0,
                        closed: 0,
                        other: 0,
                    };
                }

                summaryMap[type].total += 1;

                if (bureauAccountStatus[account.status] === "ACTIVE") {
                    summaryMap[type].active += 1;
                    totalActive += 1
                } else if (bureauAccountStatus[account.status] === "CLOSED") {
                    summaryMap[type].closed += 1;
                    totalClosed += 1
                } else {
                    summaryMap[type].other += 1;
                    totalOther += 1
                }
            });

            console.log("summary", summaryMap)
            setSummaryDetails({ summaryMap, totalActive, totalClosed, totalOther })
        }

        const uniqueLoanTypes = data?.length && data
            .map(account => account?.loan_type)
            .filter((type, index, self) => type && self.indexOf(type) === index);
        //console.log("loan types :::", uniqueLoanTypes)
        setLoanTypes(uniqueLoanTypes);
    };

    const extractUnquieEnquiryPurpose = (data) => {
        const enquirySummary = {}
        console.log("enquiry summary :::",data)
        if (data?.length){
            data.forEach(enquiry => {
                const purpose = enquiry?.enquiry_purpose || "UNKNOWN";
                if (!enquirySummary[purpose]){
                    enquirySummary[purpose] = {
                        total : 0
                    }
                }
                enquirySummary[purpose].total += 1
            })
        }
        console.log("enquiry summary :::",enquirySummary)
        setEnquirySummary(enquirySummary)

        const uniqueEnquiryPurpose = data?.length && data
            .map(enquiry => enquiry?.enquiry_purpose)
            .filter((type, index, self) => type && self.indexOf(type) === index);
        setEnquiryPurpose(uniqueEnquiryPurpose)
    }

    const options = ['ALL', 'Active', 'Closed', 'Other'];

    const toggleChange = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const isEdit = !isEqual(skip, oldData)

    const fetchLookups = async ()=>{
        try{
            const {data} = await GetCall(APIENDPOINTS.LOOKUP_MASTER + "?group_code=APPLICATION_BUREAU")
            if (data?.data?.length) {
                data.data?.forEach(code => {
                    if (code.lu_key === props?.step?.configuration?.product_code) {
                        setProductCode(productCodeLabels[code.lu_key])
                    }
                })
            }
        }catch (error){
            console.log(error)
        }
    }

    useEffect(() => {
        if (applicantData?.length > 0 && applicantData[0]?.bureau_details) {
            // Initialize CurrentApplicant for single applicant scenario
            setCurrentApplicant(applicantData[0]);
            extractUniqueLoanTypes(applicantData[0]?.bureau_details?.bureau_data?.computed_data?.accounts || []);
            extractUnquieEnquiryPurpose(applicantData[0]?.bureau_details?.bureau_data?.computed_data?.enquiry || []);

            // Set initial filtered data
            setFilteredAccounts(applicantData[0]?.bureau_details?.bureau_data?.computed_data?.accounts || []);
            setFilteredEnquirys(applicantData[0]?.bureau_details?.bureau_data?.computed_data?.enquiry || []);
        }
    }, [applicantData]);

    useEffect(() => {
        let config
        if (props?.step?.configuration) {
            config = props?.step?.configuration
            setShowDetails(config?.show_details)
            setOnlyScoreView(config?.only_score_view)

            if(config?.product_code){
                fetchLookups().then(r => r && console.log(r))
            }
        }
        fetchData(config?.trigger_bureau);

        if (props.restrictMode) {
            setRestrictMode(props.restrictMode);
        } else {
            setRestrictMode(props.viewMode)
        }
        getPrivileges();

    }, [props?.data])

    //credit props effect
    const getPrivileges = () => {

        let myModuleList = getModuleObj(pageCodeValue);
        console.log("Previlage::", myModuleList);

        if (myModuleList.allowedPermission?.skip) {
            setSkipPrivilege(true);
        }
    }


    const handleSwitchChange = (e) => {
        setSkip(e.target.checked ? 2 : 1);
    };


    const fetchData = async (callWorkflow) => {
        try {
            setLoading(true);
            setProgress(true);
            console.log("FetchdataOfpartner", props);

            if (props?.data?.application?.application_id || props?.data?.application?.channel_id) {
                const response = await GetCall(
                    APIENDPOINTS.BUREAU_PULL_LIST.replace(":applicationId", props.data?.application?.onboarding_id)
                );

                if (response.status) {
                    setLoading(false);
                    setProgress(false);

                    const { result } = response.data;
                    console.log("response---credit", response.data);

                    if (response?.data?.cam_status === 2) {
                        setSkip(response?.data.cam_status);
                        setOldData(response?.data.cam_status);
                    }

                    if (result != null) {
                        setApplicationBureauResult(result)
                        console.log(result[0]?.bureau_details?.bureau_data?.computed_data?.accounts);
                        setFilteredAccounts(result[0]?.bureau_details?.bureau_data?.computed_data?.accounts || []);
                        setFilteredEnquirys(result[0]?.bureau_details?.bureau_data?.computed_data?.enquiry || []);
                        extractUniqueLoanTypes(result[0]?.bureau_details?.bureau_data?.computed_data?.accounts || []);
                        extractUnquieEnquiryPurpose(result[0]?.bureau_details?.bureau_data?.computed_data?.enquiry);
                        setApplicant(result);

                        let applicantData = response.data.result;
                        const bureauInitPayload = {
                            application_id: props.data.application.onboarding_id,
                        };

                        if (applicantData[activeTab]?.applicant_category === "ENTITY") {
                            bureauInitPayload.entity_id = applicantData[activeTab]?.applicant_id;
                        }
                        if (applicantData[activeTab]?.applicant_category === "PERSON") {
                            bureauInitPayload.person_id = applicantData[activeTab]?.applicant_id;
                        }

                        bureauInitPayload.cam_application_id =
                            result[activeTab]?.bureau_details?.bureau_data?.cam_application_id;
                        bureauInitPayload.work_order_id =
                            result[activeTab]?.bureau_details?.bureau_data?.work_order_id?.toString();

                        if (bureauAnalysisId) {
                            bureauInitPayload.bureau_analysis_id =
                                result[activeTab]?.bureau_details?.bureau_data?.bureau_analysis_id?.toString();
                            bureauInit(bureauInitPayload);
                        }

                        if (response.data.result.length !== 0) {
                            setBureauAnalysisId(
                                response?.data?.result[activeTab]?.bureau_details?.bureau_data?.bureau_analysis_id
                            );
                            if (callWorkflow === true) {
                                await initiateWorkFlow(response?.data?.result[activeTab]);
                            }
                        }
                    }
                } else {
                    setLoading(false);
                    setProgress(false);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
            setProgress(false);
        }
    };

    console.log("applicantData --->",applicantData)

    const proceedToSkip = async () => {
        await Swal.fire({
            title: 'Are you sure?',
            text: "Note : Skipping this step will also skip the Bureau Rule",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Skip!"
        }).then((result) => {
            if (result.isConfirmed) {
                const bureauInitPayload = {
                    application_id: props.data.application.onboarding_id,
                };

                // console.log("bureau analysis payload",bureauInitPayload)
                if (applicantData[activeTab]?.applicant_category === "ENTITY") {
                    bureauInitPayload.entity_id = applicantData[activeTab]?.applicant_id
                }
                if (applicantData[activeTab]?.applicant_category === "PERSON") {
                    bureauInitPayload.person_id = applicantData[activeTab]?.applicant_id
                }
                if (bureauAnalysisId) {
                    bureauInitPayload.bureau_analysis_id = bureauAnalysisId.toString();
                }
                bureauInitPayload.skip_status = 2;
                const bureauInitResponse = bureauInit(bureauInitPayload).then(() => {
                    props.moveToNextStep(props.stageID, props.stepID, props.data, true)
                });

            }
        });

    }
    const proceedToRun = async () => {
        await Swal.fire({
            title: 'Are you sure?',
            text: "Note : This step was previously skipped. Re-running this step will also enable the Bureau Rule.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Run!"
        }).then((result) => {
            if (result.isConfirmed) {
                const bureauInitPayload = {
                    application_id: props.data.application.onboarding_id,
                };
                if (applicantData[activeTab]?.applicant_category === "ENTITY") {
                    bureauInitPayload.entity_id = applicantData[activeTab]?.applicant_id
                }
                if (applicantData[activeTab]?.applicant_category === "PERSON") {
                    bureauInitPayload.person_id = applicantData[activeTab]?.applicant_id
                }
                if (bureauAnalysisId) {
                    bureauInitPayload.bureau_analysis_id = bureauAnalysisId.toString();
                }
                bureauInitPayload.skip_status = 1;
                const bureauInitResponse = bureauInit(bureauInitPayload).then(() => {
                    props.moveToNextStep(props.stageID, props.stepID, props.data, true)
                });

            }
        });

    }
    const updateApplicantData = async (application) => {

        const payload = {
            type: "APPLICATION_BUREAU",
            reference_id: application?.bureau_details?.bureau_data?.bureau_analysis_id,
            product_code: application?.product_code,
        };

        try {
            const response = await PostCall(APIENDPOINTS.BUREAU_APPLICANT_UPDATE, payload);
            console.log("Applicant data updated successfully:", response);
        } catch (error) {
            console.error("Error updating applicant data:", error);
        }
    };

    const initiateWorkFlow = async (application , reProcess) => {
        console.log("applicantData --->",application)
        try {
            if (reProcess){
                await updateApplicantData(application)
            }
            let bureauInitPayload={}
            setLoading(true);
             bureauInitPayload = {
                application_id: props.data.application.onboarding_id,
            };
            if (application.applicant_category === "ENTITY") {
                bureauInitPayload.entity_id = application.applicant_id
            }
            if (application.applicant_category === "PERSON") {
                bureauInitPayload.person_id = application.applicant_id
            }
            let bureauAnalysisIdToUse = bureauAnalysisId;
            bureauInitPayload.cam_application_id=application?.bureau_details?.bureau_data?.cam_application_id
            bureauInitPayload.work_order_id=application?.bureau_details?.bureau_data?.work_order_id
            if (bureauAnalysisId) {
                bureauInitPayload.bureau_analysis_id =application?.bureau_details?.bureau_data?.bureau_analysis_id.toString();
                const bureauInitResponse = await bureauInit(bureauInitPayload);
            } else {
                const bureauInitResponse = await bureauInit(bureauInitPayload);
                bureauAnalysisIdToUse = bureauInitResponse?.bureau_analysis_id;
                setBureauAnalysisId(bureauAnalysisIdToUse);
            }
            console.log("builder payload --->",bureauInitPayload)
            const buildPayload = {
                // eslint-disable-next-line no-undef
                source_id: bureauAnalysisIdToUse.toString(),
                workflow_type: "CAM_BUREAU_FETCH"
            };
            const bureauBuildResponse = await bureauBuild(buildPayload);
            console.log("Bureau build response", bureauBuildResponse);
            const executionPayload = {

                execute_step_id: ((bureauBuildResponse.last_active_step_id && bureauBuildResponse.last_active_step_id !== '0' && bureauBuildResponse.last_active_step_id !== '')
                    ? bureauBuildResponse.last_active_step_id
                    : bureauBuildResponse?.stages[0]?.steps[0]?.id),
                source_id: bureauAnalysisIdToUse.toString(),
                workflow_type: "CAM_BUREAU_FETCH",
            };
            const bureauExecutionResponse = await bureauExecution(executionPayload);
            if (bureauExecutionResponse) {
                setLoading(false);
                // console.log("credit bureau workflow")
                fetchData(false);
            }
        } catch (error) {
            setLoading(false);
            setProgress(false);
            Swal.fire({
                title: 'Failed!',
                text: 'An error occurred',
                icon: 'error',
            });
            console.error("Error in initiating Workflow:", error);
        }
    };

    const toggle = (index) => {
        setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    const bureauInit = async (payload) => {
        const response = await PostCall(APIENDPOINTS.BUREAU_INIT, payload);
        if (response.status) {
            console.log("SKIPSTATUS", response.data?.result?.skip_status)
            return response.data;
        } else {
            throw new Error('Failed in Init');
        }
    };

    const bureauBuild = async (payload) => {
        const response = await PostCall(APIENDPOINTS.WORKFLOW_BUILD, payload);
        if (response.status) {
            return response.data.data;
        } else {
            throw new Error('Failed on WorkFlow Build');
        }
    };

    const bureauExecution = async (payload) => {
        const response = await PostCall(APIENDPOINTS.WORKFLOW_EXECUTION, payload);
        if (response.status) {
            return response.data;
        } else {
            throw new Error('Failed on WorkFlow Execution');
        }
    };

    console.log("Config::", showDetails)
    const submitQuestionnaire = async (payload) => {
        setProgress(true)
        let data = props.data;
        data.questionnaire = payload.updatedQuestions
        const submitQuestionnairePayload = {
            product_code:CurrentApplicant.product_code|| applicantData[0].product_code,
            source_version: "V2",
            data: data
        };
        console.log(submitQuestionnairePayload)
        console.log(JSON.stringify(submitQuestionnairePayload))
        let bureauQuestionnaireIAAS = await PostCall(APIENDPOINTS.IAAS_BUREAU_QUESTIONNAIRE_SUBMIT.replaceAll(":work_order_id", payload.workOrderId), submitQuestionnairePayload)
        if (bureauQuestionnaireIAAS.status) {
            const buildPayload = {
                // eslint-disable-next-line no-undef
                source_id: payload.sourceId.toString(),
                workflow_type: "CAM_BUREAU_FETCH"
            };
            const bureauBuildResponse = await bureauBuild(buildPayload);

            const {stages, last_active_step_id} = bureauBuildResponse;

            let executionPayload;
            stages.forEach(stage => {
                stage.steps.forEach(step => {
                    let stepConfig = JSON.parse(step.configuration);
                    if (stepConfig?.stage_code && stepConfig?.stage_code === "CRIF_AUTO_AUTHORIZATION") {
                        executionPayload = {
                            execute_step_id: last_active_step_id && last_active_step_id !== 0 ? last_active_step_id : step.id,
                            source_id: payload.sourceId.toString(),
                            workflow_type: "CAM_BUREAU_FETCH"
                        };
                    } else {
                        if (!stepConfig?.stage_code) {
                            setLoading(false);
                            Swal.fire({
                                title: 'Failed!',
                                text: 'An error occurred',
                                icon: 'error',
                            });
                        } else {
                            setLoading(false);
                            Swal.fire({
                                title: 'Failed!',
                                text: 'An error occurred',
                                icon: 'error',
                            });
                        }
                    }
                });
            });
            const bureauExecutionResponse = await bureauExecution(executionPayload);
            if (bureauExecutionResponse) {
                fetchData();
            }
        } else {
            setLoading(false);
            Swal.fire({
                title: 'Failed!',
                text: 'An error occurred',
                icon: 'error',
            });
        }
    }

    const filterFunction = async (data) => {




        setCurrentApplicant(data)
        extractUniqueLoanTypes(data?.bureau_details?.bureau_data?.computed_data?.accounts)
        extractUnquieEnquiryPurpose(data?.bureau_details?.bureau_data?.computed_data?.enquiry)

        setFilteredAccounts(data?.bureau_details?.bureau_data?.computed_data?.accounts || []);
        setFilteredEnquirys(data?.bureau_details?.bureau_data?.computed_data?.enquiry || []);



    }

    return (
        <React.Fragment>
            {progress && (<ComponentLoader/>)}
            <Card className="border-1 shadow-md">
                <CardHeader>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="card-title mb-0">{productCode?.title}</h5>
                        </Col>
                        {skipPrivilege && <Col>
                        <div
                                className="d-flex justify-content-end form-check form-switch form-switch-warning mb-2 mb-md-0">
                                <Input className="form-check-input" type="checkbox" role="switch" id="SwitchCheck4"
                                       value={skip}
                                       onChange={handleSwitchChange}
                                       checked={skip === 2}
                                />
                                {/*<Label className="ms-1 fw-bold fs-15"*/}
                                {/*       htmlFor="SwitchCheck4"> {skip === 2 ? "Skipped" : "Skip"}</Label>*/}
                                <div
                                    className="ms-1 fw-bold fs-15"
                                    htmlFor="SwitchCheck4"> {skip === 2 ? "Skipped" : "Skip"}
                                </div>
                            </div>
                        </Col>}

                    </Row>
                </CardHeader>
                <CardBody>
                    <div className="row">
                        <div className="col-md-12">
                            <Row>
                                <Col xxl={12}>
                                    <Nav tabs style={{background: "transparent", borderWidth: 0}}
                                         className="nav-tabs mb-3 d-flex align-items-center justify-content-center ">
                                        {applicantData && applicantData.map((application, index) => (
                                            <NavItem key={index}>
                                                <NavLink
                                                    style={{cursor: "pointer"}}
                                                    className={classnames({active: activeTab === index})}
                                                    onClick={() => {
                                                        toggleChange(index); filterFunction(application).then(r => console.log(r));
                                                    }}
                                                >
                                                    {application.applicant_name}
                                                </NavLink>
                                            </NavItem>
                                        ))}
                                    </Nav>
                                    <TabContent activeTab={activeTab}
                                                className="text-muted">
                                        {
                                            applicantData && applicantData.map((application, index) => {
                                                const bureauIndividualInformation = application?.bureau_details?.bureau_data?.computed_data?.individual_information;
                                                return (
                                                    <TabPane key={index} tabId={index} id={`id_${index}`}>
                                                        <Card>
                                                        <CardBody>
                                                            {!application.bureau_details?.bureau_data != null && application?.bureau_details?.bureau_data?.status !== 3 ?

                                                                <div>
                                                                    {/* Case: Bureau error (-2) */}
                                                                    {application?.bureau_details?.bureau_data?.status === -2 && (
                                                                        <>
                                                                            <div className="col-md-12 d-flex flex-column justify-content-center align-items-center p-4">

                                                                                <div className="w-100 p-4 mb-3 rounded-4 shadow border border-danger bg-danger-subtle text-danger text-center">
                                                                                    <div className="mb-3 fw-bold">
                                                                                        {application?.bureau_details?.bureau_data?.response_data
                                                                                            ? JSON.stringify(application.bureau_details.bureau_data.response_data, null, 2)
                                                                                            : "Error while fetching bureau data!"}
                                                                                    </div>

                                                                                    <div className="fw-semibold small">
                                                                                        Action Required: Please fix the above error before clicking “Re-Process Report.”
                                                                                    </div>
                                                                                </div>

                                                                                {/* Re-Process Button */}
                                                                                {!Loading ? (
                                                                                    !restrictMode && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-danger outline"
                                                                                            onClick={() => initiateWorkFlow(applicantData[activeTab] , 'reProcess')}
                                                                                        >
                                                                                            Re-Process Report
                                                                                        </button>
                                                                                    )
                                                                                ) : (
                                                                                    <div className="spinner-border text-danger" role="status">
                                                                                        <span className="visually-hidden">Loading...</span>
                                                                                    </div>
                                                                                )}

                                                                            </div>


                                                                        </>
                                                                    )}

                                                                    {/* Case: Status is neither completed (4) nor error (-2) → Show Generate */}
                                                                    {application?.bureau_details?.bureau_data?.status !== 4 &&
                                                                        application?.bureau_details?.bureau_data?.status !== -2 && (
                                                                            <div className="col-md-12 d-flex justify-content-center align-items-center p-4">
                                                                                {!Loading ? (
                                                                                    !restrictMode && (
                                                                                        <Button onClick={() => initiateWorkFlow(applicantData[activeTab])}>
                                                                                            Generate Report
                                                                                        </Button>
                                                                                    )
                                                                                ) : (
                                                                                    <Loader />
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                    {/* Case: Completed (4) → Show Questionnaire */}
                                                                    {application?.bureau_details?.bureau_data?.status === 4 && (
                                                                        <Questionnaire
                                                                            submitQuestionnaire={submitQuestionnaire}
                                                                            source_id={application.bureau_details?.bureau_data?.bureau_analysis_id}
                                                                            work_order_id={application.bureau_details?.bureau_data?.work_order_id}
                                                                            questions={application.bureau_details?.bureau_data?.questionnaire_data}
                                                                        />
                                                                    )}
                                                                </div>
                                                                :
                                                                <div className="row">
                                                                    <div
                                                                        className={`${onlyScoreView ? "col-md-12" : "col-md-4"} col-sm-12`}>
                                                                        <Card
                                                                            className="card-height-100 border-1 shadow-md">
                                                                            <CardHeader
                                                                                className="text-center">
                                                                                <h4>{productCode?.title}</h4>
                                                                            </CardHeader>
                                                                            <div
                                                                                className={`card-body ${onlyScoreView && " h-75"} `}>
                                                                                <ReportChart
                                                                                    creditScore={application.bureau_details?.bureau_data?.computed_data?.individual_information?.score ?? 0}/>
                                                                            </div>
                                                                        </Card>
                                                                    </div>
                                                                    {!onlyScoreView && <div className="col-md-8">
                                                                        <Card className="border-1 shadow-md">
                                                                            <CardHeader>
                                                                                <h5>Profile Details</h5>
                                                                            </CardHeader>
                                                                            <CardBody>
                                                                                <Col xl={12}>
                                                                                    <Row>
                                                                                        <Col xs={6} md={4}>
                                                                                            <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-user-2-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">First
                                                                                                        Name :</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.first_name}</h6>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-user-2-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">Last
                                                                                                        Name :</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.last_name}</h6>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-cake-2-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">DOB
                                                                                                        :</p>
                                                                                                    <h6 className="text-truncate mb-0">{formatDateMMDDYYYY(application.bureau_details.dob)}</h6>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-phone-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">Mobile
                                                                                                        :</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.mobile}</h6>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-mail-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">Email
                                                                                                        :</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.email}</h6>
                                                                                                </div>
                                                                                            </div>
                                                                                        </Col>

                                                                                        <Col xs={6} md={4}>
                                                                                            <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-user-location-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">Address
                                                                                                        :</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.address.line_1},</h6>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.address.area},</h6>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.address.city},</h6>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.address.state},</h6>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details.address.pincode}</h6>
                                                                                                </div>
                                                                                            </div>
                                                                                            {application.bureau_details?.bureau_data?.computed_data?.individual_information?.email && <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-user-location-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">Email
                                                                                                        from {productCode?.label}:</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details?.bureau_data?.computed_data?.individual_information?.email}</h6>
                                                                                                </div>
                                                                                            </div>}
                                                                                            {application.bureau_details?.bureau_data?.computed_data?.individual_information?.full_name && <div
                                                                                                className="d-flex mt-2">
                                                                                                <div
                                                                                                    className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                                                    <div
                                                                                                        className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                                                        <i className="ri-user-location-fill"></i>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="flex-grow-1 overflow-hidden">
                                                                                                    <p className="mb-1">Full Name from {productCode?.label}:</p>
                                                                                                    <h6 className="text-truncate mb-0">{application.bureau_details?.bureau_data?.computed_data?.individual_information?.full_name}</h6>
                                                                                                </div>
                                                                                            </div>}
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </CardBody>
                                                                        </Card>
                                                                    </div>}
                                                                    {showDetails && <div>
                                                                        <div className="col-md-12 col-sm-12">
                                                                            <Card className="border-1 shadow-md">
                                                                                <CardHeader>
                                                                                    <h5 className="card-title mb-0">Credit Standing
                                                                                    </h5>
                                                                                </CardHeader>
                                                                                <CardBody>
                                                                                    <Row className="d-flex flex-wrap">
                                                                                        <PlainWidgets
                                                                                            color="success"
                                                                                            icon="ri-user-line"
                                                                                            value={applicantData[index]?.bureau_details?.bureau_data?.computed_data?.accounts?.length ?? 0}
                                                                                            label="Total Loan Accounts"
                                                                                        />

                                                                                            <PlainWidgets
                                                                                                color="warning"
                                                                                                icon="ri-user-follow-line"
                                                                                                value={summaryDetails?.totalActive ?? 0}
                                                                                                label="Active Loan Accounts"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-user-unfollow-line"
                                                                                                value={summaryDetails?.totalClosed ?? 0}
                                                                                                label="Closed Loan Accounts"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="info"
                                                                                                icon="ri-user-settings-line"
                                                                                                value={summaryDetails?.totalOther ?? 0}
                                                                                                label="Other Loan Accounts"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="warning"
                                                                                                icon="ri-file-shield-line"
                                                                                                value={formatIndianCurrency(bureauIndividualInformation?.total_secured_balance_amount ?? 0)}
                                                                                                label="Secured Amount"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-secure-payment-fill"
                                                                                                value={formatIndianCurrency(bureauIndividualInformation?.total_unsecured_balance_amount ?? 0)}
                                                                                                label="UnSecured Amount"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.zero_bal_accounts ?? 0}
                                                                                                label="Zero Balance Account"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={formatIndianCurrency(bureauIndividualInformation?.overdue_amount ?? 0)}
                                                                                                label="Total Overdue Amount"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-exchange-dollar-fill"
                                                                                                value={formatIndianCurrency(bureauIndividualInformation?.total_balance_amount ?? 0)}
                                                                                                label="Total Pending Amount"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-exchange-dollar-fill"
                                                                                                value={formatIndianCurrency(bureauIndividualInformation?.sanctioned_amount ?? 0)}
                                                                                                label="Sanctioned Amount"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.last_30_days_dpd ?? 0}
                                                                                                label={
                                                                                                    <>
                                                                                                        Last 1 Month DPD
                                                                                                        {bureauIndividualInformation?.account_one_month_dpd > 0 && (
                                                                                                            <span className="text-primary ms-2 fst-italic text-info">
                                                                                                                (No. of accounts: {application.bureau_details.bureau_data.computed_data.individual_information.account_one_month_dpd})
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                }
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="warning"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.last_90_days_dpd ?? 0}
                                                                                                label={
                                                                                                    <>
                                                                                                        Last 3 Month DPD
                                                                                                        {bureauIndividualInformation?.account_three_month_dpd > 0 && (
                                                                                                            <span className="text-primary ms-2 fst-italic text-info">
                                                                                                                (No. of accounts: {application.bureau_details.bureau_data.computed_data.individual_information.account_three_month_dpd})
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                }
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.last_180_days_dpd ?? 0}
                                                                                                label={
                                                                                                    <>
                                                                                                        Last 6 Month DPD
                                                                                                        {bureauIndividualInformation?.account_six_month_dpd > 0 && (
                                                                                                            <span className="text-primary ms-2 fst-italic text-info">
                                                                                                                (No. of accounts: {application.bureau_details.bureau_data.computed_data.individual_information.account_six_month_dpd})
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                }
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.last_9months_dpd ?? 0}
                                                                                                label={
                                                                                                    <>
                                                                                                        Last 9 Months DPD
                                                                                                        {bureauIndividualInformation?.account_nine_month_dpd > 0 && (
                                                                                                            <span className="text-primary ms-2 fst-italic text-info">
                                                                                                                (No. of accounts: {application.bureau_details.bureau_data.computed_data.individual_information.account_nine_month_dpd})
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                }
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.last_1year_dpd ?? 0}
                                                                                                label={
                                                                                                    <>
                                                                                                        Last 1 Year DPD
                                                                                                        {bureauIndividualInformation?.account_one_year_dpd > 0 && (
                                                                                                            <span className="text-primary ms-2 fst-italic text-info">
                                                                                                                (No. of accounts: {application.bureau_details.bureau_data.computed_data.individual_information.account_one_year_dpd})
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                }
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="primary"
                                                                                                icon="ri-anticlockwise-line"
                                                                                                value={bureauIndividualInformation?.last_2year_dpd ?? 0}
                                                                                                label={
                                                                                                    <>
                                                                                                        Last 2 Years DPD
                                                                                                        {bureauIndividualInformation?.account_two_year_dpd > 0 && (
                                                                                                            <span className="text-primary ms-2 fst-italic text-info">
                                                                                                                (No. of accounts: {application.bureau_details.bureau_data.computed_data.individual_information.account_two_year_dpd})
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </>
                                                                                                }
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-exchange-dollar-fill"
                                                                                                value={bureauIndividualInformation?.recent_open_date || 0}
                                                                                                label="Recent Opened Date"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-exchange-dollar-fill"
                                                                                                value={bureauIndividualInformation?.oldest_open_date || 0}
                                                                                                label="Oldest Opened Date"
                                                                                            />
                                                                                            <PlainWidgets
                                                                                                color="success"
                                                                                                icon="ri-exchange-dollar-fill"
                                                                                                value={bureauIndividualInformation?.recent_closed_date || 0}
                                                                                                label="Recent Closed Date"
                                                                                            />
                                                                                            {
                                                                                                bureauIndividualInformation?.total_enquiry >= 1 &&
                                                                                                <>
                                                                                                    <PlainWidgets
                                                                                                        color="success"
                                                                                                        icon="ri-exchange-dollar-fill"
                                                                                                        value={formatIndianCurrency(bureauIndividualInformation?.total_enquiry ?? 0)}
                                                                                                        label="Total Enquiry"
                                                                                                    />
                                                                                                    <PlainWidgets
                                                                                                        color="success"
                                                                                                        icon="ri-anticlockwise-line"
                                                                                                        value={bureauIndividualInformation?.past_30_days_enq ?? 0}
                                                                                                        label="Last 1 Month Enquiry"
                                                                                                    />
                                                                                                    <PlainWidgets
                                                                                                        color="success"
                                                                                                        icon="ri-anticlockwise-line"
                                                                                                        value={bureauIndividualInformation?.past_12_months_enq ?? 0}
                                                                                                        label="Last 1 Year Enquiry"
                                                                                                    />
                                                                                                    <PlainWidgets
                                                                                                        color="success"
                                                                                                        icon="ri-exchange-dollar-fill"
                                                                                                        value={bureauIndividualInformation?.recent_enquiry_date || 0}
                                                                                                        label="Recent Enquiry Date"
                                                                                                    />
                                                                                                </>

                                                                                            }


                                                                                        </Row>
                                                                                    </CardBody>
                                                                                </Card>
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <Card
                                                                                    className="card-height-100 border-1 border-primary shadow-md">
                                                                                    <CardHeader
                                                                                        className="align-items-center d-flex">
                                                                                        <h5 className="card-title mb-0">Credit Summary</h5>
                                                                                    </CardHeader>
                                                                                    <CardBody>
                                                                                        <Row>
                                                                                            <CardWidgets
                                                                                                key={index}
                                                                                                color="primary"
                                                                                                icon="ri-bank-line"
                                                                                                filters={filterLoanType}
                                                                                                type={"ALL"}
                                                                                                isActive={selectedLoanType === "ALL"}
                                                                                                counts={1}
                                                                                                total={applicantData[index]?.bureau_details?.bureau_data?.computed_data?.accounts?.length ?? 0}
                                                                                                active={summaryDetails?.totalActive ?? 0}
                                                                                                closed={summaryDetails?.totalClosed ?? 0}
                                                                                                other={summaryDetails?.totalOther ?? 0}
                                                                                                label={"ALL"} />
                                                                                            {loanTypes?.length ? loanTypes.map((loanType, index) => (
                                                                                                <CardWidgets
                                                                                                    key={index}
                                                                                                    color="primary"
                                                                                                    icon="ri-bank-line"
                                                                                                    filters={filterLoanType}
                                                                                                    type={summaryDetails?.summaryMap[loanType]}
                                                                                                    isActive={selectedLoanType === loanType}
                                                                                                    counts={1}
                                                                                                    // value={bureauIndividualInformation?.no_of_closed_account ?? 0}
                                                                                                    label={loanType} />
                                                                                            )) : <></>}
                                                                                        </Row>
                                                                                    </CardBody>
                                                                                    <div
                                                                                        className="d-flex align-items-center justify-content-end px-3">
                                                                                        <ButtonGroup>
                                                                                            {options.map((option) => (
                                                                                                <Button
                                                                                                    key={option}
                                                                                                    color="primary"
                                                                                                    outline={activeRange !== option}
                                                                                                    active={activeRange === option}
                                                                                                    onClick={() => handleStatusChange(option)}
                                                                                                >
                                                                                                    {option}
                                                                                                </Button>
                                                                                            ))}
                                                                                        </ButtonGroup>
                                                                                    </div>
                                                                                    <CardBody>
                                                                                        <div className="p-6">
                                                                                            <BureauLoanAccountDetails
                                                                                                openIndex={openIndex}
                                                                                                toggle={toggle}
                                                                                                filterAccounts={filteredAccounts} />
                                                                                        </div>
                                                                                    </CardBody>
                                                                                </Card>
                                                                            </div>
                                                                            <div className="col-md-12">
                                                                                <Card
                                                                                    className="card-height-100 border-1 border-primary shadow-md">
                                                                                    <CardHeader
                                                                                        className="align-items-center d-flex">
                                                                                        <h5 className="card-title mb-0">Enquiry
                                                                                            Summary</h5>
                                                                                    </CardHeader>
                                                                                    <CardBody>
                                                                                        <Row>
                                                                                            <CardWidgets
                                                                                                key={index}
                                                                                                color="primary"
                                                                                                icon="ri-file-search-line"
                                                                                                filters={filterEnquiryPurpose}
                                                                                                type={"ALL"}
                                                                                                isActive={selectedEnquiry === "ALL"}
                                                                                                counts={0}
                                                                                                total={applicantData[index]?.bureau_details?.bureau_data?.computed_data?.enquiry?.length ?? 0}
                                                                                                label={"ALL"} />
                                                                                            {enquiryPurpose?.length ? enquiryPurpose.map((enquiry, index) => (
                                                                                                <CardWidgets
                                                                                                    key={index}
                                                                                                    color="primary"
                                                                                                    icon="ri-file-search-line"
                                                                                                    filters={filterEnquiryPurpose}
                                                                                                    isActive={selectedEnquiry === enquiry}
                                                                                                    counts={0}
                                                                                                    type={enquirySummaryDetails[enquiry]}
                                                                                                    // value={bureauIndividualInformation?.no_of_closed_account ?? 0}
                                                                                                    label={enquiry} />
                                                                                            )) : <></>}
                                                                                        </Row>
                                                                                    </CardBody>
                                                                                    <CardBody>
                                                                                        <Col xl={12}>
                                                                                            <BureauEnquiryList
                                                                                                data={filteredEnquirys} />
                                                                                        </Col>
                                                                                    </CardBody>
                                                                                    <CardBody>
                                                                                        <Col xl={12}>
                                                                                            <h5>Phone Numbers List</h5>

                                                                                            {(() => {
                                                                                                const accounts = application?.bureau_details?.bureau_data?.computed_data?.accounts || [];
                                                                                                console.log("Accounts:", accounts);

                                                                                                const allNumbers = accounts.flatMap(acc => {
                                                                                                    console.log("Account:", acc.account_number, acc);
                                                                                                    return acc.account_phone_number?.map(p => {
                                                                                                        console.log("Phone Object:", p);
                                                                                                        return p.number;
                                                                                                    }) || [];
                                                                                                });

                                                                                                console.log("All Extracted Numbers:", allNumbers);

                                                                                                const uniqueNumbers = [...new Set(allNumbers.filter(Boolean))];
                                                                                                console.log("Unique Clean Numbers:", uniqueNumbers);

                                                                                                return uniqueNumbers.length > 0 ? (
                                                                                                    <ul>
                                                                                                        {uniqueNumbers.map((num, i) => (
                                                                                                            <li key={i}>{num}</li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                ) : (
                                                                                                    <p>No phone numbers available</p>
                                                                                                );
                                                                                            })()}



                                                                                        </Col>

                                                                                    </CardBody>
                                                                                </Card>
                                                                            </div>
                                                                        </div>}

                                                                    </div>
                                                                }
                                                            </CardBody>
                                                        </Card>
                                                    </TabPane>
                                                );
                                            })
                                        }
                                    </TabContent>

                                </Col>
                            </Row>
                        </div>
                    </div>
                </CardBody>
            </Card>
            {(!props.restrictMode && !props.hideButton) && <div
                className={`${props.theme === theme['mobile'] && "card position-fixed bottom-0 start-0 w-100 px-2 z-2 mb-0 p-2"}`}>
                <div
                    className={`d-flex justify-content-between `}>
                    <button
                        className={`btn btn-primary rounded-5`} disabled={props?.progress}
                        type={'button'} onClick={() => {
                            props.moveBackward(props.stageID, props.stepID, props.data, id)
                        }}> {!props?.progress &&
                            <i className={"ri-arrow-left-line label-icon align-middle"}></i>} {props?.progress ?
                                <span><span className="spinner-border spinner-border-sm text-light me-2"
                                    role="status"></span> <span className={`${isMobile && 'd-none'}`}>Loading...</span></span> : props.theme === theme['mobile'] ? "" : "Back"}
                    </button>
                    <button
                        className={`btn btn-primary ${props.theme === theme['mobile'] ? "w-100 ms-1 rounded-4 fs-5 " : "rounded-5"}`}
                        type={'button'} disabled={props?.progress}
                        onClick={() => {
                            if (skip === 2) {
                                proceedToSkip()
                            } else if (skip === 1) {
                                proceedToRun()
                            } else if (props.viewMode) {
                                props.moveToNextStep(props.stageID, props.stepID, props.data, isEdit, false)
                            } else {
                                props.moveToNextStep(props.stageID, props.stepID, props.data, true, true)
                            }
                        }}>
                        {props.viewMode ? 'Next' : props?.progress ?
                            <span><span className="spinner-border spinner-border-sm text-light me-2"
                                role="status"></span> Loading...</span> : "Save & Next"}
                        {(skip === 2) ? '(Skipped)' : ''}
                        {!props.progress && <i className="ri-arrow-right-line label-icon align-middle ms-2"></i>}
                    </button>
                </div>
            </div>
            }
        </React.Fragment>
    )
        ;
};

export default CreditBureau;