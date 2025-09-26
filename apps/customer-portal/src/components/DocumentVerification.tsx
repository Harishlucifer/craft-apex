import React, { useState } from 'react';
import { ChevronLeft, Upload, CheckCircle, AlertCircle, Camera, FileText } from 'lucide-react';

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

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState({
    aadhaarNumber: '',
    residenceAddress: '',
    verifiedPAN: '',
    verifiedDOB: ''
  });

  const handleFileUpload = (docType: string, file: File) => {
    setIsProcessing(docType);
    
    // Simulate OCR processing
    setTimeout(() => {
      const mockData = {
        aadhaar: {
          aadhaarNumber: '1234 5678 9012',
          residenceAddress: 'Sample Address, Bangalore, Karnataka - 560001'
        },
        pan: {
          verifiedPAN: applicationData.panNumber,
          verifiedDOB: applicationData.dob
        },
        income: {
          monthlyIncome: '₹45,000',
          employer: 'Sample Company Ltd'
        }
      };

      setDocuments(prev => ({
        ...prev,
        [docType]: { uploaded: true, verified: true, extractedData: mockData[docType as keyof typeof mockData] }
      }));

      if (docType === 'aadhaar') {
        setExtractedData(prev => ({
          ...prev,
          aadhaarNumber: '1234 5678 9012',
          residenceAddress: 'Sample Address, Bangalore, Karnataka - 560001'
        }));
        updateApplicationData({
          aadhaarNumber: '1234 5678 9012',
          residenceAddress: 'Sample Address, Bangalore, Karnataka - 560001'
        });
      }

      setIsProcessing(null);
    }, 2000);
  };

  const documentTypes = [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      description: 'Front side of your Aadhaar card',
      icon: FileText,
      required: true
    },
    {
      id: 'pan',
      name: 'PAN Card',
      description: 'Clear image of your PAN card',
      icon: FileText,
      required: true
    },
    {
      id: 'income',
      name: 'Income Proof',
      description: 'Latest salary slip or ITR',
      icon: FileText,
      required: true
    }
  ];

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
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(docType.id, file);
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
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-black" />
                      <span className="font-medium text-black">Document Verified</span>
                    </div>
                    {status.extractedData && (
                      <div className="mt-2 text-sm text-gray-700">
                        <p>✓ Information extracted and verified successfully</p>
                      </div>
                    )}
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