// Static demo data for the Portfolio Mix tab (Sep'25).

export const PMIX_CARDS = [
  { key: "aum", label: "Total AUM", value: "₹10,459L", note: "across 7 products", accent: "#2563EB" },
  { key: "contracts", label: "Active Contracts", value: "2,354", note: "+86 net in Sep", accent: "#10B981" },
  { key: "ats", label: "Avg Ticket Size", value: "₹5.06L", note: "YTD avg ₹5.2L", accent: "#7C3AED" },
  { key: "secured", label: "Secured Share", value: "72%", note: "28% unsecured", accent: "#0EA5E9" },
  { key: "top", label: "Top Product", value: "LAP", note: "31% of AUM", accent: "#F59E0B" },
  { key: "npa", label: "Portfolio NPA", value: "3.11%", note: "Net 2.50%", accent: "#EF4444" },
] as const;

export const PRODUCT_COLORS = [
  "#2563EB", "#10B981", "#7C3AED", "#F59E0B", "#0EA5E9", "#EF4444", "#14B8A6",
];

export const PRODUCT_MIX = [
  { name: "LAP", aum: 3243, share: 31 },
  { name: "Home Loan", aum: 2300, share: 22 },
  { name: "Business Loan", aum: 1779, share: 17 },
  { name: "Used Car", aum: 1150, share: 11 },
  { name: "Personal Loan", aum: 941, share: 9 },
  { name: "Two-Wheeler", aum: 540, share: 5 },
  { name: "Gold Loan", aum: 506, share: 5 },
];

export const SECURED_MIX = [
  { name: "Secured", value: 72, color: "#1E2A6B" },
  { name: "Unsecured", value: 28, color: "#F59E0B" },
];

export const TICKET_BUCKETS = [
  { range: "<₹2L", count: 410 },
  { range: "₹2–5L", count: 720 },
  { range: "₹5–10L", count: 640 },
  { range: "₹10–25L", count: 430 },
  { range: ">₹25L", count: 154 },
];

export const TENURE_MIX = [
  { range: "<12m", share: 8 },
  { range: "12–24m", share: 21 },
  { range: "24–36m", share: 34 },
  { range: "36–60m", share: 27 },
  { range: ">60m", share: 10 },
];

export const REGION_MIX = [
  { region: "Bangalore", share: 26 },
  { region: "Peenya", share: 18 },
  { region: "Coimbatore", share: 14 },
  { region: "Salem", share: 12 },
  { region: "Hosur", share: 11 },
  { region: "Trichy", share: 10 },
  { region: "Vellore", share: 9 },
];

export const AUM_BY_PRODUCT = [
  { month: "Apr", LAP: 3050, Home: 2180, Business: 1700, Others: 3050 },
  { month: "May", LAP: 3090, Home: 2210, Business: 1720, Others: 3030 },
  { month: "Jun", LAP: 3130, Home: 2240, Business: 1740, Others: 3060 },
  { month: "Jul", LAP: 3170, Home: 2260, Business: 1760, Others: 3090 },
  { month: "Aug", LAP: 3205, Home: 2280, Business: 1770, Others: 3110 },
  { month: "Sep", LAP: 3243, Home: 2300, Business: 1779, Others: 3137 },
];

export const PMIX_TABLE = [
  { product: "LAP", contracts: 642, aum: "₹3,243L", share: "31%", ats: "₹5.05L", npa: "2.8%", tone: "good" },
  { product: "Home Loan", contracts: 388, aum: "₹2,300L", share: "22%", ats: "₹5.93L", npa: "1.9%", tone: "good" },
  { product: "Business Loan", contracts: 451, aum: "₹1,779L", share: "17%", ats: "₹3.94L", npa: "4.2%", tone: "warn" },
  { product: "Used Car", contracts: 287, aum: "₹1,150L", share: "11%", ats: "₹4.01L", npa: "3.6%", tone: "warn" },
  { product: "Personal Loan", contracts: 312, aum: "₹941L", share: "9%", ats: "₹3.02L", npa: "5.1%", tone: "bad" },
  { product: "Two-Wheeler", contracts: 174, aum: "₹540L", share: "5%", ats: "₹3.10L", npa: "3.0%", tone: "warn" },
  { product: "Gold Loan", contracts: 100, aum: "₹506L", share: "5%", ats: "₹5.06L", npa: "0.9%", tone: "good" },
] as const;
