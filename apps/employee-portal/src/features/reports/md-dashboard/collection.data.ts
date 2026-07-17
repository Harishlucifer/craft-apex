// Static demo data for the Collection tab (Sep'25).

export const COLL_CARDS = [
  { key: "sep", label: "Sep Collection %", value: "55.5%", note: "vs 65% target", accent: "#EF4444" },
  { key: "ytd", label: "YTD Collection %", value: "55.46%", note: "Apr-Sep cumulative", accent: "#F59E0B" },
  { key: "demand", label: "Sep Demand", value: "₹845.2L", note: "2,354 contracts", accent: "#2563EB" },
  { key: "collected", label: "Sep Collected", value: "₹469.1L", note: "55.5% of demand", accent: "#10B981" },
  { key: "nil", label: "Nil Collection", value: "9.26%", note: "vs <7% target", accent: "#EF4444" },
  { key: "eff", label: "0+1+2 Efficiency", value: "91.4%", note: "Target 95%", accent: "#0EA5E9" },
] as const;

export const COLL_MONTHLY = [
  { month: "Apr", pct: 56.0 },
  { month: "May", pct: 54.3 },
  { month: "Jun", pct: 55.1 },
  { month: "Jul", pct: 53.5 },
  { month: "Aug", pct: 54.3 },
  { month: "Sep", pct: 55.5 },
];
export const COLL_TARGET = 65;

export const DEMAND_COLLECTED = [
  { month: "Apr", demand: 810, collected: 454 },
  { month: "May", demand: 822, collected: 446 },
  { month: "Jun", demand: 831, collected: 458 },
  { month: "Jul", demand: 838, collected: 448 },
  { month: "Aug", demand: 840, collected: 456 },
  { month: "Sep", demand: 845, collected: 469 },
];

export const COLL_BUCKETS = [
  { label: "0 Bucket", nos: 1203, demand: "₹245.9L", pct: 96, color: "#1E2A6B" },
  { label: "1 Bucket", nos: 544, demand: "₹138.7L", pct: 70.5, color: "#F59E0B" },
  { label: "2 Bucket", nos: 401, demand: "₹201.6L", pct: 40.8, color: "#FB923C" },
  { label: "3 Bucket", nos: 118, demand: "₹85.3L", pct: 37.3, color: "#F97316" },
  { label: "4+ Bucket", nos: 88, demand: "₹174.1L", pct: 12, color: "#EF4444" },
] as const;

export const BRANCH_COLL = [
  { branch: "Trichy", pct: 82.6 },
  { branch: "Peenya", pct: 65.0 },
  { branch: "Salem", pct: 63.4 },
  { branch: "Cuddalore", pct: 59.2 },
  { branch: "Channel", pct: 56.4 },
  { branch: "Bangalore", pct: 55.7 },
  { branch: "Poonamallee", pct: 50.6 },
  { branch: "Hosur", pct: 49.3 },
  { branch: "Vellore", pct: 40.1 },
  { branch: "Coimbatore", pct: 38.1 },
];

export const MODE_MIX = [
  { name: "NACH", value: 62, color: "#2563EB" },
  { name: "Online", value: 18, color: "#10B981" },
  { name: "Cash", value: 12, color: "#F59E0B" },
  { name: "Cheque", value: 8, color: "#94A3B8" },
];

export const NIL_TREND = [
  { month: "Apr", pct: 7.5 },
  { month: "May", pct: 8.1 },
  { month: "Jun", pct: 8.6 },
  { month: "Jul", pct: 9.0 },
  { month: "Aug", pct: 9.4 },
  { month: "Sep", pct: 9.26 },
];
export const NIL_TARGET = 7;

export const COLL_TABLE = [
  { branch: "Bangalore", demand: "₹178.4L", collected: "₹99.4L", coll: "55.7%", nil: "8.4%", b4: "₹28.1L", tone: "warn" },
  { branch: "Peenya", demand: "₹120.2L", collected: "₹78.1L", coll: "65.0%", nil: "5.9%", b4: "₹14.0L", tone: "good" },
  { branch: "Poonamallee", demand: "₹96.7L", collected: "₹48.9L", coll: "50.6%", nil: "11.2%", b4: "₹22.4L", tone: "bad" },
  { branch: "Channel", demand: "₹88.3L", collected: "₹49.8L", coll: "56.4%", nil: "7.8%", b4: "₹16.6L", tone: "warn" },
  { branch: "Coimbatore", demand: "₹74.1L", collected: "₹28.2L", coll: "38.1%", nil: "14.1%", b4: "₹31.9L", tone: "bad" },
  { branch: "Cuddalore", demand: "₹61.5L", collected: "₹36.4L", coll: "59.2%", nil: "6.7%", b4: "₹9.8L", tone: "good" },
  { branch: "Hosur", demand: "₹58.9L", collected: "₹29.0L", coll: "49.3%", nil: "9.9%", b4: "₹13.2L", tone: "warn" },
  { branch: "Salem", demand: "₹54.2L", collected: "₹34.4L", coll: "63.4%", nil: "6.1%", b4: "₹7.4L", tone: "good" },
  { branch: "Trichy", demand: "₹40.7L", collected: "₹33.6L", coll: "82.6%", nil: "3.2%", b4: "₹4.1L", tone: "good" },
  { branch: "Vellore", demand: "₹72.2L", collected: "₹29.0L", coll: "40.1%", nil: "12.8%", b4: "₹25.7L", tone: "bad" },
] as const;
