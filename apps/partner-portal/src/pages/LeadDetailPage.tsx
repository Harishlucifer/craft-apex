import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ModuleLayout } from "@repo/ui/module";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { leadsApiService, LeadApplication } from "@repo/shared-state/api";
import { DynamicStagesAndSteps } from "@/pages/DynamicStagesAndSteps";
import {BasicDetailsStep1, BasicDetailsStep2,DataCaptureStep1,DataCaptureStep2,KYCStep1,BranchRecommendationStep,HQApprovalStep} from "@/pages/SampleStepComponents";
import { useAuthStore } from "@repo/shared-state/stores";


export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  interface Step {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  step_type: string;                // e.g. "MANUAL"
  sequence: number;
  ui_component: string;             // e.g. "FORM_BUILDER"
  conditional_component: string;
  automatic_component: string;
  display_mode: string;             // e.g. "ALL"
  allocation_rule_id: string;
  validation_rule_id: string;
  completion_rule_id: string;
  field_master_id: string;
  allocation_configuration: Record<string, any>;
  stage_id: string;
  workflow_id: string;
  status: number;
  task_id: string;
  task_start_date: string;          // ISO datetime
  task_end_date: string;            // ISO datetime
  task_status: string;
  workflow_instance_id: string;
  edit_mode: boolean;
  username: string;
  user_id: string;
  user_type: string;
}

// Stage inside a Workflow
interface Stage {
  id: string;
  name: string;
  description: string;
  sequence: number;
  allocation_rule_id: string;
  validation_rule_id: string;
  configuration: Record<string, any>;
  workflow_id: string;
  status: number;
  task_start_date: string;
  task_end_date: string;
  task_status: string;
  steps: Step[];
}

// Root Workflow
 interface Workflow {
  id: string;
  name: string;
  description: string;
  start_date: string; // e.g. "2025-02-27"
  end_date: string;   // may be empty
  workflow_type: string; // e.g. "LEAD_CREATION"
  allocation_rule_id: string;
  is_default: number;     // 1 or 0
  configuration: any | null;
  mode: string;           // e.g. "TESTING"
  status: number;
  created_at: string;     // ISO datetime
  updated_at: string;     // ISO datetime
  stages: Stage[];
}

  const [workflowData, setWorkflowData] = useState<Workflow | null>(null);
  

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
    fetchWorkflow()
  }, [id]);

  const apiUrl = import.meta.env.VITE_API_ENDPOINT;
 const fetchWorkflow = async () => {
  const payload = {
    workflow_type: "LEAD_CREATION",
    source_id: id,
  };

  try {
    const res = await fetch(`${apiUrl}/alpha/v1/workflow/build`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    // If the server returned no content
    if (res.status === 204) {
      console.log("✅ Workflow created, no content returned");
      return;
    }

    // Get raw response first
    const text = await res.text();

    if (!text) {
      console.log("⚠️ Empty response body");
      return;
    }

    // Try parsing as JSON
    const data = JSON.parse(text);
    setWorkflowData(data.data);
    console.log("✅ Workflow response:", data);
  } catch (err) {
    console.error("❌ fetchWorkflow error:", err);
  }
};


   const stages = [
    {
      id: 'basic-details',
      title: 'Basic Details',
      description: 'Personal & Location Information',
      steps: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          description: 'Basic personal details',
          content: <BasicDetailsStep1 />
        },
        {
          id: 'location-info',
          title: 'Location Details',
          description: 'Address and identification',
          content: <BasicDetailsStep2 />
        }
      ]
    },
    {
      id: 'data-capture',
      title: 'Data Capture',
      description: 'Business & Financial Information',
      steps: [
        {
          id: 'business-info',
          title: 'Business Information',
          description: 'Company details and registration',
          content: <DataCaptureStep1 />
        },
        {
          id: 'financial-info',
          title: 'Financial Information',
          description: 'Banking and financial details',
          content: <DataCaptureStep2 />
        }
      ]
    },
    {
      id: 'kyc',
      title: 'KYC',
      description: 'Document Verification',
      steps: [
        {
          id: 'document-upload',
          title: 'Document Upload',
          description: 'Required document submission',
          content: <KYCStep1 />
        }
      ]
    },
    {
      id: 'branch-recommendation',
      title: 'Branch Recommendation',
      description: 'Branch Assignment',
      steps: [
        {
          id: 'branch-selection',
          title: 'Branch Selection',
          description: 'Choose your preferred branch',
          content: <BranchRecommendationStep />
        }
      ]
    },
    {
      id: 'hq-approval',
      title: 'HQ Approval',
      description: 'Final Review & Approval',
      steps: [
        {
          id: 'final-review',
          title: 'Final Review',
          description: 'Application review and submission',
          content: <HQApprovalStep />
        }
      ]
    }
  ];

  const partnerInfo = {
    name: 'Saravanan',
    journeyType: 'Full Fledged Partner',
    mobile: '9992299921'
  };
  const handleBack = () => {
    // Navigate back to the list with preserved state
    navigate(-1);
  };

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
      <DynamicStagesAndSteps stages={workflowData?.stages || []} partnerInfo={partnerInfo} />
    </ModuleLayout>
  );
}