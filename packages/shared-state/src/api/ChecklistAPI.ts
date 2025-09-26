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
            const response = await fetch(`${this.apiUrl}/alpha/v1/onboarding/${onboardingID}/checklist`, {
                method: 'GET',
                headers: {
                    'X-Platform': 'CUSTOMER_PORTAL',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.user?.access_token}`,
                },
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to fetch documents');
            }

            return await response.json();
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

        const response = await fetch(`${this.apiUrl}/alpha/v1/onboarding/${onboardingID}/document`, {
            method: 'POST',
            headers: {
                'X-Platform': 'CUSTOMER_PORTAL',
                'Authorization': `Bearer ${this.user?.access_token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to upload document');
        }

        return await response.json();
    }

    /**
     * Deletes a document
     * @param fileId The ID of the file to delete
     * @returns Promise that resolves when the document is deleted
     */
    async deleteDocument(fileId: string): Promise<void> {
        const response = await fetch(`${this.apiUrl}/alpha/v1/application`, {
            method: 'DELETE',
            headers: {
                'X-Platform': 'CUSTOMER_PORTAL',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.user?.access_token}`,
            },
            body: JSON.stringify({ file_id: fileId })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to delete document');
        }
    }

}