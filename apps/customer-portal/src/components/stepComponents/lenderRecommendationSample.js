import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {
    Accordion, AccordionBody, AccordionHeader, AccordionItem,
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Container,
    Label,
    Offcanvas,
    OffcanvasBody, OffcanvasHeader,
    Row
} from 'reactstrap';
import {Link, useParams} from 'react-router-dom';
import {BrowserView, isBrowser, isMobile, MobileView} from 'react-device-detect';
import ComponentLoader from "../../Common/ComponentLoader";
import {lenderApplyMethod, lenderApplyStatus, theme, workflowType} from "../../constants/constant";
import {GetCall, PostCall} from "../../helper/ApiProvider";
import {APIENDPOINTS} from "../../helper/ApiEndPoint";
import Swal from "sweetalert2";
import OfferDetailsConsumer from "./OfferDetailsConsumer";
import RejectionLenderTwo from "./RejectionLenderConsumer";
import fileTransfer from '../../../assets/images/giftbox/fileTransfer.gif'
import FinalOfferSelection from "../../LenderLogin/OfferSelection";
import ApplicationOffer from "../../LenderLogin/ApplicationOffer";
import {AmountExtractor} from "../../helper/utility";
import SimplePie from "../../Common/PieChart";
import getChartColorsArray from "../../Common/ChartDynamicColor";

const LenderRecommendedOfferSelection = forwardRef((props,ref) => {
    const currentURL = window.location.href;
    const [isLoading, setIsLoading] = useState(true);
    const [lenderDetails, setLenderDetails] = useState([]);
    const {id} = useParams();
    const [isLastStep, setLastStep] = useState(false);
    const [isReload, setIsReload] = useState(false);
    const [isApplicableLenderAvailable, setIsApplicableLenderAvailable] = useState(false);
    const [confettiActive, setConfettiActive] = useState(true);
    const [dimensions, setDimensions] = useState({width: window.innerWidth, height: window.innerHeight});
    const [isOfferLoading, setIsOfferLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(null)
    const [lenderView, setLenderView] = useState(true)
    const [hideLenderApplyBtn, setHideLenderApplyBtn] = useState(false)

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case lenderApplyStatus.selected:
                return 'bg-info-subtle text-info';
            case lenderApplyStatus.applied:
                return 'bg-primary-subtle text-primary';
            case lenderApplyStatus.rejected:
                return 'bg-danger-subtle text-danger';
            case lenderApplyStatus.sanctioned:
                return 'bg-success-subtle text-success';
            case lenderApplyStatus.disbursed:
                return 'bg-success-subtle text-success';
            default:
                return 'bg-secondary-subtle text-info';
        }
    };

    const getApplyBadgeClass = (status) => {
        switch (status) {
            case lenderApplyMethod.api:
                return 'Digital Process';
            case lenderApplyMethod.utm:
                return 'UTM Link';
            default:
                return 'Digital';
        }
    };

    const configJson = props.step.configuration
    const getStatusContent = (status, lenderObj) => {
        switch (status) {
            case lenderApplyStatus.selected:
                return 'Lender Apply ID Generated';
            case lenderApplyStatus.applied:
                return 'Applied Successfully';
            case lenderApplyStatus.rejected:
                return 'Lender Rejected Application';
            case lenderApplyStatus.sanctioned:
                return `Sanctioned Amount Rs.${lenderObj?.recent_offer?.offer_amount}`;
            case lenderApplyStatus.disbursed:
                return `Disbursed Amount Rs.${lenderObj?.recent_offer?.offer_amount}`;
            default:
                return 'Loan Application';
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            setConfettiActive(false);
        }, 11000);
        return () => clearTimeout(timer);
    }, []);

    // Update dimensions on window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({width: window.innerWidth, height: window.innerHeight});
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const getLastStep = async () => {
        setLastStep(await props.isLastStep);
    };

    const chartPieBasicColors = getChartColorsArray('["--vz-primary", "--vz-secondary-rgb, 0.85"]');
    const [series, setSeries] = useState([800000, 200000])
    const options = {
        chart: {
            height: 300,
            type: 'pie',
        },
        labels: ['Principal Amount', 'Interest Amount'],
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            dropShadow: {
                enabled: false,
            }
        },
        colors: chartPieBasicColors
    };

    useEffect(() => {
        getLastStep().then(r => console.log(r));
        console.log('isReload value:', isReload);
        if (id) {
            fetchLenderDetails().then(r => console.log(r));
        }
        if (props?.step && props?.step?.configuration !== "") {
            let parseConfig =props?.step?.configuration
            console.log('config', parseConfig)
            if (Object.keys(parseConfig).length > 0) {
                setLenderView(parseConfig?.lender_view)
                setHideLenderApplyBtn(parseConfig?.hide_lender_apply_button)
            }
        }
    }, [isReload, id, props]);
    //To Submit the form or move to next process
    useImperativeHandle(ref,()=>({
        submitFormExternally:async ()=>{
            await props?.handleFormSubmitSuccess({data:null,isValidForm:true})
        }
    }))

    const [bestLender, setBestLender] = useState({})
    const [offers, setOffers] = useState([])
    const [finalOffer, setFinalOffer] = useState({})
    const [totalPayment, setTotalPayment] = useState(0)
    const fetchLenderDetails = async () => {
        try {
            const lenderResponse = await GetCall(APIENDPOINTS.LENDER_RECOMMENDATION.replace(':applicationId', id), props.guestMode);
            if (lenderResponse && lenderResponse.status) {
                setIsLoading(false);

                const updatedLenderDetails = lenderResponse ? lenderResponse?.data?.result?.lender?.map((lender) => ({
                    ...lender, offer: '', lender_status: '', apply: '',
                })) : [];
                setLenderDetails(updatedLenderDetails);
                console.log('updated Lender list ---->', updatedLenderDetails)
                if (lenderResponse.data != null) {
                    setBestLender(lenderResponse?.data?.result?.lender[0])
                    setOffers(lenderResponse?.data?.result?.lender[0]?.computed_offer)
                    const finalOfferDetails = lenderResponse?.data?.result?.lender[0]?.computed_offer.find(offer => offer?.formula_type === "FINAL_OFFER")
                    const principalAmount = finalOfferDetails?.offer_loan_amount
                    const interestAmount = (finalOfferDetails?.emi_amount * finalOfferDetails?.tenure) - finalOfferDetails?.offer_loan_amount
                    const totalPayment = finalOfferDetails?.emi_amount * finalOfferDetails?.tenure
                    setTotalPayment(parseInt(totalPayment))
                    setSeries([principalAmount, parseInt(interestAmount)])
                    setFinalOffer(finalOfferDetails)
                    console.log('final offer :::', finalOfferDetails)
                    console.log('best lender :::', lenderResponse?.data?.result?.lender[0])
                    console.log('offer :::', lenderResponse?.data?.result?.lender[0]?.computed_offer)
                }

                console.log("UpdateLenderDetails", updatedLenderDetails)
            } else {
                Swal.fire({
                    icon: 'error', title: 'Error!', text: lenderResponse?.message, confirmButtonText: 'OK'
                }).then(() => setIsLoading(false));
            }
        } catch (error) {
            console.log(error)
        }
    };

    const list = lenderDetails ? lenderDetails.map((list) => list?.lender_logo) : [];
    console.log(list);
    const [openCardIndex, setOpenCardIndex] = useState(null);

    const handleCardToggle = (index) => {
        setOpenCardIndex(openCardIndex === index ? null : index);
    };

    const [isComponentVisible, setIsComponentVisible] = useState(false);

    const handleToggle = () => {
        isMobile ? toggleComputeSection() :
            setIsComponentVisible(!isComponentVisible);
    };

    const AppliedRes = async (workflowResponse, data) => {
        const executionParams = {
            execute_step_id: workflowResponse.data?.data?.stages[0]?.steps[0]?.id,
            source_id: data?.lender_apply_id,
            workflow_type: workflowType.LenderApply
        };

        const appliedResponse = await PostCall(APIENDPOINTS.WORKFLOW_EXECUTION, executionParams);
        if (appliedResponse.status) {
            setIsOfferLoading(false)
            setIsReload(!isReload);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Lender application submitted successfully.',
                confirmButtonText: 'OK'
            }).then(() => {
                setIsOfferLoading(false)
                setIsReload(!isReload);
            });
        } else {
            console.log(appliedResponse.message, 'error')
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: appliedResponse.error,
                confirmButtonText: 'OK'
            }).then(() => {
                setIsOfferLoading(false);
                setIsReload(!isReload);
            });
        }
    }
    const WorkflowFetch = async (data) => {
        const workflowParams = {
            workflow_type: workflowType.LenderApply,
            lender_code: data?.lender_code,
            // eslint-disable-next-line no-undef
            source_id: BigInt(data?.lender_apply_id),
        };

        const workflowResponse = await PostCall(APIENDPOINTS.WORKFLOW_BUILD, workflowParams);
        if (workflowResponse.status) {
            if (workflowResponse.data?.data?.stages?.length > 0) {
                await AppliedRes(workflowResponse, data);
                setIsOfferLoading(false)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: workflowResponse?.error,
                    confirmButtonText: 'OK'
                }).then(() => setIsOfferLoading(false));
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: workflowResponse?.error,
                confirmButtonText: 'OK'
            }).then(() => setIsOfferLoading(false));
        }
    }

    const applyLender = async (application_id, lender_id, loanType_id, _index) => {
        setCurrentIndex(_index)

        console.log("this is application  id", application_id, 'this is lender id', lender_id, "index", _index);
        setIsOfferLoading(true);
        try {
            const params = {
                application_id: application_id,
                lender_id: lender_id,
                loan_type_id: loanType_id,
                status: 1
            };
            const postLenderApplyResponse = await PostCall(APIENDPOINTS.POST_LENDER_APPLY.replace(':applicationId', id), params);
            console.log(postLenderApplyResponse);
            if (postLenderApplyResponse.status) {
                const data = postLenderApplyResponse?.data.result;
                await WorkflowFetch(data);
                setIsOfferLoading(false);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: postLenderApplyResponse.message.error,
                    confirmButtonText: 'OK'
                }).then(() => setIsOfferLoading(false));
            }
        } catch (error) {
            setIsOfferLoading(false)
        }
    }

    const [minComputedObj, setMinComputedObj] = useState({})

    function getMinLoanAmountObject(computedOffer) {
        if (!Array.isArray(computedOffer) || computedOffer.length === 0) {
            return null;
        }
        let minObj = computedOffer[0];
        computedOffer.forEach((currentObj) => {
            if (currentObj.max_loan_amount < minObj.max_loan_amount) {
                minObj = currentObj;
            }
        });
        setMinComputedObj(minObj)
    }

    const [togComputeSection, setTogComputeSection] = useState(false)
    const toggleComputeSection = () => {
        setTogComputeSection(!togComputeSection)
    }

    const [currentLenderIndex, setCurrentLenderIndex] = useState(null)
    const toggleAccordion = (index) => {
        setCurrentLenderIndex(index >= 0 && index !== currentLenderIndex ? index : null)
    }
    const renderLoanDetails = (lender, minObj) => (
        <>
            <Col className='col-lg-3'>
                <div className="py-0 ">
                    <h5 className="text-muted text-uppercase fs-13">
                        Loan Amount
                        <i className={`ri-arrow-up-circle-line ${(!lender.lender_scheme?.min_loan_amount && !lender.lender_scheme?.max_loan_amount) ? 'text-danger' : 'text-success'} fs-18 float-end align-middle`}></i>
                    </h5>
                    <div
                        className="d-flex align-items-center">
                        <div
                            className="flex-shrink-0 mt-2">
                            <i className="ri-exchange-dollar-line display-6 text-muted"></i>
                        </div>
                        <div
                            className="flex-grow-1 ms-4">
                            <h6 className="d-flex gap-3 mt-3 mb-1">
                                <span>{parseInt(minObj.offer_loan_amount)}</span>
                            </h6>
                        </div>
                    </div>
                </div>
            </Col>
            <Col className='col-lg-3'>
                <div className="py-0 ">
                    <h5 className="text-muted text-uppercase fs-13">
                        Tenure
                        <i className={`ri-arrow-up-circle-line ${(!lender.lender_scheme?.min_tenure && !lender.lender_scheme?.max_tenure) ? 'text-danger' : 'text-success'} fs-18 float-end align-middle`}></i>
                    </h5>
                    <div
                        className="d-flex align-items-center">
                        <div
                            className="flex-shrink-0 mt-2">
                            <i className="ri-pulse-line display-6 text-muted"></i>
                        </div>
                        <div
                            className="flex-grow-1 ms-4">
                            <h6 className="d-flex gap-3 mt-3 mb-1">
                                <span>{minObj.tenure}</span>
                            </h6>
                        </div>
                    </div>
                </div>
            </Col>
            <Col className='col-lg-3'>
                <div className="py-0 ">
                    <h5 className="text-muted text-uppercase fs-13">
                        EMI Amount
                        <i className={`ri-arrow-up-circle-line ${(!lender.lender_scheme?.min_loan_amount && !lender.lender_scheme?.max_loan_amount) ? 'text-danger' : 'text-success'} fs-18 float-end align-middle`}></i>
                    </h5>
                    <div
                        className="d-flex align-items-center">
                        <div
                            className="flex-shrink-0 mt-2">
                            <i className="ri-exchange-dollar-line display-6 text-muted"></i>
                        </div>
                        <div
                            className="flex-grow-1 ms-4">
                            <h6 className="d-flex gap-3 mt-3 mb-1">
                                <span>{AmountExtractor(parseInt(minObj.emi_amount))}</span>
                            </h6>
                        </div>
                    </div>
                </div>
            </Col>
            <Col className='col-lg-3'>
                <div className="py-0 ">
                    <h5 className="text-muted text-uppercase fs-13">
                        Interest
                        <i className={`ri-arrow-up-circle-line ${(!lender.lender_scheme?.min_rate_of_interest && !lender.lender_scheme?.max_rate_of_interest) ? 'text-danger' : 'text-success'} fs-18 float-end align-middle`}></i>
                    </h5>
                    <div
                        className="d-flex align-items-center">
                        <div
                            className="flex-shrink-0 mt-2">
                            <i className="ri-pie-chart-2-line display-6 text-muted"></i>
                        </div>
                        <div
                            className="flex-grow-1 ms-4">
                            <h6 className="d-flex gap-3 mt-3 mb-1">
                                <span>{minObj.interest_rate}</span>
                            </h6>
                        </div>
                    </div>
                </div>
            </Col>
        </>
    );
    return (
        <>
            <Card>
                <CardBody>
                    <CardHeader className='text-uppercase bg-success-subtle text-success mb-2'>
                        <Row className='d-flex justify-content-between'>
                            <Col>
                                <div className='fs-15'>{!lenderView ? "Compute offer" : "Eligible Lenders"}</div>
                            </Col>
                            <Col className='text-end'>
                                <Button onClick={handleToggle}>Customize</Button>
                            </Col>
                        </Row>
                    </CardHeader>

                    {isLoading ? (
                        <div className='h-10'>
                            <ComponentLoader/>
                        </div>
                    ) : (
                        <>
                            {isComponentVisible &&
                                <ApplicationOffer lenderLoad={fetchLenderDetails}
                                                  toggleComputeSection={toggleComputeSection}/>}
                            {lenderView ?
                                <div>
                                    <div
                                        className={`${isMobile ? "text-center m-0" : ''}`}>
                                        <Accordion open={currentLenderIndex} toggle={() => {
                                            console.log('Accordion---', currentLenderIndex)
                                        }} className={'mb-3'}>
                                            {lenderDetails && lenderDetails?.map((lender, index) => {
                                                if (lender.lender_applicable === true) {
                                                    setTimeout(function () {
                                                        setIsApplicableLenderAvailable(true)
                                                    }, 0);
                                                    const minObj = lender.computed_offer != null && lender.computed_offer?.reduce((min, loan) =>
                                                        loan.offer_loan_amount < min.offer_loan_amount ? loan : min
                                                    )
                                                    return (
                                                        <AccordionItem key={index}>
                                                            <AccordionHeader targetId={index} key={index}
                                                                             className={'shadow-lg'}>
                                                                {(isBrowser && !currentURL.includes("mobile")) &&
                                                                    <div className={'w-100 p-0'}
                                                                    >
                                                                        <Row key={index}
                                                                             className='d-flex h-auto  flex-wrap'>
                                                                            <Col sm={2}
                                                                                 className="bg-light d-flex align-items-center justify-content-center flex-wrap">
                                                                                <div
                                                                                    className='h-100 w-auto p-2 '>
                                                                                    <img src={lender.lender_logo}
                                                                                         className='h-70 w-auto p-2 img-thumbnail'
                                                                                         alt="Lender Logo"/>
                                                                                    <div
                                                                                        className={'badge bg-info-subtle text-wrap text-info w-100 p-1 mt-2'}>
                                                                                        {lender?.lender_scheme?.name}
                                                                                    </div>
                                                                                </div>

                                                                            </Col>
                                                                            <Col
                                                                                className={`${lender.lender_apply_id !== null ? lender.recent_offer !== null ? 'bg-marketplace d-flex m-0 align-items-center justify-content-center ' : 'bg-marketplace d-flex m-0 align-items-center justify-content-center' : ''}`}>
                                                                                {lender.lender_apply_id !== null ?
                                                                                    <>
                                                                                        <div
                                                                                            className='h-auto mt-0'>
                                                                                            {isOfferLoading && currentIndex === index ? <>
                                                                                                    <OfferDetailsConsumer
                                                                                                        loanAmount={lender?.recent_offer?.offer_amount}
                                                                                                        isOffer={lender?.recent_offer !== null}
                                                                                                        isRejected={lender.lender_apply_status === 'Rejected'}
                                                                                                        lender_apply_status={lender?.lender_apply_status}
                                                                                                        lenderApplyMethod={lender?.lender_contact?.apply_method}
                                                                                                        lenderLink={lender?.lender_links?.apply_link}/></> :
                                                                                                <OfferDetailsConsumer
                                                                                                    loanAmount={lender?.recent_offer?.offer_amount}
                                                                                                    isOffer={lender?.recent_offer !== null}
                                                                                                    isRejected={lender.lender_apply_status === 'Rejected'}
                                                                                                    lender_apply_status={lender?.lender_apply_status}
                                                                                                    lenderApplyMethod={lender?.lender_contact?.apply_method}
                                                                                                    lenderLink={lender?.lender_links?.apply_link}/>}
                                                                                        </div>
                                                                                    </> :
                                                                                    <div
                                                                                        className="col-xl-12 mt-4 mb-4 crm-widget">
                                                                                        <Row
                                                                                            className="py-0 d-flex justify-content-start align-items-start h-100 p-2">
                                                                                            {isOfferLoading && currentIndex === index ?
                                                                                                <ComponentLoader/> :
                                                                                                renderLoanDetails(lender, minObj)
                                                                                            }
                                                                                        </Row>
                                                                                    </div>
                                                                                }
                                                                            </Col>
                                                                            <div
                                                                                className={`col-sm-2 bg-light d-flex flex-wrap flex-md-column justify-content-center align-items-center`}>
                                                                                {hideLenderApplyBtn ?
                                                                                    <button
                                                                                        className={'btn btn-primary'}
                                                                                        onClick={() => toggleAccordion(index)}>View
                                                                                        offer Details</button>
                                                                                    : lender.lender_apply_id === null ? isOfferLoading && currentIndex === index
                                                                                            ?
                                                                                            <div><img src={fileTransfer}
                                                                                                      alt="Processing"
                                                                                                      className={`${isMobile ? 'w-100 h-100' : 'w-100 h100'}`}/>
                                                                                            </div> :
                                                                                            <div>
                                                                                                <div
                                                                                                    className={`btn btn-primary border-0 p-2 mb-1 cursor-pointer ${lender?.lender_contact?.apply_method.includes(configJson?.disabled_lender_type) ? "disabled" : ""}`}
                                                                                                    onClick={() => applyLender(id, lender?.lender_id, lender?.loan_type_id, index)}>Apply
                                                                                                </div>
                                                                                                {lender?.lender_contact?.apply_method.includes(configJson?.disabled_lender_type) &&
                                                                                                    <div
                                                                                                        style={{
                                                                                                            color: "grey",
                                                                                                            fontSize: 12
                                                                                                        }}>(* {configJson?.notes})</div>
                                                                                                }
                                                                                            </div> :
                                                                                        <span
                                                                                            className={`badge ${getStatusBadgeClass(lender?.lender_apply_status)} mb-1 p-2 fs-14`}>{lender?.lender_apply_status}</span>
                                                                                }
                                                                            </div>
                                                                        </Row>
                                                                    </div>}
                                                                {(isMobile || currentURL.includes("mobile")) &&
                                                                    <div className={'w-100'}>
                                                                        <Col xl={5}>
                                                                            <div
                                                                                className="d-flex p-2 justify-content-between mt-1 me-2">
                                                                                <div
                                                                                    className="flex-shrink-1">
                                                                                    <div>
                                                                                        <img
                                                                                            src={lender.lender_logo}
                                                                                            style={{
                                                                                                maxHeight: "5rem",
                                                                                                maxWidth: "9rem"
                                                                                            }}
                                                                                            className='img'
                                                                                            alt="Lender Logo"/>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="p-2">
                                                                      <span
                                                                        className={`badge align-content-end ${getStatusBadgeClass(lender?.lender_apply_status)}`}
                                                                        style={{fontSize: '14px'}}>{lender?.lender_apply_status}</span>
                                                                                </div>
                                                                            </div>
                                                                            <Row>
                                                                                {lender?.recent_offer?.offer_amount ?
                                                                                    <Col>
                                                                                        <div
                                                                                            className="d-flex flex-column p-2 mx-2">
                                                                                            <p style={{color: "grey"}}
                                                                                               className="fs-16 lh-base mb-0">Generated
                                                                                                Loan
                                                                                                Amount</p>
                                                                                            <p className="fs-16 lh-base mb-0 text-secondary">Rs.<b>{lender?.recent_offer?.offer_amount}</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </Col>
                                                                                    : <Col>
                                                                                        <div
                                                                                            className="d-flex flex-column p-2 mx-2">
                                                                                            <p style={{color: "grey"}}
                                                                                               className="fs-16 lh-base mb-0">
                                                                                                Loan
                                                                                                Amount</p>
                                                                                            <p className="fs-16 lh-base mb-0 text-secondary">Rs.<b>{parseInt(minObj.offer_loan_amount)}</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </Col>
                                                                                }
                                                                                {lender?.recent_offer?.tenure ?
                                                                                    <Col>
                                                                                        <div
                                                                                            className="d-flex flex-column p-2">
                                                                                            <p style={{color: "grey"}}
                                                                                               className="fs-16 lh-base mb-0">Generated
                                                                                                Tenure</p>
                                                                                            <p className="fs-16 lh-base mb-0 text-secondary">
                                                                                                <b>{lender?.recent_offer?.tenure}</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </Col>
                                                                                    : <Col>
                                                                                        <div
                                                                                            className="d-flex flex-column p-2">
                                                                                            <p style={{color: "grey"}}
                                                                                               className="fs-16 lh-base mb-0">
                                                                                                Tenure</p>
                                                                                            <p className="fs-16 lh-base mb-0 text-secondary">
                                                                                                <b>{minObj?.tenure}</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </Col>
                                                                                }
                                                                            </Row>
                                                                            <Row>
                                                                                {lender?.recent_offer?.tenure ?
                                                                                    <Col>
                                                                                        <div
                                                                                            className="d-flex flex-column p-2 mx-2">
                                                                                            <p style={{color: "grey"}}
                                                                                               className="fs-16 lh-base mb-0">Generated
                                                                                                Interest
                                                                                                Rate</p>
                                                                                            <p className="fs-16 lh-base mb-0 text-secondary">
                                                                                                <b>{lender?.recent_offer?.interest_rate}%</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </Col>
                                                                                    : <Col>
                                                                                        <div
                                                                                            className="d-flex flex-column p-2 mx-2">
                                                                                            <p style={{color: "grey"}}
                                                                                               className="fs-16 lh-base mb-0">
                                                                                                Interest
                                                                                                Rate</p>
                                                                                            <p className="fs-16 lh-base mb-0 text-secondary">
                                                                                                <b>{minObj.interest_rate}%</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </Col>
                                                                                }
                                                                                <Col>
                                                                                    <div className="p-2">
                                                                       <span
                                                                        className="badge border border-primary text-primary">{getApplyBadgeClass(lender.lender_contact.apply_method)}</span>
                                                                                    </div>
                                                                                </Col>
                                                                            </Row>
                                                                            {
                                                                                hideLenderApplyBtn ? null :
                                                                                    <div className="p-2 mb-1">
                                                                                        {lender.lender_apply_id === null ?
                                                                                            <div>
                                                                                                <div
                                                                                                    className={`btn btn-primary w-100 mb-1 ${(lender?.lender_contact?.apply_method.includes(configJson?.disabled_lender_type) && isOfferLoading && currentIndex === index) ? "disabled" : ""}`}
                                                                                                    onClick={() => applyLender(id, lender?.lender_id, lender?.loan_type_id, index)}>Get
                                                                                                    Loan
                                                                                                </div>
                                                                                                {(lender?.lender_contact?.apply_method.includes(configJson?.disabled_lender_type)) ?
                                                                                                    <span
                                                                                                        style={{color: "grey"}}>(* {configJson?.notes})</span> :
                                                                                                    <span
                                                                                                        style={{color: "grey"}}>(* Please click the button to proceed further)</span>
                                                                                                }
                                                                                            </div> : lender?.lender_contact?.apply_method === lenderApplyMethod.utm ?
                                                                                                <div>
                                                                                                    <div
                                                                                                        className={`btn btn-secondary w-100 mb-1 ${(lender?.lender_contact?.apply_method.includes(configJson?.disabled_lender_type) && isOfferLoading && currentIndex === index) ? "disabled" : ""}`}
                                                                                                        onClick={() => window.open(lender?.lender_links?.apply_link, '_blank')}>Get
                                                                                                        Loan
                                                                                                    </div>
                                                                                                    <span
                                                                                                        style={{color: "grey"}}>(* Please click the button to proceed further)</span>
                                                                                                </div> :
                                                                                                <div
                                                                                                    className={`${getStatusBadgeClass(lender?.lender_apply_status)} p-2 text-center rounded-2`}>
                                                                                                    {getStatusContent(lender?.lender_apply_status, lender)}
                                                                                                </div>
                                                                                        }
                                                                                    </div>
                                                                            }
                                                                            <button className={'btn btn-primary w-100'}
                                                                                    onClick={() => toggleAccordion(index)}>View
                                                                                Offer Details
                                                                            </button>
                                                                        </Col>
                                                                    </div>}
                                                            </AccordionHeader>
                                                            <AccordionBody accordionId={index}>
                                                                <Card className={'border border-1 bg-secondary-subtle'}>
                                                                    <CardBody>
                                                                        <Row>
                                                                            <Col lg={5}>
                                                                                <Row>
                                                                                    {lender?.computed_offer?.filter(offer => offer.formula_type !== "SELECTED_OFFER").map((offer, index) => (
                                                                                        <Col lg={11} key={index}>
                                                                                            <Card
                                                                                                className={'border border-1 card-animate cursor-pointer mb-2'}>
                                                                                                <CardBody>
                                                                                                    <h5>{offer?.formula_type.replace("_", " ")} {offer.formula_type !== "FINAL_OFFER" && "Based offer "}
                                                                                                        Amount  {offer.formula_type !== "FINAL_OFFER" && `(${offer?.formula_value}%)`}</h5>
                                                                                                    <p className={'float-end fs-5'}>
                                                                                                        <b>Rs.</b> {AmountExtractor(parseInt(offer?.offer_loan_amount))}
                                                                                                    </p>
                                                                                                </CardBody>
                                                                                            </Card>
                                                                                        </Col>
                                                                                    ))}
                                                                                </Row>
                                                                            </Col>
                                                                            <Col lg={6} className={'my-auto'}>
                                                                                {lender?.computed_offer?.filter(offer => offer.formula_type !== "SELECTED_OFFER" && offer.formula_type === "FINAL_OFFER").map((offer, _index) => (
                                                                                    <Card className={'border mb-0'}
                                                                                          key={_index}>
                                                                                        <CardBody>
                                                                                            <Row>
                                                                                                <Col
                                                                                                    className={'my-auto'}
                                                                                                    lg={5}>
                                                                                                    <p className={'mb-0'}>Loan
                                                                                                        Amount :</p>
                                                                                                    <h5>
                                                                                                        ₹ {(AmountExtractor(parseInt(offer?.offer_loan_amount)))}
                                                                                                    </h5>

                                                                                                    <p className={'mb-0 mt-2'}>Interest
                                                                                                        Rate :</p>
                                                                                                    <h5>{offer?.interest_rate}%</h5>

                                                                                                    <p className={'mb-0 mt-2'}>Tenure:</p>
                                                                                                    <h5>{offer?.tenure}</h5>

                                                                                                    <p className={'mb-0 mt-2'}>EMI
                                                                                                        Amount :</p>
                                                                                                    <h5>
                                                                                                        ₹ {AmountExtractor(parseInt(offer?.emi_amount))}
                                                                                                    </h5>
                                                                                                    <p className={'mb-0'}>Total
                                                                                                        Payment :</p>
                                                                                                    <h5>
                                                                                                        ₹ {AmountExtractor(parseInt(offer?.tenure * offer?.emi_amount))}
                                                                                                    </h5>
                                                                                                </Col>
                                                                                                <Col lg={6}>
                                                                                                    <SimplePie
                                                                                                        series={series}
                                                                                                        options={options}/>
                                                                                                </Col>
                                                                                            </Row>
                                                                                        </CardBody>
                                                                                    </Card>
                                                                                ))}

                                                                            </Col>
                                                                        </Row>
                                                                    </CardBody>
                                                                </Card>
                                                            </AccordionBody>
                                                        </AccordionItem>

                                                    )
                                                }
                                            })}

                                        </Accordion>

                                    </div>
                                    {!isApplicableLenderAvailable &&
                                        <div
                                            className='d-flex justify-content-center bg-info-subtle p-2 text-info align-self-center'>
                                            <span className='text-center'>No Eligible Lenders</span></div>
                                    }
                                    <CardHeader className='bg-danger-subtle mb-4 mt-2'>
                                        <div className='text-danger text-uppercase fs-15'>Rejected Lenders</div>
                                    </CardHeader>
                                    <RejectionLenderTwo lenderDetails={lenderDetails}/>
                                </div> :
                                <Card className={'border border-1 bg-secondary-subtle'}>
                                    <CardHeader>
                                        <h4 className={'text-center'}>Offer Details</h4>
                                    </CardHeader>
                                    <CardBody>
                                        <Row>
                                            <Col lg={6}>
                                                <Row>
                                                    {offers != null && offers?.filter(offer => offer.formula_type !== "FINAL_OFFER").map((offer, index) => (
                                                        <Col lg={11} key={index}>
                                                            <Card
                                                                className={'border border-1 card-animate cursor-pointer'}>
                                                                <CardBody>
                                                                    <h5>{offer?.formula_type.replace("_", " ")} Based
                                                                        offer
                                                                        Amount</h5>
                                                                    <p className={'float-end fs-5'}>
                                                                        <b>Rs.</b> {AmountExtractor(offer?.offer_loan_amount)}
                                                                    </p>
                                                                </CardBody>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                    <Col lg={11}>
                                                        <Card className={'border border-1 card-animate cursor-pointer'}>
                                                            <CardBody>
                                                                <h5>Final Offer Amount</h5>
                                                                <p className={'float-end fs-5'}>
                                                                    <b>Rs.</b> {AmountExtractor(parseInt(finalOffer?.offer_loan_amount))}
                                                                </p>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                </Row>

                                            </Col>
                                            <Col lg={5} className={'my-auto'}>
                                                <Card className={'border'}>
                                                    <CardBody>
                                                        <Row>
                                                            <Col className={'my-auto'} lg={5}>
                                                                <p className={'mb-0'}>Loan Amount :</p>
                                                                <h5>
                                                                    ₹ {AmountExtractor(parseInt(finalOffer?.offer_loan_amount))}
                                                                </h5>

                                                                <p className={'mb-0 mt-2'}>Interest Rate :</p>
                                                                <h5>{finalOffer?.interest_rate}%</h5>

                                                                <p className={'mb-0 mt-2'}>Tenure:</p>
                                                                <h5>{finalOffer?.tenure}</h5>

                                                                <p className={'mb-0 mt-2'}>EMI Amount :</p>
                                                                <h5>
                                                                    ₹ {AmountExtractor(parseInt(finalOffer?.emi_amount))}
                                                                </h5>
                                                                <p className={'mb-0'}>Total Payment :</p>
                                                                <h5>
                                                                    ₹ {AmountExtractor(totalPayment)}
                                                                </h5>
                                                            </Col>
                                                            <Col lg={6}>
                                                                <SimplePie series={series} options={options}/>
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            }
                        </>
                    )}

                    {!props?.hideButton && <CardFooter className='mt-3 bg-light'>
                        <div
                            className={`${props.theme === theme['mobile'] && "card position-fixed bottom-0 start-0 w-100 z-2 px-2 mb-0 p-2"}`}>
                            <div className={`d-flex justify-content-between `}>
                                <button className={`btn btn-primary rounded-5`}
                                        type={'button'} onClick={() => {
                                    props.moveBackward(props.stageID, props.stepID, props.data, id)
                                }}><i
                                    className={"ri-arrow-left-line label-icon align-middle"}></i> {props.theme === theme['mobile'] ? "" : "Back"}
                                </button>
                                <button
                                    className={`btn btn-primary   ${props.theme === theme['mobile'] ? "w-100 ms-1 rounded-4 fs-5 " : "rounded-5"}`}
                                    type={'button'}
                                    onClick={
                                        props.viewMode
                                            ? () => props.moveToNextStep(props.stageID, props.stepID, props.data, false)
                                            : () => props.moveToNextStep(props.stageID, props.stepID, props.data, false)
                                    }>
                                    {props.viewMode ? 'Next' : isLastStep ? "Finish" : 'Save & Next'}
                                    <i className="ri-arrow-right-line label-icon align-middle ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </CardFooter>}
                </CardBody>
            </Card>

            <Offcanvas toggle={toggleComputeSection} style={{height: '85vh'}} direction="bottom"
                       isOpen={togComputeSection}>
                <OffcanvasHeader toggle={toggleComputeSection}></OffcanvasHeader>
                <div className={'overflow-y-scroll'}>
                    <ApplicationOffer lenderLoad={fetchLenderDetails} toggleComputeSection={toggleComputeSection}/>
                </div>
            </Offcanvas>

        </>
    );
});

LenderRecommendedOfferSelection.displayName="LenderRecommendedOfferSelection"
export default LenderRecommendedOfferSelection;