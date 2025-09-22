import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import WorkflowStepComponentLoader, { Step } from "../WorkflowStepComponentLoader";
import { WorkflowAPI } from "../../api/WorkflowAPI";
import { useWorkflowStore } from "../../stores/workflow";
import { useLeadStore } from "../../stores/Lead";
import { JourneyTypeModal } from "./JourneyTypeModal";
import { WorkflowStagesNavigation } from "./WorkflowStagesNavigation";
import { StepsHorizontalStepper } from "./StepsHorizontalStepper";

export interface ApplicationData {
  fullName: string;
  mobileNumber: string;
  employmentType: string;
  panNumber: string;
  dob: string;
  residencePincode: string;
  monthlyIncome: string;
  workPincode: string;
  existingEmi: string;
  residenceAddress?: string;
  officeAddress?: string;
  aadhaarNumber?: string;
  selectedLender?: any;
  bookingNumber?: string;
  bookingAmount?: string;
  applicationId?: string;
}

export interface DynamicStagesAndStepsProps {
  api: WorkflowAPI; // API instance to handle create/update
  className?: string;
  dataInfo?: any;
  sourceId?: string;
  workflowType?: string;
  navigateUrl?: string;
}

export interface StepComponentRef {
  submitStepExternally: () => Promise<any>;
}

const WORKFLOW_STEPS: Step[] = [
  {
    id: '1',
    name: 'Verify',
    description: 'OTP verification step',
    ui_component: 'OTP_VERIFICATION',
    sequence: 1
  },
  {
    id: '2',
    name: 'Personal',
    description: 'Personal details collection',
    ui_component: 'PERSONAL_DETAILS',
    sequence: 2
  },
  {
    id: '3',
    name: 'Income',
    description: 'Income details collection',
    ui_component: 'INCOME_DETAILS',
    sequence: 3
  },
  {
    id: '4',
    name: 'Eligibility',
    description: 'Eligibility results display',
    ui_component: 'ELIGIBILITY_RESULTS',
    sequence: 4
  },
  {
    id: '5',
    name: 'Documents',
    description: 'Document verification step',
    ui_component: 'DOCUMENT_VERIFICATION',
    sequence: 5
  },
  {
    id: '6',
    name: 'Lenders',
    description: 'Lender selection step',
    ui_component: 'LENDER_SELECTION',
    sequence: 6
  },
  {
    id: '7',
    name: 'Status',
    description: 'Application status display',
    ui_component: 'APPLICATION_STATUS',
    sequence: 7
  }
];

export const DynamicStagesAndSteps: React.FC<DynamicStagesAndStepsProps> = ({
  api,
  className,
  sourceId,
  dataInfo,
  workflowType = "LEAD_CREATION",
  navigateUrl
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    fullName: '',
    mobileNumber: '',
    employmentType: '',
    panNumber: '',
    dob: '',
    residencePincode: '',
    monthlyIncome: '',
    workPincode: '',
    existingEmi: ''
  });

  const navigate = useNavigate();
  const formRef = useRef<any>(null);
  const [searchParams] = useSearchParams();
  const {id}=useParams()

  // Get URL parameters
  const journeyType = searchParams.get("journey_type");
  const loanType = searchParams.get("loan_type");

  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Workflow store state
  const {
    currentStageIndex,
    currentStepIndex,
    currentStepData,
    currentStageData,
    workflow,
    goToStage,
    goToNextStep,
    goToPreviousStep,
  } = useWorkflowStore();

  // Lead store state
  const {
    loading: storeLoading,
    error: storeError,
    setLeadData,
    setLoading,
    setError,
    clearError
  } = useLeadStore();

  // Fetch workflow based on sourceId or journey/loan type
  const workflowQuery = useQuery({
    queryKey: ["workflow", sourceId, journeyType, loanType],
    queryFn: () => {
      if (sourceId) {
        return api.fetchWorkflow({
          source_id: sourceId,
          workflow_type: workflowType
        });
      } else if (journeyType || loanType) {
        return api.fetchWorkflow({
          workflow_type: workflowType,
          data: {
            journey_type: journeyType || "",
            loan_type: loanType || ""
          }
        });
      }
      throw new Error("No workflow parameters provided");
    },
    enabled: !!(sourceId || journeyType || loanType),
    retry: 1,
  });

  console.log("currentStepData", currentStepData);
    console.log("currentStageData", currentStageData);
     // 3. Fetch journey types if nothing provided
    const journeyTypesQuery = useQuery({
        queryKey: ["journeyTypes", workflowType],
        queryFn: () => api.fetchJourneyTypes(workflowType ?? ""),
        enabled: !id && !(journeyType || loanType) && !!workflowType,
        retry: 1,
    });

    // Helper function to handle journey selection
    const handleJourneySelection = (journey: any) => {
        const params = new URLSearchParams();
        params.set("journey_type", journey.code);
    
        const partnerType = searchParams.get("partner_type");
        if (partnerType) {
            params.set("partner_type", partnerType);
        }
    
        if (journey.loan_type_id) {
            params.set("loan_type", journey.loan_type.code);
        }

        navigate(`?${params.toString()}`);
    };

    useEffect(() => {
        if (journeyTypesQuery.data && !id) {
            // Check if there's only one journey type across all categories
            const journeyData = journeyTypesQuery.data.data || journeyTypesQuery.data;
            const allJourneys = Object.values(journeyData).flat();
            console.log("all journey", journeyTypesQuery.data);
            console.log("allJourneys length", allJourneys.length);
            
            if (allJourneys.length === 1) {
                // Automatically select the single journey type
                console.log("Auto-selecting single journey:", allJourneys[0]);
                handleJourneySelection(allJourneys[0]);
            } else {
                // Show modal for multiple options
                console.log("Multiple journeys found, showing modal");
                setShowJourneyModal(true);
            }
        }
    }, [journeyTypesQuery.data]);

  // Execute workflow step mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: (variables: { step_id: string; id: string; payload?: any }) =>
      api.executeWorkflow(variables.step_id, sourceId || variables.id, workflowType),
    onSuccess: () => {
      toast.success("Step executed successfully✅", { position: "top-right", duration: 1000 });
      
      // Check if we're at the last step for completion handling
      if (workflow?.stages) {
        const isLastStage = currentStageIndex === workflow.stages.length - 1;
        const currentStage = workflow.stages[currentStageIndex];
        const isLastStep = currentStage && currentStepIndex === currentStage.steps.length - 1;
        
        if (isLastStage && isLastStep) {
          toast.success("Application completed successfully! 🎉", {
            position: "top-center",
            duration: 3000,
            style: {
              background: "#10b981",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold"
            }
          });
        }
      }
    },
    onError: () => toast.error("Step execution failed", { position: "top-right" }),
  });

  // Create/Update lead mutation
  const createUpdateMutation = useMutation({
    mutationFn: (payload: any) => api.createUpdate(payload),
    onSuccess: (data) => {
      toast.success("Data saved successfully", { position: "top-right" });
      if (data?.result) {
        setLeadData(data.result, "V2");
        // Update application data with response
        if (data.result.application) {
          setApplicationData(prev => ({
            ...prev,
            applicationId: data.result.application.application_id,
            ...data.result.application
          }));
        }
      }
    },
    onError: () => toast.error("Failed to save data", { position: "top-right" }),
  });

  // Update application data when dataInfo changes
  useEffect(() => {
    if (dataInfo) {
      setLeadData(dataInfo, "V2");
      // Update application data with lead data
      if (dataInfo.application) {
        setApplicationData(prev => ({
          ...prev,
          applicationId: dataInfo.application.application_id,
          fullName: dataInfo.application.name || prev.fullName,
          mobileNumber: dataInfo.application.mobile || prev.mobileNumber,
          panNumber: dataInfo.application.pan_number || prev.panNumber,
          // Map other fields as needed
        }));
      }
    }
  }, [dataInfo, setLeadData]);

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  // Enhanced step navigation with API integration
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, (workflow?.stages?.[currentStageIndex]?.steps?.length ?? 0) - 1 || 0));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Handle step submission with API integration
  const handleStepSubmit = async (stepData: any) => {
    try {
      // If we have workflow data, use the API to execute the step
      if (currentStepData && sourceId) {
        await executeWorkflowMutation.mutateAsync({
          step_id: currentStepData.id,
          id: sourceId,
          payload: stepData
        });
      } else {
        // For new applications, create/update the lead
        const payload = {
          ...applicationData,
          ...stepData,
          journey_type: journeyType,
          loan_type: loanType
        };
        await createUpdateMutation.mutateAsync(payload);
      }
      
      // Move to next step on success
      nextStep();
    } catch (error) {
      console.error('Step submission failed:', error);
    }
  };

  // Trigger external form submission
  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.submitStepExternally();
    } else if (currentStepData && sourceId) {
      executeWorkflowMutation.mutateAsync({
        step_id: currentStepData.id,
        id: sourceId
      });
    }
  };

  // Render workflow navigation system
  const renderWorkflowNavigation = () => {
    // Only show navigation if we have workflow data with stages
    if (!workflow?.stages || workflow.stages.length === 0) {
      return null;
    }

    const currentStage = workflow.stages[currentStageIndex];
    const hasMultipleSteps = currentStage?.steps && currentStage.steps.length > 1;

    return (
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        {/* Stages Navigation Bar */}
        <WorkflowStagesNavigation
          stages={workflow.stages}
          currentStageIndex={currentStageIndex}
          onStageClick={(stageIndex) => {
            // Only allow navigation to completed stages or current stage
            if (stageIndex <= currentStageIndex) {
              goToStage(stageIndex);
            }
          }}
        />
        
        {/* Steps Horizontal Stepper - only show if current stage has multiple steps */}
        {hasMultipleSteps && (
          <StepsHorizontalStepper
            steps={currentStage.steps}
            currentStepIndex={currentStepIndex}
            onStepClick={(stepIndex) => {
              // Only allow navigation within current stage to completed steps or current step
              if (stepIndex <= currentStepIndex) {
                // Use workflow store to navigate to specific step
                const { setCurrentStepIndex } = useWorkflowStore.getState();
                setCurrentStepIndex(stepIndex);
              }
            }}
          />
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    // Use workflow data if available, otherwise fall back to static steps
    const step = currentStepData;
    if (!step) return null;

    // Special handling for ApplicationStatus step
    const handleBack = step.ui_component === 'APPLICATION_STATUS' 
      ? () => setCurrentStep(0) 
      : prevStep;

    // Determine if we're loading
    const isLoading = workflowQuery.isLoading || storeLoading;

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

     // show modal if no workflowData and journey types available
    if (showJourneyModal && journeyTypesQuery.data) {
        return (
            <JourneyTypeModal
                open={showJourneyModal}
                workflowType={workflowType}
                onClose={() => setShowJourneyModal(false)}
                data={journeyTypesQuery.data?.data}
                onSelect={(journey: any) => {
                    setShowJourneyModal(false);
                    handleJourneySelection(journey);
                }}
            />

        );
    }

    // Show error state
    if (workflowQuery.isError || storeError) {
      const errorMessage = workflowQuery.error instanceof Error ? workflowQuery.error.message : 
                          storeError || "An error occurred";
      
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <WorkflowStepComponentLoader
        ref={formRef}
        step={step}
        handleSubmitSuccess={handleStepSubmit}
        data={applicationData}
        isReturningCustomer={isReturningCustomer}
        applicationData={applicationData}
        updateApplicationData={updateApplicationData}
        onNext={nextStep}
        onBack={handleBack}
        onVerified={nextStep}
        onApplyNew={() => {
          setIsReturningCustomer(false);
          nextStep();
        }}
        onContinueApplication={() => {
          setIsReturningCustomer(true);
          nextStep();
        }}
      />
    );
  };


  return (
    <div className={`min-h-screen bg-gray-50 ${className || ''}`}>
      {renderWorkflowNavigation()}
      <div className="container mx-auto px-4 py-4">
        {renderCurrentStep()}
      </div>
    </div>
  );
};