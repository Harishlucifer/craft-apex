import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ModuleLayout } from "@repo/ui/module";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { leadsApiService } from "@repo/shared-state/api";
import type { LeadApplication } from "@repo/types/application";

const statusColors: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Under Review': 'bg-orange-100 text-orange-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Pending': 'bg-gray-100 text-gray-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
};

const sourceColors: Record<string, string> = {
  'Website': 'bg-blue-100 text-blue-800',
  'Mobile App': 'bg-green-100 text-green-800',
  'Partner Portal': 'bg-purple-100 text-purple-800',
  'Employee Portal': 'bg-orange-100 text-orange-800',
  'API': 'bg-gray-100 text-gray-800',
  'Direct': 'bg-yellow-100 text-yellow-800',
  'Referral': 'bg-pink-100 text-pink-800',
};

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Lead Details - {lead.code}
              </h1>
              <p className="text-muted-foreground mt-1">
                {lead.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Lead Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="text-lg font-medium">{lead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <p className="text-lg">{lead.contact_name || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.mobile || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.sourced_by?.user_name || '-'}</span>
              </div>
            </div>
          </Card>

          {/* Status & Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Status & Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={statusColors[lead.application_status] || "bg-gray-100 text-gray-800"}
                  >
                    {lead.application_status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={sourceColors[lead.origin_platform] || "bg-gray-100 text-gray-800"}
                  >
                    {lead.origin_platform}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                <p className="text-lg font-medium">
                  ₹{lead.loan_amount?.toLocaleString() || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                <p className="text-lg">{lead.sourced_by?.user_name || '-'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Lead Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(lead.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ModuleLayout>
  );
}