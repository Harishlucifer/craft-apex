// Static demo data for the NPA tab (Sep'25).

export const NPA_CARDS = [
  { key: "gross", label: "Gross NPA %", value: "3.11%", note: "recovered from 3.68%", accent: "#F59E0B" },
  { key: "net", label: "Net NPA %", value: "2.50%", note: "vs <2% target", accent: "#EF4444" },
  { key: "gnpa", label: "GNPA Amount", value: "₹325L", note: "of ₹10,459L AUM", accent: "#2563EB" },
  { key: "accounts", label: "NPA Accounts", value: "88", note: "4+ bucket contracts", accent: "#7C3AED" },
  { key: "pcr", label: "Provision Coverage", value: "19.6%", note: "₹64L provisioned", accent: "#0EA5E9" },
  { key: "slippage", label: "Net Slippage Sep", value: "+12", note: "accounts MoM", accent: "#EF4444" },
] as const;

export const NPA_TREND = [
  { month: "Apr", gross: 3.4, net: 2.1 },
  { month: "May", gross: 3.5, net: 2.4 },
  { month: "Jun", gross: 3.6, net: 2.7 },
  { month: "Jul", gross: 3.68, net: 2.93 },
  { month: "Aug", gross: 3.3, net: 2.7 },
  { month: "Sep", gross: 3.11, net: 2.5 },
];
export const NET_NPA_TARGET = 2;

export const BUCKET_GROWTH = [
  { month: "Apr", contracts: 51 },
  { month: "May", contracts: 60 },
  { month: "Jun", contracts: 68 },
  { month: "Jul", contracts: 75 },
  { month: "Aug", contracts: 82 },
  { month: "Sep", contracts: 88 },
];

export const DPD_BUCKETS = [
  { range: "1–30", amount: 138.7 },
  { range: "31–60", amount: 85.3 },
  { range: "61–90", amount: 52.1 },
  { range: "91–120", amount: 33.2 },
  { range: "120+", amount: 15.7 },
];

export const NPA_BY_PRODUCT = [
  { product: "Personal Loan", pct: 5.1 },
  { product: "Business Loan", pct: 4.2 },
  { product: "Used Car", pct: 3.6 },
  { product: "Two-Wheeler", pct: 3.0 },
  { product: "LAP", pct: 2.8 },
  { product: "Home Loan", pct: 1.9 },
  { product: "Gold Loan", pct: 0.9 },
];

export const NPA_BY_BRANCH = [
  { branch: "Coimbatore", pct: 5.2 },
  { branch: "Vellore", pct: 4.8 },
  { branch: "Poonamallee", pct: 3.9 },
  { branch: "Hosur", pct: 3.1 },
  { branch: "Bangalore", pct: 2.6 },
  { branch: "Channel", pct: 2.4 },
  { branch: "Salem", pct: 2.0 },
  { branch: "Cuddalore", pct: 1.8 },
  { branch: "Peenya", pct: 1.5 },
  { branch: "Trichy", pct: 1.1 },
];

export const SLIP_RECOVERY = [
  { month: "Apr", slippage: 18, recovery: 12 },
  { month: "May", slippage: 22, recovery: 14 },
  { month: "Jun", slippage: 20, recovery: 12 },
  { month: "Jul", slippage: 24, recovery: 16 },
  { month: "Aug", slippage: 19, recovery: 15 },
  { month: "Sep", slippage: 21, recovery: 9 },
];

export const NPA_TABLE = [
  { branch: "Coimbatore", gnpa: "6.1%", nnpa: "5.2%", accounts: 18, amount: "₹54.4L", recovery: "₹4.1L", tone: "bad" },
  { branch: "Vellore", gnpa: "5.6%", nnpa: "4.8%", accounts: 15, amount: "₹42.8L", recovery: "₹3.6L", tone: "bad" },
  { branch: "Poonamallee", gnpa: "4.7%", nnpa: "3.9%", accounts: 12, amount: "₹31.5L", recovery: "₹5.2L", tone: "warn" },
  { branch: "Hosur", gnpa: "3.8%", nnpa: "3.1%", accounts: 9, amount: "₹22.1L", recovery: "₹4.8L", tone: "warn" },
  { branch: "Bangalore", gnpa: "3.2%", nnpa: "2.6%", accounts: 11, amount: "₹28.4L", recovery: "₹6.0L", tone: "warn" },
  { branch: "Channel", gnpa: "3.0%", nnpa: "2.4%", accounts: 7, amount: "₹16.6L", recovery: "₹3.1L", tone: "warn" },
  { branch: "Salem", gnpa: "2.5%", nnpa: "2.0%", accounts: 6, amount: "₹12.4L", recovery: "₹2.1L", tone: "warn" },
  { branch: "Cuddalore", gnpa: "2.2%", nnpa: "1.8%", accounts: 4, amount: "₹9.8L", recovery: "₹2.0L", tone: "good" },
  { branch: "Peenya", gnpa: "1.9%", nnpa: "1.5%", accounts: 3, amount: "₹7.0L", recovery: "₹1.4L", tone: "good" },
  { branch: "Trichy", gnpa: "1.4%", nnpa: "1.1%", accounts: 3, amount: "₹4.1L", recovery: "₹1.1L", tone: "good" },
] as const;
