import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, CheckCircle, Camera, FileText, Trash2 } from 'lucide-react';
import axios from 'axios';
import {Bounce, toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from "@repo/shared-state/stores";
import { LeadAPI } from '../api/LeadAPI';

interface DocumentVerificationProps {
    applicationData: any;
    updateApplicationData: (data: Partial<any>) => void;
    onNext: () => void;
    onBack: () => void;
}

interface DocumentStatus {
    uploaded: boolean;
    verified: boolean;
    extractedData?: any;
}

interface ChecklistItem {
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

interface ApplicantChecklist {
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

interface DocumentResponse {
    checklist: ApplicantChecklist[];
    status: number;
}

const documentTypes = [
    {
        id: 'aadhaar',
        name: 'Aadhaar Card',
        description: 'Front side of your Aadhaar card',
        icon: FileText,
        required: true,
        documentId: '2',
    },
    {
        id: 'pan',
        name: 'PAN Card',
        description: 'Clear image of your PAN card',
        icon: FileText,
        required: true,
        documentId: '1'
    },
    {
        id: 'bank_statement',
        name: 'Income Proof',
        description: 'Latest salary slip or ITR',
        icon: FileText,
        required: true,
        documentId: '25'
    }
];

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
                                                                              applicationData,
                                                                              updateApplicationData,
                                                                              onNext,
                                                                              onBack
                                                                          }) => {
    const [documents, setDocuments] = useState<Record<string, DocumentStatus>>({
        aadhaar: { uploaded: false, verified: false },
        pan: { uploaded: false, verified: false },
        income: { uploaded: false, verified: false }
    });
    const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState({
        aadhaarNumber: '',
        residenceAddress: '',
        verifiedPAN: '',
        verifiedDOB: ''
    });

    const apiUrl = import.meta.env.VITE_API_ENDPOINT;
    const accessToken = useAuthStore.getState().user?.access_token;
    const leadAPI = new LeadAPI();

    useEffect(() => {
        if (applicationData?.application?.onboarding_id) {
            fetchDocuments();
        }
    }, [applicationData]);

    const handleDeleteDocument = async (docType: string, fileId: string) => {
        try {
            const onboardingID = applicationData.application?.onboarding_id;
            if (!onboardingID) return;

            await axios.delete(
                `${apiUrl}/alpha/v1/application`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    data: { file_id: fileId }
                }
            );

            setUploadedDocs(prevDocs =>
                prevDocs.map(doc => ({
                    ...doc,
                    files: doc.files.filter((file: any) => file.id !== fileId)
                })).filter(doc => doc.files.length > 0)
            );

            setDocuments(prev => ({
                ...prev,
                [docType]: { uploaded: false, verified: false, extractedData: null }
            }));

            toast.success("Document deleted successfully!");
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error("Failed to delete the document. Please try again.");
        }
    };

    const fetchDocuments = async () => {
        try {
            const onboardingID = applicationData.application?.onboarding_id;
            if (!onboardingID) return;

            const response = await leadAPI.get<DocumentResponse>(
                `/alpha/v1/onboarding/${onboardingID}/checklist`
            );

            if (response?.checklist?.[0]?.checklists) {
                const updatedDocs = { ...documents };
                const uploadedDocsList: any[] = [];

                Object.keys(updatedDocs).forEach(key => {
                    updatedDocs[key] = { uploaded: false, verified: false };
                });

                response.checklist[0].checklists.forEach(checklist => {
                    if (checklist.required) {
                        checklist.required.forEach(doc => {
                            if (doc.files && doc.files.length > 0) {
                                uploadedDocsList.push({ ...doc });
                            }
                        });
                    }
                });

                uploadedDocsList.forEach(doc => {
                    let docKey: string | null = null;
                    const matchingType = documentTypes.find(type => type.documentId === doc.document_id);
                    if (matchingType) {
                        docKey = matchingType.id;
                    } else {
                        switch (doc.document_type) {
                            case 'AADHAAR_CARD': docKey = 'aadhaar'; break;
                            case 'PAN_CARD': docKey = 'pan'; break;
                            case 'BANK_STATEMENT':
                            case 'INCOME_PROOF':
                            case 'CANCELLED_CHEQUE': docKey = 'bank_statement'; break;
                            case 'GST_CERTIFICATE': docKey = 'gst_certificate'; break;
                            default: return;
                        }
                    }
                    if (docKey) {
                        updatedDocs[docKey] = {
                            uploaded: doc.files?.length > 0,
                            verified: doc.verify_status === 1,
                            extractedData: doc
                        };
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

    const handleFileUpload = async (docType: string, file: File, documentId: string) => {
        setIsProcessing(docType);

        try {
            const onboardingID = applicationData.application?.onboarding_id;
            const applicantId = applicationData.primary?.personal?.person_id;
            const checkListItemId = '';
            const applicantCategory = applicationData.primary?.applicant_category;
            const password = '';

            const formData = new FormData();
            formData.append('document', file);
            formData.append('applicant_id', applicantId);
            formData.append('document_id', documentId);
            formData.append('checklist_item_id', checkListItemId);
            formData.append('applicant_category', applicantCategory);
            formData.append('password', password);

            const response = await axios.post(
                `${apiUrl}/alpha/v1/onboarding/${onboardingID}/document`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            toast.success(response.data.message || "Document uploaded successfully");


            setDocuments(prev => ({
                ...prev,
                [docType]: { uploaded: true, verified: true, extractedData: response.data }
            }));

            if (response.data.aadhaarNumber || response.data.residenceAddress) {
                setExtractedData(prev => ({
                    ...prev,
                    aadhaarNumber: response.data.aadhaarNumber || prev.aadhaarNumber,
                    residenceAddress: response.data.residenceAddress || prev.residenceAddress
                }));
                updateApplicationData({
                    aadhaarNumber: response.data.aadhaarNumber,
                    residenceAddress: response.data.residenceAddress
                });
            }

            await fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error("Failed to upload document. Please try again.");
            setDocuments(prev => ({
                ...prev,
                [docType]: { uploaded: false, verified: false, error: 'Upload failed' }
            }));
        } finally {
            setIsProcessing(null);
        }
    };

  const allDocumentsVerified = documentTypes.every(doc => documents[doc.id]?.verified);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ToastContainer
        position="top-right"
        autoClose={2500}
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

        {/* Extracted Data Display */}
        {extractedData.aadhaarNumber && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-black mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Verified Information
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>`    1
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
            const status = documents[docType.id];
            const processing = isProcessing === docType.id;

            return (
              <div key={docType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${status?.verified ? 'bg-gray-100' : 'bg-gray-100'}`}>
                      <docType.icon className={`h-5 w-5 ${status?.verified ? 'text-black' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-black">
                        {docType.name}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-sm text-gray-600">{docType.description}</p>
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
                        if (file) handleFileUpload(docType.id, file, docType.documentId);
                      }}
                      className="hidden"
                      id={`upload-${docType.id}`}
                    />
                    <label
                      htmlFor={`upload-${docType.id}`}
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
                          // Find document by matching document_id
                          const docToShow = uploadedDocs.find(doc =>
                            doc.document_id === docType.documentId
                          );
                          // If document is found, render it
                          if (docToShow) {
                            return (
                                <div className="flex items-center space-x-2">
                                    <div key={docToShow.document_id} className="relative group">
                                        <img
                                            src={docToShow.files[0].url}
                                            alt={docToShow.document_name}
                                            className="w-full h-20 object-contain border rounded bg-white p-2"
                                        />
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
                                            onClick={() => handleDeleteDocument(docType.id, docToShow.files[0].file_id)}
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

        {allDocumentsVerified && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-black" />
              <div>
                <h4 className="font-medium text-black">All Documents Verified!</h4>
                <p className="text-sm text-gray-700">You can now proceed to select your preferred lender.</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={!allDocumentsVerified}
          className="w-full mt-6 bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Lender Selection
        </button>
      </div>
    </div>
  );
};