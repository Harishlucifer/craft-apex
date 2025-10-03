import React, { useState } from 'react';
import { ChevronLeft, User, Calendar, MapPin, CreditCard } from 'lucide-react';

interface PersonalDetailsProps {
  applicationData: any;
  updateApplicationData: (data: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  applicationData,
  updateApplicationData,
  onNext,
  onBack
}) => {
  const [formData, setFormData] = useState({
    employmentType: applicationData.employmentType,
    panNumber: applicationData.panNumber,
    dob: applicationData.dob,
    residencePincode: applicationData.residencePincode
  });

  const employmentTypes = [
    'Salaried - Private',
    'Salaried - Government',
    'Self Employed - Business',
    'Self Employed - Professional',
    'Student',
    'Others'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    updateApplicationData(formData);
    onNext();
  };

  const isFormValid = () => {
    return formData.employmentType && 
           formData.panNumber.length === 10 && 
           formData.dob && 
           formData.residencePincode.length === 6;
  };

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
            <User className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Personal Details</h2>
          <p className="text-gray-600">Help us know you better to process your loan</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type *
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => handleInputChange('employmentType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            >
              <option value="">Select Employment Type</option>
              {employmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter as per your PAN card
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Residence Pincode *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.residencePincode}
                onChange={(e) => handleInputChange('residencePincode', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="560001"
                maxLength={6}
              />
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!isFormValid()}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};