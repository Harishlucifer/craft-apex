"use client";

import { AuthProtected } from "@craft-apex/auth";
import { EmployeeLayout } from "@/components/employee-layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProtected loginRoute="/login">
      <EmployeeLayout>{children}</EmployeeLayout>
    </AuthProtected>
  );
}
