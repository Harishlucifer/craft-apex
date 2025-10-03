import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const stepLabels = ['Verify', 'Personal', 'Income', 'Eligibility', 'Documents', 'Apply'];

  return (
    <div className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            {stepLabels.map((label, index) => (
              <span 
                key={label}
                className={`${index <= currentStep ? 'text-green-600 font-medium' : 'text-gray-400'}`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};