import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ModuleLayout } from "@repo/ui/module";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DynamicStagesAndSteps } from "@/pages/workflow/DynamicStagesAndSteps.tsx";
import { useQuery } from "@tanstack/react-query";
import { LeadAPI } from "@repo/shared-state/api";
import { useLeadStore, Lead } from "@repo/shared-state/stores";

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadApi = LeadAPI.getInstance(); // Shared-state API instance

  // Access Lead store state
  const {
    leadataV2,
    loading: storeLoading,
    error: storeError,
    setLeadData,
    setLoading,
    setError,
    clearError
  } = useLeadStore();

  const [lead, setLead] = useState<Lead | null>(null);

  // ✅ Read loan_type and journey_type from query params
  const loanType = searchParams.get("loan_type");
  const journeyType = searchParams.get("journey_type");

  // ✅ Fetch lead from API only if `id` exists
  const {
    data: apiLead,
    isLoading: isLeadLoading,
    isError: isLeadError,
    error: leadError,
  } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) throw new Error("Lead ID is required");
      setLoading(true);
      clearError();
      try {
        const response = await leadApi.fetchLead(id, "V2");
        return response.result;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch lead");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!id,
  });

  // ✅ Handle case when id is missing but loan_type & journey_type are in URL
  useEffect(() => {
    if (!id && loanType && journeyType) {
      setLead({
        application: {
          loan_type_code: loanType,
          type: journeyType,
        },
      });
    }
  }, [id, loanType, journeyType]);

  // ✅ Update lead state when API data arrives
  useEffect(() => {
    if (apiLead) {
      setLead(apiLead);
      // Store in Zustand store for global access
      setLeadData(apiLead, "V2");
    }
  }, [apiLead, setLeadData]);

  // ✅ Use store data if available
  useEffect(() => {
    if (!lead && leadataV2) {
      setLead(leadataV2);
    }
  }, [lead, leadataV2]);

  const handleBack = () => {
    navigate(-1);
  };

  // Combine loading states
  const isLoading = isLeadLoading || storeLoading;
  const hasError = isLeadError || !!storeError;
  const errorMessage = leadError instanceof Error ? leadError.message : storeError;

  if (isLoading) {
    return (
        <ModuleLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading lead details...</p>
            </div>
          </div>
        </ModuleLayout>
    );
  }

  if ((hasError && id) || (!lead && id)) {
    return (
        <ModuleLayout>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            <Card className="p-6">
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">
                  {errorMessage || "Lead not found"}
                </p>
                <Button onClick={handleBack}>Return to Lead List</Button>
              </div>
            </Card>
          </div>
        </ModuleLayout>
    );
  }

  console.log('lead ', lead)

  return (
      <ModuleLayout>
        <div className="bg-card border-b border-border p-2 mb-1 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium text-foreground">
                {lead?.application?.name ?? lead?.application?.contact_person ?? "-"}
              </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Journey Type:</span>
                <span className="ml-2 font-medium text-foreground">
                {lead?.type ?? lead?.application?.type}
              </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Mobile No:</span>
                <span className="ml-2 font-medium text-foreground">
                {lead?.application?.mobile ?? "-"}
              </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Action
            </Button>
          </div>
        </div>

        <DynamicStagesAndSteps
            dataInfo={lead}
            api={leadApi}
            sourceId={lead?.application?.application_id || apiLead?.application?.application_id}
            workflowType={"LEAD_CREATION"}
            navigateUrl={"/lead/list"}
        />
      </ModuleLayout>
  );
}
