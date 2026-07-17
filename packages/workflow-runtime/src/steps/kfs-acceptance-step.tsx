import { registerStepComponent } from "../step-component-registry";
import React, { useState } from 'react';
import { Card, CardContent } from "@craft-apex/ui";
import { Button } from "@craft-apex/ui";

export const KFSAcceptance = (props: any) => {
    const { context } = props;
    const [accepted, setAccepted] = useState(true);

    const kfsData = [
        { label: 'Lender', value: 'L&T Finance Ltd.' },
        { label: 'Loan amount', value: '₹72,300' },
        { label: 'Interest rate (reducing)', value: '14.25%', suffix: ' p.a.' },
        { label: 'APR', value: '16.2%' },
        { label: 'Tenure', value: '24', suffix: ' months' },
        { label: 'EMI', value: '₹3,480', suffix: ' / month' },
        { label: 'Total interest', value: '₹11,220' },
        { label: 'Processing fee', value: '₹1,050', suffix: ' + GST' },
        { label: 'Net Disbursement to Dealer', value: '₹71,061', isHighlighted: true },
        { label: 'Total repayment', value: '₹83,520' },
        { label: 'Prepayment charges', value: 'Nil', suffix: ' after 12 months', isLast: true }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-5 text-white">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                            <i className="ri-file-text-fill text-3xl text-white"></i>
                        </div>
                        <div>
                            <div className="text-blue-100 font-bold text-xs uppercase tracking-wider mb-1">
                                RBI KFS
                            </div>
                            <h4 className="text-2xl font-black mb-1">Final Key Fact Statement</h4>
                            <p className="text-blue-100 font-medium opacity-90">
                                Review your loan terms and provide your acceptance.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-8 md:p-10">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm mb-8">
                        {kfsData.map((item, index) => (
                            <div 
                                key={index} 
                                className={`flex flex-col sm:flex-row justify-between sm:items-center px-6 py-4 transition-colors ${
                                    item.isHighlighted 
                                        ? 'bg-blue-50/50 border-y border-blue-100' 
                                        : 'bg-white'
                                } ${item.isLast && !item.isHighlighted ? '' : !item.isHighlighted ? 'border-b border-slate-200' : ''}`}
                            >
                                <span className={`mb-1 sm:mb-0 ${item.isHighlighted ? 'font-bold text-blue-900' : 'font-medium text-slate-600'}`}>
                                    {item.label}
                                </span>
                                <span className="font-mono text-base text-right">
                                    <span className={`${item.isHighlighted ? 'font-black text-blue-700' : 'font-bold text-slate-900'}`}>
                                        {item.value}
                                    </span>
                                    {item.suffix && (
                                        <span className={`font-medium ${item.isHighlighted ? 'text-blue-600' : 'text-slate-700'}`}>
                                            {item.suffix}
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className={`flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            accepted 
                                ? 'bg-blue-50 border-blue-600 shadow-md shadow-blue-600/10' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setAccepted(!accepted)}
                    >
                        <div className="mr-4 mt-1">
                            <div
                                className={`flex items-center justify-center rounded-md w-6 h-6 border-2 transition-all duration-300 ${
                                    accepted 
                                        ? 'bg-blue-600 border-blue-600 text-white scale-110' 
                                        : 'bg-white border-slate-300'
                                }`}
                            >
                                {accepted && <i className="ri-check-line font-bold"></i>}
                            </div>
                        </div>
                        <div>
                            <h6 className="font-bold text-slate-900 text-base mb-1">I accept the Key Fact Statement</h6>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                I have read and understood the KFS, including the APR, fees, EMI and total repayment. I accept these terms. (KFS acceptance is recorded separately from e-Sign.)
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            </div>
    );
};

export default KFSAcceptance;

registerStepComponent("KFS_ACCEPTANCE", KFSAcceptance);
