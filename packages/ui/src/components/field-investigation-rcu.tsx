import React, { useState } from 'react';
import { Card, CardContent } from "./card";
import { Button } from "./button";

export const FieldInvestigationRCU = (props: any) => {
    const { context } = props;
    const [scenario, setScenario] = useState('no-fi'); // 'no-fi', 'fi-required', 'rcu-sampled'
    const [rcuOutcome, setRcuOutcome] = useState('clear'); // 'clear', 'refer', 'reject'

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Scenario Simulator */}
            <Card className="border-0 shadow-lg shadow-slate-200/40 bg-white overflow-hidden rounded-[2rem]">
                <CardContent className="p-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        SIMULATE SCENARIO
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${scenario === 'no-fi' ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                            onClick={() => setScenario('no-fi')}
                        >
                            &le; &#8377;4L &middot; No FI
                        </button>
                        <button
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${scenario === 'fi-required' ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                            onClick={() => setScenario('fi-required')}
                        >
                            &gt; &#8377;4L &middot; FI required
                        </button>
                        <button
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${scenario === 'rcu-sampled' ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
                            onClick={() => setScenario('rcu-sampled')}
                        >
                            RCU sampled (random)
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Scenario 1: No FI */}
            {scenario === 'no-fi' && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm mx-2 md:mx-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                        <i className="ri-check-line text-2xl font-bold"></i>
                    </div>
                    <div>
                        <h6 className="text-emerald-700 font-bold text-lg mb-1">No field investigation required</h6>
                        <p className="text-emerald-600/80 font-medium">Ticket size within standard limits and not selected for RCU sampling. Proceeding to final underwriting.</p>
                    </div>
                </div>
            )}

            {/* Scenario 2: FI Required */}
            {scenario === 'fi-required' && (
                <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                    <CardContent className="p-8 md:p-10">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                            FIELD INVESTIGATION (FI) &mdash; REQUIRED FOR &gt; &#8377;4,00,000
                        </div>

                        <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <span className="text-lg">📆</span>
                            <p className="text-blue-900 text-sm font-medium leading-relaxed">
                                <span className="font-bold">Expected timeline:</span> FI agent visit within <span className="font-bold text-blue-700">24&ndash;48 working hours.</span> The customer has been notified via SMS & WhatsApp. <span className="italic opacity-80">(R17 &mdash; review timeline communicated)</span>
                            </p>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm mb-8">
                            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
                                <span className="text-slate-600 font-medium">Residence verification</span>
                                <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">Scheduled</span>
                            </div>
                            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
                                <span className="text-slate-600 font-medium">Office / business verification</span>
                                <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">Scheduled</span>
                            </div>
                            <div className="flex justify-between items-center px-6 py-4">
                                <span className="text-slate-500 font-medium">FI reference</span>
                                <span className="font-mono font-bold text-slate-800">FI-LT-2026-00842</span>
                            </div>
                        </div>

                        <h6 className="font-bold text-slate-900 mb-4 text-lg">Capture additional documents for FI / RCU</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors group">
                                <div className="text-3xl mb-3">🏠</div>
                                <h6 className="font-bold text-slate-800 mb-2">Residence Proof (additional)</h6>
                                <p className="text-slate-500 text-sm font-medium mb-4">Utility bill / ownership document for FI cross-check.</p>
                                <button className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:text-blue-700">
                                    <i className="ri-attachment-line text-lg"></i>
                                    Upload Document
                                </button>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors group">
                                <div className="text-3xl mb-3">🏢</div>
                                <h6 className="font-bold text-slate-800 mb-2">Business / Office Proof</h6>
                                <p className="text-slate-500 text-sm font-medium mb-4">Shop & Establishment / GST / office photo.</p>
                                <button className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:text-blue-700">
                                    <i className="ri-attachment-line text-lg"></i>
                                    Upload Document
                                </button>
                            </div>
                        </div>

                        <Button className="w-full sm:w-auto px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">
                            Simulate FI Completed <i className="ri-arrow-right-line ml-2"></i>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Scenario 3: RCU Sampled */}
            {scenario === 'rcu-sampled' && (
                <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                    <CardContent className="p-8 md:p-10">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                            RCU REVIEW (RISK CONTAINMENT UNIT)
                        </div>

                        <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <span className="text-lg">🎲</span>
                            <p className="text-blue-900 text-sm font-medium leading-relaxed">
                                This case was selected as part of the <span className="font-bold">RCU sampling</span> (a defined % of cases). 📆 <span className="font-bold">Expected review:</span> 2&ndash;3 working days. Customer notified of the review timeline.
                            </p>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm mb-8">
                            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
                                <span className="text-slate-600 font-medium">Document authenticity</span>
                                {rcuOutcome === 'clear' ? (
                                    <span className="font-bold text-emerald-600 flex items-center gap-1"><i className="ri-check-line text-lg"></i>Clear</span>
                                ) : rcuOutcome === 'refer' ? (
                                    <span className="font-bold text-amber-600 flex items-center gap-1"><i className="ri-error-warning-line text-lg"></i>Refer</span>
                                ) : (
                                    <span className="font-bold text-red-600 flex items-center gap-1"><i className="ri-close-line text-lg"></i>Reject</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
                                <span className="text-slate-600 font-medium">Income document sampling</span>
                                {rcuOutcome === 'clear' ? (
                                    <span className="font-bold text-emerald-600 flex items-center gap-1"><i className="ri-check-line text-lg"></i>Clear</span>
                                ) : rcuOutcome === 'refer' ? (
                                    <span className="font-bold text-amber-600 flex items-center gap-1"><i className="ri-error-warning-line text-lg"></i>Refer</span>
                                ) : (
                                    <span className="font-bold text-red-600 flex items-center gap-1"><i className="ri-close-line text-lg"></i>Reject</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center px-6 py-4">
                                <span className="text-slate-500 font-medium">RCU reference</span>
                                <span className="font-mono font-bold text-slate-800">RCU-LT-2026-00842</span>
                            </div>
                        </div>

                        <h6 className="font-bold text-slate-900 mb-4 text-lg">Simulate RCU outcome</h6>
                        <div className="flex flex-wrap gap-3 mb-8">
                            <button
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${rcuOutcome === 'clear' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                                onClick={() => setRcuOutcome('clear')}
                            >
                                Clear
                            </button>
                            <button
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${rcuOutcome === 'refer' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                                onClick={() => setRcuOutcome('refer')}
                            >
                                Refer (more docs)
                            </button>
                            <button
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${rcuOutcome === 'reject' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                                onClick={() => setRcuOutcome('reject')}
                            >
                                Reject
                            </button>
                        </div>

                        {/* RCU Outcome Alerts */}
                        {rcuOutcome === 'clear' && (
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                                    <i className="ri-check-line text-2xl font-bold"></i>
                                </div>
                                <div>
                                    <h6 className="text-emerald-700 font-bold text-lg mb-1">RCU cleared</h6>
                                    <p className="text-emerald-600/80 font-medium">No discrepancies &mdash; proceeding to final underwriting.</p>
                                </div>
                            </div>
                        )}

                        {rcuOutcome === 'refer' && (
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <i className="ri-error-warning-fill text-2xl"></i>
                                </div>
                                <div>
                                    <h6 className="text-amber-800 font-bold text-lg mb-1">Referred &mdash; additional documents requested</h6>
                                    <p className="text-amber-700/80 font-medium">RCU requires fresh income proof. Customer notified &mdash; expected resolution in 1&ndash;2 working days. Upload via the FI / RCU document section above.</p>
                                </div>
                            </div>
                        )}

                        {rcuOutcome === 'reject' && (
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                    <i className="ri-close-circle-fill text-2xl"></i>
                                </div>
                                <div className="w-full">
                                    <h6 className="text-red-800 font-bold text-lg mb-1">Application rejected by RCU</h6>
                                    <p className="text-red-700/80 font-medium mb-4">Adverse RCU findings (document discrepancy). The application cannot proceed. Customer notified with reason & grievance-redressal details.</p>
                                    <button className="px-4 py-2 bg-white text-slate-700 font-bold text-sm border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                                        Close &mdash; Return to Lead List
                                    </button>
                                </div>
                            </div>
                        )}
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
                    disabled={context?.submitting || rcuOutcome === 'reject'}
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

export default FieldInvestigationRCU;
