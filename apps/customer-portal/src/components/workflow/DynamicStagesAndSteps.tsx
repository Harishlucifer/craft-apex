import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import WorkflowStepComponentLoader from "../WorkflowStepComponentLoader";
import { WorkflowAPI, utilityAPI } from "@repo/shared-state/api";
import { useWorkflowStore, useLeadStore, useAuthStore } from "@repo/shared-state/stores";
import { JourneyTypeModal } from "./JourneyTypeModal";
import { WorkflowStagesNavigation } from "./WorkflowStagesNavigation";
import { StepsHorizontalStepper } from "./StepsHorizontalStepper";

// Add Journey type definition
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
  loan_type_id?: string;
}

// Add JourneyTypesResponse type definition
type JourneyTypesResponse = Record<string, Journey[]>;

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

// Helper function to handle autoLogin token processing
const handleAutoLoginToken = async (
  originalUrl: string,
  user: any,
  loginWithLink: (token: string, platform?: any) => Promise<void>,
  platform: any
) => {
  // Check if conditions are met for autoLogin processing
  if (!originalUrl || (user?.id && user?.user_type !== 'GUEST')) {
    if (!originalUrl) {
      console.log('No autoLogin token found in original URL');
    } else {
      console.log('Login with link skipped: User is already authenticated (ID exists and user type is not GUEST)');
    }
    return;
  }

  try {
    // Extract autoLogin token from query parameters
    const url = new URL(originalUrl);
    const autoLoginToken = url.searchParams.get('autoLogin');
    
    if (autoLoginToken) {
      console.log('AutoLogin token found:', autoLoginToken);
      
      // Call login-with-link API using the auth store
      await loginWithLink(autoLoginToken, platform);
      console.log('User authenticated successfully with autoLogin token');
    } else {
      console.log('No autoLogin token found in original URL');
    }
  } catch (error) {
    console.error('Error processing autoLogin token:', error);
  }
};

export const DynamicStagesAndSteps: React.FC<DynamicStagesAndStepsProps> = ({
  api,
  className,
  dataInfo,
  workflowType = "LEAD_CREATION",
  navigateUrl
}) => {
  const { id : sourceId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

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
    workflow,
    goToStage,
    goToPreviousStep,
  } = useWorkflowStore();

  // Lead store state
  const {
    loading: storeLoading,
    error: storeError,
    setLeadData,
    clearError
  } = useLeadStore();

  // Auth store state
  const {
    user,
    loginWithLink,
    platform
  } = useAuthStore();

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

     // 3. Fetch journey types if nothing provided
    const journeyTypesQuery = useQuery<JourneyTypesResponse>({
        queryKey: ["journeyTypes", workflowType],
        queryFn: async (): Promise<JourneyTypesResponse> => {
            const result = await api.fetchJourneyTypes(workflowType ?? "");
            return result as JourneyTypesResponse;
        },
        enabled: !id && !(journeyType || loanType) && !!workflowType,
        retry: 1,
    });

    // Helper function to handle journey selection
    const handleJourneySelection = (journey: Journey) => {
        const params = new URLSearchParams();
        params.set("journey_type", journey.code);
    
        const partnerType = searchParams.get("partner_type");
        if (partnerType) {
            params.set("partner_type", partnerType);
        }
    
        if (journey.loan_type_id) {
            params.set("loan_type", journey.loan_type!.code);
        }

        navigate(`?${params.toString()}`);
    };

    useEffect(() => {
        if (journeyTypesQuery.data && !id) {
            // Check if there's only one journey type across all categories
            const journeyData = journeyTypesQuery.data;
            const allJourneys = Object.values(journeyData).flat();
            console.log("all journey", journeyTypesQuery.data);
            console.log("allJourneys length", allJourneys.length);
            
            if (allJourneys.length === 1) {
                // Automatically select the single journey type
                console.log("Auto-selecting single journey:", allJourneys[0]);
                handleJourneySelection(allJourneys[0] as Journey);
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
      console.log("createUpdate data", data);
      toast.success("Data saved successfully", { position: "top-right" });
      if (data?.result) {
        setLeadData(data.result, "V2");
      }
    },
    onError: () => toast.error("Failed to save data", { position: "top-right" }),
  });

  // Update lead data when dataInfo changes
  useEffect(() => {
    if (dataInfo) {
      setLeadData(dataInfo, "V2");
    }
  }, [dataInfo, setLeadData]);

  // Sync local currentStep state with workflow store's currentStepIndex
  // This ensures data consistency when navigation happens through workflow store methods
  useEffect(() => {
    setCurrentStep(currentStepIndex);
  }, [currentStepIndex]);

  // Enhanced step navigation with API integration
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, (workflow?.stages?.[currentStageIndex]?.steps?.length ?? 0) - 1 || 0));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Handle step submission with API integration - following partner portal pattern
  const handleStepSubmit = async (data: any) => {
    if (currentStepData) {
      try {
        if (data?.isValidForm && data?.data != null) {
          // Call createUpdate from API class
          const createUpdateResponse = await createUpdateMutation.mutateAsync(data.data);
          
          // Extract short URL identifier from redirect_url (part after 'sh/')
          const shortUrlIdentifier = createUpdateResponse.redirect_url?.split('/sh/')[1];
          if (shortUrlIdentifier) {
            // Process shorter URL using utility API
            const shorterUrlResponse = await utilityAPI.processShortUrl(shortUrlIdentifier);
            console.log('Shorter URL Response:', shorterUrlResponse);
            console.log('Original URL:', shorterUrlResponse.original_url);
            
            if(shorterUrlResponse.original_url && !id && user?.user_type === 'GUEST') {
              // Use the helper function to handle autoLogin token processing
              await handleAutoLoginToken(
                shorterUrlResponse.original_url,
                user,
                loginWithLink,
                platform
              );
            }
          } else {
            console.log('No short URL identifier found in redirect_url:', createUpdateResponse.redirect_url);
          }
          
          // Get source_id from createUpdate response if sourceId is not present
          const workflowId = sourceId || id || createUpdateResponse?.source_id;
          
          if (!workflowId) {
            throw new Error("No valid ID found for workflow execution");
          }

        
          
          // Update URL with ID if not present and we got source_id from create operation
          if (!id && createUpdateResponse?.source_id) {
            const currentPath = window.location.pathname;
            const newPath = currentPath.includes('/create') 
              ? currentPath.replace(/\/create$/, `/create/${createUpdateResponse.source_id}`)
              : `${currentPath}/${createUpdateResponse.source_id}`;
            navigate(newPath + window.location.search, { replace: true });
          }
          
          // Execute workflow step after saving
          await executeWorkflowMutation.mutateAsync({step_id: currentStepData.id, id: workflowId});
        } else if (data?.isValidForm && data?.data == null) {
          await executeWorkflowMutation.mutateAsync({step_id: currentStepData.id, id: sourceId ?? id ?? ""});
        } else {
          toast.error("Please fill all the required fields");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save step data ❌");
      }
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
            const targetStage = workflow.stages[stageIndex];
            
            // Allow navigation if:
            // 1. It's a completed stage or current stage (existing logic)
            // 2. OR the stage task_status is "1" or "2" (new requirement)
            if (stageIndex <= currentStageIndex || 
                (targetStage && (targetStage.task_status === "1" || targetStage.task_status === "2"))) {
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
                data={journeyTypesQuery.data}
                onSelect={(journey: Journey) => {
                    setShowJourneyModal(false);
                    handleJourneySelection(journey);
                }}
            />

        );
    }

    const handleBackStep = () => {
        try {
            // Check if we're at the very beginning (first step of first stage)
            if (currentStageIndex === 0 && currentStepIndex === 0) {
                toast.info("You're already at the first step of the workflow");
                return;
            }

            // Use the workflow store's goToPreviousStep method for proper navigation
            // The useEffect hook will automatically sync the local state
            goToPreviousStep();

            // Provide user feedback
            toast.success("Moved to previous step");

            // Clear any existing errors when navigating back
            clearError();

        } catch (error) {
            console.error("Error navigating to previous step:", error);
            toast.error("Failed to navigate to previous step. Please try again.");
        }
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
        handleBack={handleBackStep}
        handleSubmitSuccess={handleStepSubmit}
        data={dataInfo}
        isReturningCustomer={isReturningCustomer}
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