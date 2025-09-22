import React, { useState } from 'react';
import { ChevronLeft, Star, TrendingUp, DollarSign, Clock, FileText, CheckCircle, Minus, Plus } from 'lucide-react';

interface LenderSelectionProps {
  applicationData: any;
  updateApplicationData: (data: Partial<any>) => void;
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
  specialOffer?: string;
  finalAmount?: number;
  finalEmi?: number;
}

export const LenderSelection: React.FC<LenderSelectionProps> = ({
  applicationData,
  updateApplicationData,
  onNext,
  onBack
}) => {
  const [selectedLender, setSelectedLender] = useState<string | null>(null);
  const [offers, setOffers] = useState<Record<string, LenderOffer>>({});
  const [loadingOffer, setLoadingOffer] = useState<string | null>(null);
  const [bookingAmount, setBookingAmount] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [downPayment, setDownPayment] = useState(50000);
  const [vehiclePrice] = useState(150000); // Mock vehicle price

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
      features: ['Quick Approval', 'Zero Foreclosure', 'Digital Process'],
      rating: 4.5,
      specialOffer: '0% Processing Fee for EV Loans'
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
      features: ['Instant Approval', 'Flexible EMI', 'Online Account'],
      rating: 4.3,
      specialOffer: 'Get 0.25% rate reduction on EV loans'
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
      rating: 4.2
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
      features: ['EV Specialist', 'Green Benefits', 'Extended Warranty'],
      rating: 4.1,
      specialOffer: 'Special EV financing with green benefits'
    }
  ];

  const handleApplyWithLender = (lenderId: string) => {
    setLoadingOffer(lenderId);
    
    // Simulate API call to get final offer
    setTimeout(() => {
      const lender = lenders.find(l => l.id === lenderId);
      if (lender) {
        const finalOffer = {
          ...lender,
          finalAmount: lender.maxAmount * 0.9, // 90% of max amount
          finalEmi: lender.emi * 0.95 // 5% discount on EMI
        };
        
        setOffers(prev => ({ ...prev, [lenderId]: finalOffer }));
      }
      setLoadingOffer(null);
    }, 2000);
  };

  const handleSelectLender = (lenderId: string) => {
    setSelectedLender(lenderId);
    const lender = lenders.find(l => l.id === lenderId);
    updateApplicationData({ selectedLender: lender });
  };

  const handleProceed = () => {
    updateApplicationData({ 
      bookingAmount, 
      bookingNumber,
      applicationId: `AL${Date.now().toString().slice(-6)}`
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-black hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Select Your Preferred Lender</h2>
        <p className="text-gray-600">Click "Apply" to get personalized offer from each lender</p>
      </div>

      {/* Down Payment Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-black mb-4">Down Payment Selection</h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Down Payment</span>
            <span className="text-lg font-bold text-black">₹{downPayment.toLocaleString()}</span>
          </div>
          
          {/* Slider */}
          <div className="relative mb-4">
            <input
              type="range"
              min="0"
              max={vehiclePrice}
              step="5000"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #000 0%, #000 ${(downPayment / vehiclePrice) * 100}%, #e5e7eb ${(downPayment / vehiclePrice) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹0</span>
              <span>₹{vehiclePrice.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Quick Selection Buttons */}
          <div className="flex space-x-2 mb-4">
            {[0, 25000, 50000, 75000, 100000].map((amount) => (
              <button
                key={amount}
                onClick={() => setDownPayment(amount)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  downPayment === amount
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {amount === 0 ? 'No Down Payment' : `₹${(amount / 1000)}k`}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Vehicle Price:</span>
              <span className="font-medium">₹{vehiclePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Down Payment:</span>
              <span className="font-medium">₹{downPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
              <span className="text-black">Your Loan Amount:</span>
              <span className="text-black">₹{(vehiclePrice - downPayment).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {lenders.map((lender) => {
          const isLoading = loadingOffer === lender.id;
          const hasOffer = offers[lender.id];
          const isSelected = selectedLender === lender.id;
          const adjustedLoanAmount = vehiclePrice - downPayment;
          const adjustedEmi = Math.round((adjustedLoanAmount / vehiclePrice) * (hasOffer?.finalEmi || lender.emi));

          return (
            <div key={lender.id} className={`bg-white rounded-xl shadow-lg p-6 transition-all ${isSelected ? 'ring-2 ring-black' : ''}`}>
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
                
                {!hasOffer && !isLoading && (
                  <button
                    onClick={() => handleApplyWithLender(lender.id)}
                    className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </button>
                )}
              </div>

              {lender.specialOffer && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-orange-800">🎯 {lender.specialOffer}</p>
                </div>
              )}

              {isLoading && (
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3"></div>
                  <p className="font-medium text-blue-800">Generating Your Personalized Offer...</p>
                  <p className="text-sm text-blue-600">This may take a few moments</p>
                </div>
              )}

              {hasOffer && (
                <div className="border-t pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h5 className="font-bold text-black mb-2 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Your Personalized Offer
                    </h5>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-black">₹{adjustedLoanAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Approved Amount</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-black">{hasOffer.interestRate}%</div>
                        <div className="text-sm text-gray-600">Interest Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-black">₹{adjustedEmi.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Monthly EMI</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p>Processing Fee: {hasOffer.processingFee} | Tenure: {hasOffer.tenure} months</p>
                    </div>
                    <button
                      onClick={() => handleSelectLender(lender.id)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        isSelected 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select This Offer'}
                    </button>
                  </div>
                </div>
              )}

              {!hasOffer && !isLoading && (
                <div className="grid md:grid-cols-4 gap-4 text-center text-sm text-gray-600">
                  <div>
                    <div className="font-semibold">₹{adjustedLoanAmount.toLocaleString()}</div>
                    <div>Max Amount</div>
                  </div>
                  <div>
                    <div className="font-semibold">{lender.interestRate}%</div>
                    <div>Interest Rate</div>
                  </div>
                  <div>
                    <div className="font-semibold">₹{Math.round((adjustedLoanAmount / vehiclePrice) * lender.emi).toLocaleString()}</div>
                    <div>Est. EMI</div>
                  </div>
                  <div>
                    <div className="font-semibold">{lender.tenure} months</div>
                    <div>Max Tenure</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedLender && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-black mb-4">Complete Your Application</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Number (Optional)
              </label>
              <input
                type="text"
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your Ather booking number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Amount (Optional)
              </label>
              <input
                type="number"
                value={bookingAmount}
                onChange={(e) => setBookingAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Amount paid for booking"
              />
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
          >
            Proceed to Sanction Letter
          </button>
        </div>
      )}
    </div>
  );
};