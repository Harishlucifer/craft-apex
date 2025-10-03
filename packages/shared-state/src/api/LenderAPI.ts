import { BaseApiService } from './base';
import { LeadState, useLeadStore } from '../stores/Lead';

export interface OfferResponse {
    result: any;
    status: number;
}

export interface ApplyResponse {
    result: any;
    status: number;
}

export class LenderOfferAPI extends BaseApiService {
    private static lenderOfferInstance: LenderOfferAPI;

    private constructor() {
        super();
    }

    protected get leadStore(): LeadState {
        return useLeadStore.getState();
    }

    public static getInstance(): LenderOfferAPI {
        if (!LenderOfferAPI.lenderOfferInstance) {
            LenderOfferAPI.lenderOfferInstance = new LenderOfferAPI();
        }
        return LenderOfferAPI.lenderOfferInstance;
    }

    async fetchEligibleOffers(id: string, version: string = "V1"): Promise<OfferResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const endpoint = `/alpha/${version.toLowerCase()}/application/${id}/recommendation`;
            const response = await this.get<OfferResponse>(endpoint);
            const responseData = response?.data || response;
            
            return responseData as OfferResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch offers";
            this.leadStore.setError(errorMessage);
            console.error('LenderOfferAPI.fetchEligibleOffers error:', errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }

    async lenderApply(id: string, lenderCode: string, version: string = "V1"): Promise<ApplyResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const endpoint = `/alpha/${version.toLowerCase()}/application/${id}/batch-lender-apply`;
            const body = { lender_code: [lenderCode] };
            const response = await this.post<ApplyResponse>(endpoint, body);
            const responseData = response?.data || response;
            
            return responseData as ApplyResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Lender apply failed";
            this.leadStore.setError(errorMessage);
            console.error('LenderOfferAPI.lenderApply error:', errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
