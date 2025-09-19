import React from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { 
  User, 
  Home, 
  MapPin, 
  Car,
  Heart,
  GraduationCap,
  Plane,
  Building,
  Key,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { BaseDashboard } from './BaseDashboard';
import { DashboardProps, DASHBOARD_CONFIGS } from './types';

// Personal Loan Dashboard
export function PersonalLoanDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.PERSONAL_LOAN;

  const personalLoanUses = [
    { icon: Heart, title: 'Medical Emergency', description: 'Cover unexpected medical expenses' },
    { icon: GraduationCap, title: 'Education', description: 'Fund your or your child\'s education' },
    { icon: Plane, title: 'Travel', description: 'Plan your dream vacation' },
    { icon: Home, title: 'Home Renovation', description: 'Upgrade your living space' }
  ];

  return (
    <BaseDashboard {...props} config={config}>
      <section className="py-20 bg-gradient-to-r from-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Personal Loan Uses
            </h2>
            <p className="text-xl text-gray-600">
              Use personal loans for any legitimate personal need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personalLoanUses.map((use, index) => {
              const IconComponent = use.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{use.title}</h3>
                  <p className="text-sm text-gray-600">{use.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}

// Home Loan Dashboard
export function HomeLoanDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.HOME_LOAN;

  const homeTypes = [
    { title: 'Ready to Move', description: 'Immediate possession homes', rate: '8.5%' },
    { title: 'Under Construction', description: 'Properties under development', rate: '8.7%' },
    { title: 'Plot Purchase', description: 'Buy land for future construction', rate: '9.0%' }
  ];

  return (
    <BaseDashboard {...props} config={config}>
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Home Loan Options
            </h2>
            <p className="text-xl text-gray-600">
              Choose the right home loan for your property type
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {homeTypes.map((home, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{home.title}</h3>
                <p className="text-gray-600 mb-4">{home.description}</p>
                <p className="text-purple-600 font-semibold mb-6">From {home.rate} onwards</p>
                <Button className="w-full" onClick={props.onApplyForLoan}>
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Home Loan Benefits
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <Key className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Tax Benefits</h3>
              <p className="text-gray-600">Save up to ₹3.5L annually under Section 80C and 24(b)</p>
            </Card>
            <Card className="p-8 text-center">
              <Building className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Long Tenure</h3>
              <p className="text-gray-600">Repay over 30 years with affordable EMIs</p>
            </Card>
            <Card className="p-8 text-center">
              <Wrench className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Flexible Options</h3>
              <p className="text-gray-600">Step-up, step-down, and flexi payment options</p>
            </Card>
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}

// Property Loan Dashboard
export function PropertyLoanDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.PROPERTY_LOAN;

  return (
    <BaseDashboard {...props} config={config}>
      <section className="py-20 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Property Investment Options
            </h2>
            <p className="text-xl text-gray-600">
              Build your real estate portfolio with our property loans
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Commercial Property</h3>
              <p className="text-gray-600 mb-4">
                Invest in office spaces, retail outlets, and commercial complexes
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Up to ₹10 Cr loan amount</li>
                <li>• Competitive interest rates</li>
                <li>• Flexible repayment terms</li>
              </ul>
              <Button className="w-full" onClick={props.onApplyForLoan}>
                Apply for Commercial Loan
              </Button>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <Building className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Residential Investment</h3>
              <p className="text-gray-600 mb-4">
                Purchase residential properties for rental income or capital appreciation
              </p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>• Up to ₹5 Cr loan amount</li>
                <li>• Lower interest rates</li>
                <li>• Tax benefits available</li>
              </ul>
              <Button className="w-full" onClick={props.onApplyForLoan}>
                Apply for Residential Loan
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}

// Vehicle Loan Dashboard
export function VehicleLoanDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.VEHICLE_LOAN;

  const vehicleTypes = [
    { title: 'New Car', description: 'Finance your brand new car', rate: '8.5%', funding: '90%' },
    { title: 'Used Car', description: 'Get loans for pre-owned vehicles', rate: '9.5%', funding: '80%' },
    { title: 'Two Wheeler', description: 'Bikes and scooters financing', rate: '10.5%', funding: '95%' }
  ];

  return (
    <BaseDashboard {...props} config={config}>
      <section className="py-20 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vehicle Loan Options
            </h2>
            <p className="text-xl text-gray-600">
              Finance any vehicle with our competitive loan options
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {vehicleTypes.map((vehicle, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{vehicle.title}</h3>
                <p className="text-gray-600 mb-4">{vehicle.description}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Interest Rate:</span>
                    <span className="font-semibold text-cyan-600">{vehicle.rate} onwards</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Funding:</span>
                    <span className="font-semibold">Up to {vehicle.funding}</span>
                  </div>
                </div>
                <Button className="w-full" onClick={props.onApplyForLoan}>
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}