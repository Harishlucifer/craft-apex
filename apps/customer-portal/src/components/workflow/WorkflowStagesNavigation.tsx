import React from 'react';
import { Stage } from '@repo/shared-state/stores';

interface WorkflowStagesNavigationProps {
  stages: Stage[];
  currentStageIndex: number;
  onStageClick?: (stageIndex: number) => void;
  className?: string;
}

export const WorkflowStagesNavigation: React.FC<WorkflowStagesNavigationProps> = ({
  stages,
  currentStageIndex,
  onStageClick,
  className = ''
}) => {
  const progress = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <div className={`bg-white shadow-sm py-4 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            {stages.map((stage, index) => (
              <span 
                key={stage.id}
                className={`${
                  index <= currentStageIndex 
                    ? 'text-green-600 font-medium' 
                    : 'text-gray-400'
                } ${onStageClick ? 'cursor-pointer hover:text-green-700' : ''}`}
                onClick={() => onStageClick?.(index)}
              >
                {stage.name}
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