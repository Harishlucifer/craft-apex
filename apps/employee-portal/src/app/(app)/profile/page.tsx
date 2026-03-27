"use client";

import { useSetupStore } from "@craft-apex/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@craft-apex/ui/components/card";
import { User, Mail, Hash, Phone, Briefcase, Shield } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Profile Page                                                       */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { user } = useSetupStore();

  const initials = (user?.username ?? "U")[0]!.toUpperCase();

  const profileFields = [
    {
      icon: <Hash className="h-4 w-4" />,
      label: "Employee Code",
      value: user?.employee_code || "—",
    },
    {
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
      value: user?.email || "—",
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: "Mobile",
      value: user?.mobile || "—",
    },
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: "User Type",
      value: user?.user_type || "—",
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: "Admin",
      value: user?.is_admin ? "Yes" : "No",
    },
    {
      icon: <Hash className="h-4 w-4" />,
      label: "User ID",
      value: user?.id ? String(user.id) : "—",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your account information
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-white shadow-lg">
              <span className="text-2xl font-bold">{initials}</span>
            </div>

            {/* User info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800">
                {user?.username || "User"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {user?.email || "—"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {user?.user_type || "USER"}
                </span>
                {user?.is_admin && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileFields.map((field) => (
              <div
                key={field.label}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {field.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700 truncate">
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
