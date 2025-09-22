import React from 'react';
import { Step } from '../../stores/workflow';

interface StepsHorizontalStepperProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const StepsHorizontalStepper: React.FC<StepsHorizontalStepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = ''
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-400';
      case 'pending':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getStepNumberStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  const getConnectorStyles = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    return status === 'completed' ? 'bg-green-400' : 'bg-gray-200';
  };

  // Don't render if there's only one step
  if (steps.length <= 1) {
    return null;
  }

  return (
    <div className={`w-full bg-white border-b border-gray-100 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                {/* Step Container */}
                <div
                  className={`
                    flex items-center px-3 py-2 rounded-lg border transition-all duration-200
                    ${getStepStyles(getStepStatus(index))}
                    ${onStepClick ? 'cursor-pointer hover:shadow-sm' : ''}
                  `}
                  onClick={() => onStepClick?.(index)}
                >
                  {/* Step Number/Icon */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-2
                    ${getStepNumberStyles(getStepStatus(index))}
                  `}>
                    {getStepStatus(index) === 'completed' ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Step Name */}
                  <span className="text-sm font-medium whitespace-nowrap">
                    {step.name}
                  </span>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="flex items-center mx-2">
                  <div className={`
                    w-8 h-0.5 transition-all duration-300
                    ${getConnectorStyles(index)}
                  `} />
                  <svg 
                    className={`
                      w-3 h-3 ml-1 transition-all duration-300
                      ${getStepStatus(index) === 'completed' ? 'text-green-400' : 'text-gray-300'}
                    `} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};