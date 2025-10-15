import React from "react";
import { ModuleLayout, ModuleContent } from "@repo/ui/module";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/ui";
import Footer from "../shared/Footer";
import uiLayoutConfig from "../config/uiLayout";
import { useModule } from "@repo/shared-state/contexts";

export function DashboardPage() {

  const { currentModule } = useModule();
  console.log("currentModule", currentModule);
  return (
    <ModuleLayout
      direction={uiLayoutConfig.direction}
      layoutType={uiLayoutConfig.layoutType}
    >
      <ModuleContent>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are logged into the Employee Portal.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the sidebar to navigate modules and features.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Footer />
        </div>
      </ModuleContent>
    </ModuleLayout>
  );
}

export default DashboardPage;
