import React from 'react';
import { usePlatformConfig } from '@repo/shared-state/hooks';
import { ModuleLayout as SingleModuleLayout } from './single-column-layout/ModuleLayout';
import { TwoColumnLayout } from './two-column-layout/TwoColumnLayout';

interface ModuleDynamicLayoutProps {
  children?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

// Parent wrapper that decides which content layout to render based on platform config
export function ModuleDynamicLayout({
  children,
  left,
  right,
  className = '',
  direction,
}: ModuleDynamicLayoutProps) {
  const platformConfig = usePlatformConfig('EMPLOYEE_PORTAL');

  const configLayoutType = (platformConfig as any)?.ui?.layout?.type
    || (platformConfig as any)?.layout?.type
    || 'SINGLE_COLUMN_LAYOUT';

  const isTwoColumn = String(configLayoutType).toUpperCase() === 'TWO_COLUMN_LAYOUT';

  return (
    <SingleModuleLayout className={className} direction={direction}>
      {isTwoColumn ? (
        <TwoColumnLayout left={left ?? children} right={right} />
      ) : (
        children ?? left
      )}
    </SingleModuleLayout>
  );
}