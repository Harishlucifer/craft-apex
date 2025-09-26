import { BaseApiService } from './base';

export interface DocumentStatus {
  uploaded: boolean;
  verified: boolean;
  extractedData?: any;
}

export interface ChecklistItem {
  document_name: string;
  document_id: string;
  checklist_item_id: string;
  service_provider_id: string;
  document_type: string;
  description: string;
  sequence: number;
  allowed_count: number;
  files: Array<{
    file_id: string;
    url: string;
    password: string | null;
  }> | null;
  extracted_value: any;
  verify_status: number;
}

export interface ChecklistSection {
  title: string;
  required: ChecklistItem[] | null;
  anyone: any[] | null;
  optional: any[] | null;
  sequence: number;
}

export interface ApplicantChecklist {
  applicant_name: string;
  applicant_id: string;
  applicant_category: string;
  applicant_type: string;
  checklists: ChecklistSection[];
}

export interface DocumentResponse {
  checklist: ApplicantChecklist[];
  status: number;
}

export interface ExtractedValue {
  aadhaarNumber?: string;
  residenceAddress?: string;
  // Add other possible properties as needed
  [key: string]: any; // For any additional dynamic properties
}

export interface UploadDocumentResponse {
  status: number;
  message?: string;
  error?: string;
  extracted_value?: ExtractedValue;
  data?: any;
  verify_status?: number;
}

export class ChecklistAPI extends BaseApiService {
  constructor() {
    super();
  }

  // Use a single instance pattern through the baseApiService
  private static _instance: ChecklistAPI | null = null;

  public static getInstance(): ChecklistAPI {
    if (!ChecklistAPI._instance) {
      ChecklistAPI._instance = new ChecklistAPI();
    }
    return ChecklistAPI._instance;
  }

  /**
   * Fetches all documents for a given onboarding ID
   * @param onboardingID The onboarding ID to fetch documents for
   * @returns Promise with the document response
   *
   */

  async fetchDocuments(onboardingID: string): Promise<DocumentResponse> {
    try {
      const url = `/alpha/v1/onboarding/${onboardingID}/checklist`;
      const headers = {
        'X-Platform': 'CUSTOMER_PORTAL',
      };

      const response = await this.get<DocumentResponse>(url, { headers });
      const responseData = response?.data || response;
      
      if (!responseData) {
        throw new Error('No data received from the server');
      }

      return responseData as DocumentResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Uploads a document for verification using multipart/form-data
   * @param onboardingID The onboarding ID
   * @param file The file to upload
   * @param applicantId The applicant's ID
   * @param documentId The type of document
   * @param applicantCategory The category of the applicant
   * @param password Optional password for the document
   * @returns Promise with the upload response
   */
  async uploadDocument(
    onboardingID: string,
    file: File,
    applicantId: string,
    documentId: string,
    applicantCategory: string,
    password: string = ''
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('applicant_id', applicantId);
    formData.append('document_id', documentId);
    formData.append('applicant_category', applicantCategory);

    // FormData prepared for file upload

    if (password) {
      formData.append('password', password);
    }

    try {
      const response = await this.post<UploadDocumentResponse>(
        `/alpha/v1/onboarding/${onboardingID}/document`, 
        formData, 
        {
          headers: {
            'X-Platform': 'CUSTOMER_PORTAL',
            'Accept': 'application/json',
          },
        }
      );
      
      return response;
    } catch (error: any) {
      if (error?.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response?.data?.message || 'Upload failed');
      } else if (error?.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      }
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }

  /**
   * Deletes a document by file ID
   * @param fileId The ID of the file to delete
   * @returns Promise that resolves when the document is deleted
   */
  async deleteDocument(fileId: string): Promise<void> {
    await this.delete(`/alpha/v1/application`, {
      headers: {
        'X-Platform': 'CUSTOMER_PORTAL',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file_id: fileId })
    });
  }
}
