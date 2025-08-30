import { BaseApiService } from './base';
import type { LeadApplication, LeadsApiResponse, LeadsApiParams } from '@repo/types/application';

export class LeadsApiService extends BaseApiService {
  private static leadsInstance: LeadsApiService;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): LeadsApiService {
    if (!LeadsApiService.leadsInstance) {
      LeadsApiService.leadsInstance = new LeadsApiService();
    }
    return LeadsApiService.leadsInstance;
  }
  
  async fetchLeads(params: LeadsApiParams = {}): Promise<LeadsApiResponse> {
    const queryParams = new URLSearchParams();
    
    // Set default values
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('size', (params.size || 10).toString());
    
    // Add optional parameters
    if (params.journey_type) {
      queryParams.append('journey_type', params.journey_type);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.territory_id) {
      queryParams.append('territory_id', params.territory_id);
    }
    
    const response = await this.get<LeadsApiResponse>(
      `/alpha/v1/application?${queryParams.toString()}`
    );
    
    // BaseApiService returns the raw API response, not wrapped in ApiResponse
    return response as unknown as LeadsApiResponse;
  }

  async fetchLead(id: string): Promise<LeadApplication> {
    const response = await this.get<LeadApplication>(
      `/alpha/v1/application/${id}`
    );
    
    return response as unknown as LeadApplication;
  }
}

export const leadsApiService = LeadsApiService.getInstance();