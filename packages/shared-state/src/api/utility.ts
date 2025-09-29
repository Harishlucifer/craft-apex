import { BaseApiService } from './base';

export interface ShorterUrlRequest {
  short_url: string;
}

export interface ShorterUrlResponse {
  original_url: string;
  status: number;
  message?: string;
  error?: string;
}

export class UtilityAPI extends BaseApiService {
  /**
   * Process a shorter URL through the backend utility endpoint
   * 
   * @param shortUrl - The short URL to process
   * @returns Promise with the redirect URL response
   */
  async processShortUrl(shortUrl: string): Promise<ShorterUrlResponse> {
    try {
      const response = await this.post<ShorterUrlResponse>('/alpha/v1/utility/shorter', {
        short_url: shortUrl
      });
      console.log("response", response);
      if (response.data) {
        console.log(`[UtilityAPI] Successfully processed shorter URL`);
        console.log(`[UtilityAPI] Redirect URL: ${response.data}`);
        console.log(`[UtilityAPI] Full Response:`, response.data);
        
        return response.data;
      } else {
        throw new Error('No data received from utility endpoint');
      }
      
    } catch (error: any) {
      console.error(`[UtilityAPI] Error processing shorter URL:`, error);
      
      throw new Error(error.message || 'Failed to process shorter URL');
    }
  }
}

export const utilityAPI = new UtilityAPI();