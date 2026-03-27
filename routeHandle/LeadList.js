import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TableContainer from "../../Components/Common/TableContainerReactTableWithPageNo";
import {
    Badge,
    Button, ButtonGroup,
    Card,
    CardBody,
    Col,
    DropdownItem, DropdownMenu, DropdownToggle, Form, Label,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader, Row, UncontrolledDropdown
} from "reactstrap";
import axios from "axios";
import JSONbig from "json-bigint";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import LeadListFilter from "./../../Components/Common/LeadListFilter";
import Swal from "sweetalert2";
import {
    journeyAndType,
    loanStatus,
    brandName, pageCode, ApplicantCategory, workflowType, reopenType,
    journeyType, noteScope
} from "../constants/constant";
import Loader from '../../Components/Common/Loader'
import WorkFlowSummary from "../../Components/WorkFlow/WorkFlowSummary";
import { isMobile } from "react-device-detect";
import { getModuleObj } from "../../helpers/api_helper";
import { GetCall, PostCall } from "../helper/ApiProvider";
import { APIENDPOINTS } from "../helper/ApiEndPoint";
import LenderStatusCard from "../../Components/LenderLogin/LenderStatusCard";
import OfferDetailCapture from "../../Components/LenderLogin/OfferDetailCapture";
import { useTenantConfiguration } from "../Common/TenantConfigurationProvider";
import ExportXLSXModal from "../Common/ExportXLSXModal";
import LenderStage from "../../Components/LenderLogin/LenderStage";
import Ask from "../../Components/PartnerOnboarding/Ask";
import { AmountExtractorWithComma } from "../helper/utility";
import ParticipantDetails from "../../Components/LeadCreation/ParticipantDetails";

import ActivityStream from "../Common/ActivityStream";
import ReopenLead from "../../Components/LenderLogin/ReopenLead"
import BankParser from "../LeadCreation/BankParser";
import CreditBureau from "../LeadCreation/CreditBureau";
import { useDispatch } from "react-redux";
import { fetchAppliedLenders } from "../redux/LenderLogin/LenderLoginThunk";
import Select from "react-select";
import ErrorMessage from "../LeadCreation/ErrorMessage";
import { useFormik } from "formik";
import * as Yup from "yup";
import swal from "sweetalert2";

const SearchTable = ({ listName, param, isReAssign, setOpen, filteredJourneyType, addEnquiry, module, navigateUrl }) => {
    console.log("map_id", module)
    const configuration = useTenantConfiguration()
    console.log(configuration, "configuration")
    const tenantName = configuration?.tenant?.TENANT_NAME
    const isTerritoryEnabled = configuration?.tenant?.TERRITORY_ENABLED
    const servicedBy = configuration?.tenant?.APPLICATION_SERVICING_ROLE_CODE;
    const processBy = configuration?.tenant?.APPLICATION_PROCESSING_ROLE_CODE;
    const ApplicationMobileMasked = configuration?.tenant?.APPLICATION_MOBILE_MASK_ENABLED
    const [leadListData, setLeadListData] = useState([]);
    const [assignAccess, setAssignAccess] = useState(false)
    const [syncModal, setSyncModal] = useState(false);
    const [employeeId, setEmployeeId] = useState(0);
    const [employeeName, setEmployeeName] = useState("");
    const [applicationId, setApplicationId] = useState(0);
    const [responseMessage, setResponseMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [modalEmployeeMapping, setModalEmployeeMapping] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [leadListPagination, setLeadListPagination] = useState([]);
    const [totalPages, setTotalPages] = useState(0)
    const [clickedValue, setClickedValue] = useState(1)
    const [isFilter, setIsFilter] = useState(false)
    const [isInfoDetails, setIsInfoDetails] = useState(false);
    const [progress, setProgress] = useState(true)
    const [dataNull, setDataNull] = useState(false)
    const [isSummary, setIsSummary] = useState(false)
    const [isAppliedLenders, setIsAppliedLenders] = useState(false)
    const [action, setAction] = useState('')
    const [summaryData, setSummaryData] = useState({})
    const [loader, setLoader] = useState(false)
    const [viewAccess, setViewAccess] = useState(false)
    const [summaryAccess, setSummaryAccess] = useState(false)
    const [participantAccess, setParticipantAccess] = useState(false)
    const [askAccess, setAskAccess] = useState(false)
    const [lenderListArr, setLenderListArr] = useState([])
    const [selectedLender, setSelectedLender] = useState(null);
    const [viewLenderDetails, setViewLenderDetails] = useState(false);
    const [viewOfferDetails, setViewOfferDetails] = useState(false);
    const [loading, setLoading] = useState(false)
    const [isExportXlsx, setIsExportXlsx] = useState(false);
    const [leadList, setLeadList] = useState([]);
    const [lenderData, setLenderData] = useState({});
    const hashValue = useLocation();
    const type = hashValue.hash.substring(1);
    const [exportAccess, setExportAccess] = useState(false);
    const [togAskModal, setTogAskModal] = useState(false);
    const [togglePartner, setTogglePartner] = useState(false);
    const [workflowDefinition, setWorkflowDefinition] = useState([]);
    const [askAvailableStages, setAskAvailableStages] = useState([]);
    const [isActivityStreamView, setIsActivityStreamView] = useState(false);
    const [toggleReopen, setToggleReopen] = useState(false)
    const [reopenStatus, SetReopenStatus] = useState(null)
    const [leadCode, setLeadCode] = useState(null);
    const [isBankOpen, setIsBankOpen] = useState(false);
    const [bankStatementProps, setBankStatementProps] = useState([]);
    const [isCreditOpen, setIsCreditOpen] = useState(false);
    const [creditBureauData, setCreditBureauData] = useState([]);
    const [bankStatementAccess, setBankStatementAccess] = useState(false)
    const [creditBureauAccess, setCreditBureauAccess] = useState(false)
    const [activityStreamAccess, setActivityStreamAccess] = useState(false)
    const [lenderStatusAccess, setLenderStatusAccess] = useState(false)
    const [serviceByList, setServicedByList] = useState([]);
    const [excludeJourneys, setExcludeJourneys] = useState("")
    const [includedJourneys, setIncludedJourneys] = useState("")
    const [status, setStatus] = useState("")
    const location = useLocation();
    const [filterData, setFilterData] = useState(location.state);

    useEffect(() => {
        setFilterData(location?.state);
        setClickedValue(1);
    }, [module?.module_id]);

    const dispatch = useDispatch()

    let setupData;

    const toggleInfo = () => {
        setIsInfoDetails(!isInfoDetails);
    };

    const toggleAskModal = async (applicationId) => {
        setApplicationId(applicationId)
        if (!togAskModal) {
            let params = {
                workflow_type: workflowType.LeadCreation,
                // eslint-disable-next-line no-undef
                source_id: applicationId.toString(),
            }
            const response = await PostCall(APIENDPOINTS.WORKFLOW_BUILD, params)
            if (response.status) {
                setProgress(false);
                const { data } = response.data
                if (data && data?.stages != null) {
                    setWorkflowDefinition(response.data?.data);
                    setAskAvailableStages(data.stages.map(stage => {
                        if (stage.configuration != null) {
                            if (stage.configuration != null && stage.configuration.trim() !== "") {
                                const parsedConfig = stage.configuration;
                                if (parsedConfig && parsedConfig.ask === true) {
                                    return { label: stage.name, value: stage.id };
                                }
                            }
                        }
                        return null; // Return null for stages that don't meet the criteria
                    }).filter(stage => stage !== null));
                    setTogAskModal(!togAskModal)
                } else {
                    setWorkflowDefinition([])
                }

            } else {
                await Swal.fire({
                    text: `${response.message.error[0].message ? response.message.error[0].message : "Build Error"}`,
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2000
                })
            }
        } else {
            setTogAskModal(!togAskModal)
        }


    }
    console.log("excludeJourneys", excludeJourneys)
    const togglePartnerModel = (applicationId) => {
        setTogglePartner(!togglePartner)
        if (!togglePartner) {
            setApplicationId(applicationId.toString())
        }
    }
    const toggleReopenModel = (applicationId, code, leadStatus) => {
        setToggleReopen(!toggleReopen)
        if (!toggleReopen) {
            setApplicationId(applicationId.toString())
            SetReopenStatus(leadStatus)
            setLeadCode(code)
        }
    }

    const toggleSummary = () => {
        setIsSummary(!isSummary)
    }
    const toggleAppliedLenders = () => {
        setIsAppliedLenders(!isAppliedLenders)
    }

    useEffect(() => {
        console.log("filterData", filterData)
        if (filterData !== null) {
            getLeadList(filterData);
            console.log("filterData - 1", filterData)
        } else if (module?.configuration) {
            getLeadList({ configurationData: module.configuration });
            console.log("filterData - 2", filterData)
        } else if (module) {
            getLeadList(filterData)
            console.log("filterData - 3", filterData)
        } else if (listName) {
            getLeadList(filterData)
            console.log("filterData - 4", filterData)
        }
        getPreveliges();
        getSetupData().then(r => r && console.log(r));
        setLenderListArr([])
    }, [filterData, clickedValue, type, param, module, module?.module_id]);

    const getPreveliges = () => {
        // pageCode.EmployeePortal.LeadView
        let pageCodeValue;
        switch (listName) {
            case 'LEADVIEW':
                pageCodeValue = pageCode.EmployeePortal.LeadView;
                break;
            case 'FULFILLED':
                pageCodeValue = pageCode.EmployeePortal.FullfilledLead;
                break;
            case 'ARCHIVED':
                pageCodeValue = pageCode.EmployeePortal.ArchivedLead;
                break;
            case 'LEADLIST':
                pageCodeValue = pageCode.PartnerPortal.LeadList;
                break;
            default:
                pageCodeValue = module ? module?.code : "";
                break;
        }
        if (module?.code === pageCode.EmployeePortal.amBlLeadList) {
            pageCodeValue = module.code
        }
        console.log('pageCodeValue', pageCodeValue)

        let myModuleList = getModuleObj(pageCodeValue);

        myModuleList == null && (myModuleList = module)

        console.log('myModuleList lead list ', myModuleList)

        if (myModuleList.allowedPermission?.view) {
            setViewAccess(true);
        }

        if (myModuleList.allowedPermission?.summary) {
            setSummaryAccess(true);
        }
        if (myModuleList.allowedPermission?.export) {
            setExportAccess(true);
        }
        if (myModuleList.allowedPermission?.partcipant_details) {
            setParticipantAccess(true);
        }
        if (myModuleList.allowedPermission?.ask_details) {
            setAskAccess(true);
        }
        if (myModuleList.allowedPermission?.assign === true) {
            setAssignAccess(true)
        }
        if (myModuleList.allowedPermission?.bank_statement) {
            setBankStatementAccess(true)
        }
        if (myModuleList.allowedPermission?.credit_bureau) {
            setCreditBureauAccess(true)
        }
        if (myModuleList.allowedPermission?.activity_stream) {
            setActivityStreamAccess(true)
        }
        if (myModuleList.allowedPermission?.lender_status) {
            setLenderStatusAccess(true)
        }
        if (myModuleList.configuration?.exclude_journey_types !== null) {
            setExcludeJourneys(myModuleList.configuration?.exclude_journey_types)
        }
        if (myModuleList.configuration?.include_journey_types !== null) {
            setIncludedJourneys(myModuleList.configuration?.include_journey_types)
        }
        if (myModuleList.configuration?.status !== null) {
            setStatus(myModuleList.configuration?.status)
        }
    }


    useEffect(() => {
        getSetupData().then(r => console.log(r));
        servicedBy && getServicedBylist()
    }, []);

    const getSetupData = async () => {
        const response = await PostCall(APIENDPOINTS.SETUP, {});
        if (response.status) {
            setupData = response.data.data?.tenant;
        } else {
            console.log(response.message)
        }
    }
    console.log(setupData);

    const handleAssign = (application_id, user_id, territory_id) => {
        setModalEmployeeMapping(true);
        if (module?.allowed_permission?.assign_type === "PROCESSED_BY") {
            getAssignByList(processBy, territory_id)
        } else if (module?.allowed_permission?.assign_type === "SERVICED_BY") {
            getAssignByList(servicedBy, territory_id)

        }
        setApplicationId(application_id);
    }

    const formik = useFormik({
        initialValues: {
            user_id: ""
        },
        onSubmit: async (values) => {
            assignRepresentedBy();
        },
        validationSchema: Yup.object().shape({
            user_id: Yup.string().required("Employee is required")
        })
    });

    const handleEmployee = (e) => {
        setEmployeeId(e.value);
        setEmployeeName(e.label)
        formik.setFieldValue('user_id', e.value ? e.value : '');
    }

    const getServicedBylist = () => {
        const apiUrl = process.env.REACT_APP_API_URL + `/alpha/v1/employee?role_code=${servicedBy}`;
        axios.get(apiUrl, {
            transformResponse: function (response) {
                return JSONbig.parse(response);
            }
        }).then(response => {
            console.log("getProcessedBy", response)
            if (response.status === 1) {
                setServicedByList(response.data.map(item => ({
                    value: item.user_id,
                    label: item.name
                })))
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {

        });

        // console.log("Processed by list",serviceByList)

    }
    const getAssignByList = (assign_type, territory_id) => {
        const apiUrl = process.env.REACT_APP_API_URL + `/alpha/v1/employee?role_code=${assign_type}&territory_id=${territory_id}`;
        axios.get(apiUrl, {
            transformResponse: function (response) {
                return JSONbig.parse(response);
            }
        }).then(response => {
            console.log("getProcessedBy", response)
            if (response?.status === 1) {
                setServicedByList(response?.data?.map(item => ({
                    value: item?.user_id,
                    label: item?.name
                })) || [])
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {

        });
    }

    const assignRepresentedBy = () => {
        const apiUrl = process.env.REACT_APP_API_URL + `/alpha/v1/application/${applicationId}/assign`;
        let requestData = {
            participant_type: module?.allowed_permission?.assign_type ? module?.allowed_permission?.assign_type : 'SERVICED_BY',
            application_id: applicationId,
            user_id: employeeId,
        }
        axios.post(apiUrl, requestData, {
            transformResponse: function (response) {
                return JSONbig.parse(response)
            }
        }).then(response => {
            if (response.status === 1) {
                let inputs = {
                    scope: noteScope.applicationFlow,
                    reference_id: applicationId,
                    code: "LEAD_ASSIGNED",
                    content: `Lead serviced by ${employeeName}`,
                    sub_code: ["SERVICED_BY"]
                }
                let lenderResponse = PostCall(APIENDPOINTS.POST_NOTE, inputs)
                swal.fire(
                    'Assigned',
                    `Application Assigned`,
                    'success'
                )
                setModalEmployeeMapping(false);
                setEmployeeId(0);
                setApplicationId(0);
                formik.setFieldValue('user_id', '');
            }
        }).catch(error => {
            console.log("error", error)
        }).finally(() => {
            getLeadList({ filterData, includedJourneys: module?.configuration?.include_journey_types });

        });

    }

    const objectToQueryString = (paramsObject) => {
        const searchParams = new URLSearchParams();
        for (const key in paramsObject) {
            if (Object.prototype.hasOwnProperty.call(paramsObject, key)) {
                searchParams.append(key, paramsObject[key]);
            }
        }
        return searchParams.toString();
    };

    const getActivityStream = (appId) => {
        setApplicationId(appId)
        console.log("From Clicking AppId", appId)
        setIsActivityStreamView(!isActivityStreamView)
    }

    const getLeadList = useCallback((value) => {
        console.log("trigerr", value);

        let apiUrl = `${process.env.REACT_APP_API_URL}/alpha/v1/application?page=${clickedValue}`;
        const filterStatusValue = value?.filterData;
        const queryString = objectToQueryString(filterStatusValue);

        console.log("value", value);
        console.log("filterStatusValue", filterStatusValue);
        console.log("QueryString", queryString);

        if (value === undefined || value === null) {
            setFilterData("");
        }
        if (listName) {
            console.log(listName, 'listName')
            if (listName === "FULFILLED") apiUrl += `&status=3`;
            if (listName === "ARCHIVED") apiUrl += `&status=-1`;
            if (listName === "DEDUPE_Q") apiUrl += `&status=-2`;
        }
        if (filterStatusValue === null || filterStatusValue === undefined) {
            if (module?.configuration?.status && module?.configuration?.status !== "") {
                apiUrl += `&status=${module?.configuration?.status}`;
            } else if (value?.configurationData?.status) {
                apiUrl += `&status=${value?.configurationData?.status}`;
            } else if (status && status !== "") {
                apiUrl += `&status=${status}`;
            }
        }
        if (queryString) apiUrl += `&${queryString}`;
        if (filteredJourneyType || (includedJourneys && includedJourneys !== "")) {
            apiUrl += `&journey_type=${filteredJourneyType ? filterStatusValue : includedJourneys}`;
        } else if (value?.configurationData?.include_journey_types) {
            apiUrl += `&journey_type=${filteredJourneyType ? filterStatusValue : value?.configurationData?.include_journey_types}`;
        }
        if (excludeJourneys && excludeJourneys !== "") {
            apiUrl += `&exclude_journey_type=${excludeJourneys}`;
        }
        const header = {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        };
        if (module?.map_id != null) header["X-Module"] = module.map_id;
        console.log("Final API URL =>", apiUrl);
        axios
            .get(apiUrl, {
                transformResponse: (response) => JSONbig.parse(response),
                headers: header,
            })
            .then((response) => {
                console.log("lead response", response);

                if (response.data !== null) {
                    setLeadListData(response.data);
                    setLeadListPagination(response.pagination);
                    setLeadList(response.data);
                    setDataNull(false);
                } else {
                    setLeadListData([]);
                    setLeadList([]);
                    setLeadListPagination([]);
                    setDataNull(true);
                }
            })
            .catch((error) => {
                console.log("LeadList Error:", error);
            })
            .finally(() => {
                setProgress(false);
            });
    }, [
        clickedValue,
        listName,
        module?.map_id,
        module?.configuration?.status,
        filteredJourneyType,
        includedJourneys,
        excludeJourneys,
        setFilterData,
        setLeadListData,
        setLeadListPagination,
        setLeadList,
        setDataNull,
        setProgress,
    ]);


    useEffect(() => {
        const total = leadListPagination.total;
        const groupSize = 10;

        const numberOfGroups = Math.ceil(total / groupSize);

        const groups = [];

        for (let i = 0; i < numberOfGroups; i++) {
            const startIndex = i * groupSize;
            const endIndex = startIndex + groupSize;
            const currentGroup = Array.from(
                { length: groupSize },
                (_, index) => startIndex + index + 1
            );
            groups.push(currentGroup);
        }
        const totalPageNumber = groups.length;
        setTotalPages(totalPageNumber);
    }, [leadListPagination]);

    function formatDateString(dateString) {
        if (!dateString) {
            return null;
        }
        const [day, month, year] = dateString.split('/');
        const formatDateValue = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
        return formatDateValue;
    }

    const getFilterValues = (startDate, endDate, loanCode, loanStatus, mobileNo, journeyType, channelID, territoryType, territory, loanType, dateType, sourceType) => {
        const filterData = { filterData: {} };
        setClickedValue(1)
        setPageNumber(1)
        if (dateType) {
            filterData.filterData.date_type = dateType;
        }
        if (sourceType) {
            filterData.filterData.source_type = sourceType;
        }
        if (territory) {
            filterData.filterData.territory = territory;
        }
        if (loanType) {
            filterData.filterData.loan_type = loanType;
        }

        if (startDate) {
            filterData.filterData.start_date = formatDateString(startDate);
        }
        if (endDate) {
            filterData.filterData.end_date = formatDateString(endDate);
        }
        if (loanCode) {
            filterData.filterData.loan_code = loanCode;
        }
        if (loanStatus) {
            filterData.filterData.status = loanStatus;
        }
        if (mobileNo) {
            filterData.filterData.mobile_no = mobileNo;
        }
        if (journeyType) {
            filterData.filterData.journey_type = journeyType;
        }
        if (channelID) {
            filterData.filterData.channel_id = channelID
        }
        setFilterData(filterData);
        console.log("filterData", filterData)
        // getLeadList({filterData, includedJourneys: module.configuration.include_journey_types });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress':
                return '#8181e1';
            case 'Disbursed':
                return '#006400';
            case 'Approved':
                return '#008000';
            case 'Not approved':
                return '#ff0000';
            case 'Closed':
                return '#ff0000';
            case 'Rejected':
                return '#ff0000';
            case 'Pending':
                return '#ffce37';
            case "1":
                return "bg-primary-subtle text-dark"
            case "2":
                return "bg-primary-subtle text-primary"
            case "-1":
                return "bg-danger-subtle text-danger"
            case "3":
                return "bg-success-subtle text-success"
            default:
                return "bg-primary-subtle text-primary"
        }
    };

    const navigate = useNavigate();

    const leadDetailsSync = async (loanCode, applicationId, type, isAsk) => {
        try {
            setSyncModal(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            axios.get(process.env.REACT_APP_API_URL + `/alpha/v1/sync/direct-integrate/LOAN_DETAILS/${loanCode}`, {
                transformResponse: function (response) {
                    return JSONbig.parse(response);
                }
            }).then(response => {
                console.log(response);
                setIsSuccess(true);
                setResponseMessage('Lead Details Sync was Successful');
                setApplicationId(applicationId)

                setTimeout(() => {
                    setSyncModal(false);
                    setResponseMessage('');
                    isMobile ? navigate(`/lead/mobile/create/${applicationId}#${type}`, {
                        state: {
                            key: "edit_lead",
                            ask: isAsk
                        }
                    }) :
                        navigate(`/lead/create/${applicationId}#${type}`, { state: { key: "edit_lead", ask: isAsk } })
                }, 1000)

            }).catch(error => {
                console.log(error);
                setResponseMessage('Error Syncing Data');
                // setApplicationId(applicationId)

                setTimeout(() => {
                    setSyncModal(false);
                    setResponseMessage('');

                }, 1000)
            });
        } catch (error) {
            console.log('Error sync data:', error);
        }
    };


    const handleEditLead = (loanCode, applicationId, type, isAsk) => {
        leadDetailsSync(loanCode, applicationId, type, isAsk);
    };

    const getWorkflowSummary = (applicationID, applicationType) => {
        setLoader(true)
        console.log('id', applicationID)
        console.log('type', applicationType)
        console.log('module', module)
        toggleSummary()
        // let workflowType = applicationType === "FULL_FLEDGED_APPLICATION" ? leadWorkflowType["FullFilledLead"] : leadWorkflowType["ShortLead"]
        let workflowType = module?.configuration?.workflow_type || "LEAD_CREATION"
        axios.get(process.env.REACT_APP_API_URL + `/alpha/v1/workflow/summary?source_id=${applicationID}&source_type=${workflowType}`, {
            transformResponse: (response) => JSONbig.parse(response)
        }).then((response) => {
            console.log('Workflow summary', response.data)
            console.log('headers----', response.headers)
            if (response.data && Object.keys(response.data).length > 0) {
                setSummaryData(response.data)

                setLoader(false)
            }
        })

    }
    const getLenderStatus = async (applicationID) => {
        setApplicationId(applicationId)
        setLoader(true)
        console.log('id', applicationID)
        setViewOfferDetails(false)
        setSelectedLender(null)
        toggleAppliedLenders()
        dispatch(fetchAppliedLenders({ applicationId: applicationID }))
        let URL = APIENDPOINTS.GET_APPLIED_LENDER.replace(":applicationId", applicationID)
        let response = await GetCall(URL)
        if (response.data?.status) {
            if (response.data?.result) {
                const appliedLenderList = response ? response.data?.result?.map((option, index) => {
                    // lenderStatus[index]=option.apply_status;
                    return ({
                        "name": option.lender.lender_name,
                        "lenderId": option.lender.lender_id,
                        "lenderLogo": option.lender.lender_logo,
                        "data": option,
                        "apply_status": option.apply_status,
                        "updatedDate": option.updated_date,
                        "loanTypeId": option.lender.loan_type_id
                    })
                }) : [];
                setLenderListArr(appliedLenderList)
            } else {
                setLenderListArr([])
            }
            setLoader(false)
        }
    }

    //bank statement parser screen implement
    const bankStatementToggle = () => {
        setIsBankOpen(!isBankOpen);
    }

    const getBankStatementParser = (data) => {
        console.log('bank parse ind', data);
        const setData = {
            stageID: null,
            stepID: null,
            viewMode: false,
            data: {
                application: {
                    application_id: data?.application_id,
                    application_code: data?.code,
                    loan_type_code: data?.loan_type_code,
                    loan_code: data?.loan_code,
                    onboarding_id: data?.onboarding_id
                }
            },
            isLastStep: {},
            customStyles: {},
            moveNextStep: {},
            moveBackward: {},
            theme: ''
        };
        setBankStatementProps([setData]);
        bankStatementToggle();
    }
    const getCreditBureau = (data) => {
        console.log(data)
        const setData = {
            stageID: null,
            stepID: null,
            viewMode: false,
            data: {
                application: {
                    application_id: data?.application_id,
                    application_code: data?.code,
                    loan_type_code: data?.loan_type_code,
                    loan_code: data?.loan_code,
                    onboarding_id: data?.onboarding_id
                }
            },
            isLastStep: {},
            customStyles: {},
            moveNextStep: {},
            moveBackward: {},
            theme: ''
        };
        setCreditBureauData([setData])
        creditBureauToggle();
    }
    const creditBureauToggle = () => {
        setIsCreditOpen(!isCreditOpen);
    }

    console.log(bankStatementProps)

    const selectOffer = async (index, lenderData) => {
        setSelectedLender(index)
        viewOfferSection(true, lenderData);
    }
    const viewOfferSection = (flag, lenderData) => {
        setViewLenderDetails(!flag)
        setViewOfferDetails(flag)
        setLenderData(lenderData.data)
    }

    const cancelOfferSave = async () => {
        toggleAppliedLenders()
    }

    function selectLender(index, data) {
        setSelectedLender(index)
        console.log("SelectedLender", data)
        viewLenderSection(true, data)
    }

    const viewLenderSection = (flag, lenderData) => {
        setViewLenderDetails(flag)
        setViewOfferDetails(!flag)
        setLenderData(lenderData.data)
    }

    const updateLenderStatusView = () => {
        getLenderStatus(applicationId)
    }

    function togModal() {
        setModalEmployeeMapping(!modalEmployeeMapping);
    }


    const columns = useMemo(
        () => {
            const baseColumns = [
                {
                    Header: "Lead ID",
                    accessor: (cellProps) => {
                        const codePart = cellProps.code || "";
                        const loanCodePart = cellProps.loan_code ? `\nLoan Code: ${cellProps.loan_code}` : "";
                        let value = `${codePart}${loanCodePart}`;

                        return (
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {isReAssign && <input value={cellProps.application_id} type={'checkbox'}
                                    className={'form-check-input me-2'} />}
                                <b>{value}</b></div>
                        )

                    },
                    disableFilters: true,
                    filterable: true,
                },
                {
                    Header: "Loan Details",
                    accessor: (cellProps) => (
                        <div className={'text-wrap w-auto'}>
                            <p><strong>Loan Type :</strong> {cellProps.loan_type_name}</p>
                            <p><strong>Requested Amount :</strong> {AmountExtractorWithComma(cellProps.loan_amount)}</p>
                        </div>
                    ),
                    disableFilters: true,
                    filterable: false,
                },
                {
                    Header: "Lead Details",
                    accessor: (cellProps) => (
                        <div className={'text-wrap w-auto'}>
                            <p><strong>Application Name :</strong> {cellProps.name}</p>
                            {cellProps.apply_capacity === ApplicantCategory.Entity &&
                                <p><strong>Contact Person :</strong> {cellProps.contact_name}</p>
                            }
                            {ApplicationMobileMasked === "YES" ? (
                                <p><strong>Mobile Number :</strong> ******{cellProps.mobile.slice(6, 10)}</p>
                            ) : (
                                <p><strong>Mobile Number :</strong> {cellProps.mobile} </p>
                            )}
                        </div>
                    ),
                    disableFilters: true,
                    filterable: false,
                },
                {
                    Header: "Source Details",
                    accessor: (cellProps) => (
                        <td className="customer_name text-wrap">
                            <Badge
                                color="primary"
                                className="text-wrap">{cellProps.sourced_by?.user_role !== "EMPLOYEE" && cellProps.sourced_by?.supervisor_username ? cellProps.sourced_by?.supervisor_username + " - " : ""} {cellProps.sourced_by?.channel_name ? cellProps.sourced_by?.channel_name + " - " : cellProps.sourced_by?.user_name + " - "} {cellProps.sourced_by?.user_role}</Badge><br />
                            {/*<b>Journey*/}
                            {/*    Type:</b> {cellProps.external_journey_type === journeyAndType["ExternalJourneyType"] ? "Portal" : cellProps.external_journey_type}*/}
                            <b>Journey Type:</b> {
                                journeyType[cellProps?.type] ?? cellProps?.type
                            }
                            <br />


                            <b>User Type
                                :</b> {cellProps.sourced_by?.user_type}
                            <br />
                            <b>Lead Type
                                :</b> {cellProps.external_lead_type}
                            <br />
                            {cellProps?.submission_mode && (
                                <>
                                    <b>Submission Mode:</b> {cellProps?.submission_mode}
                                </>
                            )}
                        </td>
                    ),
                    disableFilters: true,
                    filterable: false,
                },
                {
                    Header: "Status",
                    accessor: (cellProps) => (
                        <td className="customer_name">
                            <p><strong>Pending in : </strong>{cellProps.active_task?.task_name}</p>
                            <p><strong>Pending with : </strong>
                                <span
                                    style={{
                                        backgroundColor: cellProps.loan_status === loanStatus["InProgress"] || cellProps.loan_status === loanStatus["Approved"] ? getStatusColor("Approved") : cellProps.external_lead_id !== "" && tenantName === "Flexiloans" ? getStatusColor("In Progress") : getStatusColor("Pending"),
                                        color: "#423f37"
                                    }}
                                    className={`badge`}>

                                    {cellProps.loan_status === loanStatus["Closed"] || cellProps.loan_status === loanStatus["Disbursed"] || cellProps.loan_status === loanStatus["NotApproved"] ? loanStatus["Closed"] : cellProps.external_lead_id !== "" && tenantName === "Flexiloans" ? brandName["BrandName"] : cellProps.active_task?.user_detail.username}
                                </span>
                            </p>
                            <p><strong>Status :</strong>

                                {tenantName === "Flexiloans" ? (
                                    <>
                                        <span
                                            style={{
                                                backgroundColor: cellProps.loan_status ? getStatusColor(cellProps.loan_status) : getStatusColor("In Progress"),
                                                color: "black"
                                            }}
                                            className={`badge`}>
                                            {cellProps.loan_status ? (
                                                <>
                                                    {cellProps.loan_status}
                                                </>
                                            ) : (
                                                <>

                                                </>
                                            )}
                                        </span>

                                        {cellProps.data && cellProps.data.sub_status_one && cellProps.data.sub_status_two && (
                                            <div className={'text-wrap w-auto'}>
                                                <b>Sub
                                                    Status:</b> {cellProps.data.sub_status_one} - {cellProps.data.sub_status_two}
                                            </div>
                                        )}
                                    </>
                                ) :
                                    <span
                                        className={`badge ${getStatusColor(cellProps?.status.toString())}`}>
                                        {cellProps?.application_status}
                                    </span>
                                }
                            </p>
                            {cellProps?.serviced_by && cellProps?.serviced_by?.user_name && (
                                <p>
                                    <strong>Assigned to : </strong>
                                    <span
                                        className={`badge bg-info-subtle text-info`}>
                                        {cellProps?.serviced_by?.user_name}
                                    </span>
                                </p>
                            )}

                        </td>
                    ),
                    disableFilters: true,
                    filterable: false,
                },
                //     {
                //     Header:'Disbursement Details',
                //     accessor:(cellProps)=> (
                //         <div className={'text-wrap w-auto'}>
                //             <p><strong>{`Total sanction (${''})`}:</strong>
                //                 <p><strong>{`Total Disbursement (${''})`}:</strong></p>
                //             </p>
                //         </div>
                //     ),
                //     disableFilters: true,
                //     filterable: false,
                // },
                {
                    Header: "Date",
                    accessor: (cellProps) => (
                        <div className={'text-wrap w-auto'}>
                            <strong>Created
                                On: </strong><p
                                    className="m-0 p-0 mb-2">{cellProps.createdAt ? moment(cellProps.createdAt).format('DD-MM-YYYY, h:mm:ss A') : "-"}
                            </p>
                            <p><strong>Submitted On:</strong>{''}
                            </p>
                            <strong>Updated On:
                            </strong> <p
                                className="m-0 p-0 mb-2">{cellProps.updatedAt ? moment(cellProps.updatedAt).format('DD-MM-YYYY, h:mm:ss A') : "-"}
                            </p>
                        </div>
                    ),
                    disableFilters: true,
                    filterable: false,
                },
                // {
                //     Header: "More Data",
                //     accessor: (cellProps) => (
                //         <div>
                //             <p><b>Pending : </b>{cellProps.pending_ask_count}</p>
                //             <p><b>Resolved : </b>{cellProps.resolved_ask_count}</p>
                //         </div>
                //     ),
                //     disableFilters: true,
                //     filterable: false,
                // }
            ]
            if (!isReAssign) {
                baseColumns.splice(baseColumns.findIndex(col => col.Header === "Date") + 1, 0, {
                    Header: "Action",
                    accessor: (cellProps) => {
                        let isAsk = false;
                        if (tenantName === "Fleximart") {
                            if (cellProps?.pending_ask_count > 0) {
                                isAsk = true
                            }
                        }
                        return (
                            <td className="customer_name">
                                {cellProps.originPlatform === "FLEXILOAN" && cellProps.status === 1 ? (
                                    <>
                                        <ButtonGroup>
                                            <UncontrolledDropdown direction="down">
                                                <DropdownToggle className={' bg-transparent text-dark border-0'}>
                                                    <div className={'btn btn-outline-primary py-1 px-2'}>
                                                        <i className="ri-more-fill  fs-3"></i>
                                                    </div>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {viewAccess && (
                                                        <DropdownItem onClick={() => {
                                                            param && setOpen(false)
                                                            handleEditLead(cellProps.loan_code, cellProps.application_id.toString(), cellProps.type, isAsk)
                                                        }}>
                                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                                                            View</DropdownItem>
                                                    )}

                                                    {cellProps.workflow_instance_id !== 0 && (
                                                        summaryAccess && (
                                                            <DropdownItem onClick={() => {

                                                                getWorkflowSummary(cellProps.application_id.toString(), cellProps.type)
                                                            }}>Workflow summary</DropdownItem>
                                                        )
                                                    )}


                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </ButtonGroup>
                                    </>
                                ) : (
                                    <>
                                        <ButtonGroup>
                                            <UncontrolledDropdown direction="down">
                                                <DropdownToggle className={' bg-transparent text-dark border-0'}>
                                                    <div className={'btn btn-outline-primary py-1 px-2'}>
                                                        <i className="ri-more-fill  fs-3"></i>
                                                    </div>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {addEnquiry &&
                                                        <DropdownItem onClick={() => {
                                                            param && setOpen(false)
                                                            isMobile ?
                                                                navigate(`/enquiry/customer/lead/${cellProps.application_id}#${cellProps.type}`, { state: { ask: isAsk } })
                                                                : navigate(`/enquiry/customer/lead/${cellProps.application_id}#${cellProps.type}`, { state: { ask: isAsk } })
                                                        }}>
                                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
                                                            View</DropdownItem>
                                                    }
                                                    {!addEnquiry && viewAccess && (
                                                        <DropdownItem onClick={() => {
                                                            param && setOpen(false)
                                                            isMobile ?
                                                                navigate(`/lead/mobile/create/${cellProps.application_id}#${cellProps.type}`, { state: { ask: isAsk } })
                                                                : navigate(`${navigateUrl ? navigateUrl : "/lead/create"}/${cellProps.application_id}#${cellProps.type}`, { state: { ask: isAsk } })
                                                        }}>
                                                            <i className="ri-eye-fill align-bottom me-2 text-muted"></i>View</DropdownItem>
                                                    )}
                                                    {assignAccess && (<DropdownItem onClick={() => {
                                                        handleAssign(cellProps.application_id.toString(), cellProps?.represented_by?.user_id.toString(), cellProps.territory_id)

                                                    }}>
                                                        <i className="ri-user-follow-line align-bottom me-2 text-muted"></i>
                                                        {cellProps?.serviced_by ? "Re Assign" : "Assign"}
                                                    </DropdownItem>
                                                    )}

                                                    {cellProps.workflow_instance_id !== 0 && (
                                                        summaryAccess && (
                                                            <DropdownItem onClick={() => {
                                                                getWorkflowSummary(cellProps.application_id.toString(), cellProps.type)
                                                            }}>Workflow summary</DropdownItem>
                                                        )
                                                    )}
                                                    {askAccess &&
                                                        <DropdownItem
                                                            onClick={() => toggleAskModal(cellProps.application_id.toString())}>Ask
                                                            Details</DropdownItem>
                                                    }
                                                    {participantAccess &&
                                                        <DropdownItem onClick={() => {
                                                            togglePartnerModel(cellProps.application_id);
                                                            // getPartnerDetails().then(r => console.log(r));
                                                        }}>Participant Details</DropdownItem>
                                                    }

                                                    {(cellProps?.status >= 2 || lenderStatusAccess) && (
                                                        <DropdownItem onClick={() => {
                                                            getLenderStatus(cellProps.application_id.toString(), cellProps.type)
                                                        }}>Lender Status</DropdownItem>

                                                    )}
                                                    {bankStatementAccess && (
                                                        <DropdownItem onClick={() => getBankStatementParser(cellProps)}>Bank
                                                            Statement Parser</DropdownItem>
                                                    )}
                                                    {creditBureauAccess && (
                                                        <DropdownItem onClick={() => getCreditBureau(cellProps)}>Credit
                                                            Bureau</DropdownItem>
                                                    )}

                                                    {listName === "FULFILLED" ?
                                                        <DropdownItem
                                                            onClick={() => toggleReopenModel(cellProps.application_id, cellProps.code, reopenType.activate)}><i
                                                                className="mdi mdi-arrow-u-left-top me-2 text-muted"></i>Activate</DropdownItem> : listName === "ARCHIVED" ?
                                                            <DropdownItem
                                                                onClick={() => toggleReopenModel(cellProps.application_id, cellProps.code, reopenType.unarchive)}><i
                                                                    className="mdi mdi-archive-lock-open me-2 text-muted"></i>Unarchive</DropdownItem> : ""}
                                                    {activityStreamAccess && (
                                                        <DropdownItem onClick={() => {
                                                            getActivityStream(cellProps.application_id.toString())
                                                        }}>Activity Stream</DropdownItem>
                                                    )}
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </ButtonGroup>
                                    </>

                                )}
                            </td>
                        )
                    },
                    disableFilters: true,
                    filterable: false,
                })
            }
            if (tenantName.toUpperCase() !== "FLEXILOANS") {
                baseColumns.splice(baseColumns.findIndex(col => col.Header === "Status") + 1, 0, {
                    Header: "Ask Details",
                    accessor: (cellProps) => (
                        <div>
                            <p><b>Pending : </b>{cellProps.pending_ask_count}</p>
                            <p><b>Resolved : </b>{cellProps.resolved_ask_count}</p>
                        </div>
                    ),
                    disableFilters: true,
                    filterable: false,
                });

            }
            if (isTerritoryEnabled) {
                baseColumns.splice(baseColumns.findIndex(col => col.Header === "Lead Details") + 1, 0, {
                    Header: "Territory",
                    accessor: (cellProps) => (
                        <div className={'text-wrap w-auto'}>
                            <p><strong>Territory Type :</strong> {cellProps.territory_type}</p>
                            <p><strong>Territory Name :</strong> {cellProps.territory_name}</p>
                            <p><strong>RM Name :</strong> {cellProps.represented_by?.user_name}</p>
                        </div>
                    ),
                    disableFilters: true,
                    filterable: false,

                });
            }

            return baseColumns;
        },
        [viewAccess, summaryAccess, tenantName, leadListData]
    );


    useEffect(() => {
        if (hashValue?.state?.filterData?.keyword) {
            getLeadListWithKeyword(hashValue?.state?.filterData?.keyword)
        }
    }, [hashValue?.state?.filterData]);

    const getLeadListWithKeyword = (keyValue) => {
        let newFilterData = { ...(filterData || {}) };

        if (!newFilterData.filterData) {
            newFilterData.filterData = {};
        }

        newFilterData.filterData.keyword = keyValue;

        setFilterData(newFilterData);
        setClickedValue(1);

        // const apiUrl = process.env.REACT_APP_API_URL + `/alpha/v1/application?keyword=${keyValue}`;
        // axios.get(apiUrl, {
        //     transformResponse: function (response) {
        //         return JSONbig.parse(response);
        //     }
        // }).then(response => {
        //
        //     if (response.data !== null) {
        //         setLeadListData(response.data);
        //         setLeadListPagination(response.pagination);
        //     } else {
        //         response.data = [];
        //         setLeadListData(response.data);
        //         setLeadListPagination(response.pagination);
        //     }
        //
        // }).catch(error => {
        //     console.log(error);
        // }).finally(() => {
        //
        // });
    }

    const exportLeadList = () => {
        setLoading(true);
        let apiUrl = process.env.REACT_APP_API_URL + `/alpha/v1/application?download=true`;
        const filterStatusValue = filterData?.filterData;
        const queryString = objectToQueryString(filterStatusValue);
        if (queryString) {
            apiUrl += `&${queryString}`
        }
        axios.get(apiUrl, {
            transformResponse: function (response) {
                return JSONbig.parse(response);
            }
        }).then(response => {
            if (response?.data !== null) {
                setLoading(false)
                setLeadListData(response?.data)
                setIsExportXlsx(true)
            }
        }).catch(error => {
            console.log("error", error);
            Swal.fire({
                title: 'Error!',
                text: `${error?.response?.data?.error}`,
                icon: 'error',
            });
            setLoading(false);
        }).finally(() => {
            setLoading(false);
        });
    }

    const exportXLSX = () => {
        exportLeadList()
    }
    const xlsxData = [['Lead ID', 'Loan Type', 'Application Name', 'Contact Person', 'Mobile Number', 'User Name', 'User Type', 'Journey Type', 'Lead Type', 'Pending With', 'Active step', 'Active Stage', 'Status', 'Ask Pending', 'Ask Resolved', 'Created At', 'Updated At'],
    ...leadList.map((list) => [
        list?.code?.toString(),
        list?.loan_type_name,
        list?.name,
        list?.contact_name,
        list?.mobile,
        list?.active_task?.user_detail?.username,
        list?.active_task?.user_detail?.user_type,
        `${list?.external_journey_type === journeyAndType["ExternalJourneyType"] ? "Portal" : list?.external_journey_type}`,
        list?.external_lead_type,
        list?.active_task?.task_name,
        list?.active_task?.task_name,
        list?.active_task?.stage_name,
        list?.application_status,
        list?.pending_ask_count,
        list?.resolved_ask_count,
        `${list?.createdAt ? moment(list?.createdAt).format('DD-MM-YYYY') : "-"}`,
        `${list?.updatedAt ? moment(list?.updatedAt).format('DD-MM-YYYY') : "-"}`,
    ])]

    console.log("access", exportAccess)
    console.log("param", param)
    console.log("tenant", tenantName)
    console.log("add enquiry", addEnquiry)


    return (
        <React.Fragment>
            {progress ? (<div className={' d-flex align-items-center justify-content-center'} style={{ height: '70vh' }}>
                <div>
                    <p>Please wait....</p>
                    <Loader />
                </div>

            </div>) : (
                <Card>
                    <CardBody>
                        <div className="hstack d-flex gap-3 float-end mb-4">
                            {addEnquiry ?
                                <button type="button" className="btn btn-primary"
                                    onClick={() => navigate('/enquiry/customer/lead')}
                                    disabled={loading}>
                                    Add Enquiry
                                </button> : ""}
                            {!param ? exportAccess && tenantName !== "Fleximart" ?
                                <>
                                    <button type="button" className="btn btn-primary" onClick={() => exportXLSX()}
                                        disabled={loading}>
                                        {loading ? "Please Wait..." : "Export"}
                                    </button>
                                    <ExportXLSXModal show={isExportXlsx}
                                        onCloseClick={() => setIsExportXlsx(false)}
                                        data={xlsxData}
                                        fileName={`${listName}-list`} />
                                    <button type="button" className="btn btn-primary" onClick={() => toggleInfo()}>
                                        <i className="ri-filter-3-line align-bottom me-1"></i>
                                        Filters
                                    </button>
                                </>
                                :
                                <button type="button" className={`btn btn-primary ${isReAssign && 'd-none'}`}
                                    onClick={() => toggleInfo()}>
                                    <i className="ri-filter-3-line align-bottom me-1"></i>
                                    Filters
                                </button>
                                : ""
                            }
                        </div>
                        <TableContainer
                            columns={columns || []}
                            data={leadListData || []}
                            isPagination={true}
                            isGlobalFilter={!param}
                            iscustomPageSize={false}
                            setPageNumber={setPageNumber}
                            pageNumber={pageNumber}
                            leadListPagination={leadListPagination}
                            totalPages={totalPages}
                            setClickedValue={setClickedValue}
                            clickedValue={clickedValue}
                            isBordered={false}
                            customPageSize={10}
                            isFilter={isFilter}
                            getGlobalFilterValues={getLeadListWithKeyword}
                            className="custom-header-css table align-middle table-nowrap"
                            tableClass="table-centered align-middle table-nowrap"
                            theadClass={"table-light"}
                            SearchPlaceholder='Search...'
                            divClass={"overflow-auto"}
                        />{dataNull && (
                            <div className={' d-flex align-items-center justify-content-center'} style={{ height: '40vh' }}>
                                <p>No data found</p></div>)}

                    </CardBody>
                </Card>)}
            <LeadListFilter show={isInfoDetails} onCloseClick={() => setIsInfoDetails(false)}
                getFilterValues={getFilterValues} getLeadList={getLeadList} />
            <Modal id="addQuestionModal" tabIndex="-1" isOpen={modalEmployeeMapping} toggle={() => {
                togModal()
            }} centered size="lg">
                <ModalHeader className="p-3" toggle={() => {
                    togModal()
                }}>
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={formik.handleSubmit} action="#">
                        <div>
                            <Row>
                                <Col lg={12}>
                                    <div className="mb-3">
                                        <Label htmlFor="employee" className="form-label">
                                            Assign Employee
                                        </Label>
                                        <Select
                                            onChange={handleEmployee}
                                            options={serviceByList}
                                            isSearchable={true}
                                            value={serviceByList.find(options => options.value === employeeId)}
                                            name="territoryType"
                                        />
                                        <ErrorMessage touched={formik.touched.user_id}
                                            error={formik.errors.user_id} />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="text-end">
                            <Button type="submit" className="btn btn-primary"
                                color="primary">Assign</Button>
                        </div>
                    </Form>
                </ModalBody>
            </Modal>
            <Modal className="modal-xl"
                id="askModal"
                tabIndex="-1"
                isOpen={isSummary}
                toggle={toggleSummary}
                centered>
                <ModalHeader toggle={() => {
                    toggleSummary()
                    setAction("")
                }}>
                    Workflow summary
                </ModalHeader>
                <ModalBody>
                    {loader ? (
                        <div className={' d-flex align-items-center justify-content-center'} style={{ height: '40vh' }}>
                            <div>
                                <p>Please wait....</p>
                                <Loader />
                            </div>
                        </div>) : <WorkFlowSummary data={summaryData} />}
                </ModalBody>
            </Modal>
            {/*bank statement toggle here*/}
            <Modal className="modal-xl"
                id="BSPmodel"
                tabIndex="-1" isOpen={isBankOpen} toggle={bankStatementToggle} centered>
                <ModalHeader toggle={bankStatementToggle}>
                    <Label>Bank statement parser</Label>
                </ModalHeader>
                <ModalBody>
                    <BankParser data={bankStatementProps[0]?.data} restrictMode={true} hideButton={true} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={bankStatementToggle}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
            {/*credit bureau toggle here*/}
            <Modal className="modal-xl"
                id="BSPmodel"
                tabIndex="-1" isOpen={isCreditOpen} toggle={creditBureauToggle} centered>
                <ModalHeader toggle={creditBureauToggle}>
                    <Label>Credit Bureau</Label>
                </ModalHeader>
                <ModalBody>
                    <CreditBureau data={creditBureauData[0]?.data} restrictMode={true} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={creditBureauToggle}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
            <Modal
                id="askModal"
                size={'xl'}
                tabIndex="-1"
                isOpen={isAppliedLenders}
                toggle={toggleAppliedLenders}
                centered>
                <ModalHeader toggle={() => {
                    toggleAppliedLenders()
                    setAction("")
                }}>
                    Applied Lenders
                </ModalHeader>
                <ModalBody>
                    {loader ? (
                        <div className={' d-flex align-items-center justify-content-center'} style={{ height: '40vh' }}>
                            <div>
                                <p>Please wait....</p>
                                <Loader />
                            </div>
                        </div>) :
                        <>
                            <Row>
                                {lenderListArr && lenderListArr.map((element, index) => {
                                    const displayDate = new Date(element.updatedDate);
                                    const formattedDate = moment(displayDate).format('DD-MM-YYYY');
                                    return (
                                        <Col xl={3} md={3} sm={6} key={index}>
                                            <LenderStatusCard element={element} index={index}
                                                selectedLender={selectedLender}
                                                selectLender={selectLender}
                                                formattedDate={formattedDate} selectOffer={selectOffer} />
                                        </Col>
                                    )
                                })}
                            </Row>
                            {viewOfferDetails &&
                                <OfferDetailCapture editControl={false} cancelOfferSave={cancelOfferSave}
                                    lenderData={lenderData}>
                                </OfferDetailCapture>
                            }
                            {viewLenderDetails &&
                                <LenderStage view={true} lenderData={lenderData}
                                    lenderStatusView={updateLenderStatusView}></LenderStage>
                            }
                            {lenderListArr.length === 0 &&
                                <h3>Processing..</h3>
                            }
                        </>
                    }
                </ModalBody>
            </Modal>
            <Modal isOpen={togAskModal} size={"xl"}>
                <ModalHeader toggle={toggleAskModal}><h4>Ask</h4></ModalHeader>
                <ModalBody>
                    <Ask toggleAskModal={toggleAskModal} stages={askAvailableStages}
                        workflow={workflowDefinition} applicationId={applicationId} />
                </ModalBody>
            </Modal>
            <Modal isOpen={togglePartner} size={"xl"}>
                <ModalHeader toggle={togglePartnerModel}><h4>Participant Details</h4></ModalHeader>
                <ModalBody>
                    <ParticipantDetails applicationId={applicationId}></ParticipantDetails>
                </ModalBody>
            </Modal>
            <Modal isOpen={toggleReopen} size={"lg"}>
                <ModalHeader toggle={toggleReopenModel}>
                    <h4>{reopenStatus === reopenType.activate ? `Activate Lead - ${leadCode}` : reopenStatus === reopenType.unarchive ? `Unarchive Lead - ${leadCode}` : ""}</h4>
                </ModalHeader>
                <ModalBody>
                    <ReopenLead reopenStatus={reopenStatus} appId={applicationId}
                        toggleReopenModel={toggleReopenModel}></ReopenLead>
                </ModalBody>
            </Modal>
            {isActivityStreamView && (
                <ActivityStream
                    show={isActivityStreamView}
                    applicationId={applicationId}
                    onCloseClick={() => setIsActivityStreamView(false)}
                />
            )}
        </React.Fragment>
    );
};

export default SearchTable;
