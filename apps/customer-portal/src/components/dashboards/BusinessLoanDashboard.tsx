import React from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Briefcase, 
  Factory,
  Store,
  Laptop,
  ArrowRight
} from 'lucide-react';
import { BaseDashboard } from './BaseDashboard';
import { DashboardProps, DASHBOARD_CONFIGS } from './types';

export function BusinessLoanDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.BUSINESS_LOAN;

  const businessTypes = [
    {
      icon: Store,
      title: 'Retail Business',
      description: 'Expand your retail operations',
      amount: 'Up to ₹25L'
    },
    {
      icon: Factory,
      title: 'Manufacturing',
      description: 'Scale your production capacity',
      amount: 'Up to ₹50L'
    },
    {
      icon: Laptop,
      title: 'Service Business',
      description: 'Grow your service offerings',
      amount: 'Up to ₹30L'
    }
  ];

  return (
    <BaseDashboard {...props} config={config}>
      {/* Business Loan Benefits */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Business Loan Features
            </h2>
            <p className="text-xl text-gray-600">
              Tailored financing solutions for your business growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Flexible Repayment</h3>
              <p className="text-gray-600">
                Choose from multiple repayment options that suit your business cash flow.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Quick Disbursement</h3>
              <p className="text-gray-600">
                Get funds disbursed within 48 hours of approval to meet urgent business needs.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Minimal Documentation</h3>
              <p className="text-gray-600">
                Simple documentation process with digital verification for faster approval.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loans for Every Business Type
            </h2>
            <p className="text-xl text-gray-600">
              Whether you're a startup or established business, we have the right solution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {businessTypes.map((business, index) => {
              const IconComponent = business.icon;
              return (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{business.title}</h3>
                  <p className="text-gray-600 mb-4">{business.description}</p>
                  <p className="text-green-600 font-semibold mb-6">{business.amount}</p>
                  <Button className="w-full" onClick={props.onApplyForLoan}>
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Can You Use Business Loans For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Working Capital',
              'Equipment Purchase',
              'Business Expansion',
              'Inventory Management',
              'Technology Upgrade',
              'Marketing Campaigns',
              'Office Setup',
              'Staff Hiring'
            ].map((useCase, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-800">{useCase}</h4>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}