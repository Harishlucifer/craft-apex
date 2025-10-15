import React from 'react';
import { useModule } from '@repo/shared-state/contexts';

interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  rightSticky?: boolean;
}

// A responsive two-column content layout. Left is the primary content,
// right is an optional panel (details/actions). On small screens it stacks.
export function TwoColumnLayout({
  left,
  right,
  className = '',
  rightSticky = true,
}: TwoColumnLayoutProps) {
  const {
    currentModule,
    expandedModuleId,
    getChildren,
    setExpandedModuleId,
    navigateToModule,
  } = useModule();

  const firstLevelChildren = currentModule ? getChildren(currentModule.module_id) : [];
  const secondLevelChildren = expandedModuleId ? getChildren(expandedModuleId) : [];

  const renderChildItem = (m: any) => (
    <li key={m.module_id} className="py-1">
      <button
        className="w-full text-left hover:underline"
        onClick={() => {
          // Expand if it has children, navigate regardless
          if (m.child_module && m.child_module.length > 0) {
            setExpandedModuleId(m.module_id);
          } else {
            setExpandedModuleId(null);
          }
          navigateToModule(m);
        }}
      >
        {m.name}
      </button>
    </li>
  );

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${className}`}>
      <section className="lg:col-span-8">
        {left}
      </section>
      <aside className={`lg:col-span-4 ${rightSticky ? 'lg:sticky lg:top-16' : ''}`}>
        {right}
        {currentModule && (
          <div className="rounded-md border p-3 bg-background">
            <h3 className="text-sm font-semibold mb-2">Submodules</h3>
            {firstLevelChildren.length === 0 ? (
              <p className="text-muted-foreground text-sm">No submodules</p>
            ) : (
              <ul>
                {firstLevelChildren.map(renderChildItem)}
              </ul>
            )}

            {expandedModuleId && secondLevelChildren.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground">More</h4>
                <ul className="mt-1 ml-2 border-l pl-3">
                  {secondLevelChildren.map(renderChildItem)}
                </ul>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}