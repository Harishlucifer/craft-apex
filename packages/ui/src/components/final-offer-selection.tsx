import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { getApiClient } from "@craft-apex/api";

export const FinalOfferSelection = (props: any) => {
    const { context } = props;
    const applicationId = context?.applicationId || props?.value?.application_id;
    // Extract lender details from application context if available, otherwise from props value
    const applicationLenderApply = context?.applicationDetail?.application_lender_apply?.[0];
    const lenderApplyId = applicationLenderApply?.lender_apply_id || props?.value?.lender_apply_id;
    const lenderId = applicationLenderApply?.lender_id || props?.value?.lender_id;

    // We should fallback to a safe 0 or max value
    const initialAmount = Number(props?.value?.loan_amount || context?.applicationDetail?.loan_amount || 0);

    const [loanAmount, setLoanAmount] = useState<number>(initialAmount);
    const [data, setData] = useState<any>(null);
    const [selectedOfferIndex, setSelectedOfferIndex] = useState<number | null>(null);
    const [isFetchingOffers, setIsFetchingOffers] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchOffers = async (amount: number) => {
        setIsFetchingOffers(true);
        setError("");
        setSelectedOfferIndex(null);
        try {
            const api = getApiClient();
            const response = await api.post("/alpha/v1/offer/compute", {
                lender_apply_id: lenderApplyId,
                selected_loan_amount: amount,
                rate_of_interest: 0
            });
            if (response.data?.status) {
                setData(response.data.data);
                setLoanAmount(response.data.data.selected_loan_amount);
            } else {
                setError(response.data?.message?.error?.errors || response.data?.message?.error?.[0]?.message || "Failed to fetch offers.");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setIsFetchingOffers(false);
        }
    };

    // Fetch initial offers on mount if we have an amount
    useEffect(() => {
        if (initialAmount > 0 && lenderApplyId) {
            fetchOffers(initialAmount);
        }
    }, [initialAmount, lenderApplyId]);

    const handleSave = async () => {
        if (selectedOfferIndex === null || !data) return;

        setIsSaving(true);
        setError("");

        try {
            const selectedOffer = data.offer_range[selectedOfferIndex];
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const requestData = {
                offerId: '',
                application_id: applicationId,
                lender_id: lenderId,
                offer_type: 'GENERATED_OFFER',
                offer_amount: data.selected_loan_amount,
                tenure: selectedOffer.tenure,
                interest_rate: selectedOffer.roi,
                emi: selectedOffer.emi_amount,
                date: dateStr,
                process_fee: selectedOffer.process_fee,
                charges: selectedOffer.charges?.map((charge: any) => ({
                    charge_name: charge.name,
                    charge_type: charge.type,
                    charge_value: charge.value,
                    charge_amount: charge.amount,
                    tax_name: charge.tax_name,
                    tax_type: charge.type,
                    tax_value: charge.tax_value,
                    tax_amount: charge.tax_amount,
                })) || []
            };

            const api = getApiClient();
            const response = await api.post(`/alpha/v1/application/${applicationId}/lender-offer`, requestData);

            if (response.data?.status) {
                // Successfully saved the offer. Now trigger standard workflow advance.
                if (context?.onSubmit) {
                    await context.onSubmit();
                } else if (props.onNext) {
                    props.onNext();
                }
            } else {
                setError(response.data?.message?.error?.[0]?.message || "Failed to save offer.");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to save offer.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-5 text-white">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                            <i className="ri-hand-coin-fill text-3xl text-white"></i>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black mb-1">Loan Offer Selection</h4>
                            <p className="text-blue-100 font-medium opacity-90">
                                Customize your loan amount and select a comfortable EMI plan.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-8 md:p-10">
                    {/* Amount Customization */}
                    <div className="mb-10">
                        <h6 className="font-bold text-slate-900 mb-6 text-lg">How much do you need?</h6>

                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-slate-500 text-sm font-medium">
                                            Min<br /><span className="text-slate-800 font-bold">{formatCurrency(data?.min_loan_amount || 0)}</span>
                                        </div>
                                        <div className="text-right text-slate-500 text-sm font-medium">
                                            Max<br /><span className="text-slate-800 font-bold">{formatCurrency(data?.max_loan_amount || 500000)}</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={data?.min_loan_amount || 0}
                                        max={data?.max_loan_amount || 500000}
                                        step={5000}
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-48">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-slate-500 font-bold">&#8377;</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                                            className="w-full h-14 pl-10 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-bold text-lg focus:border-blue-600 focus:ring-0 transition-colors"
                                        />
                                    </div>
                                    <Button
                                        className="h-14 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md"
                                        onClick={() => fetchOffers(loanAmount)}
                                        disabled={isFetchingOffers}
                                    >
                                        {isFetchingOffers ? <i className="ri-loader-4-line animate-spin text-xl"></i> : "Calculate"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 mb-8 rounded-2xl bg-red-50 border border-red-100 text-red-600 shadow-sm">
                            <i className="ri-error-warning-fill text-xl mt-0.5"></i>
                            <p className="font-medium text-sm leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* EMI Plans */}
                    {data?.offer_range && data.offer_range.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h6 className="font-bold text-slate-900 text-lg">Pick Your EMI Plan</h6>
                                <div className="text-sm font-medium text-slate-500">
                                    Processing Fee: <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md ml-1">{formatCurrency(data.processing_fee)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.offer_range.map((offer: any, index: number) => {
                                    const isSelected = selectedOfferIndex === index;
                                    const pfPercent = offer?.charges?.[0]?.value;
                                    const taxPercent = offer?.charges?.[0]?.tax_value;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedOfferIndex(index)}
                                            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${isSelected
                                                ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-600/10 scale-[1.02]'
                                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="pt-1">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600' : 'border-slate-300'
                                                    }`}>
                                                    {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full animate-in zoom-in"></div>}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-xl mb-1">{formatCurrency(offer.emi_amount)} <span className="text-sm font-medium text-slate-500">/mo</span></div>
                                                <p className="text-slate-600 font-medium text-sm mb-2">For {offer.tenure} months @ {offer.roi}% p.a.</p>
                                                {pfPercent && taxPercent && (
                                                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                                                        PF: {pfPercent}% + {taxPercent}% GST
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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
                    disabled={isSaving}
                >
                    Back
                </Button>
                <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                    disabled={selectedOfferIndex === null || isSaving || isFetchingOffers || context?.submitting}
                    onClick={handleSave}
                >
                    {isSaving || context?.submitting ? (
                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                    ) : (
                        <>{context?.submitLabel || "Save & Next"}</>
                    )}
                </Button>
            </div>
        </div>
    );
};
