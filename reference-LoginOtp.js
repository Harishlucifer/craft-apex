import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import {Card, Col, Container, Input, Label, Row, Button, FormFeedback, Form, Alert} from 'reactstrap';
import AuthSlider from './authCarousel';
import {useFormik} from "formik";
import {useDispatch} from "react-redux";
import * as Yup from "yup";
import withRouter from '../../Components/Common/withRouter';
import axios from "axios";
import JSONbig from "json-bigint";
import logo from "../../assets/images/lendingstack.png"
import {setAuthorization} from "../../helpers/api_helper";
import Swal from "sweetalert2";
import {useTenantConfiguration} from "../../Components/Common/TenantConfigurationProvider";
import Favicon from "../../Components/Common/Favicon";
import {X_Platform} from "../../Components/constants/constant"

const LoginOtp = (props) => {

    const tokenHashValue = useLocation();
    const getToken = tokenHashValue.search.substring(1)

    const urlParams = new URLSearchParams(getToken);
    const autoLoginToken = urlParams.get('autoLogin');

    const openAutoLoginWindow = (token) => {
        const tokenObj = token;
        const xPlatform = X_Platform.EmployeePortal;
        const apiUrl = process.env.REACT_APP_API_URL + `/alpha/v2/auth/login-with-link`;
        axios.post(apiUrl,
            {token: tokenObj},
            {
                transformResponse: function (response) {
                    return JSONbig.parse(response, 0);
                },
                headers: {
                    'X-Platform': xPlatform,
                },
            }).then(response => {
            console.log("response", response)
            if (response?.status) {
                console.log("response", response)
                setAuthorization(response?.data?.user?.access_token)
                localStorage.removeItem("guestToken")
                localStorage.setItem("authUser", JSON.stringify(response?.data));
                localStorage.setItem("accessToken", response?.data?.user?.access_token);
                localStorage.setItem("module", JSON.stringify(response?.data?.module));
                navigate(response?.data?.user?.default_route ? response?.data?.user?.default_route : '/partner/dashboard', {replace: true});
            } else {
                console.log("error");
            }
        }).catch(error => {
            console.log(error);
            Swal.fire({
                title: 'Warning!',
                text: error?.response?.data?.error,
                icon: 'warning',
            })
            navigate('/login', {replace: true});
        });
    };

    useEffect(() => {
        if (autoLoginToken !== null && autoLoginToken !== undefined && autoLoginToken !== '') {
            openAutoLoginWindow(autoLoginToken);
        }
    }, [autoLoginToken]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [disableMobile, setDisableMobile] = useState(false)

    const [sendBtnLabel, setSendBtnLabel] = useState("Send OTP")
    const [successAlert, setSuccessAlert] = useState("")
    const [errorAlert, setErrorAlert] = useState("")

    const [progress, setProgress] = useState(false);

    const configuration = useTenantConfiguration();
    const tenantName = configuration?.tenant?.TENANT_NAME;
    const [faviconUrl, setFaviconUrl] = useState(configuration?.tenant?.TENANT_FAVICON);
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        initialValues: {
            mobile: "",
            otp: ""
        },
        validationSchema: Yup.object({
            mobile: Yup.string()
                .matches(/^\d{10}$/, 'Invalid Mobile Number').required('Mobile Number is Required'),
            otp: Yup.string().required("OTP is required").max(4, "Max 4 numbers only").min(4, "Min 4 numbers only")
        }),
    });

    useEffect(() => {
        let timerInterval;
        if (timerSeconds > 0 && resendDisabled) {
            timerInterval = setInterval(() => {
                setTimerSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else if (timerSeconds === 0 && resendDisabled) {
            clearInterval(timerInterval);
            setResendDisabled(false);
        }
        return () => clearInterval(timerInterval);
    }, [timerSeconds, resendDisabled]);

    const sendOtp = () => {
        if (validation.values.mobile === null || validation.values.mobile === '') {
            validation.setTouched({
                mobile: true,
            });

        } else {
            setProgress(true);
            const otpApiUrl = process.env.REACT_APP_API_URL + '/alpha/v2/auth/login-with-otp';
            const otpRequestData =
                {
                    mobile: '91' + validation.values.mobile,
                    platform: X_Platform.EmployeePortal
                }

            axios.post(otpApiUrl, otpRequestData, {
                transformResponse: function (response) {
                    return JSONbig.parse(response);
                },
                transformRequest: function (request) {
                    return JSONbig.stringify(request);
                }
            })
                .then(response => {
                    console.log(response)
                    if (response?.status === -6) {
                        setSendBtnLabel("Verify OTP")
                        setDisableMobile(true)
                        setSuccessAlert(response.message)
                        setTimeout(() => {
                            setSuccessAlert("")
                        }, 5000)
                        setResendDisabled(true);
                        setTimerSeconds(60);
                    } else {
                        setErrorAlert(response.message)
                        setTimeout(() => {
                            setErrorAlert("")
                        }, 5000)
                    }
                })
                .catch(error => {
                    console.log(error.response.data.error)
                    if (error.response && error.response.data && error.response.data.error) {
                        setErrorAlert(error.response.data.error)
                    } else {
                        setErrorAlert("Login Failed. Please try again after sometime")
                    }

                }).finally(() => {
                setProgress(false);
            })
        }
    };

    const verifyOtp = () => {
        if (validation.values.otp === null || validation.values.otp === '') {
            validation.setTouched({
                otp: true,
            });
        } else {
            setProgress(true);
            const otpApiUrl = process.env.REACT_APP_API_URL + '/alpha/v2/auth/login-with-otp';
            const otpRequestData =
                {
                    mobile: '91' + validation.values.mobile,
                    platform: X_Platform.EmployeePortal,
                    otp: String(validation.values.otp)
                }

            axios.post(otpApiUrl, otpRequestData, {
                transformResponse: function (response) {
                    return JSONbig.parse(response);
                },
                transformRequest: function (request) {
                    return JSONbig.stringify(request);
                }
            })
                .then(response => {
                    setSuccessAlert(response.message)
                    if (response?.data) {
                        setAuthorization(response.data.user.access_token)
                        localStorage.setItem("authUser", JSON.stringify(response.data));
                        localStorage.setItem("accessToken", response.data.user.access_token);
                        localStorage.setItem("refreshToken", response.data.user.refresh_token);
                        localStorage.setItem("module", JSON.stringify(response.data.module));
                        localStorage.removeItem("guestToken");
                        navigate(response?.data?.change_password ? "/change-password" : response?.data?.user?.default_route ? response?.data?.user?.default_route : '/partner/dashboard', {replace: true});
                    }
                    setTimeout(() => {
                        setSuccessAlert("")
                    }, 1000)
                })
                .catch((error) => {
                    console.error('API Error:', error);
                    console.log(error.response.data.status)
                    if (error.response.data.status === -100) {
                        // registration flow is pending
                        navigate(`/register/${error.response.data.channel_id.toString()}`);
                    } else if (error.response.data.status === -101) {
                        if (error.response.data.pending_ask) {
                            Swal.fire({
                                icon: "question",
                                titleText: "Ask Pending",
                                text: "Do you want resolve the ask ?",
                                showCancelButton: true,
                                confirmButtonText: "Resolve Now",
                                cancelButtonText: "Maybe later"
                            }).then((res) => {
                                if (res.isConfirmed) {
                                    navigate(`/register/${error.response.data.channel_id.toString()}`, {
                                        state: {
                                            ask: error.response.data.channel_token,
                                            raised_ask: true
                                        }
                                    })
                                }
                                if (res.isDismissed) {
                                    window.location.reload();
                                }
                            })
                        } else {
                            //channel registration pending for approval
                            Swal.fire({
                                title: "Alert",
                                text: error.response.data.error,
                                icon: "info"
                            }).then(res => {
                                window.location.reload();
                            })
                        }

                    } else if (error.response.data.status === -102) {
                        //channel registration is rejected
                        Swal.fire({
                            title: 'Warning!',
                            text: error.response.data.error,
                            icon: 'warning',
                        })
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: error.response.data.error,
                            icon: "error"
                        })
                    }

                    // setErrorAlert(error.response.data.error)
                    // setTimeout(() => {
                    //     setErrorAlert("")
                    // }, 3500)
                }).finally(() => {
                setProgress(false);
            })
        }
    }
    const resendOtp = () => {
        console.log("resend")
        const otpApiUrl = process.env.REACT_APP_API_URL + '/alpha/v2/auth/login-with-otp';
        const otpRequestData =
            {
                mobile: '91' + validation.values.mobile,
                platform: X_Platform.EmployeePortal,
                resend: true,
                "retry_type": "text"
            }
        axios.post(otpApiUrl, otpRequestData, {
            transformResponse: function (response) {
                return JSONbig.parse(response);
            },
            transformRequest: function (request) {
                return JSONbig.stringify(request);
            },

        })
            .then(response => {
                setResendDisabled(true);
                setTimerSeconds(60);
                setSuccessAlert(response.message)
                setTimeout(() => {
                    setSuccessAlert("")
                }, 5000)
            })
            .catch(error => {
                console.error('API Error:', error);
                setErrorAlert(error.message)

                setTimeout(() => {
                    setErrorAlert("")
                }, 5000)
            })
    }
    return (
        <React.Fragment>
            <div className="d-flex flex-column min-vh-100">
                <div className="flex-grow-1">
                    <Container>
                        <Row>
                            <Col lg={12} style={{
                                marginTop: "7vh", // 10% of viewport height
                            }}>
                                <Card className="overflow-hidden">
                                    <Row className="g-0">
                                        <div className="d-none d-lg-block col-lg-6">
                                            <AuthSlider/>
                                        </div>

                                        <Col lg={6} className="min-vh-50 my-auto">
                                            <div className="p-lg-5 p-4">
                                                <div
                                                    className="d-flex flex-column justify-content-between align-items-start"
                                                    style={{height: '100%'}}>
                                                    <h5 className="text-primary mb-2">Welcome back to</h5>
                                                    <img height={'50vh'} src={configuration?.tenant.TENANT_LOGO}
                                                         alt={configuration?.tenant.TENANT_NAME}/>
                                                </div>

                                                <div className="mt-4">
                                                    <Form onSubmit={(e) => {
                                                        e.preventDefault();
                                                        return false;
                                                    }}
                                                          action="#">
                                                        <div className="mb-3">
                                                            <Label htmlFor="mobile"
                                                                   className="form-label">Mobile Number</Label>
                                                            <Input
                                                                name="mobile"
                                                                className="form-control"
                                                                placeholder="Enter Mobile number"
                                                                id="mobile"
                                                                type="text"
                                                                onChange={validation.handleChange}
                                                                onBlur={validation.handleBlur}
                                                                value={validation.values.mobile || ""}
                                                                disabled={disableMobile}
                                                                invalid={
                                                                    validation.touched.mobile && validation.errors.mobile ? true : false
                                                                }
                                                            />
                                                            {validation.touched.mobile && validation.errors.mobile ? (
                                                                <FormFeedback
                                                                    type="invalid">{validation.errors.mobile}</FormFeedback>
                                                            ) : null}
                                                        </div>

                                                        {disableMobile &&
                                                            <div className="mb-3">
                                                                <Label htmlFor="otp"
                                                                       className="form-label">OTP</Label>
                                                                <Input
                                                                    name="otp"
                                                                    className="form-control"
                                                                    placeholder="Enter OTP"
                                                                    id="otp"
                                                                    type="text"
                                                                    autoComplete="off"
                                                                    maxLength={4}
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.otp || ""}
                                                                    invalid={
                                                                        validation.touched.otp && validation.errors.otp ? true : false
                                                                    }
                                                                />
                                                                {validation.touched.otp && validation.errors.otp ? (
                                                                    <FormFeedback
                                                                        type="invalid">{validation.errors.otp}</FormFeedback>
                                                                ) : null}
                                                            </div>
                                                        }
                                                        {successAlert &&
                                                            <Alert color="success">{successAlert}</Alert>}
                                                        {errorAlert && <Alert color="danger">{errorAlert}</Alert>}

                                                        <div className="mt-4">
                                                            {progress ? (
                                                                <button className="btn btn-primary w-100"
                                                                        style={{fontSize: '16px'}} type="button"
                                                                        disabled>
                                                                <span className="spinner-grow spinner-grow-sm"
                                                                      style={{width: '1.5rem', height: '1.5rem'}}
                                                                      role="status" aria-hidden="true"></span>
                                                                    &nbsp;Please Wait ...
                                                                </button>
                                                            ) : (
                                                                <button className="btn btn-primary w-100"
                                                                        onClick={sendBtnLabel === "Send OTP" ? sendOtp : verifyOtp}>{sendBtnLabel}</button>
                                                            )}
                                                        </div>
                                                    </Form>
                                                </div>
                                                {resendDisabled && (
                                                    <>
                                                        <div
                                                            className="text-danger mt-4 mb-0 p-3 bg-primary text-white"
                                                            style={{
                                                                borderRadius: '50%',
                                                                width: '50px',
                                                                height: '50px',
                                                                textAlign: 'center',
                                                                lineHeight: '20px',
                                                                alignItems: 'center',
                                                                margin: 'auto'
                                                            }}
                                                        >
                                                            {timerSeconds}
                                                        </div>


                                                    </>
                                                )}
                                                {sendBtnLabel !== "Send OTP" ?
                                                    <div className="mt-3 text-center">
                                                        <p className="mb-2">Didn't receive a code ?</p>
                                                        <div
                                                            className="d-flex justify-content-center align-items-center">
                                                            <Button size="sm" color="primary"
                                                                    disabled={resendDisabled} onClick={resendOtp}>Resend
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    : <></>
                                                }
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <footer className="mt-auto" style={{padding: "20px 0"}}>
                    <Container>
                        <a href={"https://lendingstack.in/"} target={"_blank"} rel="noreferrer">
                            <div className="text-center">
                                <div className='text-center d-flex justify-content-center mt-3 align-items-center'>
                                    <p className={'me-2 mt-3'}>Powered By : </p>
                                    <img height={'28px'} src={logo} alt={'lending stack'}/>
                                </div>
                                <p className="mb-2">&copy; {new Date().getFullYear()} Inforvio Technologies.</p>
                            </div>
                        </a>
                    </Container>
                </footer>

            </div>
        </React.Fragment>
    );
};

export default withRouter(LoginOtp);