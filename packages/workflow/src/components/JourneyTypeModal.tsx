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
        className="w-[90vw] max-w-[520px] rounded-2xl shadow-2xl border-0 overflow-hidden p-0"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div style={{ padding: "24px 24px 16px" }}>
          {/* ── Select Loan Type ─────────────────────────────────────── */}
          {!isPartnerOnboarding && (
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Select Loan Type
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))",
                  gap: "10px",
                }}
              >
                {uniqueLoanTypes.map(
                  (loanType) =>
                    loanType && (() => {
                      const IconComp = getLoanTypeIcon(loanType.name);
                      const isSelected = selectedLoanType === loanType.code;

                      return (
                        <button
                          key={loanType.code}
                          onClick={() => handleLoanTypeSelect(loanType.code)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "12px 8px",
                            borderRadius: "12px",
                            border: isSelected
                              ? "2px solid #3b82f6"
                              : "2px solid #e5e7eb",
                            background: isSelected ? "#eff6ff" : "#fff",
                            boxShadow: isSelected
                              ? "0 2px 8px rgba(59,130,246,0.15)"
                              : "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: isSelected
                                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                                : "linear-gradient(135deg, #3b82f6, #6366f1)",
                              color: "#fff",
                              transition: "all 0.2s ease",
                              transform: isSelected ? "scale(1.05)" : "scale(1)",
                            }}
                          >
                            <IconComp style={{ width: "18px", height: "18px" }} />
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: isSelected ? 600 : 500,
                              lineHeight: "1.3",
                              color: isSelected ? "#1d4ed8" : "#374151",
                              transition: "color 0.2s ease",
                            }}
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
          <div>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "12px",
              }}
            >
              Select Journey Type
            </h2>

            {(!isPartnerOnboarding && !selectedLoanType) ? (
              <p
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  padding: "12px 0",
                }}
              >
                Please select a loan type first
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                }}
              >
                {availableJourneys.map(
                  (journey) =>
                    journey && (() => {
                      const JIcon = getJourneyIcon(journey.name);
                      const isSelected = selectedJourneyType?.id === journey.id;

                      return (
                        <button
                          key={journey.id}
                          onClick={() => setSelectedJourneyType(journey)}
                          style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "14px 10px",
                            borderRadius: "12px",
                            border: isSelected
                              ? "2px solid #3b82f6"
                              : "2px solid #e5e7eb",
                            background: isSelected ? "#eff6ff" : "#fff",
                            boxShadow: isSelected
                              ? "0 2px 8px rgba(59,130,246,0.15)"
                              : "none",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: isSelected
                                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                                : "linear-gradient(135deg, #3b82f6, #6366f1)",
                              color: "#fff",
                              transition: "all 0.2s ease",
                              transform: isSelected ? "scale(1.05)" : "scale(1)",
                            }}
                          >
                            <JIcon style={{ width: "18px", height: "18px" }} />
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: isSelected ? 600 : 500,
                              lineHeight: "1.3",
                              color: isSelected ? "#1d4ed8" : "#374151",
                              textTransform: "capitalize",
                              transition: "color 0.2s ease",
                            }}
                          >
                            {journey.name}
                          </span>

                          {/* Selected checkmark */}
                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "#3b82f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                animation: "dialogContentIn 0.2s ease",
                              }}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            padding: "14px 24px",
            borderTop: "1px solid #f3f4f6",
            background: "rgba(249, 250, 251, 0.5)",
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            style={{ height: "36px", fontSize: "13px", fontWeight: 600, padding: "0 16px" }}
          >
            Close
          </Button>
          <Button
            onClick={handleStartJourney}
            disabled={!selectedJourneyType}
            className="rounded-lg text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              height: "36px",
              fontSize: "13px",
              fontWeight: 600,
              padding: "0 16px",
              background: selectedJourneyType
                ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                : "#94a3b8",
              border: "none",
            }}
          >
            Start Lead Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
