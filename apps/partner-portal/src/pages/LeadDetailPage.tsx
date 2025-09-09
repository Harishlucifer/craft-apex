import {useNavigate, useParams} from "react-router-dom";
import {ModuleLayout} from "@repo/ui/module";
import {Card} from "@repo/ui/components/ui/card";
import {Button} from "@repo/ui/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {leadsApiService} from "@repo/shared-state/api";
import {DynamicStagesAndSteps} from "@/pages/DynamicStagesAndSteps";
import {useAuthStore} from "@repo/shared-state/stores";
import {toast} from "sonner";
import {useMutation, useQuery} from "@tanstack/react-query";

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_ENDPOINT;
  const user = useAuthStore((state) => state.user);

  // Query for fetching lead details
  const {
    data: lead,
    isLoading: isLeadLoading,
    isError: isLeadError,
    error: leadError,
  } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) throw new Error("Lead ID is required");
      const response = await leadsApiService.fetchLead(id,"V2");
      return response.result;
    },
    enabled: !!id, // only run if id is present
  });

  // Mutation for saving lead
  const saveLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${apiUrl}/alpha/v2/application/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(data?.data),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to save lead");
      }

      await response.json();
      return true; // return true only API success
    },
    onSuccess: () => {
      toast.success("Lead saved successfully ✅");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save lead ❌");
    },
  });

  const handleBack = () => {
    navigate(-1);
  };

  if (isLeadLoading) {
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

  if (isLeadError || !lead) {
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
                  {leadError instanceof Error
                      ? leadError.message
                      : "Lead not found"}
                </p>
                <Button onClick={handleBack}>Return to Lead List</Button>
              </div>
            </Card>
          </div>
        </ModuleLayout>
    );
  }

  return (
      <ModuleLayout>
        <div className="bg-card border-b border-border p-2 mb-1 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium text-foreground">
                {lead?.application?.applicant_name}
              </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Journey Type:</span>
                <span className="ml-2 font-medium text-foreground">
                {lead?.application?.type}
              </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Mobile No:</span>
                <span className="ml-2 font-medium text-foreground">
                {lead.application?.mobile}
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
            onComplete={(data: any) => saveLeadMutation.mutateAsync(data)}
            workflowType={"LEAD_CREATION"}
        />

        {saveLeadMutation.isPending && (
            <p className="text-muted-foreground mt-2">Saving lead...</p>
        )}
      </ModuleLayout>
  );
}
