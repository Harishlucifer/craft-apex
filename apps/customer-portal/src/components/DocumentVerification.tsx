import {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Upload, CheckCircle, Camera, FileText, Trash2 } from 'lucide-react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChecklistAPI } from '@repo/shared-state/api';
import { StepComponentProps } from './WorkflowStepComponentLoader';

export interface DocumentVerificationRef {
    submitStepExternally: () => void;
}

interface DocumentStatus {
    uploaded: boolean;
    verified: boolean;
    extractedData?: any;
}

const DocumentVerification = forwardRef<DocumentVerificationRef, StepComponentProps>((props, ref) => {
    const { data: applicationData = {}, handleSubmitSuccess, handleBack } = props;
    const [isProcessingDocId, setIsProcessingDocId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const onboardingID = applicationData?.application?.onboarding_id;

    /** 1. Fetch documents using React Query */
    const { data: documentResponse, isLoading, isError, error} = useQuery({
        queryKey: ['documents', onboardingID],
        queryFn: () => ChecklistAPI.getInstance().fetchDocuments(onboardingID!),
        enabled: !!onboardingID,
        retry: 1,
    });

    useEffect(() => {
        if (error) {
            toast.error('Failed to fetch documents');
        }
    }, [error]);

    // Process documentResponse to derive documentTypes and documents state
    const documentTypes = documentResponse?.checklist?.[0]?.checklists?.flatMap((checklist) =>
        checklist.required?.map((doc) => ({ ...doc, title: checklist.title })) || []
    ) || [];

    // Build documents status map from documentTypes and responses
    const documents: Record<string, DocumentStatus> = {};
    documentTypes.forEach(doc => {
        const uploadedFile = doc.files?.[0];
        documents[doc.document_id] = {
            uploaded: !!uploadedFile,
            verified: doc.verify_status === 1,
            extractedData: doc,
        };
    });

    /** 2. Upload Mutation */
    const uploadMutation = useMutation({
        mutationFn: (payload: { docId: string; file: File; documentId: string }) => {
            if (!onboardingID) return Promise.reject('Missing onboardingID');
            const applicantId = applicationData.primary?.personal?.person_id ?? '';
            const applicantCategory = applicationData.primary?.applicant_category ?? '';
            return ChecklistAPI.getInstance().uploadDocument(
                onboardingID,
                payload.file,
                applicantId,
                payload.documentId,
                applicantCategory
            );
        },
        onMutate: (variables) => {
            setIsProcessingDocId(variables.docId);
            return {}; // You should return the context here if you need it in onSuccess/onError
        },
        onSuccess: async (response) => {
            toast.success(response.message || "Document uploaded successfully");
            await queryClient.invalidateQueries({
                queryKey: ['documents', onboardingID]
            });
            setIsProcessingDocId(null);
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to upload document");
            setIsProcessingDocId(null);
        }
    });

    /** 3. Delete Mutation */
    const deleteMutation = useMutation({
        mutationFn: (fileId: string) => ChecklistAPI.getInstance().deleteDocument(fileId),
        onSuccess: async () => {
            toast.success("Document deleted successfully!");
            await queryClient.invalidateQueries({
                queryKey: ['documents', onboardingID]
            });
        },
    });

    /** 4. Submit handler */
    const handleSubmit = async () => {
        try {
            if (typeof handleSubmitSuccess === 'function') {
                // All uploaded check
                const allUploaded = documentTypes.length > 0 && documentTypes.every(doc =>
                    documents[doc.document_id]?.uploaded
                );
                await handleSubmitSuccess({
                    isValidForm: allUploaded,
                    data: applicationData,
                });
            }
        } catch (error) {
            console.error('Error submitting documents:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        submitStepExternally: handleSubmit
    }));

    /** 5. File upload handler */
    const handleFileUpload = (docId: string, file: File, documentId: string) => {
        uploadMutation.mutate({ docId, file, documentId });
    };

    /** 6. Document delete handler */
    const handleDeleteDocument = (_docId: string, fileId: string) => {
        deleteMutation.mutate(fileId);
    };

    // Whether all documents are uploaded (for submit button enable)
    const allDocumentsUploaded = documentTypes.length > 0 && documentTypes.every(doc => documents[doc.document_id]?.uploaded);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-2">Loading documents...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-8 text-red-600">
                Error loading documents: {(error as Error)?.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
                style={{ marginTop: '50px' }}
            />

            <button
                onClick={() => handleBack && handleBack()}
                className="flex items-center text-black hover:text-gray-700 mb-6 transition-colors"
            >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-8">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-8 w-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-black mb-2">Document Verification</h2>
                    <p className="text-gray-600">Upload your documents for quick verification</p>
                </div>

                <div className="space-y-6">
                    {documentTypes.map((docType) => {
                        const status = documents[docType.document_id];
                        const processing = isProcessingDocId === docType.document_id;
                        const uploadedFile = docType.files?.[0];

                        return (
                            <div key={docType.document_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div>
                                            <h4 className="font-medium text-black">{docType.document_name || docType.title}</h4>
                                            <p className="text-sm text-gray-600">{docType.description || docType.title}</p>
                                        </div>
                                    </div>

                                    {status?.verified && (
                                        <CheckCircle className="h-6 w-6 text-black" />
                                    )}
                                </div>

                                {processing
                                    ? (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="animate-spin w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                                                <div>
                                                    <p className="font-medium text-blue-800">Processing Document...</p>
                                                    <p className="text-sm text-blue-600">Extracting and verifying information</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    : !status?.uploaded
                                        ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors">
                                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600 mb-3">Click to upload or drag and drop</p>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(docType.document_id, file, docType.document_id);
                                                    }}
                                                    className="hidden"
                                                    id={`upload-${docType.document_id}`}
                                                />
                                                <label
                                                    htmlFor={`upload-${docType.document_id}`}
                                                    className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                                                >
                                                    Choose File
                                                </label>
                                            </div>
                                        )
                                        : (
                                            <div className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row gap-6">
                                                <div className="md:w-2/3">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <CheckCircle className="h-5 w-5 text-black" />
                                                        <span className="font-medium text-black">Document Verified</span>
                                                    </div>
                                                    {status.extractedData && (
                                                        <div className="text-sm text-gray-700 mb-4 md:mb-0">
                                                            <p>✓ Information extracted and verified successfully</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="md:w-3/3 flex items-center space-x-2">
                                                    {uploadedFile ? (
                                                        <>
                                                            {uploadedFile.url.toLowerCase().endsWith('.pdf') ? (
                                                                <div className="w-32 h-24 flex items-center justify-center bg-white border rounded overflow-hidden relative">
                                                                    <FileText className="h-8 w-8 text-gray-400 mb-1" />
                                                                    <span className="text-xs text-gray-500 text-center truncate w-full">{docType.document_name || 'Document.pdf'}</span>
                                                                </div>
                                                            ) : (
                                                                <a 
                                                                    href={uploadedFile.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="w-32 h-24 flex items-center justify-center bg-white border rounded overflow-hidden hover:border-blue-500 transition-colors"
                                                                >
                                                                    <img
                                                                        src={uploadedFile.url}
                                                                        alt={docType.document_name}
                                                                        className="max-w-full max-h-full object-contain p-1"
                                                                    />
                                                                </a>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                                onClick={() => handleDeleteDocument(docType.document_id, uploadedFile.file_id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}
                            </div>
                        );
                    })}
                </div>

                <div>
                    <button
                        onClick={handleSubmit}
                        disabled={!allDocumentsUploaded || uploadMutation.isPending || deleteMutation.isPending}
                        className="w-full mt-6 bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue to Lender Selection
                    </button>
                </div>
            </div>
        </div>
    );
});

export default DocumentVerification;
