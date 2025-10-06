import {BaseApiService} from './base';

export interface GstRequest {
    id?: string;
    gst_no: string;
    associate_type?: string;
    associate_id?: string;
    office_id?: string;
    is_main_branch?: string;
    address?: string;
    pincode_id?: string;
    status?: number;
}

export interface PincodeSuggestion {
    id: number;
    pincode: string;
    area: string;
    city_id: string;
    state_id: string;
    country_id: string;
    city: string;
    state: string;
    country: string;
}

export interface GstDetails {
    gst_id?: bigint;
    gst_no?: string;
    address?: string;
    pincode?: string | number;
    area?: string;
    area_id?: string;
    city?: string;
    state?: string;
    district?: string;
    is_head_office?: number;
    isMainBranch?: number;
    status?: number;
    created_at?: string;
    updated_at?: string;
    
    // Legacy structure (keeping for backward compatibility)
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
    
    // For any additional properties that might come from the API
    [key: string]: any;
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

    async fetchGstDetails(params: Record<string, string | number> = {}): Promise<GstDetails[]> {
        const query = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && `${v}` !== '') query.append(k, String(v));
        }
        const qs = query.toString();
        const url = qs ? `/alpha/v1/finance/gst?${qs}` : `/alpha/v1/finance/gst`;
        const res = await this.get<GstDetails>(url);
        console.log("gstDetails ::: straight API ,", res);
        return res as unknown as GstDetails[]
    }

    async fetchGstDetailsById(id: string): Promise<GstDetails> {
        const res = await this.get<GstDetails>(`/alpha/v1/finance/gst/${id}`);
        return res as unknown as GstDetails;
    }

    async createOrUpdateGst(payload: GstRequest): Promise<{ status: number; message?: string; data?: GstDetails }> {
        const res = await this.post<{ status: number; message?: string; data?: GstDetails }>(
            `/alpha/v1/finance/gst`,
            payload
        );
        return res as unknown as { status: number; message?: string; data?: GstDetails };
    }
    async getPincodeSuggestions(pincode: string): Promise<{ data: PincodeSuggestion[] }> {
        const res = await this.get<{ data: PincodeSuggestion[] }>(
            `/alpha/v1/master/pin-code/suggest?pincode=${pincode}`
        );
        return res as unknown as { data: PincodeSuggestion[] };
    }

    async getPincodeDetails(pincode: string): Promise<{ data: GstDetails[] }> {
        const res = await this.get<{ data: GstDetails[] }>(
            `/alpha/v1/master/pin-code/?pincode=${pincode}`
        );
        return res as unknown as { data: GstDetails[] };
    }
}

export const gstApiService = GstApiService.getInstance();
