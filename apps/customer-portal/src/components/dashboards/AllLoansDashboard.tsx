import React from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { 
  Building2, 
  User, 
  Home, 
  MapPin, 
  Car,
  ArrowRight,
  Calculator,
  Clock,
  Shield
} from 'lucide-react';
import { BaseDashboard } from './BaseDashboard';
import { DashboardProps, DASHBOARD_CONFIGS } from './types';

export function AllLoansDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.ALL_LOANS;

  const loanTypes = [
    {
      icon: Building2,
      title: 'Business Loan',
      description: 'Fuel your business growth with flexible financing options',
      rate: '10.5% onwards',
      amount: 'Up to ₹50L',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: User,
      title: 'Personal Loan',
      description: 'Meet your personal financial needs instantly',
      rate: '11.5% onwards',
      amount: 'Up to ₹25L',
      color: 'from-red-400 to-red-600'
    },
    {
      icon: Home,
      title: 'Home Loan',
      description: 'Make your dream home a reality',
      rate: '8.5% onwards',
      amount: 'Up to ₹5Cr',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: MapPin,
      title: 'Property Loan',
      description: 'Invest in real estate with competitive rates',
      rate: '9.5% onwards',
      amount: 'Up to ₹10Cr',
      color: 'from-orange-400 to-orange-600'
    },
    {
      icon: Car,
      title: 'Vehicle Loan',
      description: 'Drive your dream car with easy financing',
      rate: '9.0% onwards',
      amount: 'Up to ₹1Cr',
      color: 'from-blue-400 to-blue-600'
    }
  ];

  return (
    <BaseDashboard {...props} config={config}>
      {/* Loan Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Loan Type
            </h2>
            <p className="text-xl text-gray-600">
              We offer comprehensive loan solutions for all your financial needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loanTypes.map((loan, index) => {
              const IconComponent = loan.icon;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-32 bg-gradient-to-br ${loan.color} flex items-center justify-center`}>
                    <IconComponent className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{loan.title}</h3>
                    <p className="text-gray-600 mb-4">{loan.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-semibold text-green-600">{loan.rate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-semibold">{loan.amount}</span>
                      </div>
                    </div>
                    <Button className="w-full" onClick={props.onApplyForLoan}>
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loan Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Loan Process
            </h2>
            <p className="text-xl text-gray-600">
              Get your loan approved in just 3 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Apply Online</h3>
              <p className="text-gray-600">
                Fill out our simple online application form with your basic details and loan requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Approved</h3>
              <p className="text-gray-600">
                Our AI-powered system evaluates your application and provides instant approval decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Receive Funds</h3>
              <p className="text-gray-600">
                Once approved, funds are disbursed directly to your bank account within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loan Tools & Calculators
            </h2>
            <p className="text-xl text-gray-600">
              Plan your loan with our helpful tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">EMI Calculator</h3>
              <p className="text-gray-600 mb-6">
                Calculate your monthly EMI for different loan amounts and tenures.
              </p>
              <Button variant="outline" className="w-full">
                Calculate EMI
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Eligibility Check</h3>
              <p className="text-gray-600 mb-6">
                Check your loan eligibility instantly without affecting your credit score.
              </p>
              <Button variant="outline" className="w-full">
                Check Eligibility
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Credit Score</h3>
              <p className="text-gray-600 mb-6">
                Get your free credit score and improve your loan approval chances.
              </p>
              <Button variant="outline" className="w-full">
                Check Score
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}