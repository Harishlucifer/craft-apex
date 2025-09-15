import { WorkflowAPI, InvalidateFn } from "./WorkflowAPI.ts";
import usePartnerStore, { Partner, PartnerState } from "@/stores/Partner.ts";

// Define your types (adjust these as per your API response)
export interface PartnersApiParams {
    page?: number;
    size?: number;
    journey_type?: string;
    status?: string;
    search?: string;
    territory_id?: string;
}

export interface PartnersApiResponse {
    data: any[];
    total: number;
    page: number;
    size: number;
}

export interface PartnerApiResponse {
    channel_id:string,
    message:string,
    result:any,
    status:number,
    source_id?:string,
}

export class PartnerAPI extends WorkflowAPI {
    protected partnerStore: PartnerState;

    constructor(invalidate?: InvalidateFn) {
        super(invalidate);
        this.partnerStore = usePartnerStore.getState();
    }

    /** Override createUpdate for Partner creation */
    async createUpdate(data: any): Promise<PartnerApiResponse> {
        this.partnerStore.setLoading(true);
        this.partnerStore.clearError();

        try {
            const res = await fetch(`${this.apiUrl}/alpha/v2/partner/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.user?.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Failed to create/update partner");
            }
            
            const response = await res.json() as PartnerApiResponse;
            
            // Update store with new partner data
            if (response.status === 200 || response.status === 201) {
                const newPartner: Partner = {
                    channel_id: response.channel_id,
                    ...response.result,
                    ...data
                };
                
                this.partnerStore.setPartnerData(newPartner, 'V2');
            }
            
            // Return response with source_id set from application_id
            return {
                ...response,
                source_id: response.channel_id.toString(),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create partner';
            this.partnerStore.setError(errorMessage);
            throw error;
        } finally {
            this.partnerStore.setLoading(false);
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

    /** Fetch list of partners with optional filters */
    async fetchPartners(params: PartnersApiParams = {}): Promise<PartnersApiResponse> {
        this.partnerStore.setLoading(true);
        this.partnerStore.clearError();

        try {
            const queryParams = new URLSearchParams();

            queryParams.append('page', (params.page || 1).toString());
            queryParams.append('size', (params.size || 10).toString());

            if (params.journey_type) queryParams.append('journey_type', params.journey_type);
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
            if (params.territory_id) queryParams.append('territory_id', params.territory_id);

            const response = await this.get<PartnersApiResponse>(`/alpha/v1/channel?${queryParams.toString()}`);
            
            // Update store with partners data
            this.partnerStore.setPartnerListData(response);
            
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch partners';
            this.partnerStore.setError(errorMessage);
            throw error;
        } finally {
            this.partnerStore.setLoading(false);
        }
    }

    /** Fetch single partner by ID */
    async fetchPartner(id: string, version: string = "V1"): Promise<PartnerApiResponse> {
        this.partnerStore.setLoading(true);
        this.partnerStore.clearError();

        try {
            const response = await this.get<PartnerApiResponse>(`/alpha/${version}/partner/${id}`);
            
            // Update store with single partner data
            if (response.status === 200) {
                const partner: Partner = {
                    channel_id: response.channel_id.toString(),
                    ...response.result
                };
                
                this.partnerStore.setPartnerData(partner, version);
            }
            
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch partner';
            this.partnerStore.setError(errorMessage);
            throw error;
        } finally {
            this.partnerStore.setLoading(false);
        }
    }
}
