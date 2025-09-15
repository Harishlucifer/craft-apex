import { WorkflowAPI, InvalidateFn } from "./WorkflowAPI.ts";
import useLeadStore, { Lead, LeadState } from "@/stores/Lead.ts";

// Define your types (adjust these as per your API response)
export interface LeadsApiParams {
    page?: number;
    size?: number;
    journey_type?: string;
    status?: string;
    search?: string;
    territory_id?: string;
}

export interface LeadsApiResponse {
    data: any[];
    total: number;
    page: number;
    size: number;
}

export interface LeadApiResponse {
    application_id:string,
    message:string,
    result:any,
    status:number,
    source_id?:string,
}

export class LeadAPI extends WorkflowAPI {
    protected leadStore: LeadState;

    constructor(invalidate?: InvalidateFn) {
        super(invalidate);
        this.leadStore = useLeadStore.getState();
    }

    /** Override createUpdate for Lead creation */
    async createUpdate(data: any): Promise<LeadApiResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const res = await fetch(`${this.apiUrl}/alpha/v2/application/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.user?.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Failed to create/update lead");
            }
            
            const response = await res.json() as LeadApiResponse;
            
            // Update store with new lead data
            if (response.status === 200 || response.status === 201) {
                const newLead: Lead = {
                    application_id: response.application_id,
                    ...response.result,
                    ...data
                };
                
                this.leadStore.setLeadData(newLead, 'V2');
            }
            
            // Return response with source_id set from application_id
            return {
                ...response,
                source_id: response.application_id
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create lead';
            this.leadStore.setError(errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }

    /** Generic GET request helper */
    protected async get<T>(endpoint: string): Promise<T> {
        const res = await fetch(`${this.apiUrl}${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.user?.access_token}`,
            },
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "GET request failed");
        }

        const text = await res.text();
        if (!text) return {} as T;
        console.log(JSON.parse(text),'text')
        return JSON.parse(text) as T;
    }

    /** Fetch list of leads with optional filters */
    async fetchLeads(params: LeadsApiParams = {}): Promise<LeadsApiResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const queryParams = new URLSearchParams();

            queryParams.append('page', (params.page || 1).toString());
            queryParams.append('size', (params.size || 10).toString());

            if (params.journey_type) queryParams.append('journey_type', params.journey_type);
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
            if (params.territory_id) queryParams.append('territory_id', params.territory_id);

            const response = await this.get<LeadsApiResponse>(`/alpha/v1/application?${queryParams.toString()}`);
            
            // Update store with leads data
            this.leadStore.setLeadListData(response);
            
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leads';
            this.leadStore.setError(errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }

    /** Fetch single lead by ID */
    async fetchLead(id: string, version: string = "V1"): Promise<LeadApiResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const response = await this.get<LeadApiResponse>(`/alpha/${version}/application/${id}`);
            
            // Update store with single lead data
            if (response.status === 200) {
                const lead: Lead = {
                    application_id: response.application_id,
                    ...response.result
                };
                
                this.leadStore.setLeadData(lead, version);
            }
            
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lead';
            this.leadStore.setError(errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
