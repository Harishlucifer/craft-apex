import {InvalidateFn, WorkflowAPI} from "./WorkflowAPI";

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

export interface ApplicantChecklist {
    applicant_name: string;
    applicant_id: string;
    applicant_category: string;
    applicant_type: string;
    checklists: Array<{
        title: string;
        required: ChecklistItem[] | null;
        anyone: any[] | null;
        optional: any[] | null;
        sequence: number;
    }>;
}

export interface DocumentResponse {
    checklist: ApplicantChecklist[];
    status: number;
}

export class ChecklistAPI extends WorkflowAPI {
    constructor(invalidate?: InvalidateFn) {
        super(invalidate);
    }

    /**
     * Fetches all documents for a given onboarding ID
     * @param onboardingID The onboarding ID to fetch documents for
     * @returns Promise with the document response
     */
    async fetchDocuments(onboardingID: string): Promise<DocumentResponse> {
        try {
            const response = await this.get<DocumentResponse>(`/alpha/v1/onboarding/${onboardingID}/checklist`, {
                headers: {
                    'X-Platform': 'CUSTOMER_PORTAL',
                },
            });

            if (response.status !== 1) {
                throw new Error(response.error || response.message || 'Failed to fetch documents');
            }

            return response.data || { checklist: [], status: 0 };
        } catch (error) {
            console.error('Error fetching documents:', error);
            throw error;
        }
    }

    /**
     * Uploads a document for verification
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
    ): Promise<any> {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('applicant_id', applicantId);
        formData.append('document_id', documentId);
        formData.append('applicant_category', applicantCategory);
        if (password) {
            formData.append('password', password);
        }

        const response = await this.post(`/alpha/v1/onboarding/${onboardingID}/document`, formData, {
            headers: {
                'X-Platform': 'CUSTOMER_PORTAL',
                // Don't set Content-Type for FormData, let the browser set it
            },
        });

        if (response.status !== 1) {
            throw new Error(response.error || response.message || 'Failed to upload document');
        }

        return response.data;
    }

    /**
     * Deletes a document
     * @param fileId The ID of the file to delete
     * @returns Promise that resolves when the document is deleted
     */
    async deleteDocument(fileId: string): Promise<void> {
        const response = await this.post(`/alpha/v1/application`, { file_id: fileId }, {
            headers: {
                'X-Platform': 'CUSTOMER_PORTAL',
            },
        });

        if (response.status !== 1) {
            throw new Error(response.error || response.message || 'Failed to delete document');
        }
    }

}