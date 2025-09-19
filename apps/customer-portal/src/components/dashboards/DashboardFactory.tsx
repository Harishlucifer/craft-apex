import { SetupData } from '@repo/types/setup';
import { DashboardType, DashboardProps } from './types';
import { EVLoanDashboard } from './EVLoanDashboard';
import { AllLoansDashboard } from './AllLoansDashboard';
import { BusinessLoanDashboard } from './BusinessLoanDashboard';
import { 
  PersonalLoanDashboard, 
  HomeLoanDashboard, 
  PropertyLoanDashboard, 
  VehicleLoanDashboard 
} from './SpecificLoanDashboards';

interface DashboardFactoryProps {
  setupData: SetupData;
  platformConfig: any;
  isAuthenticated: boolean;
  onLogout: () => void;
  onApplyForLoan: () => void;
  onContinueApplication: () => void;
}

/**
 * Dashboard Factory Component
 * 
 * This component dynamically renders the appropriate dashboard based exclusively on
 * the CONSUMER_DASHBOARD_TYPE property from the tenant configuration in setupData.
 * 
 * If CONSUMER_DASHBOARD_TYPE is not set or not recognized, it defaults to ALL_LOANS dashboard.
 * 
 * Supported dashboard types:
 * - EV_LOAN: Electric vehicle loan dashboard
 * - BUSINESS_LOAN: Business loan dashboard  
 * - PERSONAL_LOAN: Personal loan dashboard
 * - HOME_LOAN: Home loan dashboard
 * - PROPERTY_LOAN: Property loan dashboard
 * - VEHICLE_LOAN: Vehicle loan dashboard
 * - ALL_LOANS: General dashboard showing all loan types (default)
 */
export function DashboardFactory(props: DashboardFactoryProps) {
  const { setupData } = props;

  /**
   * Determines which dashboard type to render based on tenant configuration.
   * 
   * Exclusively uses setupData.tenant.CONSUMER_DASHBOARD_TYPE to determine the dashboard type.
   * Defaults to ALL_LOANS if CONSUMER_DASHBOARD_TYPE is not set or not recognized.
   */
  const getDashboardType = (): DashboardType => {
    const consumerDashboardType = setupData?.tenant?.CONSUMER_DASHBOARD_TYPE;
    
    if (!consumerDashboardType) {
      console.warn('CONSUMER_DASHBOARD_TYPE not set, defaulting to ALL_LOANS dashboard');
      return 'ALL_LOANS';
    }

    const dashboardType = consumerDashboardType.toLowerCase();
    
    // Map consumer dashboard types to dashboard types
    switch (dashboardType) {
      case 'ev':
      case 'ev_loan':
      case 'electric_vehicle':
      case 'electric':
        return 'EV_LOAN';
      case 'business':
      case 'business_loan':
        return 'BUSINESS_LOAN';
      case 'personal':
      case 'personal_loan':
        return 'PERSONAL_LOAN';
      case 'home':
      case 'home_loan':
        return 'HOME_LOAN';
      case 'property':
      case 'property_loan':
        return 'PROPERTY_LOAN';
      case 'vehicle':
      case 'vehicle_loan':
      case 'auto':
      case 'auto_loan':
        return 'VEHICLE_LOAN';
      case 'all':
      case 'all_loans':
        return 'ALL_LOANS';
      default:
        console.warn(`Unknown CONSUMER_DASHBOARD_TYPE: ${consumerDashboardType}, defaulting to ALL_LOANS dashboard`);
        return 'ALL_LOANS';
    }
  };

  /**
   * Render the appropriate dashboard component based on type
   */
  const renderDashboard = (dashboardType: DashboardType) => {
    const dashboardProps: DashboardProps = {
      setupData: props.setupData,
      platformConfig: props.platformConfig,
      isAuthenticated: props.isAuthenticated,
      onLogout: props.onLogout,
      onApplyForLoan: props.onApplyForLoan,
      onContinueApplication: props.onContinueApplication
    };

    switch (dashboardType) {
      case 'EV_LOAN':
        return <EVLoanDashboard {...dashboardProps} />;
      
      case 'BUSINESS_LOAN':
        return <BusinessLoanDashboard {...dashboardProps} />;
      
      case 'PERSONAL_LOAN':
        return <PersonalLoanDashboard {...dashboardProps} />;
      
      case 'HOME_LOAN':
        return <HomeLoanDashboard {...dashboardProps} />;
      
      case 'PROPERTY_LOAN':
        return <PropertyLoanDashboard {...dashboardProps} />;
      
      case 'VEHICLE_LOAN':
        return <VehicleLoanDashboard {...dashboardProps} />;
      
      case 'ALL_LOANS':
      default:
        return <AllLoansDashboard {...dashboardProps} />;
    }
  };

  // Get the dashboard type and render the appropriate component
  const dashboardType = getDashboardType();
  
  // Add debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Factory Debug:', {
      consumerDashboardType: setupData?.tenant?.CONSUMER_DASHBOARD_TYPE,
      selectedDashboard: dashboardType
    });
  }

  return renderDashboard(dashboardType);
}

/**
 * Hook to get dashboard type for external use
 * 
 * Exclusively uses setupData.tenant.CONSUMER_DASHBOARD_TYPE to determine the dashboard type.
 * Defaults to ALL_LOANS if CONSUMER_DASHBOARD_TYPE is not set or not recognized.
 */
export function useDashboardType(setupData: SetupData): DashboardType {
  const consumerDashboardType = setupData?.tenant?.CONSUMER_DASHBOARD_TYPE;
  
  if (!consumerDashboardType) {
    console.warn('CONSUMER_DASHBOARD_TYPE not set, defaulting to ALL_LOANS dashboard');
    return 'ALL_LOANS';
  }

  const dashboardType = consumerDashboardType.toLowerCase();
  
  switch (dashboardType) {
    case 'ev':
    case 'ev_loan':
    case 'electric_vehicle':
    case 'electric':
      return 'EV_LOAN';
    case 'business':
    case 'business_loan':
      return 'BUSINESS_LOAN';
    case 'personal':
    case 'personal_loan':
      return 'PERSONAL_LOAN';
    case 'home':
    case 'home_loan':
      return 'HOME_LOAN';
    case 'property':
    case 'property_loan':
      return 'PROPERTY_LOAN';
    case 'vehicle':
    case 'vehicle_loan':
    case 'auto':
    case 'auto_loan':
      return 'VEHICLE_LOAN';
    case 'all':
    case 'all_loans':
      return 'ALL_LOANS';
    default:
      console.warn(`Unknown CONSUMER_DASHBOARD_TYPE: ${consumerDashboardType}, defaulting to ALL_LOANS dashboard`);
      return 'ALL_LOANS';
  }
}