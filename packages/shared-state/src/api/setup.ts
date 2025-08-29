import { SetupResponse, SetupApiHeaders, PlatformType } from '@repo/types/setup';
import { getApiEndpoint } from '../config';

export class SetupApiService {
  private static instance: SetupApiService;
  
  private constructor() {}
  
  public static getInstance(): SetupApiService {
    if (!SetupApiService.instance) {
      SetupApiService.instance = new SetupApiService();
    }
    return SetupApiService.instance;
  }
  
  async fetchSetup(platform: PlatformType, tenantDomain: string): Promise<SetupResponse> {
    const headers: SetupApiHeaders & Record<string, string> = {
      'x-platform': platform,
      'x-tenant-domain': tenantDomain,
      'Content-Type': 'application/json',
    };
    
    try {
      const response = await fetch(`${getApiEndpoint()}/alpha/v1/setup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error(`Setup API failed: ${response.status} ${response.statusText}`);
      }
      
      const data: SetupResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Setup API Error:', error);
      throw error;
    }
  }
  

}

export const setupApiService = SetupApiService.getInstance();