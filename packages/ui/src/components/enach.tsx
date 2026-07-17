import React, { useState } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";

export const Enach = (props: any) => {
    const { context } = props;
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [selectedAuthMethod, setSelectedAuthMethod] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Sample bank accounts data
    const bankAccounts = [
        {
            id: 1,
            bankName: "HDFC Bank",
            accountNumber: "XXXX XXXX 5678",
            ifsc: "HDFC0001234",
            verified: true,
            accountType: "Salary A/C"
        },
        {
            id: 2,
            bankName: "ICICI Bank",
            accountNumber: "XXXX XXXX 9012",
            ifsc: "ICIC0001234",
            verified: true,
            accountType: "Savings"
        }
    ];

    // Authentication methods
    const authMethods = [
        {
            id: "netbanking",
            name: "Net Banking",
            icon: "ri-global-line",
            description: "Login to your bank account"
        },
        {
            id: "debitcard",
            name: "Debit Card",
            icon: "ri-bank-card-line",
            description: "Verify using your debit card"
        },
        {
            id: "aadhaar",
            name: "Aadhaar eSign",
            icon: "ri-fingerprint-line",
            description: "Sign using Aadhaar OTP"
        }
    ];

    const [loanDetails, setLoanDetails] = useState({
        bankAccount: "HDFC Bank - XXXX5678",
        loanAmount: "₹2,00,000",
        emiAmount: "To be determined after approval",
        frequency: "Monthly",
        tenure: "24 months",
        maxDebitAmount: "₹15,000 (buffer included)"
    });

    const handleBankSelect = (bank: any) => {
        setSelectedBank(bank);
    };

    const handleProceedToEnach = () => {
        if (selectedBank) {
            setLoanDetails(prev => ({
                ...prev,
                bankAccount: `${selectedBank.bankName} - ${selectedBank.accountNumber}`
            }));
        }
        setCurrentStep(2);
    };

    const handleAuthMethodSelect = (method: any) => {
        setSelectedAuthMethod(method);
    };

    const handleSetupAutoDebit = async () => {
        if (context?.onSubmit) {
            await context.onSubmit();
        } else if (props.onNext) {
            props.onNext();
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setSelectedAuthMethod(null);
        setIsAuthorized(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {currentStep === 1 && (
                <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-5 text-white">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                                <i className="ri-bank-fill text-3xl text-white"></i>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black mb-1">Select Disbursement Account</h4>
                                <p className="text-blue-100 font-medium opacity-90">
                                    Choose the account for loan disbursement and EMI auto-debit
                                </p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-8 md:p-10">
                        {/* Info Alert */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100 mb-8 shadow-sm">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                                <i className="ri-information-fill text-2xl"></i>
                            </div>
                            <div>
                                <h6 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-lg">
                                    <i className="ri-shield-check-fill text-blue-600"></i>
                                    Accounts from Account Aggregator
                                </h6>
                                <p className="text-slate-600 text-sm font-medium mb-3">
                                    We've fetched your bank accounts through Account Aggregator. Select the account where you want the loan amount to be disbursed and EMIs to be auto-debited.
                                </p>
                                <ul className="text-slate-600 text-sm font-medium space-y-1.5 list-disc pl-4 marker:text-blue-400">
                                    <li>Loan amount will be disbursed here</li>
                                    <li>Monthly EMIs will be auto-debited via eNACH</li>
                                    <li>Already verified through Account Aggregator &mdash; no penny drop needed!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Bank Accounts List */}
                        <div className="space-y-4 mb-8">
                            {bankAccounts.map((bank) => (
                                <div
                                    key={bank.id}
                                    className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex flex-col sm:flex-row sm:items-center gap-4 ${selectedBank?.id === bank.id
                                        ? 'border-blue-600 bg-blue-50/30 shadow-md shadow-blue-600/10 scale-[1.01]'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                                        }`}
                                    onClick={() => handleBankSelect(bank)}
                                >
                                    {selectedBank?.id === bank.id && (
                                        <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in">
                                            <i className="ri-checkbox-circle-fill text-2xl"></i>
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${selectedBank?.id === bank.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        <i className="ri-bank-fill text-2xl"></i>
                                    </div>
                                    <div className="flex-1">
                                        <h6 className="font-bold text-slate-900 text-lg mb-0.5">{bank.bankName}</h6>
                                        <p className="text-slate-500 text-sm font-medium">Account: <span className="font-mono text-slate-700">{bank.accountNumber}</span></p>
                                        <p className="text-slate-500 text-sm font-medium mb-2">IFSC: <span className="font-mono text-slate-700">{bank.ifsc}</span></p>

                                        {bank.verified && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                                <i className="ri-checkbox-circle-fill"></i>
                                                Verified via Account Aggregator
                                            </span>
                                        )}
                                    </div>
                                    <div className="sm:text-right mt-2 sm:mt-0">
                                        <span className={`px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm border ${bank.accountType === "Salary A/C"
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            }`}>
                                            {bank.accountType}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Manual Account Addition Link */}
                        <div className="text-center mb-8">
                            <p className="text-slate-500 text-sm font-medium mb-1">Don't see your account?</p>
                            <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
                                Add manually <i className="ri-arrow-right-s-line align-middle"></i>
                            </button>
                        </div>


                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-10 text-white">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
                                <i className="ri-bank-card-fill text-3xl text-white"></i>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black mb-1">Setup Auto-Debit (eNACH)</h4>
                                <p className="text-blue-100 font-medium opacity-90">
                                    Authorize automatic EMI deduction from your bank account
                                </p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-8 md:p-10">
                        {/* What is eNACH Info */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 mb-8">
                            <i className="ri-information-fill text-blue-600 text-2xl"></i>
                            <div>
                                <h6 className="font-bold text-blue-900 mb-1 text-base">What is eNACH?</h6>
                                <p className="text-blue-800/80 text-sm font-medium leading-relaxed">
                                    Electronic National Automated Clearing House (eNACH) is a secure method for automatic EMI deduction. You'll never miss a payment!
                                </p>
                            </div>
                        </div>

                        {/* Loan Details Summary */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                                    <span className="text-slate-500 font-medium text-sm">Bank Account</span>
                                    <span className="font-bold text-slate-800">{loanDetails.bankAccount}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 md:pb-3">
                                    <span className="text-slate-500 font-medium text-sm">Loan Amount</span>
                                    <span className="font-black text-blue-600 text-lg">{loanDetails.loanAmount}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                                    <span className="text-slate-500 font-medium text-sm">EMI Amount</span>
                                    <span className="font-bold text-slate-700">{loanDetails.emiAmount}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                                    <span className="text-slate-500 font-medium text-sm">Frequency</span>
                                    <span className="font-bold text-slate-800">{loanDetails.frequency}</span>
                                </div>
                                <div className="flex justify-between items-center border-b md:border-none border-slate-200/60 pb-3 md:pb-0">
                                    <span className="text-slate-500 font-medium text-sm">Tenure</span>
                                    <span className="font-bold text-slate-800">{loanDetails.tenure}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium text-sm">Max Debit Amount</span>
                                    <span className="font-bold text-emerald-600">{loanDetails.maxDebitAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Select Authentication Method */}
                        <div className="mb-8">
                            <h6 className="font-black text-slate-900 text-lg mb-4">Select Authentication Method</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {authMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 text-center ${selectedAuthMethod?.id === method.id
                                            ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/10 scale-[1.02]'
                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                        onClick={() => handleAuthMethodSelect(method)}
                                    >
                                        {selectedAuthMethod?.id === method.id && (
                                            <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in">
                                                <i className="ri-checkbox-circle-fill text-2xl"></i>
                                            </div>
                                        )}
                                        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-colors ${selectedAuthMethod?.id === method.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            <i className={`${method.icon} text-3xl`}></i>
                                        </div>
                                        <h6 className={`font-black text-lg mb-1 transition-colors ${selectedAuthMethod?.id === method.id ? 'text-blue-900' : 'text-slate-800'}`}>{method.name}</h6>
                                        <p className="text-slate-500 text-xs font-medium">{method.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Authorization Checkbox */}
                        <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isAuthorized}
                                        onChange={(e) => setIsAuthorized(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                                    <i className="ri-check-line absolute text-white opacity-0 peer-checked:opacity-100 text-sm font-bold pointer-events-none"></i>
                                </div>
                                <span className="text-sm font-medium text-slate-600 leading-relaxed select-none group-hover:text-slate-800 transition-colors">
                                    I authorize <strong className="text-slate-900">FinGridAI</strong> to debit my bank account for EMI payments as per the schedule. I understand that I'll receive SMS/email notifications before each debit.
                                </span>
                            </label>
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
                        if (currentStep === 2) {
                            handleBack();
                        } else if (props.onBack) {
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
                        if (currentStep === 1) {
                            handleProceedToEnach();
                        } else {
                            handleSetupAutoDebit();
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

export default Enach;
