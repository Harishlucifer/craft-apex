import React, { useState } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";

export const AALinkBankDataFetch = (props: any) => {
    const { context } = props;
    const [band, setBand] = useState('<2.5L'); // '<2.5L', '2.5L-4L', '>=4L'
    const [verificationMethod, setVerificationMethod] = useState('aa'); // 'aa', 'statement', 'netbanking'

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Top Section */}
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-8 md:p-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Income Verification</h2>
                    <p className="text-slate-500 text-lg mb-8">
                        Verifying your income via Account Aggregator can help you qualify for a <span className="font-bold text-slate-800">Higher LTV / Higher loan amount</span>. An exact amount is shown only after income verification is complete &mdash; the generic value shown until then is intentional.
                    </p>

                    {/* Applicability Table */}
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        INCOME VERIFICATION APPLICABILITY
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 mb-8 shadow-sm">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">Loan &lt; &#8377;2.5 lakh</span>
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Non-mandatory</span>
                        </div>
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white">
                            <span className="text-slate-800 font-semibold">&#8377;2.5 lakh &ndash; &lt; &#8377;4 lakh</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">Mandatory</span>
                        </div>
                        <div className="flex justify-between items-center px-6 py-4 bg-white">
                            <span className="text-slate-800 font-semibold">&ge; &#8377;4 lakh</span>
                            <span className="font-mono font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg">Mandatory + Field Investigation (FI)</span>
                        </div>
                    </div>

                    {/* Simulate Band */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-600 font-medium whitespace-nowrap">Simulate band:</span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${band === '<2.5L' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                                onClick={() => setBand('<2.5L')}
                            >
                                &lt; &#8377;2.5L
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${band === '2.5L-4L' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                                onClick={() => setBand('2.5L-4L')}
                            >
                                &#8377;2.5L &ndash; 4L
                            </button>
                            <button
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${band === '>=4L' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                                onClick={() => setBand('>=4L')}
                            >
                                &ge; &#8377;4L
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Band Alert */}
            {band === '<2.5L' && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <i className="ri-information-fill text-2xl"></i>
                    </div>
                    <div className="text-amber-800">
                        <p className="font-medium">Current band: <span className="font-bold">&lt; &#8377;2.5 lakh</span></p>
                        <p className="text-sm mt-1 opacity-90">Income verification is <span className="font-bold">optional</span>. You may still share data to unlock a higher LTV / higher loan amount.</p>
                    </div>
                </div>
            )}
            {band === '2.5L-4L' && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <i className="ri-information-fill text-2xl"></i>
                    </div>
                    <div className="text-blue-900">
                        <p className="font-medium">Current band: <span className="font-bold">&#8377;2.5 lakh &ndash; &lt; &#8377;4 lakh</span></p>
                        <p className="text-sm mt-1 opacity-90">Income verification is <span className="font-bold">mandatory</span>. Please complete verification below.</p>
                    </div>
                </div>
            )}
            {band === '>=4L' && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <i className="ri-alert-fill text-2xl"></i>
                    </div>
                    <div className="text-red-900">
                        <p className="font-medium">Current band: <span className="font-bold">&ge; &#8377;4 lakh</span></p>
                        <p className="text-sm mt-1 opacity-90">Income verification is <span className="font-bold">mandatory</span> and Field Investigation (FI) will be triggered.</p>
                    </div>
                </div>
            )}

            {/* Verification Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                        verificationMethod === 'aa' 
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10 -translate-y-1' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setVerificationMethod('aa')}
                >
                    {verificationMethod === 'aa' && (
                        <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in">
                            <i className="ri-checkbox-circle-fill text-2xl"></i>
                        </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                        verificationMethod === 'aa' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
                    }`}>
                        <i className="ri-link text-2xl"></i>
                    </div>
                    <h6 className={`font-black text-lg mb-2 transition-colors ${verificationMethod === 'aa' ? 'text-blue-900' : 'text-slate-700'}`}>Account Aggregator</h6>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Share bank data via RBI AA. Instant, no upload.</p>
                </div>
                
                <div
                    className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                        verificationMethod === 'statement' 
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10 -translate-y-1' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setVerificationMethod('statement')}
                >
                    {verificationMethod === 'statement' && (
                        <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in">
                            <i className="ri-checkbox-circle-fill text-2xl"></i>
                        </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                        verificationMethod === 'statement' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
                    }`}>
                        <i className="ri-file-text-line text-2xl"></i>
                    </div>
                    <h6 className={`font-black text-lg mb-2 transition-colors ${verificationMethod === 'statement' ? 'text-blue-900' : 'text-slate-700'}`}>Bank Statement</h6>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Upload last 6 months PDF statement.</p>
                </div>
                
                <div
                    className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                        verificationMethod === 'netbanking' 
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10 -translate-y-1' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setVerificationMethod('netbanking')}
                >
                    {verificationMethod === 'netbanking' && (
                        <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in">
                            <i className="ri-checkbox-circle-fill text-2xl"></i>
                        </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                        verificationMethod === 'netbanking' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
                    }`}>
                        <i className="ri-bank-line text-2xl"></i>
                    </div>
                    <h6 className={`font-black text-lg mb-2 transition-colors ${verificationMethod === 'netbanking' ? 'text-blue-900' : 'text-slate-700'}`}>Net Banking</h6>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Login to net banking &mdash; statement fetched automatically.</p>
                </div>
            </div>

            {/* Journey Section */}
            {verificationMethod === 'aa' && (
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden rounded-[2.5rem] mt-6 animate-in slide-in-from-bottom-4 duration-500">
                    <CardContent className="p-8 md:p-10">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                            AA CONSENT JOURNEY
                        </div>

                        <div className="space-y-4 relative">
                            {/* Connecting Line */}
                            <div className="absolute left-[1.15rem] top-8 bottom-8 w-0.5 bg-slate-100 -z-10 rounded-full"></div>

                            {/* Step 1 */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                                    <i className="ri-link text-xl"></i>
                                </div>
                                <div>
                                    <h6 className="font-bold text-slate-800">AA link sent to customer</h6>
                                    <p className="text-slate-500 text-sm mt-1 font-medium">OTP-based session on +91 98765 43210</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                                    <i className="ri-bank-fill text-xl"></i>
                                </div>
                                <div>
                                    <h6 className="font-bold text-slate-800">Bank linked</h6>
                                    <p className="text-slate-500 text-sm mt-1 font-medium">SBI Savings A/C connected</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                <div className="flex-shrink-0 relative w-10 h-10 mt-1">
                                    {/* Offset lighter blue background for 3D effect */}
                                    <div className="absolute inset-0 bg-blue-400 rounded-xl translate-y-0.5 -translate-x-0.5 opacity-80"></div>
                                    {/* Main icon foreground */}
                                    <div className="absolute inset-0 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                                        <i className="ri-bar-chart-fill text-lg"></i>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h6 className="font-bold text-blue-900">6-month statement fetching</h6>
                                        <i className="ri-loader-4-line animate-spin text-blue-600 text-lg"></i>
                                    </div>
                                    <p className="text-blue-600/70 text-sm mt-0.5 font-semibold">84% complete...</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-60">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-300 flex items-center justify-center">
                                    <i className="ri-check-line text-xl font-bold"></i>
                                </div>
                                <div>
                                    <h6 className="font-bold text-slate-500">Data shared with L&T Finance</h6>
                                    <p className="text-slate-400 text-sm mt-1 font-medium">Pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 mt-0.5">
                                <i className="ri-loop-right-line text-lg"></i>
                            </div>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                The Account Aggregator outcome stays <span className="font-bold text-slate-800">synchronised with your loan amount</span> throughout the journey &mdash; any change to the amount re-references this income data.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
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

export default AALinkBankDataFetch;
