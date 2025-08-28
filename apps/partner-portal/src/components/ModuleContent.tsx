import React from 'react';
import { useCurrentModule } from '@/contexts/ModuleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { convertIconToLucideName } from '@repo/ui/utils/iconConverter';
import { DynamicIcon } from 'lucide-react/dynamic';

interface ModuleContentProps {
  children?: React.ReactNode;
  showModuleInfo?: boolean;
  className?: string;
}

export function ModuleContent({ 
  children, 
  showModuleInfo = true, 
  className = '' 
}: ModuleContentProps) {
  const currentModule = useCurrentModule();

  if (!currentModule) {
    return (
      <div className={`space-y-6 ${className}`}>
        {children}
      </div>
    );
  }

  const iconName = convertIconToLucideName(currentModule.icon || 'default');

  return (
    <div className={`space-y-6 ${className}`}>
      {showModuleInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DynamicIcon name={iconName as any} className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{currentModule.name}</CardTitle>
                {currentModule.code && (
                  <CardDescription className="mt-1">
                    Module Code: {currentModule.code}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                {currentModule.display_mode && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                    {currentModule.display_mode}
                  </span>
                )}
                {currentModule.allowed_permission && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                    Permissions Available
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          {(currentModule.child_module && currentModule.child_module.length > 0) && (
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Sub-modules</h4>
                <div className="flex flex-wrap gap-2">
                  {currentModule.child_module.map((childModule) => {
                    const childIconName = convertIconToLucideName(childModule.icon || 'default');
                    return (
                      <span key={childModule.module_id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                        <DynamicIcon name={childIconName as any} className="h-3 w-3" />
                        {childModule.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
      
      {children}
    </div>
  );
}

// Simplified version for pages that just need the module context without the info card
export function ModuleContentSimple({ 
  children, 
  className = '' 
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
}