import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Badge } from "./badge";
import { toast } from "./sonner";

export const KycVerification = (props: any) => {
    const { context } = props;
    const applicationDetail = context?.applicationDetail;
    const data = props.data || applicationDetail; // fallback to props.data for flexibility

    const applicants = data?.applicants || data?.application?.applicants || [];
    const primaryApplicant = applicants[0] || {};
    const personal = primaryApplicant?.personal || {};

    const verificationTypes = [
        {
            id: "aadhaar",
            label: "Aadhaar eKYC",
            text: "Verify using Aadhaar OTP or XML",
            icon: "ri-fingerprint-line",
        },
        {
            id: "pan",
            label: "PAN Verification",
            text: "Verify using PAN card details",
            icon: "ri-bank-card-line",
        },
        {
            id: "ckyc",
            label: "CKYC Fetch",
            text: "Fetch existing KYC from central registry",
            icon: "ri-database-2-line",
        },
    ];

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [enteredOtp, setEnteredOtp] = useState("");
    const [verifiedStatus, setVerifiedStatus] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            aadhaar_no: personal?.secondary_id_type === "AADHAR" ? personal?.secondary_id_value || "" : "",
            pan_no: personal?.primary_id_type === "PAN" ? personal?.primary_id_value || "" : "",
            full_name: personal?.first_name || "",
            dob: personal?.dob || "",
            ckyc_no: "",
            otp: ""
        },
        onSubmit: async (values) => {
            if (selectedType === "aadhaar") {
                toggleOtpModal();
            } else {
                toast.success(`${selectedType?.toUpperCase()} Verified Successfully`);
                setVerifiedStatus(true);
            }
        },
        validationSchema: Yup.object().shape({
            aadhaar_no: selectedType === "aadhaar" ? Yup.string()
                .required("Aadhaar is required")
                .matches(/^[0-9]{12}$/, "Aadhaar must be exactly 12 digits") : Yup.string(),
            pan_no: selectedType === "pan" || selectedType === "ckyc" ? Yup.string()
                .required("PAN is required") : Yup.string(),
            otp: otpModalOpen ? Yup.string()
                .required("OTP is required")
                .matches(/^[0-9]{6}$/, "OTP must be exactly 6 digits") : Yup.string()
        }),
    });

    const toggleOtpModal = () => {
        setOtpModalOpen(!otpModalOpen);
        if (otpModalOpen) {
            formik.setFieldValue("otp", "");
            setEnteredOtp("");
        } else {
            startResendTimer();
        }
    };

    const startResendTimer = () => {
        setResendTimer(30);
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resendOtp = () => {
        startResendTimer();
        toast.success("OTP resent successfully!");
    };

    const handleOtpSubmit = () => {
        if (!formik.values.otp || formik.values.otp.length !== 6) {
            formik.setFieldError("otp", "Valid 6-digit OTP is required");
            return;
        }
        toast.success("Aadhaar Verified Successfully");
        setVerifiedStatus(true);
        toggleOtpModal();
        setSelectedType("pan");
    };

    const renderVerificationUI = () => {
        switch (selectedType) {
            case "aadhaar":
                return (
                    <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-slate-800">Aadhaar Verification</h5>
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700">
                            <i className="ri-fingerprint-line text-xl"></i>
                            <p className="m-0 text-sm">
                                Aadhaar eKYC verification will require OTP authentication on your registered mobile number
                            </p>
                        </div>
                        <form className="mt-4 space-y-4" onSubmit={formik.handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                <div className="space-y-2">
                                    <Label htmlFor="aadhaar_no">
                                        Aadhaar Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="aadhaar_no"
                                        id="aadhaar_no"
                                        maxLength={12}
                                        placeholder="XXXX XXXX XXXX"
                                        value={formik.values.aadhaar_no}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={personal?.secondary_id_type === "AADHAR" && !!personal?.secondary_id_value}
                                        className={formik.touched.aadhaar_no && formik.errors.aadhaar_no ? "border-red-500" : ""}
                                    />
                                    {formik.touched.aadhaar_no && formik.errors.aadhaar_no && (
                                        <div className="text-sm text-red-500 mt-1">{formik.errors.aadhaar_no as string}</div>
                                    )}
                                </div>
                                <div className="pt-8">
                                    <Button type="submit" className="w-full md:w-auto">
                                        Send OTP
                                    </Button>
                                </div>
                            </div>

                            {verifiedStatus && (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700 mt-4">
                                    <i className="ri-check-line text-xl"></i>
                                    <p className="m-0 text-sm font-medium">Aadhaar verified successfully</p>
                                </div>
                            )}
                        </form>
                    </div>
                );

            case "pan":
                return (
                    <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-slate-800">PAN Verification</h5>
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700">
                            <i className="ri-bank-card-line text-xl"></i>
                            <p className="m-0 text-sm">
                                PAN verification requires accurate details. Make sure the name matches exactly as on your PAN card.
                            </p>
                        </div>
                        <form className="mt-4 space-y-4" onSubmit={formik.handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pan_no">
                                        PAN Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="pan_no"
                                        id="pan_no"
                                        maxLength={10}
                                        placeholder="Enter PAN no"
                                        value={formik.values.pan_no}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={personal?.primary_id_type === "PAN" && !!personal?.primary_id_value}
                                        className={formik.touched.pan_no && formik.errors.pan_no ? "border-red-500" : ""}
                                    />
                                    {formik.touched.pan_no && formik.errors.pan_no && (
                                        <div className="text-sm text-red-500 mt-1">{formik.errors.pan_no as string}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">
                                        Full Name (as on PAN) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="full_name"
                                        id="full_name"
                                        placeholder="Enter your full name"
                                        value={formik.values.full_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={!!personal?.first_name}
                                        className={formik.touched.full_name && formik.errors.full_name ? "border-red-500" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        name="dob"
                                        id="dob"
                                        value={formik.values.dob}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={!!personal?.dob}
                                        className={formik.touched.dob && formik.errors.dob ? "border-red-500" : ""}
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button type="submit">Verify PAN</Button>
                            </div>

                            {verifiedStatus && (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700 mt-4">
                                    <i className="ri-check-line text-xl"></i>
                                    <p className="m-0 text-sm font-medium">PAN verified successfully</p>
                                </div>
                            )}
                        </form>
                    </div>
                );

            case "ckyc":
                return (
                    <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-slate-800">CKYC Verification</h5>
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700">
                            <i className="ri-database-2-line text-xl"></i>
                            <p className="m-0 text-sm">
                                CKYC fetch will retrieve your existing KYC data from the Central KYC Registry maintained by CERSAI.
                            </p>
                        </div>
                        <form className="mt-4 space-y-4" onSubmit={formik.handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ckyc_no">CKYC Number</Label>
                                    <Input
                                        type="text"
                                        name="ckyc_no"
                                        id="ckyc_no"
                                        maxLength={14}
                                        placeholder="14-digit CKYC Number"
                                        value={formik.values.ckyc_no}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pan_no">
                                        PAN Number (for verification) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        name="pan_no"
                                        id="pan_no"
                                        maxLength={10}
                                        placeholder="Enter your PAN no"
                                        value={formik.values.pan_no}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={personal?.primary_id_type === "PAN" && !!personal?.primary_id_value}
                                        className={formik.touched.pan_no && formik.errors.pan_no ? "border-red-500" : ""}
                                    />
                                    {formik.touched.pan_no && formik.errors.pan_no && (
                                        <div className="text-sm text-red-500 mt-1">{formik.errors.pan_no as string}</div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button type="submit">Fetch CKYC Data</Button>
                            </div>

                            {verifiedStatus && (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700 mt-4">
                                    <i className="ri-check-line text-xl"></i>
                                    <p className="m-0 text-sm font-medium">CKYC data fetched successfully</p>
                                </div>
                            )}
                        </form>
                    </div>
                );

            default:
                return (
                    <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                        <div className="text-center p-6">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                                <i className="ri-shield-check-line text-2xl text-slate-400"></i>
                            </div>
                            <h5 className="text-base font-medium text-slate-600">Please select a verification method</h5>
                            <p className="text-sm text-slate-400 mt-1">Choose an option from the left to proceed</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full space-y-6">
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-slate-900">Applicants</h4>
                    <Button variant="outline" size="sm" className="gap-2">
                        <i className="ri-user-add-line"></i> Add Co-Applicant
                    </Button>
                </div>

                <div className="mb-6">
                    <Card className="w-full md:w-1/3 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <i className="ri-user-line text-lg"></i>
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {primaryApplicant?.applicant_type || "PRIMARY"} APPLICANT
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {personal?.first_name || data?.application?.applicant_name || "Applicant Name"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm border-slate-100">
                    <CardContent className="p-0">
                        <div className="border-b border-slate-100 p-4">
                            <h5 className="text-base font-semibold text-slate-900">KYC Details for Primary Applicant</h5>
                        </div>

                        <div className="flex flex-col md:flex-row min-h-[400px]">
                            {/* Left Column: Method Selection */}
                            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 p-4 bg-slate-50/50">
                                <h6 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Method</h6>
                                <div className="space-y-3">
                                    {verificationTypes.map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                                                selectedType === type.id
                                                    ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                    selectedType === type.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                                }`}>
                                                    <i className={`${type.icon} text-lg`}></i>
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-bold ${
                                                        selectedType === type.id ? "text-blue-900" : "text-slate-700"
                                                    }`}>
                                                        {type.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{type.text}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Verification UI */}
                            <div className="w-full md:w-2/3 p-6">
                                {renderVerificationUI()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* OTP Modal */}
                <Dialog open={otpModalOpen} onOpenChange={toggleOtpModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Enter OTP</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">
                                    OTP <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    value={formik.values.otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                        formik.setFieldValue("otp", val);
                                    }}
                                    className={formik.errors.otp ? "border-red-500 text-center tracking-widest text-lg" : "text-center tracking-widest text-lg"}
                                />
                                {formik.errors.otp && (
                                    <div className="text-sm text-red-500 mt-1">{formik.errors.otp as string}</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={resendTimer > 0}
                                    className={`font-medium ${resendTimer > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:underline"}`}
                                >
                                    Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
                                </button>
                            </div>
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <Button variant="outline" onClick={toggleOtpModal}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleOtpSubmit}>
                                Verify OTP
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
        
        {/* Footer Actions */}
        <div className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Button
                variant="outline"
                type="button"
                onClick={() => {
                    if (props.onBack) {
                        props.onBack();
                    } else if (context?.cancelHref) {
                        window.location.href = context.cancelHref;
                    }
                }}
            >
                Back
            </Button>
            <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={context?.submitting}
                onClick={async () => {
                    if (context?.onSubmit) {
                        await context.onSubmit();
                    } else if (props.onNext) {
                        props.onNext();
                    }
                }}
            >
                {context?.submitLabel || "Save & Next"}
            </Button>
        </div>
        </div>
    );
};

export default KycVerification;
