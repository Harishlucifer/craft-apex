import { BaseApiService } from "./base";

// --------------------
// Interfaces
// --------------------
export interface Estimate {
    id?: string;
    territory_id: string;
    territory_name?: string;
    employee_id?: string;
    employee_name?: string;
    month: string;
    category: string;
    mode: string;
    payable_amount?: number;
    lead_code?: string;
    application_name?: string;
    loan_type?: string;
    user_type?: string;
    partner_name?: string;
    lender_name?: string;
    disbursement_date?: string;
    disbursement_amount?: number;
    over_due_amount?: number;
    payout_rate?: number;
    payout_amount?: number;
    scheme_name?: string;
}

export interface EstimateSummary {
    TotalEarnings: number;
    LeadsCount: number;
    UniqueLead: number;
    DueAmount: number;
    InvoicedAmount: number;
}

export interface EstimateResponse {
    status: number;
    data: Estimate[];
    summary: EstimateSummary;
}

export interface EstimateParams {
    mode?: string;
    category?: string;
    employee_id?: string;
    territory_id?: string;
    month?: string;
}

// --------------------
// Service Class
// --------------------
export class EstimateApiService {
    private static instance: EstimateApiService;
    private api: BaseApiService;

    private constructor() {
        this.api = BaseApiService.getInstance();
    }

    public static getInstance(): EstimateApiService {
        if (!EstimateApiService.instance) {
            EstimateApiService.instance = new EstimateApiService();
        }
        return EstimateApiService.instance;
    }

    async fetchEstimates(params: EstimateParams = {}): Promise<EstimateResponse> {
        const queryParams = new URLSearchParams();
        if (params.mode) queryParams.append("mode", params.mode);
        if (params.category) queryParams.append("category", params.category);
        if (params.employee_id) queryParams.append("employee_id", params.employee_id);
        if (params.territory_id) queryParams.append("territory_id", params.territory_id);
        if (params.month) queryParams.append("month", params.month);

        const endpoint = queryParams.toString()
            ? `/alpha/v1/finance/estimate?${queryParams.toString()}`
            : `/alpha/v1/finance/estimate`;

        try {
            const response = await this.api.get<EstimateResponse>(endpoint);

            console.log("Estimate API response", response);

            // BaseApiService returns ApiResponse<T> where the actual data is in response.data or response.result
            // The API structure is {data: [...], status: 1, summary: {...}}
            // So response itself IS the structure we need (not response.data)
            const apiData = response as any; // Type assertion to handle the structure

            return {
                status: apiData.status ?? 0,
                data: apiData.data ?? [],
                summary: apiData.summary ?? {
                    TotalEarnings: 0,
                    LeadsCount: 0,
                    UniqueLead: 0,
                    DueAmount: 0,
                    InvoicedAmount: 0,
                }
            };
        } catch (error) {
            console.error("Error fetching estimates:", error);
            return {
                status: 0,
                data: [],
                summary: {
                    TotalEarnings: 0,
                    LeadsCount: 0,
                    UniqueLead: 0,
                    DueAmount: 0,
                    InvoicedAmount: 0,
                },
            };
        }
    }
}