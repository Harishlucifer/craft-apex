import { registerStepComponent } from "../step-component-registry";
import React from 'react';
import { Card, CardContent } from "@craft-apex/ui";
import { Button } from "@craft-apex/ui";

export const TentativeKFS = (props: any) => {
    const { context } = props;
    const kfsData = [
        { label: 'Indicative loan amount', value: '₹72,300' },
        { label: 'Indicative rate (reducing)', value: '14.25%', suffix: ' p.a.' },
        { label: 'Tenure', value: '24', suffix: ' months' },
        { label: 'Indicative EMI', value: '₹3,480', suffix: ' / month' },
        { label: 'Indicative APR', value: '16.2%' },
        { label: 'Processing fee', value: '₹1,050', suffix: ' + GST' },
        { label: 'Total repayment (indicative)', value: '₹83,520' },
        { label: 'Prepayment charges', value: 'Nil', suffix: ' after 12 months', isLast: true }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm mx-2 md:mx-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <i className="ri-information-fill text-2xl"></i>
                </div>
                <div className="text-amber-800">
                    <p className="font-medium text-[0.95rem] leading-relaxed">
                        <span className="font-bold">This is a tentative KFS.</span> Figures are indicative and may change based on the final underwriting outcome (including FI / RCU where applicable). A final KFS will be presented for your acceptance before e-Sign.
                    </p>
                </div>
            </div>

            {/* Indicative Terms Card */}
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-8 md:p-10">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                        INDICATIVE TERMS &mdash; L&T FINANCE LTD.
                    </div>

                    {/* Terms Table / List */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                        {kfsData.map((item, index) => (
                            <div key={index} className={`flex flex-col sm:flex-row justify-between sm:items-center px-6 py-4 bg-white ${item.isLast ? '' : 'border-b border-slate-200'}`}>
                                <span className="text-slate-600 font-medium mb-1 sm:mb-0">{item.label}</span>
                                <span className="font-mono text-base text-right">
                                    <span className="font-bold text-slate-900">{item.value}</span>
                                    {item.suffix && <span className="font-medium text-slate-700">{item.suffix}</span>}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Card Footer Note */}
                    <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm">
                        <i className="ri-shield-check-fill text-slate-400 text-lg"></i>
                        <span>Lender selected: <span className="font-bold text-slate-700">L&T Finance Ltd.</span> &middot; KFS issued per RBI Key Facts Statement guidelines.</span>
                    </div>
                </CardContent>
            </Card>

            </div>
    );
};

export default TentativeKFS;

registerStepComponent("TENTATIVE_KFS", TentativeKFS);
