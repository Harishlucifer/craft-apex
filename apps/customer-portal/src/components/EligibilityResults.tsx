import React from 'react';
import { ChevronLeft, CheckCircle, Star, TrendingUp, Clock, Shield } from 'lucide-react';

interface EligibilityResultsProps {
  applicationData: any;
  onNext: () => void;
  onBack: () => void;
}

interface LenderOffer {
  id: string;
  name: string;
  logo: string;
  maxAmount: number;
  interestRate: number;
  tenure: number;
  processingFee: string;
  emi: number;
  features: string[];
  rating: number;
  approved: boolean;
}

export const EligibilityResults: React.FC<EligibilityResultsProps> = ({
  applicationData,
  onNext,
  onBack
}) => {
  // Mock lender data based on application
  const lenders: LenderOffer[] = [
    {
      id: 'hdfc',
      name: 'HDFC Bank',
      logo: '🏦',
      maxAmount: 150000,
      interestRate: 8.5,
      tenure: 60,
      processingFee: '1%',
      emi: 3041,
      features: ['Quick Approval', 'Zero Foreclosure Charges', 'Digital Process'],
      rating: 4.5,
      approved: true
    },
    {
      id: 'icici',
      name: 'ICICI Bank',
      logo: '🏛️',
      maxAmount: 140000,
      interestRate: 8.75,
      tenure: 60,
      processingFee: '0.5%',
      emi: 2895,
      features: ['Instant Approval', 'Flexible EMI Options', 'Online Account'],
      rating: 4.3,
      approved: true
    },
    {
      id: 'bajaj',
      name: 'Bajaj Finserv',
      logo: '💰',
      maxAmount: 135000,
      interestRate: 9.25,
      tenure: 48,
      processingFee: '2%',
      emi: 3421,
      features: ['No Documentation', 'Quick Disbursal', '24x7 Support'],
      rating: 4.2,
      approved: true
    },
    {
      id: 'tata',
      name: 'Tata Capital',
      logo: '🚗',
      maxAmount: 125000,
      interestRate: 9.5,
      tenure: 48,
      processingFee: '1.5%',
      emi: 3187,
      features: ['EV Specialist', 'Green Loan Benefits', 'Extended Warranty'],
      rating: 4.1,
      approved: true
    }
  ];

  const creditScore = 742; // Mock credit score

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-black hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </button>

      <div className="mb-8">
        {/* Credit Score Card */}
        <div className="bg-black text-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Credit Score</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">{creditScore}</span>
                <span className="text-gray-300">/ 900</span>
              </div>
              <p className="text-gray-200 text-sm mt-1">Excellent Credit Profile</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Eligibility Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Great News!</h2>
            <p className="text-gray-600">You're eligible for loans from {lenders.length} lenders</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-black">₹{Math.max(...lenders.map(l => l.maxAmount)).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Max Loan Amount</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-black">{Math.min(...lenders.map(l => l.interestRate))}%</div>
              <div className="text-sm text-gray-600">Best Interest Rate</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-black">₹{Math.min(...lenders.map(l => l.emi)).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Lowest EMI</div>
            </div>
          </div>
        </div>

        {/* Lender Cards */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-black mb-4">Available Loan Offers</h3>
          {lenders.map((lender) => (
            <div key={lender.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{lender.logo}</div>
                  <div>
                    <h4 className="text-lg font-bold text-black">{lender.name}</h4>
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(lender.rating) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({lender.rating})</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-black">✓ Approved</span>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-black">₹{lender.maxAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Max Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-black">{lender.interestRate}%</div>
                  <div className="text-sm text-gray-600">Interest Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-black">₹{lender.emi.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly EMI</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-black">{lender.tenure} months</div>
                  <div className="text-sm text-gray-600">Max Tenure</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {lender.features.map((feature, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Processing Fee: {lender.processingFee}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Quick Approval</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Next Steps</h4>
              <p className="text-sm text-yellow-700 mt-1">
                To proceed with any lender, we'll need to verify your documents and collect additional information as required by each lender.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full mt-6 bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
        >
          Continue to Document Verification
        </button>
      </div>
    </div>
  );
};