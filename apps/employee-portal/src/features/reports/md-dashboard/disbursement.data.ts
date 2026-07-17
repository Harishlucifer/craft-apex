// Static demo data for the Disbursement tab (FY 2025-26).

export const DISB_CARDS = [
  { key: "sep", label: "Sep'25 Actual", value: "₹430L", note: "85 new files disbursed", sub: "of revised ₹450L target", accent: "#10B981", bar: 96 },
  { key: "ytd", label: "YTD Apr-Sep Actual", value: "₹2,502L", note: "₹2,188L below revised target", sub: "Revised YTD target ₹2,700L", accent: "#F59E0B", bar: 93 },
  { key: "fy", label: "FY 2024-25 (Same Period)", value: "₹2,640L", note: "5.2% YoY decline", sub: "Apr-Sep FY 24-25 total", accent: "#94A3B8", bar: 0 },
  { key: "files", label: "Sep New Files", value: "85", note: "25% vs Aug (68 files)", sub: "of target 150 files", accent: "#2563EB", bar: 57 },
  { key: "ats", label: "Sep Avg Ticket Size", value: "₹5.06L", note: "30 files | YTD avg ₹5.2L", sub: "Average ticket size", accent: "#7C3AED", bar: 0 },
  { key: "aum", label: "AUM Sep'25", value: "₹10,459L", note: "up from ₹70,503L", sub: "Collections : Disbursements", accent: "#0EA5E9", bar: 0 },
] as const;

export const MONTHLY_DISB = [
  { month: "Apr", original: 450, revised: 450, actual: 435 },
  { month: "May", original: 475, revised: 450, actual: 416 },
  { month: "Jun", original: 500, revised: 450, actual: 392 },
  { month: "Jul", original: 500, revised: 450, actual: 458 },
  { month: "Aug", original: 575, revised: 450, actual: 372 },
  { month: "Sep", original: 600, revised: 450, actual: 438 },
];

export const ACHIEVEMENT = [
  { month: "Apr 25", pct: 96.7 },
  { month: "May 25", pct: 82.4 },
  { month: "Jun 25", pct: 87.1 },
  { month: "Jul 25", pct: 101.8 },
  { month: "Aug 25", pct: 82.7 },
  { month: "Sep 25", pct: 96.9 },
];

export const FY_TREND = [
  { month: "Apr", fy2425: 380, fy2526: 435 },
  { month: "May", fy2425: 415, fy2526: 416 },
  { month: "Jun", fy2425: 355, fy2526: 392 },
  { month: "Jul", fy2425: 410, fy2526: 458 },
  { month: "Aug", fy2425: 430, fy2526: 372 },
  { month: "Sep", fy2425: 440, fy2526: 438 },
  { month: "Oct", fy2425: 460, fy2526: null },
  { month: "Nov", fy2425: 470, fy2526: null },
  { month: "Dec", fy2425: 485, fy2526: null },
  { month: "Jan", fy2425: 495, fy2526: null },
  { month: "Feb", fy2425: 505, fy2526: null },
  { month: "Mar", fy2425: 500, fy2526: null },
];

export const AUM_TREND = [
  { month: "Apr", fy2223: 8800, fy2324: 9300, fy2425: 9900, fy2526: 10500 },
  { month: "May", fy2223: 8900, fy2324: 9400, fy2425: 10000, fy2526: 10350 },
  { month: "Jun", fy2223: 9050, fy2324: 9550, fy2425: 10100, fy2526: 10200 },
  { month: "Jul", fy2223: 9200, fy2324: 9700, fy2425: 10200, fy2526: 10100 },
  { month: "Aug", fy2223: 9350, fy2324: 9850, fy2425: 10300, fy2526: 10050 },
  { month: "Sep", fy2223: 9500, fy2324: 10000, fy2425: 10400, fy2526: 10000 },
  { month: "Oct", fy2223: 9650, fy2324: 10150, fy2425: 10550, fy2526: null },
  { month: "Nov", fy2223: 9800, fy2324: 10300, fy2425: 10700, fy2526: null },
  { month: "Dec", fy2223: 9950, fy2324: 10500, fy2425: 10850, fy2526: null },
  { month: "Jan", fy2223: 10100, fy2324: 10700, fy2425: 11000, fy2526: null },
  { month: "Feb", fy2223: 10250, fy2324: 10900, fy2425: 11150, fy2526: null },
  { month: "Mar", fy2223: 10400, fy2324: 11100, fy2425: 11300, fy2526: null },
];

export const BUS_PORTFOLIO = [
  { month: "Apr", pct: 55, contracts: 7, above: false },
  { month: "May", pct: 78, contracts: 5, above: true },
  { month: "Jun", pct: 52, contracts: 5, above: false },
  { month: "Jul", pct: 54, contracts: 6, above: false },
  { month: "Aug", pct: 53, contracts: 6, above: false },
  { month: "Sep", pct: 70, contracts: 5, above: true },
];

export const DISB_SUMMARY = [
  { month: "Apr'25", orig: "450L", revised: "450L", actual: "₹434.9L", vsOrig: "96.7%", vsRev: "96.7%", npr: "80", ats: "₹5.44L", shortfall: "₹15.0L", vsRevTone: "warn" },
  { month: "May'25", orig: "475L", revised: "450L", actual: "₹415.9L", vsOrig: "87.6%", vsRev: "92.4%", npr: "86", ats: "₹4.84L", shortfall: "₹74.1L", vsRevTone: "warn" },
  { month: "Jun'25", orig: "500L", revised: "450L", actual: "₹391.9L", vsOrig: "78.4%", vsRev: "87.1%", npr: "84", ats: "₹4.67L", shortfall: "₹182.1L", vsRevTone: "warn" },
  { month: "Jul'25", orig: "500L", revised: "450L", actual: "₹457.8L", vsOrig: "91.6%", vsRev: "101.7%", npr: "74", ats: "₹6.18L", shortfall: "₹275.3L", vsRevTone: "good" },
  { month: "Aug'25", orig: "575L", revised: "450L", actual: "₹372.2L", vsOrig: "64.7%", vsRev: "82.7%", npr: "68", ats: "₹5.47L", shortfall: "₹477.5L", vsRevTone: "warn" },
  { month: "Sep'25", orig: "600L", revised: "450L", actual: "₹438.1L", vsOrig: "73.0%", vsRev: "97.4%", npr: "85", ats: "₹5.86L", shortfall: "₹647.7L", vsRevTone: "warn" },
] as const;
