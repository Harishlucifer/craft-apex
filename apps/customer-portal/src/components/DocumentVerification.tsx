import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, CheckCircle, Camera, FileText, Trash2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {useAuthStore} from "@repo/shared-state/stores";
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

interface Document {
    document_type: string;
    id: string;
    type: string;
    files: any;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    url?: string;
    uploaded_at?: string;
    verified_at?: string;
    verify_status: number;
    document_name: string;
    document_id: string;
}

interface DocumentResponse {
    data: any;
    status: number;
    result: Document[];
    message?: string;
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
    console.log("applicationData", applicationData);

    useEffect(() => {
        if (applicationData?.application?.onboarding_id) {
            fetchDocuments();
        }
    }, [applicationData]);

    const handleDeleteDocument = async (docType: string, fileId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this document. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
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
            data: {
              file_id: fileId
            }
          }
        );

        // Update the UI immediately
        setUploadedDocs(prevDocs => 
          prevDocs.map(doc => ({
            ...doc,
            files: doc.files.filter((file: any) => file.id !== fileId)
          })).filter(doc => doc.files.length > 0)
        );

        // Update documents state
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            ...prev[docType],
            uploaded: false,
            verified: false,
            extractedData: null
          }
        }));

        // Show success message
        await Swal.fire({
          title: 'Deleted!',
          text: 'The document has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Still fetch documents to ensure consistency with the server
        await fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the document. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  const fetchDocuments = async () => {
        console.log("fetching documents");
        try {
            const onboardingID = applicationData.application?.onboarding_id;
            if (!onboardingID) return;

            const response = await leadAPI.get<DocumentResponse>(`/alpha/v1/onboarding/${onboardingID}/documents`);
            console.log("Documents response:", response);

            if (response?.result) {
                const updatedDocs = { ...documents };
                const uploadedDocsList: any[] = []; // New array to store uploaded docs

                // Reset all documents to default state first
                Object.keys(updatedDocs).forEach(key => {
                    updatedDocs[key] = { uploaded: false, verified: false };
                });

                // First, map all documents to uploadedDocsList
                response.result.forEach((doc: Document) => {
                    if (doc.files?.length > 0) {
                        uploadedDocsList.push(doc);
                    }
                });

                // Then update the status based on document types
                response.result.forEach((doc: Document) => {
                    // Map API document types to our local state keys
                    let docKey: string | null = null;
                    
                    // Match by document_id first
                    const matchingType = documentTypes.find(type => type.documentId === doc.document_id);
                    if (matchingType) {
                        docKey = matchingType.id;
                    } else {
                        // Fallback to document_type if document_id doesn't match
                        switch(doc.document_type) {
                            case 'AADHAAR_CARD':
                                docKey = 'aadhaar';
                                break;
                            case 'PAN_CARD':
                                docKey = 'pan';
                                break;
                            case 'BANK_STATEMENT':
                            case 'INCOME_PROOF':
                                docKey = 'bank_statement';
                                break;
                            default:
                                return; // Skip unknown document types
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
        }
    };
  const handleFileUpload = async (docType: string, file: File, documentId:string) => {
    setIsProcessing(docType);

    try {
      // Configuration values
      const onboardingID = applicationData.application?.onboarding_id;
      const applicantId = applicationData.primary?.personal?.person_id;
      const checkListItemId = '';
      const applicantCategory = applicationData.primary?.applicant_category;
      const password = '';

      // Create form data
      const formData = new FormData();
      formData.append('document', file);
      formData.append('applicant_id', applicantId);
      formData.append('document_id', documentId);
      formData.append('checklist_item_id', checkListItemId);
      formData.append('applicant_category', applicantCategory);
      formData.append('password', password);

      // API call with axios
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

      // Show success message
      await Swal.fire({
        title: 'Success!',
        text: response.data.message || 'Document uploaded successfully',
        icon: 'success',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Update UI state
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          uploaded: true,
          verified: true,
          extractedData: response.data
        }
      }));

      // Update application data if needed
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

      // After successful upload, refresh the documents
      await fetchDocuments();

    } catch (error) {
      console.error('Error uploading document:', error);
      // Handle error state in your UI
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          uploaded: false,
          verified: false,
          error: 'Failed to upload document. Please try again.'
        }
      }));
    } finally {
      setIsProcessing(null);
    }
  };



  const allDocumentsVerified = documentTypes.every(doc => documents[doc.id]?.verified);

  return (
    <div className="max-w-2xl mx-auto">
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