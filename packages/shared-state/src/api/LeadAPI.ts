import { BaseApiService } from "./base";
import { useLeadStore, Lead, LeadState, LeadsApiResponse } from "../stores";
import { WorkflowAPI, InvalidateFn } from "./WorkflowAPI";

// Define your types (adjust these as per your API response)
export interface LeadsApiParams {
    page?: number;
    size?: number;
    journey_type?: string;
    status?: string;
    search?: string;
    territory_id?: string;
}

export interface LeadApiResponse {
    application_id?: string;
    message?: string;
    result: any;
    status: number;
    source_id?: string;
}

export class LeadAPI extends WorkflowAPI {
    private static leadInstance: LeadAPI;

    private constructor(invalidate?: InvalidateFn) {
        super(invalidate);
    }

    protected get leadStore(): LeadState {
        return useLeadStore.getState();
    }

    public static getInstance(invalidate?: InvalidateFn): LeadAPI {
        if (!LeadAPI.leadInstance) {
            LeadAPI.leadInstance = new LeadAPI(invalidate);
        }
        return LeadAPI.leadInstance;
    }

    /** Override createUpdate for Lead creation */
    async createUpdate(data: any): Promise<LeadApiResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const apiResponse = await this.post<LeadApiResponse>('/alpha/v2/application/create', data);
            const response = apiResponse as unknown as LeadApiResponse;
            console.log("createUpdate response ---- ", apiResponse);
            // Update store with new lead data
            if (apiResponse.status === 1) {
                const newLead: Lead = {
                    application_id: response.application_id,
                    ...response.result,
                    ...data
                };
                
                this.leadStore.setLeadData(newLead, 'V2');
            }
            console.log("createUpdate response", response);
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

    /** Fetch multiple leads */
    async fetchLeads(params: LeadsApiParams = {}): Promise<LeadsApiResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });

            const endpoint = `/alpha/v2/application/list?${queryParams.toString()}`;
            const apiResponse = await this.get<LeadsApiResponse>(endpoint);

            const response = apiResponse as unknown as LeadsApiResponse;
            
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

    /** Fetch single lead */
    async fetchLead(id: string, version: string = "V1"): Promise<LeadApiResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const endpoint = `/alpha/${version.toLowerCase()}/application/${id}`;
            const apiResponse = await this.get<LeadApiResponse>(endpoint);
            const response = apiResponse as unknown as LeadApiResponse; 
            
            if (response.result) {
                this.leadStore.setLeadData(response.result, version);
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