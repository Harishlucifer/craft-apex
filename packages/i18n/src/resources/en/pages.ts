export const pages = {
  profile: {
    title: "Profile",
    name: "Name",
    email: "Email",
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
