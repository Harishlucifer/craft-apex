import {Dialog, DialogContent} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useState } from "react";

interface Journey {
    id: number;
    code: string;
    name: string;
    workflow_type: string;
    partner_type: string;
    loan_type?: {
        code: string;
        name: string;
    };
}

interface JourneyTypeModalProps {
    open: boolean;
    workflowType?:string;
    onClose: () => void;
    data?: Record<string, Journey[]>;
    onSelect: (journey: Journey) => void;
}

export const JourneyTypeModal = ({ open, onClose, data, onSelect, workflowType }: JourneyTypeModalProps) => {
    const [selectedJourneyType, setSelectedJourneyType] = useState<Journey | null>(null);
    const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);
    const [showJourneySelection, setShowJourneySelection] = useState(workflowType === 'PARTNER_ONBOARDING');

    if (!data) return null;

    // Get unique loan types for non-PARTNER_ONBOARDING workflows
    const uniqueLoanTypes = workflowType !== 'PARTNER_ONBOARDING' 
        ? Array.from(new Set(
            Object.values(data).flat()
                .filter(journey => journey?.loan_type)
                .map(journey => journey.loan_type!.code)
          )).map(code => {
            const journey = Object.values(data).flat().find(j => j?.loan_type?.code === code);
            return journey?.loan_type;
          }).filter(Boolean)
        : [];

    // Get available journeys based on workflow type and selected loan type
    const getAvailableJourneys = () => {
        if (workflowType === 'PARTNER_ONBOARDING') {
            // For PARTNER_ONBOARDING, show all journey types
            return Object.values(data).flat().filter(journey => journey);
        } else {
            // For other workflows, filter by selected loan type
            if (!selectedLoanType) return [];
            return Object.values(data).flat().filter(journey => 
                journey && journey.loan_type?.code === selectedLoanType
            );
        }
    };

    const availableJourneys = getAvailableJourneys();

    const handleLoanTypeSelect = (loanTypeCode: string) => {
        setSelectedLoanType(loanTypeCode);
        setShowJourneySelection(true);
        setSelectedJourneyType(null); // Reset journey selection
    };

    const handleBackToLoanTypes = () => {
        setShowJourneySelection(false);
        setSelectedLoanType(null);
        setSelectedJourneyType(null);
    };

    const handleStartJourney = () => {
        if (selectedJourneyType) {
            onSelect(selectedJourneyType);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="max-w-xl w-full rounded-3xl shadow-2xl transition-transform duration-300 ease-in-out"
                style={{ top: "30%", transform: "translateY(0)" }}
            >
                <div className="p-8">
                    {/* Loan Type Selection (for non-PARTNER_ONBOARDING workflows) */}
                    {workflowType !== 'PARTNER_ONBOARDING' && !showJourneySelection && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Loan Type</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {uniqueLoanTypes.map((loanType) => loanType && (
                                    <div
                                        key={loanType.code}
                                        className="p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg border-gray-200 bg-gray-50 hover:border-gray-300"
                                        onClick={() => handleLoanTypeSelect(loanType.code)}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-4">
                                                <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {loanType.name}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Journey Type Selection */}
                    {showJourneySelection && (
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                {workflowType !== 'PARTNER_ONBOARDING' && (
                                    <Button
                                        variant="outline"
                                        onClick={handleBackToLoanTypes}
                                        className="mr-4 px-4 py-2 rounded-xl"
                                    >
                                        ← Back
                                    </Button>
                                )}
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {workflowType === 'PARTNER_ONBOARDING' ? 'Select Journey Type' : `Select Journey Type for ${selectedLoanType}`}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {availableJourneys.map((journey) => journey && (
                                    <div
                                        key={journey.id}
                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                            selectedJourneyType?.id === journey.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedJourneyType(journey)}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-4">
                                                {journey.name.toLowerCase().includes('hot') ? (
                                                    <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22v-2z"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {journey.name}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-8 py-2 rounded-xl"
                        >
                            Close
                        </Button>
                        {showJourneySelection && (
                            <Button
                                onClick={handleStartJourney}
                                disabled={!selectedJourneyType}
                                className="px-8 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                Start Lead Journey
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};