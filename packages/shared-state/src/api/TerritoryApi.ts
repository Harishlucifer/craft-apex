
import { BaseApiService } from './base';

export interface Territory {
    territory_id: string;
    code: string;
    territory_name: string;
    description: string;
    territory_type_id: string;
    territory_type_name: string;
    parent_territory_name: string | null;
    parent_territory_id: string | null;
    location_type: string | null;
    location_type_value: string | null;
    status: number;
}

export interface TerritoryApiResponse {
    data: Territory[];
    status: number;
}

export interface TerritoryParams {
    territory_type?: string;
    territory_type_id?: string;
    parent_territory_id?: string;
    status?: number;
    search?: string;
}

export class TerritoryApiService {
    private static instance: TerritoryApiService;
    private api: BaseApiService;

    private constructor() {
        // Lazy composition instead of inheritance
        this.api = BaseApiService.getInstance();
    }

    public static getInstance(): TerritoryApiService {
        if (!TerritoryApiService.instance) {
            TerritoryApiService.instance = new TerritoryApiService();
        }
        return TerritoryApiService.instance;
    }

    async fetchTerritories(params: TerritoryParams = {}): Promise<Territory[]> {
        const queryParams = new URLSearchParams();
        if (params.territory_type) queryParams.append('territory_type', params.territory_type);
        if (params.territory_type_id) queryParams.append('territory_type_id', params.territory_type_id);
        if (params.parent_territory_id) queryParams.append('parent_territory_id', params.parent_territory_id);
        if (params.status !== undefined) queryParams.append('status', params.status.toString());
        if (params.search) queryParams.append('search', params.search);

        const endpoint = queryParams.toString()
            ? `/alpha/v1/master/territory?${queryParams.toString()}`
            : '/alpha/v1/master/territory';

        const response = await this.api.get<TerritoryApiResponse>(endpoint);

        // Always return the array or empty array
        return (response?.data?.data || []) as Territory[];
    }
}

export default TerritoryApiService;
