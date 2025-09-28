import { InvalidateFn, WorkflowAPI } from "partner-portal/src/api/WorkflowAPI";
import { LeadState, useLeadStore } from "partner-portal/src/stores/Lead";

export interface OfferResponse {
    result: any;
    status: number;
}
export interface ApplyResponse {
    result: any;
    status: number;
}

export class LenderOfferAPI extends WorkflowAPI {
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

    async post<T>(endpoint: string, body: any): Promise<T> {
        const res = await fetch(`${this.apiUrl}${endpoint}`, {
            method: "POST",
            headers: {
                "X-Platform": "CUSTOMER_PORTAL",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.user?.access_token}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "POST request failed");
        }
        const text = await res.text();
        if (!text) return {} as T;
        return JSON.parse(text);
    }

    async fetchEligibleOffers(id: string, version: string = "V1"): Promise<OfferResponse> {
        try {
            const endpoint = `/alpha/${version.toLowerCase()}/application/${id}/recommendation`;
            return await this.get<OfferResponse>(endpoint);
        } catch (error) {
            throw error instanceof Error ? error : "Failed to fetch offers";
        } finally {
            this.leadStore.setLoading(false);
        }
    }

    async lenderApply(id: string, lenderCode: string, version: string = "V1"): Promise<ApplyResponse> {
        try {
            const endpoint = `/alpha/${version.toLowerCase()}/application/${id}/batch-lender-apply`;
            const body = { lender_code: [lenderCode] };
            return await this.post<ApplyResponse>(endpoint, body);
        } catch (error) {
            throw error instanceof Error ? error : "Lender apply failed";
        } finally {
            this.leadStore.setLoading(false);
        }
    }
}
