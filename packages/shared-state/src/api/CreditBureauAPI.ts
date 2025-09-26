import {InvalidateFn, WorkflowAPI} from "partner-portal/src/api/WorkflowAPI";
import {LeadState, useLeadStore} from "partner-portal/src/stores/Lead";
import {LenderOfferAPI} from "./LenderAPI";


export interface CreditResponse {
    cam_status: number;
    result: any[];
    status: number;
}
export class CreditBureauAPI extends WorkflowAPI{
    protected leadStore: LeadState;
    constructor(invalidate?: InvalidateFn) {
        super(invalidate);
        this.leadStore = useLeadStore.getState();
    }
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
    async fetchCreditResponse(id: string): Promise<CreditResponse> {
        try {
            const endpoint = `/alpha/v1/onboarding/${id}/cam/APPLICATION_BUREAU`;
            return await this.get<CreditResponse>(endpoint);
        } catch (error) {
            throw error instanceof Error ? error : 'Failed to fetch offers';
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
