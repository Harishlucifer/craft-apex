// Dashboard Types and Interfaces
export * from './types';

// Dashboard Factory (Main Component)
export { DashboardFactory, useDashboardType } from './DashboardFactory';

// Base Dashboard Component
export { BaseDashboard } from './BaseDashboard';

// Specific Dashboard Components
export { EVLoanDashboard } from './EVLoanDashboard';
export { AllLoansDashboard } from './AllLoansDashboard';
export { BusinessLoanDashboard } from './BusinessLoanDashboard';
export { 
  PersonalLoanDashboard, 
  HomeLoanDashboard, 
  PropertyLoanDashboard, 
  VehicleLoanDashboard 
} from './SpecificLoanDashboards';