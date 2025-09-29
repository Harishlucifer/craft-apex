import React, { useState } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, Phone, Mail, Home } from 'lucide-react';


interface ApplicationStatusProps {
  applicationData:any;
  onBack: () => void;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  applicationData,
  onBack
}) => {
  const [sanctionGenerated, setSanctionGenerated] = useState(false);

  const handleGenerateSanction = () => {
    setSanctionGenerated(true);
  };

  const handleDownloadSanction = async () => {
    try {
      // Resolve PDF from bundled assets (Vite will handle the correct URL)
      const pdfUrl = new URL('../assets/pdf/sanction_letter.pdf', import.meta.url).href;
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Sanction_Letter_${applicationData.applicationId}.pdf`;;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download the document. Please try again.');
    }
  };

  const disbursementSteps = [
    {
      title: 'Application Submitted',
      status: 'completed',
      description: 'Your loan application has been successfully submitted'
    },
    {
      title: 'Document Verification',
      status: 'completed',
      description: 'All documents verified and approved'
    },
    {
      title: 'Sanction Letter Generated',
      status: sanctionGenerated ? 'completed' : 'pending',
      description: 'Loan sanctioned and letter generated for download'
    },
    {
      title: 'Awaiting Disbursal',
      status: sanctionGenerated ? 'current' : 'pending',
      description: 'Funds will be disbursed to dealer account upon vehicle delivery'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Congratulations!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Your loan application has been approved by {applicationData.selectedLender?.name}
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-black">
              Application ID: <span className="font-bold">{applicationData.applicationId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Loan Details Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-black mb-4">Loan Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Lender:</span>
              <span className="font-semibold">{applicationData.selectedLender?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved Amount:</span>
              <span className="font-semibold text-black">₹{applicationData.selectedLender?.finalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-semibold">{applicationData.selectedLender?.interestRate}% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tenure:</span>
              <span className="font-semibold">{applicationData.selectedLender?.tenure} months</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly EMI:</span>
              <span className="font-semibold text-black">₹{applicationData.selectedLender?.finalEmi?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="font-semibold">{applicationData.selectedLender?.processingFee}</span>
            </div>
            {applicationData.bookingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Number:</span>
                <span className="font-semibold">{applicationData.bookingNumber}</span>
              </div>
            )}
            {applicationData.bookingAmount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Amount:</span>
                <span className="font-semibold">₹{applicationData.bookingAmount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sanction Letter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-black mb-4">Sanction Letter</h3>
        
        {!sanctionGenerated ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-black" />
            </div>
            <h4 className="text-lg font-semibold text-black mb-2">Generate Sanction Letter</h4>
            <p className="text-gray-600 mb-6">
              Your loan has been approved. Generate and download your official sanction letter.
            </p>
            <button
              onClick={handleGenerateSanction}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              Generate Sanction Letter
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-black" />
            </div>
            <h4 className="text-lg font-semibold text-black mb-2">Sanction Letter Ready!</h4>
            <p className="text-gray-600 mb-6">
              Your official sanction letter has been generated and is ready for download.
            </p>
            <button
              onClick={handleDownloadSanction}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Download className="h-5 w-5" />
              <span>Download Sanction Letter</span>
            </button>
          </div>
        )}
      </div>

      {/* Disbursement Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-black mb-6">Disbursement Status</h3>
        
        <div className="space-y-4">
          {disbursementSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                step.status === 'completed' ? 'bg-gray-100' :
                step.status === 'current' ? 'bg-gray-100' :
                'bg-gray-100'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-black" />
                ) : step.status === 'current' ? (
                  <Clock className="h-5 w-5 text-black" />
                ) : (
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  step.status === 'completed' ? 'text-black' :
                  step.status === 'current' ? 'text-black' :
                  'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {sanctionGenerated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Next Steps</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your loan amount will be directly disbursed to the Ather dealer upon vehicle delivery. 
                  Please coordinate with your dealer for the final handover process.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-black mb-4">Need Help?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Phone className="h-8 w-8 text-black mx-auto mb-2" />
            <h4 className="font-semibold text-black mb-1">Call Support</h4>
            <p className="text-sm text-gray-600">1800-XXX-XXXX</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Mail className="h-8 w-8 text-black mx-auto mb-2" />
            <h4 className="font-semibold text-black mb-1">Email Us</h4>
            <p className="text-sm text-gray-600">loans@ather.energy</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Home className="h-8 w-8 text-black mx-auto mb-2" />
            <h4 className="font-semibold text-black mb-1">Visit Store</h4>
            <p className="text-sm text-gray-600">Find nearest Ather Space</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Start New Application
        </button>
      </div>
    </div>
  );
};