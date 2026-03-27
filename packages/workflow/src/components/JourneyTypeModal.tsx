import { Dialog, DialogContent } from "@craft-apex/ui/components/dialog";
import { Button } from "@craft-apex/ui/components/button";
import { useState, useEffect } from "react";
import {
  Building2,
  Landmark,
  Home,
  CircleDollarSign,
  Car,
  Bus,
  Truck,
  Sparkles,
  Flame,
  FileText,
} from "lucide-react";
import type { Journey, JourneyTypeModalProps, LoanType } from "../types";

/**
 * JourneyTypeModal — A premium modal for selecting loan type and journey type
 * before starting a workflow.
 *
 * Features:
 *  - Both Loan Type and Journey Type shown on the same screen
 *  - Auto-select when only one option exists
 *  - Animated card selection with visual feedback
 *  - Matching the reference design with icon cards
 */

/* ── Icon Mapper ─────────────────────────────────────────────────────────────── */

const getLoanTypeIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("business")) return Building2;
  if (lower.includes("payday")) return CircleDollarSign;
  if (lower.includes("housing") && !lower.includes("non"))
    return Home;
  if (lower.includes("non") && lower.includes("housing"))
    return Landmark;
  if (lower.includes("used") && lower.includes("vehicle")) return Car;
  if (lower.includes("passenger")) return Bus;
  if (lower.includes("commercial")) return Truck;
  return Building2;
};

const getJourneyIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("hot")) return Flame;
  if (lower.includes("enqui") || lower.includes("inquiry")) return FileText;
  return Sparkles;
};

export const JourneyTypeModal = ({
  open,
  onClose,
  data,
  onSelect,
  workflowType,
}: JourneyTypeModalProps) => {
  const [selectedJourneyType, setSelectedJourneyType] =
    useState<Journey | null>(null);
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);

  const isPartnerOnboarding = workflowType === "PARTNER_ONBOARDING";

  if (!data) return null;

  // ── Derived Data ─────────────────────────────────────────────────────────

  const uniqueLoanTypes: LoanType[] = !isPartnerOnboarding
    ? Array.from(
        new Set(
          Object.values(data)
            .flat()
            .filter((j) => j?.loan_type)
            .map((j) => j.loan_type!.code)
        )
      )
        .map((code) => {
          const journey = Object.values(data)
            .flat()
            .find((j) => j?.loan_type?.code === code);
          return journey?.loan_type as LoanType;
        })
        .filter(Boolean)
    : [];

  const getAvailableJourneys = (): Journey[] => {
    if (isPartnerOnboarding) {
      return Object.values(data)
        .flat()
        .filter((j) => !!j);
    }
    if (!selectedLoanType) return [];
    return Object.values(data)
      .flat()
      .filter((j) => j && j.loan_type?.code === selectedLoanType);
  };

  const availableJourneys = getAvailableJourneys();

  // ── Auto-select single loan type ──────────────────────────────────────────

  useEffect(() => {
    if (uniqueLoanTypes.length === 1 && !selectedLoanType) {
      setSelectedLoanType(uniqueLoanTypes[0]!.code);
    }
  }, [uniqueLoanTypes.length]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLoanTypeSelect = (loanTypeCode: string) => {
    setSelectedLoanType(loanTypeCode);
    setSelectedJourneyType(null);
  };

  const handleStartJourney = () => {
    if (selectedJourneyType) {
      onSelect(selectedJourneyType);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl w-full rounded-2xl shadow-2xl border-0 overflow-hidden p-0"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="p-6 pb-0">
          {/* ── Select Loan Type ─────────────────────────────────────── */}
          {!isPartnerOnboarding && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Select Loan Type
              </h2>

              <div className="flex flex-wrap gap-3">
                {uniqueLoanTypes.map(
                  (loanType) =>
                    loanType && (() => {
                      const IconComp = getLoanTypeIcon(loanType.name);
                      const isSelected = selectedLoanType === loanType.code;

                      return (
                        <button
                          key={loanType.code}
                          className={`group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center min-w-[100px] max-w-[110px]
                            ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                            }`}
                          onClick={() => handleLoanTypeSelect(loanType.code)}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white scale-105"
                                  : "bg-blue-600 text-white group-hover:scale-105"
                              }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-xs font-medium leading-tight transition-colors
                              ${
                                isSelected
                                  ? "text-blue-700"
                                  : "text-gray-700 group-hover:text-blue-600"
                              }`}
                          >
                            {loanType.name}
                          </span>
                        </button>
                      );
                    })()
                )}
              </div>
            </div>
          )}

          {/* ── Select Journey Type ────────────────────────────────────── */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Select Journey Type
            </h2>

            {(!isPartnerOnboarding && !selectedLoanType) ? (
              <p className="text-sm text-gray-400 py-4">
                Please select a loan type first
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availableJourneys.map(
                  (journey) =>
                    journey && (() => {
                      const JIcon = getJourneyIcon(journey.name);
                      const isSelected = selectedJourneyType?.id === journey.id;

                      return (
                        <button
                          key={journey.id}
                          className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center min-w-[110px] max-w-[130px]
                            ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100 ring-1 ring-blue-200"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                            }`}
                          onClick={() => setSelectedJourneyType(journey)}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white scale-105"
                                  : "bg-blue-600 text-white group-hover:scale-105"
                              }`}
                          >
                            <JIcon className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-xs font-medium leading-tight capitalize transition-colors
                              ${
                                isSelected
                                  ? "text-blue-700"
                                  : "text-gray-700 group-hover:text-blue-600"
                              }`}
                          >
                            {journey.name}
                          </span>

                          {/* Selected checkmark */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-in zoom-in duration-200">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })()
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            Close
          </Button>
          <Button
            onClick={handleStartJourney}
            disabled={!selectedJourneyType}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Start Lead Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
