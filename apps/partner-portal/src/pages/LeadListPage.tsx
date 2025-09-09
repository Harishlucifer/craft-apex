import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ModuleLayout } from "@repo/ui/module";
import { Card } from "@repo/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Search, Plus, Filter, Loader2, MoreHorizontal } from "lucide-react";
import { useCurrentModule } from "@repo/shared-state/contexts";
import { leadsApiService, LeadApplication, LeadsApiResponse } from "@repo/shared-state/api";

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

export function LeadListPage() {
  const currentModule = useCurrentModule();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [journeyTypeFilter, setJourneyTypeFilter] = useState(searchParams.get('journey_type') || "all");
  const [leads, setLeads] = useState<LeadApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    size: parseInt(searchParams.get('size') || '10'),
    total: 0
  });
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, string>>({});

  // Get default filters from module configuration
  const getDefaultFilters = () => {
    const config = currentModule?.configuration;
    return {
      journey_type: config?.default_journey_type,
      status: config?.default_status || undefined,
      territory_id: config?.default_territory_id || undefined
    };
  };

  // Fetch leads data
  const fetchLeads = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const defaultFilters = getDefaultFilters();
      const params = {
        page,
        size: pagination.size,
        journey_type: journeyTypeFilter !== "all" ? journeyTypeFilter : defaultFilters.journey_type,
        status: statusFilter !== "all" ? statusFilter : defaultFilters.status,
        search: searchTerm || undefined,
        territory_id: defaultFilters.territory_id
      };
      
      const response: LeadsApiResponse = await leadsApiService.fetchLeads(params);
      
      setLeads(response.data);
      setApplicationStatuses(response.application_status);
      setPagination({
        page: response.pagination.page,
        size: response.pagination.size,
        total: response.pagination.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, journeyTypeFilter, searchTerm, pagination.size]);

  // Initial load
  useEffect(() => {
    fetchLeads(1);
  }, []); // Only run on mount

  // Watch for pagination changes
  useEffect(() => {
    fetchLeads(pagination.page);
  }, [pagination.page]);

  // Handle filter changes
  useEffect(() => {
    if (statusFilter !== "all" || journeyTypeFilter !== "all") {
      fetchLeads(1);
      updateURLParams({ status: statusFilter, journey_type: journeyTypeFilter, page: '1' });
    }
  }, [statusFilter, journeyTypeFilter]);

  // Search with debounce
  useEffect(() => {
    if (searchTerm === "") return; // Don't search for empty string
    
    const timeoutId = setTimeout(() => {
      fetchLeads(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateURLParams({ search: value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    updateURLParams({ page: newPage.toString() });
  };

  // Update URL parameters
  const updateURLParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
  };

  const uniqueStatuses = Object.keys(applicationStatuses);
  const uniqueJourneyTypes = ["ENQUIRY_APPLICATION", "FULLFILMENT"];

  return (
    <ModuleLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Lead Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your sales leads and opportunities
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Lead
          </Button>
        </div>

        {/* Filters and Search */}
        <Card title="Lead Management" className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search leads by name, contact, email, or ID..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={journeyTypeFilter}
                onChange={(e) => setJourneyTypeFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Journey Types</option>
                {uniqueJourneyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card title="Lead List" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {leads.length} of {pagination.total} leads
              </p>
              {loading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchLeads(pagination.page)}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.application_id}>
                      <TableCell className="font-medium">{lead.code}</TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.contact_name}</TableCell>
                      <TableCell className="break-all">{lead.sourced_by?.user_name || '-'}</TableCell>
                      <TableCell>{lead.mobile}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            statusColors[lead.application_status] || "bg-gray-100 text-gray-800"
                          }
                        >
                          {lead.application_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            sourceColors[lead.origin_platform] || "bg-gray-100 text-gray-800"
                          }
                        >
                          {lead.origin_platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{lead.loan_amount?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell>{lead.sourced_by?.user_name || '-'}</TableCell>
                      <TableCell>{new Date(lead.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/lead/${lead.application_id}`)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!loading && leads.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {error ? 'Failed to load leads.' : 'No leads found matching your criteria.'}
                </p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && leads.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ModuleLayout>
  );
}
