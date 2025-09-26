import { BaseApiService } from './base';

export interface LeadApiResponse {
  application_id:string,
  message:string,
  result:any,
  status:number,
}
export interface LeadApplication {
  application_id: string;
  type: string;
  code: string;
  name: string;
  mobile: string;
  external_lead_id: string;
  external_journey_type: string;
  external_lead_type: string;
  contact_name: string;
  loan_amount: number;
  loan_code: string;
  loan_status: string;
  apply_capacity: string;
  entity_type: string;
  employment_type: string | null;
  pending_ask_count: number;
  resolved_ask_count: number;
  onboarding_id: string;
  data: {
    sub_status_one: string;
    sub_status_two: string;
  };
  origin_platform: string;
  loan_type_name: string;
  loan_type_code: string;
  sourced_by: {
    user_id: number;
    user_type: string;
    user_name: string;
    user_role: string;
    user_mobile_no: string;
    user_associate_id: string;
    relationship_manager: Record<string, any>;
  };
  processed_by: any;
  represented_by: any;
  serviced_by: any;
  data_synced: number;
  status: number;
  application_status: string;
  application_editable: boolean;
  workflow_instance_id: number;
  active_task: {
    task_name: string;
    task_id: string;
    stage_name: string;
    stage_id: string;
    user_detail: {
      username: string;
      email: string;
      mobile: string;
      user_type: string;
      user_role: string;
      user_role_name: string;
      user_id: string;
      employee_id: string;
      employee_code: string;
    };
    assigned_at: string;
    completed_at: string | null;
  };
  completed_task: {
    task_name: string;
    task_id: string;
    stage_name: string;
    stage_id: string;
    user_detail: {
      username: string;
      email: string;
      mobile: string;
      user_type: string;
      user_role: string;
      user_role_name: string;
      user_id: string;
      employee_id: string;
      employee_code: string;
    };
    assigned_at: string;
    completed_at: string;
  };
  activity: {
    activity_id: string;
    activity_type: string;
    outcome: string;
    feedback: string;
    remark: string;
    latitude: number;
    longitude: number;
    engagement_level: string;
    address: string;
    follow_up_date: string;
    current_step: string;
    user_id: string;
    data: any;
    created_at: string;
    status: number;
  };
  territory_id: string;
  territory_name: string;
  territory_type: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsApiResponse {
  application_status: Record<string, string>;
  data: LeadApplication[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  status: number;
}

export interface LeadsApiParams {
  page?: number;
  size?: number;
  journey_type?: string;
  status?: string;
  search?: string;
  territory_id?: string;
}

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

  async fetchLead(id: string,version:string = "V1"): Promise<LeadApiResponse> {
    const response = await this.get<LeadApiResponse>(
      `/alpha/${version}/application/${id}`
    );
    
    return response as unknown as LeadApiResponse;
  }
}