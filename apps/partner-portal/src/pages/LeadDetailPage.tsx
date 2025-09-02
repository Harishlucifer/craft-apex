import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ModuleLayout } from "@repo/ui/module";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { leadsApiService, LeadApplication } from "@repo/shared-state/api";
import { DynamicStagesAndSteps } from "@/pages/DynamicStagesAndSteps";


export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) {
      setError('Lead ID is required');
      setLoading(false);
      return;
    }
    const fetchLead = async () => {
      try {
        setLoading(true);
        setError(null);
        // Note: This assumes the API has a method to fetch a single lead
        // You may need to implement this in the leadsApiService
        const response = await leadsApiService.fetchLead(id);
        setLead(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lead details');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  //TODO: Move this to a common place
  const partnerInfo = {
    name: 'Saravanan',
    journeyType: 'Full Fledged Partner',
    mobile: '9992299921'
  };
  console.log(lead)
  const handleBack = () => {
    // Navigate back to the list with preserved state
    navigate(-1);
  };

  const handleSubmit=(data:any)=>{
    console.log(data)
    return "ok"
  }


  if (loading) {
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

  if (error || !lead) {
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
              <p className="text-red-600 mb-4">{error || 'Lead not found'}</p>
              <Button onClick={handleBack}>Return to Lead List</Button>
            </div>
          </Card>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout>
      <DynamicStagesAndSteps partnerInfo={partnerInfo} onComplete={handleSubmit} />
    </ModuleLayout>
  );
}