import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

export interface StepperStep {
  id: string | number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  activeStepId: string | number;
  completedStepIds?: (string | number)[];
  orientation?: "horizontal" | "vertical";
  onStepClick?: (stepId: string | number) => void;
  className?: string;
  theme?: "indigo" | "emerald";
  renderContent?: (stepId: string | number) => React.ReactNode;
}

export function Stepper({
  steps,
  activeStepId,
  completedStepIds = [],
  orientation = "horizontal",
  onStepClick,
  className,
  theme = "indigo",
  renderContent,
}: StepperProps) {
  const activeIndex = steps.findIndex((s) => String(s.id) === String(activeStepId));

  // Helper to determine status of step
  const getStepStatus = (stepId: string | number, index: number) => {
    if (String(stepId) === String(activeStepId)) return "active";
    if (completedStepIds.includes(stepId) || index < activeIndex) return "completed";
    return "pending";
  };

  const getThemeColor = () => {
    return theme === "indigo" ? "#1E2A6B" : "#10b981";
  };

  // Inline styling calculations to guarantee rendering even if Tailwind classes are not hot-reloaded
  const getCircleStyles = (status: "active" | "completed" | "pending") => {
    const primaryColor = getThemeColor();

    if (status === "active") {
      return {
        backgroundColor: "#ffffff",
        borderColor: primaryColor,
        color: primaryColor,
        boxShadow: theme === "indigo" ? "0 0 0 3px rgba(30, 42, 107, 0.15)" : "0 0 0 3px rgba(16, 185, 129, 0.15)",
        transform: "scale(1)",
      };
    }
    if (status === "completed") {
      return {
        backgroundColor: "#10b981", // Green check circle
        borderColor: "#10b981",
        color: "#ffffff",
      };
    }
    return {
      backgroundColor: "#f8fafc",
      borderColor: "#e2e8f0",
      color: "#94a3b8",
    };
  };

  const activeTextColor = "text-slate-900 font-bold";
  const completedTextColor = "text-slate-600 font-semibold";

  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col gap-0 w-full", className)}>
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id, idx);
          const isLast = idx === steps.length - 1;

          return (
            <div key={String(step.id)} className="relative flex gap-4 items-start pb-6 last:pb-0 group">
              {/* Connector line on left (rendered with inline styles for absolute position and sizing) */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "28px",
                    bottom: 0,
                    width: "2px",
                    backgroundColor: status === "completed" ? "#10b981" : "#cbd5e1",
                    transition: "background-color 300ms",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Circle indicator */}
              <button
                type="button"
                disabled={!onStepClick}
                onClick={() => onStepClick?.(step.id)}
                style={getCircleStyles(status)}
                className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 font-semibold text-xs focus:outline-none"
              >
                {status === "completed" ? (
                  <Check className="h-3.5 w-3.5 stroke-[3] text-white" />
                ) : (
                  idx + 1
                )}
              </button>

              {/* Text content */}
              <div className="flex flex-col gap-0.5 pt-0.5 flex-1 w-full min-w-0">
                <span
                  className={cn(
                    "text-xs sm:text-sm transition-colors duration-200",
                    status === "active"
                      ? activeTextColor
                      : status === "completed"
                        ? completedTextColor
                        : "text-slate-400 group-hover:text-slate-600 font-medium"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs transition-colors duration-200",
                      status === "active" ? "text-slate-500 font-medium" : "text-slate-400"
                    )}
                  >
                    {step.description}
                  </span>
                )}
                {/* Render active step content if provided */}
                {renderContent && renderContent(step.id)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal version matching inline steps list with stretch connecting lines
  return (
    <div className={cn("py-2 w-full", className)}>
      <div className="flex items-center w-full justify-between gap-4">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id, idx);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={String(step.id)}>
              {/* Step indicator: Circle + Label */}
              <button
                type="button"
                disabled={!onStepClick}
                onClick={() => onStepClick?.(step.id)}
                className="flex items-center gap-3 focus:outline-none group shrink-0"
              >
                <div
                  style={getCircleStyles(status)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 font-semibold text-xs"
                >
                  {status === "completed" ? (
                    <Check className="h-3 w-3 stroke-[3] text-white" />
                  ) : (
                    idx + 1
                  )}
                </div>

                <div className="flex flex-col items-start text-left">
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors duration-200",
                      status === "active"
                        ? activeTextColor
                        : status === "completed"
                          ? completedTextColor
                          : "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    backgroundColor: status === "completed" ? "#10b981" : "#cbd5e1",
                    transition: "background-color 300ms",
                  }}
                  className="mx-2"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
