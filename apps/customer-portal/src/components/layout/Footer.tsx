import React from 'react';
import { useAuthStore } from '@repo/shared-state/stores';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { setupData } = useAuthStore();
  
  // Get tenant name from setup data
  const tenantName = setupData?.tenant?.TENANT_NAME || 'Portal';
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white border-t border-gray-200 px-4 py-3 mt-auto ${className}`}>
      <div className="flex items-center justify-center">
        <p className="text-sm text-gray-600">
          © {currentYear} {tenantName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};