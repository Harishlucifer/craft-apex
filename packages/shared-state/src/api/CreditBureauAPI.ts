import { BaseApiService } from './base';
import { LeadState, useLeadStore } from '../stores/Lead';

export interface CreditResponse {
    cam_status: number;
    result: any[];
    status: number;
}

export class CreditBureauAPI extends BaseApiService {
    private static creditBureauInstance: CreditBureauAPI;

    private constructor() {
        super();
    }

    protected get leadStore(): LeadState {
        return useLeadStore.getState();
    }

    public static getInstance(): CreditBureauAPI {
        if (!CreditBureauAPI.creditBureauInstance) {
            CreditBureauAPI.creditBureauInstance = new CreditBureauAPI();
        }
        return CreditBureauAPI.creditBureauInstance;
    }
    async fetchCreditResponse(id: string): Promise<CreditResponse> {
        this.leadStore.setLoading(true);
        this.leadStore.clearError();

        try {
            const endpoint = `/alpha/v1/onboarding/${id}/cam/APPLICATION_BUREAU`;
            const response = await this.get<CreditResponse>(endpoint);
            const responseData = response?.data || response;
            
            return responseData as CreditResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch credit response';
            this.leadStore.setError(errorMessage);
            console.error('CreditBureauAPI.fetchCreditResponse error:', errorMessage);
            throw error;
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
