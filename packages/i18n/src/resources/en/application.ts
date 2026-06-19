export const application = {
  loginQ: {
    emptyTitle: "No applications in the login queue",
    colLeadId: "Lead ID",
    colLoanDetails: "Loan Details",
    colApplicant: "Applicant",
    colSource: "Source",
    colPending: "Pending",
    colStatus: "Status",
    colCreated: "Created",
    loanCode: "Loan Code",
  },
  trackingQ: {
    emptyTitle: "No applications in the tracking queue",
  },
  disbursedQ: {
    emptyTitle: "No disbursed applications",
    colDisbursed: "Disbursed",
  },
  rejectedQ: {
    emptyTitle: "No rejected applications",
  },
  approvalQ: {
    emptyTitle: "No applications in the approval queue",
  },
  // Columns shared by tracking / disbursed / rejected / approval queues
  colLender: "Lender",
  colLeadId: "Lead ID",
  colLoanType: "Loan Type",
  colApplicant: "Applicant",
  colSourcedBy: "Sourced By",
  colProcessedBy: "Processed By",
  colLenderLogin: "Lender Login",
} as const;
