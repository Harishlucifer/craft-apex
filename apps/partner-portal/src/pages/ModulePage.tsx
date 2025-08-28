import { Navigate } from "react-router-dom";
import { useModuleAuth } from "@repo/shared-state/hooks";
import {
  getModulePermissions,
} from "@repo/ui/utils/moduleTransformer";
import { useCurrentModule } from "@/contexts/ModuleContext";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card } from "@repo/ui/card";

export function ModulePage() {
  const currentModule = useCurrentModule();
  const { hasAccess } = useModuleAuth();

  // If no module found, redirect to dashboard
  if (!currentModule) {
    return <Navigate to="/partner/dashboard" replace />;
  }

  // Get module permissions
  const permissions = getModulePermissions(currentModule);

  return (
    <ModuleLayout>
      <Card title={currentModule.name} className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Welcome to the {currentModule.name} module. This is a
                  placeholder page that will be replaced with the actual module
                  content.
                </p>
                <div className="w-full">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">
                      Module Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">Module ID:</span>
                          <span className="font-medium col-span-2 break-words">
                            {currentModule.module_id}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">Code:</span>
                          <span className="font-medium col-span-2 break-words">
                            {currentModule.code}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">System:</span>
                          <span className="font-medium col-span-2 break-words">
                            {currentModule.system}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium col-span-2 break-words">
                            {currentModule.target}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 md:border-t-0 md:pt-0">
                    <h4 className="font-semibold mb-3 text-lg">
                      Your Permissions
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">View:</span>
                          <span
                            className={`font-medium col-span-2 ${permissions.view ? "text-green-600" : "text-red-600"}`}
                          >
                            {permissions.view ? "Allowed" : "Denied"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">Add:</span>
                          <span
                            className={`font-medium col-span-2 ${permissions.add ? "text-green-600" : "text-red-600"}`}
                          >
                            {permissions.add ? "Allowed" : "Denied"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">Edit:</span>
                          <span
                            className={`font-medium col-span-2 ${permissions.edit ? "text-green-600" : "text-red-600"}`}
                          >
                            {permissions.edit ? "Allowed" : "Denied"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <span className="text-gray-600">Export:</span>
                          <span
                            className={`font-medium col-span-2 ${permissions.export ? "text-green-600" : "text-red-600"}`}
                          >
                            {permissions.export ? "Allowed" : "Denied"}
                          </span>
                        </div>
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
                  {!permissions.add &&
                    !permissions.edit &&
                    !permissions.export && (
                      <p className="text-gray-500 italic">
                        No actions available with current permissions
                      </p>
                    )}
                </div>
              </div>
      </Card>
    </ModuleLayout>
  );
}
