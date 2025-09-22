import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DynamicStagesAndSteps } from './workflow/DynamicStagesAndSteps';
import { LeadAPI } from '../api/LeadAPI';
import { useLeadStore } from '../stores/Lead';

function LeadWorkflowPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadApi = new LeadAPI(); // API instance

  // Get URL parameters
  const applicationId = searchParams.get("application_id");
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

  const [lead, setLead] = useState<any>(null);

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

  // Handle case when applicationId is missing but journey_type & loan_type are in URL
  useEffect(() => {
    if (!applicationId && (journeyType || loanType)) {
      setLead({
        application: {
          journey_type: journeyType,
          loan_type: loanType,
        },
      });
    }
  }, [applicationId, journeyType, loanType]);

  // Update lead state when API data arrives
  useEffect(() => {
    if (leadData) {
      setLead(leadData);
      // Store in Zustand store for global access
      setLeadData(leadData, "V2");
    }
  }, [leadData, setLeadData]);

  // Use store data if available
  useEffect(() => {
    if (!lead && leadataV2) {
      setLead(leadataV2);
    }
  }, [lead, leadataV2]);

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
      dataInfo={lead}
      api={leadApi}
      sourceId={lead?.application?.application_id || applicationId}
      workflowType="LEAD_CREATION"
      navigateUrl="/"
    />
  );
}

export default LeadWorkflowPage;