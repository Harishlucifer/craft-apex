import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, Phone, Mail, Home } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { LenderOfferAPI } from '@repo/shared-state/api';
import { useEnvironmentStore } from '@repo/shared-state/config';

// Interfaces for lender data
interface ComputedOffer {
  computed_offer_id: string;
  formula_type: string;
  formula_value: number;
  min_tenure: number;
  max_tenure: number;
  tenure: number;
  emi_amount: number;
  interest_rate: number;
  min_loan_amount: number;
  max_loan_amount: number;
  offer_loan_amount: number;
  down_payment: number;
  computed_by: string;
  offer_type: string;
}

interface SchemeDetail {
  lender_scheme_id: string;
  code: string;
  name: string;
  loan_type_id: string;
  loan_type_name: string;
  sub_loan_type_id: string;
  sub_loan_type_name: string;
  lender_id: string;
  lender_name: string;
  emi_date: number;
  cutoff_date: number;
  min_loan_amount: number;
  max_loan_amount: number;
  min_tenure: number;
  max_tenure: number;
  min_rate_of_interest: number;
  max_rate_of_interest: number;
  interest_type: string;
  terms_and_condition: string;
  sequence: number;
  configuration: any;
  status: number;
  created_at: string;
}

interface LenderScheme {
  lender_scheme_id: string;
  lender_id: string;
  code: string;
  name: string;
  computed_offer: ComputedOffer[];
  scheme_detail: SchemeDetail;
  sequence: number;
  scheme_applicable: boolean;
  documents_required: boolean;
  journey_type: string;
}

interface Lender {
  lender_id: string;
  lender_name: string;
  lender_code: string;
  lender_logo: string;
  loan_type_id: string;
  lender_apply_id: string | null;
  sequence: number;
  lender_scheme: LenderScheme[];
  lender_applicable: boolean;
  lender_apply_status: string;
  rejected_reason: string | null;
  computed_offer: ComputedOffer[];
}

interface RecommendedOffersResponse {
  lender: Lender[];
  viable: {
    applicable: boolean;
    executed_rule: any | null;
  };
}

interface ApplicationStatusProps {
  applicationData:any;
  onBack: () => void;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  applicationData,
  onBack
}) => {
  const [sanctionGenerated, setSanctionGenerated] = useState(false);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);

  const offerAPI = LenderOfferAPI.getInstance();
  const isEnvReady = useEnvironmentStore((s) => s.isInitialized);
  const { id } = useParams();
  
  // Extract applicationId using the same pattern as other components
  const applicationId = id || applicationData?.application?.application_id || applicationData?.applicationId;

  // Fetch recommended lenders and filter for selected ones
  const { data: offerResult, isLoading: isOfferLoading } = useQuery({
    queryKey: ['eligibleOffers', applicationId],
    queryFn: async () => {
      const response = await offerAPI.fetchEligibleOffers(applicationId, 'V1');
      return response.result;
    },
    enabled: isEnvReady && !!applicationId,
  });

  useEffect(() => {
    if (offerResult) {
      const offersData = offerResult as RecommendedOffersResponse;
      // Filter for lenders with "Selected" status
      const selectedLenders = offersData.lender?.filter(
        lender => lender.lender_apply_status === "Selected"
      );
      
      if (selectedLenders && selectedLenders.length > 0) {
        setSelectedLender(selectedLenders[0] || null); // Take the first selected lender
      } else {
        setSelectedLender(null);
      }
    }
  }, [offerResult]);

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
            Your loan application has been approved by {selectedLender?.lender_name || applicationData.selectedLender?.name || 'the selected lender'}
          </p>
          {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-black">
              Application ID: <span className="font-bold">{applicationData.applicationId}</span>
            </p>
          </div> */}
        </div>
      </div>

      {/* Loan Details Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-black mb-4">Loan Details</h3>
        {isOfferLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="flex space-x-2">
              <span className="w-4 h-4 bg-black rounded-full animate-bounce"></span>
              <span className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-4 h-4 bg-black rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        ) : selectedLender ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Lender:</span>
                <span className="font-semibold">{selectedLender.lender_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Loan Amount:</span>
                <span className="font-semibold text-black">
                  ₹{selectedLender.lender_scheme?.[0]?.scheme_detail?.max_loan_amount?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Interest Rate:</span>
                <span className="font-semibold">
                  {selectedLender.lender_scheme?.[0]?.scheme_detail?.min_rate_of_interest || 'N/A'}% p.a.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Tenure:</span>
                <span className="font-semibold">
                  {selectedLender.lender_scheme?.[0]?.scheme_detail?.max_tenure || 'N/A'} months
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly EMI:</span>
                <span className="font-semibold text-black">
                  ₹{selectedLender.computed_offer?.find(o => o.formula_type === "FINAL_OFFER")?.emi_amount?.toLocaleString() || '3585'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Type:</span>
                <span className="font-semibold">
                  {selectedLender.lender_scheme?.[0]?.scheme_detail?.interest_type || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">{selectedLender.lender_apply_status}</span>
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
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No selected lender found. Please check your application status.</p>
          </div>
        )}
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