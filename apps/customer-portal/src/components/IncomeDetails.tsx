import React, { useState } from 'react';
import { ChevronLeft, DollarSign, MapPin, Calculator } from 'lucide-react';

interface IncomeDetailsProps {
  applicationData: any;
  updateApplicationData: (data: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const IncomeDetails: React.FC<IncomeDetailsProps> = ({
  applicationData,
  updateApplicationData,
  onNext,
  onBack
}) => {
  const [formData, setFormData] = useState({
    monthlyIncome: applicationData.monthlyIncome,
    workPincode: applicationData.workPincode,
    existingEmi: applicationData.existingEmi
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setIsProcessing(true);
    updateApplicationData(formData);
    
    // Simulate bureau pull process
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 3000);
  };

  const isFormValid = () => {
    return formData.monthlyIncome && 
           formData.workPincode.length === 6 && 
           formData.existingEmi;
  };

  if (isProcessing) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Your Application</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Verifying Income Details
            </p>
            <p className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Checking Credit Bureau
            </p>
            <p className="flex items-center justify-center text-gray-400">
              <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
              Calculating Eligibility
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">This may take a few seconds...</p>
        </div>
      </div>
    );
  }

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
            <DollarSign className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Income Details</h2>
          <p className="text-gray-600">Help us assess your loan eligibility</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="">Select Monthly Income</option>
                <option value="15000-25000">₹15,000 - ₹25,000</option>
                <option value="25000-40000">₹25,000 - ₹40,000</option>
                <option value="40000-60000">₹40,000 - ₹60,000</option>
                <option value="60000-100000">₹60,000 - ₹1,00,000</option>
                <option value="100000-150000">₹1,00,000 - ₹1,50,000</option>
                <option value="150000+">Above ₹1,50,000</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select your gross monthly income
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Pincode *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.workPincode}
                onChange={(e) => handleInputChange('workPincode', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="560001"
                maxLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pincode of your workplace
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing EMI *
            </label>
            <div className="relative">
              <Calculator className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={formData.existingEmi}
                onChange={(e) => handleInputChange('existingEmi', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="">Select Existing EMI</option>
                <option value="0">No Existing EMI</option>
                <option value="1-5000">₹1 - ₹5,000</option>
                <option value="5000-10000">₹5,000 - ₹10,000</option>
                <option value="10000-20000">₹10,000 - ₹20,000</option>
                <option value="20000-30000">₹20,000 - ₹30,000</option>
                <option value="30000+">Above ₹30,000</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total monthly EMI for all existing loans
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Calculator className="h-5 w-5 text-black" />
              </div>
              <div>
                <h4 className="font-medium text-black mb-1">What happens next?</h4>
                <p className="text-sm text-gray-600">
                  We'll check your credit score and calculate your loan eligibility with multiple lenders to get you the best offers.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!isFormValid()}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Eligibility
          </button>
        </div>
      </div>
    </div>
  );
};