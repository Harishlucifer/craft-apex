export const pages = {
  profile: {
    title: "Profile",
    name: "Name",
    email: "Email",
    phone: "Phone",
    designation: "Designation",
    employeeCode: "Employee Code",
    userType: "User Type",
    role: "Role",
    reportsTo: "Reports To",
    rm: "Relationship Manager",
    branch: "Branch",
    branchTeam: "Branch Team",
    changePassword: "Change Password",
    noTeam: "No other team members in this branch.",
    workSchedule: "Work Schedule",
    workScheduleHint: "Working days, Saturday offs & holidays",
  },
  notFound: {
    code: "404",
    description: "This page could not be found.",
    backToDashboard: "Back to dashboard",
  },
  placeholder: {
    notPorted: "This page is not ported yet.",
    defaultDescription:
      "The legacy screen for this route exists, but the full UI hasn't landed in the new portal yet.",
    legacyParityNotes: "Legacy parity notes",
  },
} as const;
