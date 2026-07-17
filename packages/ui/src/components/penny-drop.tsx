import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { toast } from "./sonner";

export const PennyDrop = (props: any) => {
    const { context } = props;
    const applicationDetail = context?.applicationDetail;
    const data = props.data || applicationDetail;

    const applicants = data?.applicants || data?.application?.applicants || [];
    const primaryApplicant = applicants[0] || {};
    const personal = primaryApplicant?.personal || {};
    const bankAccount = personal?.person_bank_account || {};

    const [responseData, setResponseData] = useState<any>(null);
    const [nameMatchPercent, setNameMatchPercent] = useState<number>(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            account_number: bankAccount?.account_number || "",
            ifsc_code: bankAccount?.ifsc_code || "",
        },
        onSubmit: async (values) => {
            await handleSubmit(values);
        },
        validationSchema: Yup.object().shape({
            account_number: Yup.string().required("Account Number is required"),
            ifsc_code: Yup.string().required("IFSC Code is required"),
        }),
    });

    const getNameMatchPercentage = (expected: string, received: string) => {
        if (!expected || !received) return 0;
        const expectedWords = expected.toLowerCase().split(" ");
        const receivedWords = received.toLowerCase().split(" ");

        const matched = expectedWords.filter((word) => receivedWords.includes(word));
        return Math.round((matched.length / expectedWords.length) * 100);
    };

    const handleSubmit = async (values: any) => {
        setIsVerifying(true);

        // Simulated API response for Penny Drop Verification
        const mockResponse = {
            account_holder_name: bankAccount?.account_holder_name || data?.application?.applicant_name || "Account Holder",
            account_number: values.account_number,
            ifsc_code: values.ifsc_code,
            account_status: "Active",
        };

        const expectedName = bankAccount?.account_holder_name || data?.application?.applicant_name || "";
        const matchPercent = getNameMatchPercentage(expectedName, mockResponse.account_holder_name);

        setTimeout(() => {
            setResponseData(mockResponse);
            setNameMatchPercent(matchPercent);
            setIsVerifying(false);
            setIsVerified(true);
            toast.success("Penny Drop Verification Successful");
        }, 2000);
    };

    const getMatchStatus = (isMatch: boolean) => {
        return isMatch ? (
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
                <i className="ri-check-circle-fill text-lg"></i>
                <span className="text-sm">Matched</span>
            </div>
        ) : (
            <div className="flex items-center gap-1 text-rose-600 font-bold">
                <i className="ri-close-circle-fill text-lg"></i>
                <span className="text-sm">Failed</span>
            </div>
        );
    };

    const expectedName = bankAccount?.account_holder_name || data?.application?.applicant_name || "N/A";

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-5 text-white">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                            <i className="ri-coins-line text-3xl text-white"></i>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black mb-1">Penny Drop Verification</h4>
                            <p className="text-blue-100 font-medium opacity-90">
                                Verify your bank account by dropping ₹1 to ensure it's active.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-8 md:p-10">
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100 mb-8 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                            <i className="ri-information-fill text-2xl"></i>
                        </div>
                        <div>
                            <h6 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
                                <i className="ri-shield-check-fill text-blue-600"></i>
                                Bank Account Verification
                            </h6>
                            <p className="text-slate-600 text-sm font-medium mb-3">
                                Please confirm the bank account details below. We will initiate a ₹1 transfer (Penny Drop) to this account to verify it belongs to you and is active.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3">
                                <Label htmlFor="account_number" className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    Account Number <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="account_number"
                                    name="account_number"
                                    placeholder="Enter your account number"
                                    value={formik.values.account_number}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isVerified || !!bankAccount?.account_number}
                                    className={`h-12 rounded-xl border-2 ${formik.touched.account_number && formik.errors.account_number ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'}`}
                                />
                                {formik.touched.account_number && formik.errors.account_number && (
                                    <div className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                        <i className="ri-error-warning-line"></i> {formik.errors.account_number as string}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="ifsc_code" className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    IFSC Code <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="ifsc_code"
                                    name="ifsc_code"
                                    placeholder="e.g. HDFC0001234"
                                    value={formik.values.ifsc_code}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={isVerified || !!bankAccount?.ifsc_code}
                                    className={`h-12 rounded-xl border-2 uppercase ${formik.touched.ifsc_code && formik.errors.ifsc_code ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'}`}
                                />
                                {formik.touched.ifsc_code && formik.errors.ifsc_code && (
                                    <div className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                        <i className="ri-error-warning-line"></i> {formik.errors.ifsc_code as string}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isVerified && (
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin text-xl"></i> Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-shield-check-line text-lg"></i> Verify Account
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>

                    {/* Verification Results Table */}
                    {responseData && !isVerifying && (
                        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h6 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                                <i className="ri-file-list-3-line text-blue-600"></i> Verification Results
                            </h6>

                            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-4 bg-slate-50 border-b border-slate-200 p-4">
                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Field</div>
                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Provided Detail</div>
                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Bank Record</div>
                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Match Status</div>
                                </div>

                                {/* Name Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 p-4 border-b border-slate-100 items-center gap-y-2">
                                    <div className="font-bold text-sm text-slate-800">Name</div>
                                    <div className="text-sm text-slate-600 font-medium truncate" title={expectedName}>{expectedName}</div>
                                    <div className="text-sm text-slate-600 font-medium truncate" title={responseData.account_holder_name}>{responseData.account_holder_name}</div>
                                    <div>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${nameMatchPercent >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {nameMatchPercent >= 70 ? <i className="ri-check-line text-sm"></i> : <i className="ri-error-warning-line text-sm"></i>}
                                            {nameMatchPercent}% Match
                                        </div>
                                    </div>
                                </div>

                                {/* Account Number Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 p-4 border-b border-slate-100 items-center gap-y-2">
                                    <div className="font-bold text-sm text-slate-800">Account Number</div>
                                    <div className="text-sm text-slate-600 font-mono">{formik.values.account_number}</div>
                                    <div className="text-sm text-slate-600 font-mono">{responseData.account_number}</div>
                                    <div>{getMatchStatus(formik.values.account_number === responseData.account_number)}</div>
                                </div>

                                {/* IFSC Code Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 p-4 items-center gap-y-2">
                                    <div className="font-bold text-sm text-slate-800">IFSC Code</div>
                                    <div className="text-sm text-slate-600 font-mono uppercase">{formik.values.ifsc_code}</div>
                                    <div className="text-sm text-slate-600 font-mono uppercase">{responseData.ifsc_code}</div>
                                    <div>{getMatchStatus(formik.values.ifsc_code === responseData.ifsc_code)}</div>
                                </div>
                            </div>
                        </div>
                    )}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 px-6 h-10 rounded-lg font-semibold"
                    disabled={context?.submitting}
                    onClick={async () => {
                        if (context?.onSubmit) {
                            await context.onSubmit();
                        } else if (props.onNext) {
                            props.onNext();
                        }
                    }}
                >
                    {context?.submitting ? (
                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                    ) : (
                        <>{context?.submitLabel || "Save & Next"}</>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PennyDrop;
