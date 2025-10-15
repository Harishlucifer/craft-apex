import React from "react";
import { usePlatformConfig } from "@repo/shared-state/hooks";

function Footer() {
  const platformConfig = usePlatformConfig("EMPLOYEE_PORTAL");
  const tenantName = platformConfig?.branding?.tenantName || "Employee Portal";

  return (
    <footer className="text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} {tenantName}. All rights reserved.
    </footer>
  );
}

export default Footer;