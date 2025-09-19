import { SetupData } from '@repo/types/setup';

export type DashboardType = 
  | 'EV_LOAN'
  | 'ALL_LOANS'
  | 'BUSINESS_LOAN'
  | 'PERSONAL_LOAN'
  | 'HOME_LOAN'
  | 'PROPERTY_LOAN'
  | 'VEHICLE_LOAN';

export interface DashboardProps {
  setupData: SetupData;
  platformConfig: any;
  isAuthenticated: boolean;
  onLogout: () => void;
  onApplyForLoan: () => void;
  onContinueApplication: () => void;
}

export interface DashboardConfig {
  type: DashboardType;
  title: string;
  description: string;
  features: string[];
  primaryColor?: string;
  heroTitle: string;
  heroDescription: string;
  navItems?: { label: string; href: string }[];
  showNotifications?: boolean;
  showUserMenu?: boolean;
  primaryCTA?: string;
  secondaryCTA?: string;
  brandName?: string;
}

// Dashboard configuration mapping
export const DASHBOARD_CONFIGS: Record<DashboardType, DashboardConfig> = {
  EV_LOAN: {
    type: 'EV_LOAN',
    title: 'EV Loan Portal',
    description: 'Finance Your Dream Electric Vehicle',
    features: ['Instant Approval', 'Multiple Lenders', 'Secure Process'],
    primaryColor: '#2d5483',
    heroTitle: 'Finance Your Dream EV',
    heroDescription: 'Get instant loan approval from multiple lenders with competitive rates. Start your journey towards sustainable mobility with our streamlined application process.',
    navItems: [
      { label: 'Home', href: '/' },
      { label: 'Loans', href: '/loans' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ],
    showNotifications: true,
    showUserMenu: true,
    primaryCTA: 'Apply for Loan',
    secondaryCTA: 'Continue Application',
    brandName: 'Ather'
  },
  ALL_LOANS: {
    type: 'ALL_LOANS',
    title: 'Loan Portal',
    description: 'All Types of Loans Available',
    features: ['Multiple Loan Types', 'Quick Approval', 'Best Rates'],
    primaryColor: '#1e40af',
    heroTitle: 'Get the Loan You Need',
    heroDescription: 'Whether it\'s for business, personal needs, or property investment, we have the right loan solution for you with competitive rates and quick approval.',
  },
  BUSINESS_LOAN: {
    type: 'BUSINESS_LOAN',
    title: 'Business Loan Portal',
    description: 'Grow Your Business with Our Loans',
    features: ['Business Growth', 'Flexible Terms', 'Quick Disbursement'],
    primaryColor: '#059669',
    heroTitle: 'Fuel Your Business Growth',
    heroDescription: 'Get the capital you need to expand your business, purchase equipment, or manage cash flow with our tailored business loan solutions.',
  },
  PERSONAL_LOAN: {
    type: 'PERSONAL_LOAN',
    title: 'Personal Loan Portal',
    description: 'Personal Loans for Your Needs',
    features: ['No Collateral', 'Quick Approval', 'Flexible Repayment'],
    primaryColor: '#dc2626',
    heroTitle: 'Personal Loans Made Easy',
    heroDescription: 'Whether it\'s for medical expenses, education, or personal goals, get instant approval for personal loans with minimal documentation.',
  },
  HOME_LOAN: {
    type: 'HOME_LOAN',
    title: 'Home Loan Portal',
    description: 'Make Your Dream Home a Reality',
    features: ['Low Interest Rates', 'Long Tenure', 'Easy EMI'],
    primaryColor: '#7c3aed',
    heroTitle: 'Own Your Dream Home',
    heroDescription: 'Get the best home loan rates with flexible repayment options. Make your dream of owning a home come true with our comprehensive home loan solutions.',
  },
  PROPERTY_LOAN: {
    type: 'PROPERTY_LOAN',
    title: 'Property Loan Portal',
    description: 'Invest in Real Estate',
    features: ['Investment Property', 'Competitive Rates', 'Expert Guidance'],
    primaryColor: '#ea580c',
    heroTitle: 'Invest in Real Estate',
    heroDescription: 'Build your property portfolio with our specialized property loans. Get financing for residential or commercial properties with attractive terms.',
  },
  VEHICLE_LOAN: {
    type: 'VEHICLE_LOAN',
    title: 'Vehicle Loan Portal',
    description: 'Finance Your Vehicle Purchase',
    features: ['New & Used Cars', 'Quick Approval', 'Competitive Rates'],
    primaryColor: '#0891b2',
    heroTitle: 'Drive Your Dream Vehicle',
    heroDescription: 'Get instant approval for car loans with competitive interest rates. Finance new or used vehicles with flexible repayment options.',
  },
};