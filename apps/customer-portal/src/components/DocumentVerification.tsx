import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ChecklistAPI } from '@repo/shared-state/api';
import { ChevronLeft, Upload, CheckCircle, Camera, FileText, Trash2 } from 'lucide-react';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    const { data: applicationData = {}, onBack, handleSubmitSuccess } = props;
    const formRef = useRef<HTMLDivElement>(null);
    const [documents, setDocuments] = useState<Record<string, DocumentStatus>>({});
    const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
    const [documentTypes, setDocumentTypes] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState({
        aadhaarNumber: '',
        residenceAddress: '',
        verifiedPAN: '',
        verifiedDOB: ''
    });

    useEffect(() => {
        if (applicationData?.application?.onboarding_id) {
            fetchDocuments();
        }
    }, [applicationData]);

    const handleSubmit = async () => {
        try {
            if (typeof handleSubmitSuccess === 'function') {
                await handleSubmitSuccess({
                    isValidForm: allDocumentsUploaded,
                    data: applicationData
                });
            }
        } catch (error) {
            console.error('Error submitting documents:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        submitStepExternally: handleSubmit
    }));

    //
    // const handleSubmitSuccess = (data: any) => {
    // };

    // Helper to get icon by document type
    const getIconForDocumentType = (type: string) => {
        switch (type) {
            case 'AADHAAR_CARD':
                return FileText;
            case 'PAN_CARD':
                return FileText;
            case 'INCOME_PROOF':
                return FileText;
            default:
                return FileText;
        }
    };

    const fetchDocuments = async () => {
        try {
            const onboardingID = applicationData.application?.onboarding_id;
            if (!onboardingID) {
                console.error('No onboarding ID found in application data');
                return;
            }

            const response = await ChecklistAPI.getInstance().fetchDocuments(onboardingID);

            if (!response) {
                console.error('No response received from fetchDocuments');
                return;
            }

            if (!response.checklist || !Array.isArray(response.checklist)) {
                console.error('Invalid response format - checklist is missing or not an array:', response);
                return;
            }

            console.log('Response checklist:', response.checklist);

            if (response.checklist.length > 0) {
                // Flatten all required documents from checklist
                const allDocs: any[] = [];
                response.checklist[0]?.checklists?.forEach(checklist => {
                    if (checklist.required) {
                        checklist?.required?.forEach(doc => {
                            allDocs.push({
                                ...doc,
                                title: checklist.title
                            });
                        });
                    }
                });

                setDocumentTypes(allDocs);

                const updatedDocs: Record<string, DocumentStatus> = {};
                allDocs.forEach(doc => {
                    updatedDocs[doc.document_id] = { uploaded: false, verified: false };
                });

                // Keep track of uploaded docs for preview
                const uploadedDocsList: any[] = [];

                // Process uploaded documents from response and update status
                allDocs.forEach(doc => {
                    if (doc.files && doc.files.length > 0) {
                        updatedDocs[doc.document_id] = {
                            uploaded: true,
                            verified: doc.verify_status === 1,
                            extractedData: doc
                        };
                        uploadedDocsList.push({ ...doc });
                    }
                });

                setDocuments(updatedDocs);
                setUploadedDocs(uploadedDocsList);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error("Failed to fetch documents.");
        }
    };

    const handleDeleteDocument = async (docId: string, fileId: string) => {
        try {
            await ChecklistAPI.getInstance().deleteDocument(fileId);

            setUploadedDocs(prevDocs =>
                prevDocs.map(doc => ({
                    ...doc,
                    files: doc.files.filter((file: any) => file.id !== fileId)
                })).filter(doc => doc.files.length > 0)
            );

            setDocuments(prev => ({
                ...prev,
                [docId]: { uploaded: false, verified: false, extractedData: null }
            }));

            toast.success("Document deleted successfully!");
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error("Failed to delete the document. Please try again.");
        }
    };

    const handleFileUpload = async (docId: string, file: File, documentId: string) => {
        setIsProcessing(docId);

        try {
            const onboardingID = applicationData.application?.onboarding_id;
            const applicantId = applicationData.primary?.personal?.person_id;
            const applicantCategory = applicationData.primary?.applicant_category;
            const password = '';
            
            const response = await ChecklistAPI.getInstance().uploadDocument(
                onboardingID,
                file,
                applicantId,
                documentId,
                applicantCategory,
                password || '',
            );
            
            if (response?.status === 1) {
                toast.success(response.message || "Document uploaded successfully");
                
                // Refresh the documents list to show the newly uploaded document
                await fetchDocuments();
                
                // Update the document status
                setDocuments(prev => ({
                    ...prev,
                    [docId]: {
                        ...prev[docId],
                        uploaded: true,
                        verified: response.verify_status === 1,
                        extractedData: response.extracted_value || {}
                    }
                }));
            } else {
                throw new Error(response?.message || 'Failed to upload document');
            }

            // Extract aadhaar data if present from the response
            const extractedVals = response?.extracted_value || {};
            if (extractedVals.aadhaarNumber || extractedVals.residenceAddress) {
                setExtractedData(prev => ({
                    ...prev,
                    aadhaarNumber: extractedVals.aadhaarNumber || prev.aadhaarNumber,
                    residenceAddress: extractedVals.residenceAddress || prev.residenceAddress
                }));
                // updateApplicationData({
                //     aadhaarNumber: extractedVals.aadhaarNumber,
                //     residenceAddress: extractedVals.residenceAddress
                // });
            }

            await fetchDocuments();
        } catch (error) {
            console.error('Error uploading document');
            toast.error("Failed to upload document. Please try again.");
            setDocuments(prev => ({
                ...prev,
                [docId]: { uploaded: false, verified: false, error: 'Upload failed' }
            }));
        } finally {
            setIsProcessing(null);
        }
    };

    // Check if all required documents are uploaded and verified
    const allDocumentsUploaded = documentTypes.length > 0 && documentTypes.every(doc => documents[doc.document_id]?.uploaded);
    // const allDocumentsVerified = documentTypes.length > 0 && documentTypes.every(doc => documents[doc.document_id]?.verified);

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
                onClick={onBack}
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

                {extractedData.aadhaarNumber && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-black mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Verified Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Aadhaar Number:</span>
                                <span className="ml-2 font-medium">{extractedData.aadhaarNumber}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Address Verified:</span>
                                <span className="ml-2 text-black">✓ Matches</span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-gray-600">Address:</span>
                            <span className="ml-2 font-medium">{extractedData.residenceAddress}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {documentTypes.map((docType) => {
                        const status = documents[docType.document_id];
                        const processing = isProcessing === docType.document_id;
                        const IconComponent = getIconForDocumentType(docType.document_type);

                        return (
                            <div key={docType.document_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-gray-100`}>
                                            <IconComponent className={`h-5 w-5 ${status?.verified ? 'text-black' : 'text-gray-600'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-black">
                                                {docType.document_name || docType.title}
                                                {/* Required mark can be based on your logic if needed */}
                                            </h4>
                                            <p className="text-sm text-gray-600">{docType.description || docType.title}</p>
                                        </div>
                                    </div>

                                    {status?.verified && (
                                        <CheckCircle className="h-6 w-6 text-black" />
                                    )}
                                </div>

                                {processing ? (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="animate-spin w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
                                            <div>
                                                <p className="font-medium text-blue-800">Processing Document...</p>
                                                <p className="text-sm text-blue-600">Extracting and verifying information</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : !status?.uploaded ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-3">
                                            Click to upload or drag and drop
                                        </p>
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
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Verification Status Section */}
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

                                            {/* Document Preview Section */}
                                            <div className="md:w-3/3">
                                                {(() => {
                                                    const docToShow = uploadedDocs.find(doc =>
                                                        doc.document_id === docType.document_id
                                                    );
                                                    if (docToShow && docToShow.files?.length) {
                                                        return (
                                                            <div className="flex items-center space-x-2">
                                                                <div key={docToShow.document_id} className="relative group">
                                                                    <div className="w-32 h-24 flex items-center justify-center bg-white border rounded overflow-hidden relative">
                                                                        {docToShow.files[0].url.toLowerCase().endsWith('.pdf') ? (
                                                                            <div className="w-full h-full flex items-center justify-center flex-col p-2">
                                                                                <FileText className="h-8 w-8 text-gray-400 mb-1" />
                                                                                <span className="text-xs text-gray-500 text-center truncate w-full">
                                                                                    {docToShow.document_name || 'Document.pdf'}
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <img
                                                                                src={docToShow.files[0].url}
                                                                                alt={docToShow.document_name}
                                                                                className="max-w-full max-h-full object-contain"
                                                                                onError={(e) => {
                                                                                    const target = e.target as HTMLImageElement;
                                                                                    target.style.display = 'none';
                                                                                    const container = target.parentElement;
                                                                                    if (container) {
                                                                                        const fallback = document.createElement('div');
                                                                                        fallback.className = 'w-full h-full flex items-center justify-center flex-col p-2';
                                                                                        fallback.innerHTML = `
                                                                                            <svg class="h-8 w-8 text-gray-400 mb-1" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                            </svg>
                                                                                            <span class="text-xs text-gray-500 text-center truncate w-full">
                                                                                                 Preview
                                                                                            </span>
                                                                                        `;
                                                                                        container.appendChild(fallback);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <a
                                                                            href={docToShow.files[0].url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-white bg-black bg-opacity-70 px-1 py-1 rounded"
                                                                        >
                                                                            View Full Size
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <button
                                                                        type="button"
                                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                                        onClick={() => handleDeleteDocument(docType.document_id, docToShow.files[0].file_id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/*{allDocumentsVerified && (*/}
                {/*    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">*/}
                {/*        <div className="flex items-center space-x-3">*/}
                {/*            <CheckCircle className="h-6 w-6 text-black" />*/}
                {/*            <div>*/}
                {/*                <h4 className="font-medium text-black">All Documents Verified!</h4>*/}
                {/*                <p className="text-sm text-gray-700">You can now proceed to select your preferred lender.</p>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}

                <div ref={formRef}>
                    <button
                        onClick={handleSubmit}
                        disabled={!allDocumentsUploaded}
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