// Static demo data for the RC / PDD tab (Sep'25).
// RC = Repossession / Recovery cases, PDD = Post-Disbursement Documents.

export const RCPDD_CARDS = [
  { key: "rc120", label: "RC >120 Days", value: "33", note: "vs MDM limit 2", accent: "#EF4444" },
  { key: "rcTotal", label: "Total RC Cases", value: "78", note: "open repossessions", accent: "#F59E0B" },
  { key: "rcResolved", label: "RC Resolved Sep", value: "12", note: "+3 vs Aug", accent: "#10B981" },
  { key: "pddPending", label: "PDD Pending", value: "145", note: "documents", accent: "#2563EB" },
  { key: "pddOverdue", label: "PDD Overdue", value: "42", note: ">90 days", accent: "#7C3AED" },
  { key: "pddCompliance", label: "PDD Compliance", value: "88.6%", note: "Target 95%", accent: "#0EA5E9" },
] as const;

export const RC_AGING = [
  { range: "0–30", cases: 12 },
  { range: "31–60", cases: 14 },
  { range: "61–90", cases: 11 },
  { range: "91–120", cases: 8 },
  { range: "120+", cases: 33 },
];

export const RC_TREND = [
  { month: "Apr", newRc: 14, resolved: 10, open: 45 },
  { month: "May", newRc: 16, resolved: 11, open: 50 },
  { month: "Jun", newRc: 18, resolved: 14, open: 54 },
  { month: "Jul", newRc: 12, resolved: 18, open: 48 },
  { month: "Aug", newRc: 9, resolved: 17, open: 40 },
  { month: "Sep", newRc: 21, resolved: 12, open: 33 },
];

export const RC_BY_BRANCH = [
  { branch: "Coimbatore", cases: 14 },
  { branch: "Vellore", cases: 12 },
  { branch: "Poonamallee", cases: 10 },
  { branch: "Hosur", cases: 9 },
  { branch: "Bangalore", cases: 8 },
  { branch: "Channel", cases: 7 },
  { branch: "Salem", cases: 6 },
  { branch: "Cuddalore", cases: 5 },
  { branch: "Peenya", cases: 4 },
  { branch: "Trichy", cases: 3 },
];

export const PDD_AGING = [
  { range: "0–30", count: 68 },
  { range: "31–60", count: 35 },
  { range: "61–90", count: 22 },
  { range: "90+", count: 20 },
];

export const PDD_BY_TYPE = [
  { name: "RC Book", value: 45, color: "#2563EB" },
  { name: "Insurance", value: 35, color: "#10B981" },
  { name: "Invoice", value: 28, color: "#F59E0B" },
  { name: "Agreement", value: 20, color: "#7C3AED" },
  { name: "NACH Mandate", value: 17, color: "#0EA5E9" },
];

export const PDD_BY_BRANCH = [
  { branch: "Coimbatore", count: 28 },
  { branch: "Vellore", count: 22 },
  { branch: "Bangalore", count: 20 },
  { branch: "Poonamallee", count: 18 },
  { branch: "Channel", count: 14 },
  { branch: "Hosur", count: 12 },
  { branch: "Salem", count: 11 },
  { branch: "Cuddalore", count: 8 },
  { branch: "Peenya", count: 7 },
  { branch: "Trichy", count: 5 },
];

export const RCPDD_TABLE = [
  { branch: "Coimbatore", rc: 14, rc120: 8, pdd: 28, overdue: 11, compliance: "78.4%", tone: "bad" },
  { branch: "Vellore", rc: 12, rc120: 7, pdd: 22, overdue: 9, compliance: "81.2%", tone: "bad" },
  { branch: "Poonamallee", rc: 10, rc120: 5, pdd: 18, overdue: 6, compliance: "85.0%", tone: "warn" },
  { branch: "Hosur", rc: 9, rc120: 4, pdd: 12, overdue: 4, compliance: "88.1%", tone: "warn" },
  { branch: "Bangalore", rc: 8, rc120: 3, pdd: 20, overdue: 5, compliance: "90.3%", tone: "warn" },
  { branch: "Channel", rc: 7, rc120: 2, pdd: 14, overdue: 3, compliance: "91.5%", tone: "warn" },
  { branch: "Salem", rc: 6, rc120: 2, pdd: 11, overdue: 2, compliance: "93.0%", tone: "good" },
  { branch: "Cuddalore", rc: 5, rc120: 1, pdd: 8, overdue: 1, compliance: "95.2%", tone: "good" },
  { branch: "Peenya", rc: 4, rc120: 1, pdd: 7, overdue: 1, compliance: "96.1%", tone: "good" },
  { branch: "Trichy", rc: 3, rc120: 0, pdd: 5, overdue: 0, compliance: "98.0%", tone: "good" },
] as const;
