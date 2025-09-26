import { SetupResponse, SetupApiHeaders, PlatformType } from '@repo/types/setup';
import { BaseApiService } from './base';

export class SetupApiService extends BaseApiService {
  private static setupInstance: SetupApiService;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): SetupApiService {
    if (!SetupApiService.setupInstance) {
      SetupApiService.setupInstance = new SetupApiService();
    }
    return SetupApiService.setupInstance;
  }
  
  async fetchSetup(): Promise<SetupResponse> {
    // Platform and tenant domain headers are automatically added by BaseApiService
    // Uses postSetup method which excludes bearer token for guest users and null users
    const apiResponse = await this.postSetup<SetupResponse>(
      '/alpha/v1/setup',
      {}
    );
    
    console.log('Setup data fetched successfully', apiResponse);
    
    if (!apiResponse.data) {
      throw new Error('Failed to fetch setup data');
    }
    
    return apiResponse as unknown as SetupResponse;
  }
}