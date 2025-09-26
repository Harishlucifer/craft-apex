import { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DynamicStagesAndSteps } from './workflow/DynamicStagesAndSteps';
import { WorkflowAPI, LeadAPI } from '@repo/shared-state/api';
import { useLeadStore } from '@repo/shared-state/stores';

function LeadWorkflowPage() {
  const [searchParams] = useSearchParams();
  const leadApi = LeadAPI.getInstance(); // API instance for lead operations
  const workflowApi = WorkflowAPI.getInstance(); // API instance for workflow operations



  // Get URL parameters
 const {id :applicationId}=useParams();
  const journeyType = searchParams.get("journey_type");
  const loanType = searchParams.get("loan_type");

  // Lead store state
  const {
    loading: storeLoading,
    error: storeError,
    setLeadData,
    setLoading,
    setError,
    clearError,
    leadataV2
  } = useLeadStore();

  // Fetch lead data if application_id exists
  const {
    data: leadData,
    isLoading: isLeadLoading,
    isError: isLeadError,
    error: leadError,
  } = useQuery({
    queryKey: ["lead", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("Application ID is required");
      setLoading(true);
      clearError();
      try {
        const response = await leadApi.fetchLead(applicationId, "V2");
        return response.result;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch lead");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!applicationId,
  });
 console.log("leadData",leadataV2);
  // Handle case when applicationId is missing but journey_type & loan_type are in URL
  useEffect(() => {
    if (!applicationId && (journeyType || loanType)) {
      setLeadData({
        application: {
          type: journeyType,
          loan_type_code: loanType,
        },
      },"V2");
    }
    if(leadData){
      setLeadData(leadData,"V2");
    }
  }, [applicationId, journeyType, loanType,leadData]);


  // Show loading state
  if (isLeadLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isLeadError || storeError) {
    const errorMessage = leadError instanceof Error ? leadError.message : 
                        storeError || "An error occurred";
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DynamicStagesAndSteps
      dataInfo={leadataV2}
      api={leadApi}
      sourceId={leadataV2?.application?.application_id || applicationId}
      workflowType="LEAD_CREATION"
      navigateUrl="/"
    />
  );
}

export default LeadWorkflowPage;