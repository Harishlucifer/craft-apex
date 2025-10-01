import {BaseApiService} from './base';

export interface GstDetail {
    id?: string;
    gstin: string;
    state?: string;
    pincode?: string | number;
    address?: string;
    area?: string;
    district?: string;
    is_head_office?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GstListResponse {
    data: GstDetails[];
    status: number;
    message?: string;
    pagination?: {
        page: number;
        size: number;
        total: number;
    };
}

export interface GstDetails {
    id: string | number;
    gstNo: string;
    corePincodeList?: {
        pincode: number;
        area: string;
        coreCityList?: {
            name: string;
            coreStateList?: {
                name: string;
            };
        }
    };
    address: string;
    isMainBranch: number;
    status: number;
}

export class GstApiService extends BaseApiService {
    private static gstInstance: GstApiService;

    private constructor() {
        super();
    }

    public static getInstance(): GstApiService {
        if (!GstApiService.gstInstance) {
            GstApiService.gstInstance = new GstApiService();
        }
        return GstApiService.gstInstance;
    }

    async fetchGst(params: Record<string, string | number> = {}): Promise<GstListResponse> {
        const query = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && `${v}` !== '') query.append(k, String(v));
        }
        const qs = query.toString();
        const url = qs ? `/alpha/v1/finance/gst?${qs}` : `/alpha/v1/finance/gst`;
        const res = await this.get<GstListResponse>(url);
        return res as unknown as GstListResponse;
    }

    async createOrUpdateGst(payload: GstDetails): Promise<{ status: number; message?: string; data?: GstDetails }> {
        const res = await this.post<{ status: number; message?: string; data?: GstDetails }>(
            `/alpha/v1/finance/gst`,
            payload
        );
        return res as unknown as { status: number; message?: string; data?: GstDetails };
    }
}

export const gstApiService = GstApiService.getInstance();
