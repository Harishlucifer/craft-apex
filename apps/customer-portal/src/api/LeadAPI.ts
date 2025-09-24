import {InvalidateFn, WorkflowAPI} from "./WorkflowAPI";
import {Lead, LeadsApiResponse, LeadState, useLeadStore} from "../stores/Lead";

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
    application_id: string;
    message: string;
    result: any;
    status: number;
    source_id?: string;
}

export interface OfferResponse {
    result: any;
    status: number;
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
                    "X-Platform": "CUSTOMER_PORTAL",
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
    async get<T>(endpoint: string): Promise<T> {
        const res = await fetch(`${this.apiUrl}${endpoint}`, {
            method: "GET",
            headers: {
                "X-Platform": "CUSTOMER_PORTAL",
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

        return JSON.parse(text);
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
            const response = await this.get<LeadsApiResponse>(endpoint);
            
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
            const response = await this.get<LeadApiResponse>(endpoint);
            
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
    /** Fetch Recommended Lender's Details **/
    async fetchEligibleOffers(id: string, version: string = "V1"): Promise<OfferResponse> {
        try {
            const endpoint = `/alpha/${version.toLowerCase()}/application/${id}/recommendation`;
            return await this.get<OfferResponse>(endpoint);
        } catch (error) {
            throw error instanceof Error ? error : 'Failed to fetch offers';
        } finally {
            this.leadStore.setLoading(false);
        }
    }

}