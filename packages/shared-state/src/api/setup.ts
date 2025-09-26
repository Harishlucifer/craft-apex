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
    const response = await this.post<SetupResponse>(
      '/alpha/v1/setup',
      {}
    );
    
    return response as unknown as SetupResponse;
  }
  

}

export const setupApiService = SetupApiService.getInstance();