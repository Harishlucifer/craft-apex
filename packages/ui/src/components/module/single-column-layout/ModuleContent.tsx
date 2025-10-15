import React from 'react';
import { useCurrentModule } from '@repo/shared-state/contexts';

interface ModuleContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ModuleContent({ children, className = '' }: ModuleContentProps) {
  const currentModule = useCurrentModule();

  if (!currentModule) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No module selected</p>
      </div>
    );
  }

  return (
    <div className={`module-content ${className}`}>
      {children}
    </div>
  );
}