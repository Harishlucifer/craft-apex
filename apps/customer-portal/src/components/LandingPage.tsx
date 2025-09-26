import React from 'react';
import { CreditCard, RefreshCw, Zap, Shield, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '@repo/shared-state/hooks';


export const LandingPage: React.FC<any> = () => {

  const navigate = useNavigate()
  const { setupData, isLoading, error } = useSetup();

  // Log setup data to verify API call
  console.log('Setup data loaded:', setupData);
  console.log('Setup loading:', isLoading);
  console.log('Setup error:', error);

  const onApplyNew=()=>{
    console.log("new")
    navigate('/lead/create',{state:{applicationType:"NEW"}})
  }

  const onContinueApplication = () => {
    console.log("Exisiting Flow")
    navigate('/lead/create',{state:{applicationType:"EXISTING"}})
  }
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Hero Section */}
      <div className="text-center py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Finance Your Dream EV
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Get instant loan approval from multiple lenders with competitive rates. 
            Start your journey towards sustainable mobility.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={onApplyNew}
              className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-5 w-5" />
              <span>Apply for Loan</span>
            </button>
            
            <button
              onClick={onContinueApplication}
              className="w-full bg-white border-2 border-black text-black py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Continue My Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Why Choose Our Loan Portal?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Instant Approval</h3>
              <p className="text-gray-600 text-sm">Get loan approval in minutes with our automated eligibility system</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Multiple Lenders</h3>
              <p className="text-gray-600 text-sm">Compare offers from top banks and NBFCs to get the best deal</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Secure Process</h3>
              <p className="text-gray-600 text-sm">Bank-grade security with encrypted data transmission</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Quick Disbursal</h3>
              <p className="text-gray-600 text-sm">Fast loan disbursal directly to dealer account</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-2">
              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Competitive Rates</h3>
              <p className="text-gray-600 text-sm">Starting from 8.5% per annum with flexible tenure options up to 5 years</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};