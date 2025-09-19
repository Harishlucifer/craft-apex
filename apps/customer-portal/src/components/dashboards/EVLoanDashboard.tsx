import { Card } from '@repo/ui/components/ui/card';
import { Battery, Leaf, Zap, Car } from 'lucide-react';
import { BaseDashboard } from './BaseDashboard';
import { DashboardProps, DASHBOARD_CONFIGS } from './types';

export function EVLoanDashboard(props: DashboardProps) {
  const config = DASHBOARD_CONFIGS.EV_LOAN;

  return (
    <BaseDashboard {...props} config={config}>
      {/* EV-Specific Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              EV Loan Benefits
            </h2>
            <p className="text-xl text-gray-600">
              Special advantages for electric vehicle financing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-sm text-gray-600">
                Lower interest rates for sustainable mobility
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Battery className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Government Subsidy</h3>
              <p className="text-sm text-gray-600">
                Additional benefits under FAME II scheme
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Charging</h3>
              <p className="text-sm text-gray-600">
                Access to nationwide charging network
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Zero Emission</h3>
              <p className="text-sm text-gray-600">
                Contribute to cleaner environment
              </p>
            </Card>
          </div>
        </div>
      </section>
    </BaseDashboard>
  );
}