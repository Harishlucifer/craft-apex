import { useParams, Navigate } from 'react-router-dom';
import { useAuthStore } from '@repo/shared-state/stores';
import { useModuleAuth } from '@repo/shared-state/hooks';
import { getModulePermissions, hasModulePermission } from '@/utils/moduleTransformer';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card } from '@repo/ui/card';

export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { setupData, isAuthenticated } = useAuthStore();
  const { hasAccess, modules } = useModuleAuth(moduleId);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Find the current module
  const currentModule = modules.find(m => m.module_id === moduleId);
  
  // Redirect to dashboard if module not found or no access
  if (!currentModule || !hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // Get module permissions
  const permissions = getModulePermissions(currentModule);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentModule.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <Card title={currentModule.name} className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Welcome to the {currentModule.name} module. This is a placeholder page that will be replaced with the actual module content.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Module Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Module ID:</span>
                        <span className="font-medium">{currentModule.module_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Code:</span>
                        <span className="font-medium">{currentModule.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">System:</span>
                        <span className="font-medium">{currentModule.system}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-medium">{currentModule.target}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Your Permissions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">View:</span>
                        <span className={`font-medium ${permissions.view ? 'text-green-600' : 'text-red-600'}`}>
                          {permissions.view ? 'Allowed' : 'Denied'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Add:</span>
                        <span className={`font-medium ${permissions.add ? 'text-green-600' : 'text-red-600'}`}>
                          {permissions.add ? 'Allowed' : 'Denied'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Edit:</span>
                        <span className={`font-medium ${permissions.edit ? 'text-green-600' : 'text-red-600'}`}>
                          {permissions.edit ? 'Allowed' : 'Denied'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Export:</span>
                        <span className={`font-medium ${permissions.export ? 'text-green-600' : 'text-red-600'}`}>
                          {permissions.export ? 'Allowed' : 'Denied'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Permission-based action buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  {permissions.add && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Add New
                    </button>
                  )}
                  {permissions.edit && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Edit
                    </button>
                  )}
                  {permissions.export && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                      Export Data
                    </button>
                  )}
                  {!permissions.add && !permissions.edit && !permissions.export && (
                    <p className="text-gray-500 italic">No actions available with current permissions</p>
                  )}
                </div>
                {currentModule.child_module && currentModule.child_module.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Child Modules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentModule.child_module.map((child) => (
                        <div key={child.module_id} className="p-3 border rounded-lg">
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-600">{child.code}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}