import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ModuleLayout } from "@repo/ui/module";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DynamicStagesAndSteps } from "@/pages/workflow/DynamicStagesAndSteps.tsx";
import { WorkflowAPI } from "@repo/shared-state/api";

export function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const partnerApi = WorkflowAPI.getInstance(); // Use shared-state Workflow API

  // Local partner state
  const [partner, setPartner] = useState<any | null>(null);

  // ✅ Read loan_type and journey_type from query params
  const partnerType = searchParams.get("partner_type");
  const journeyType = searchParams.get("journey_type");

  // Placeholder query state since partner fetch API is not available in shared-state
  const apiPartner = null as any;
  const isPartnerLoading = false;
  const isPartnerError = false;
  const partnerError = null as any;

  // ✅ Handle case when id is missing but loan_type & journey_type are in URL
  useEffect(() => {
    if (!id && partnerType && journeyType) {
      setPartner({
        application: {
          partner_type: partnerType,
          journey_type: journeyType,
        },
      });
    }
  }, [id, partnerType, journeyType]);

  // ✅ Update partner state when API data arrives
  useEffect(() => {
    if (apiPartner) {
      setPartner(apiPartner);
    }
  }, [apiPartner]);

  // No shared-state partner store yet; manage locally only

  const handleBack = () => {
    navigate(-1);
  };

  // Combine loading states
  const isLoading = isPartnerLoading;
  const hasError = isPartnerError;
  const errorMessage = partnerError instanceof Error ? partnerError.message : null;

  if (isLoading) {
    return (
        <ModuleLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading partner details...</p>
            </div>
          </div>
        </ModuleLayout>
    );
  }

  if ((hasError && id) || (!partner && id)) {
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
                  {errorMessage || "Partner not found"}
                </p>
                <Button onClick={handleBack}>Return to Partner List</Button>
              </div>
            </Card>
          </div>
        </ModuleLayout>
    );
  }

  console.log('partner ', partner)

  return (
      <ModuleLayout>
        <div className="bg-card border-b border-border p-2 mb-1 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium text-foreground">
                {partner?.application?.name ?? partner?.application?.contact_person ?? partner?.applicant_name ?? "-"}
              </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Journey Type:</span>
                <span className="ml-2 font-medium text-foreground">
                {partner?.type ?? partner?.application?.type}
              </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Mobile No:</span>
                <span className="ml-2 font-medium text-foreground">
                {partner?.application?.mobile ?? partner?.mobile ?? "-"}
              </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Action
            </Button>
          </div>
        </div>

        <DynamicStagesAndSteps
            dataInfo={partner}
            api={partnerApi}
            sourceId={id || partner?.application?.application_id}
            workflowType={"PARTNER_ONBOARDING"}
            navigateUrl={"/partner/list"}
        />
      </ModuleLayout>
  );
}
