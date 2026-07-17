// Static demo data for the Branch tab (Sep'25).

export const BRANCH_CARDS = [
  { key: "total", label: "Total Branches", value: "10", note: "across 2 states", accent: "#2563EB" },
  { key: "top", label: "Top Performer", value: "Peenya", note: "166% disb · 116% YTD", accent: "#10B981" },
  { key: "coll", label: "Avg Collection %", value: "55.5%", note: "vs 65% target", accent: "#F59E0B" },
  { key: "above", label: "Above Target", value: "3", note: "branches on disb", accent: "#0EA5E9" },
  { key: "bestNpa", label: "Best NPA", value: "Trichy", note: "1.1% net NPA", accent: "#7C3AED" },
  { key: "risk", label: "At Risk", value: "4", note: "high NPA / low coll", accent: "#EF4444" },
] as const;

export const BRANCH_DISB = [
  { branch: "Peenya", pct: 166 },
  { branch: "Channel", pct: 126 },
  { branch: "Hosur", pct: 120 },
  { branch: "Salem", pct: 111 },
  { branch: "Cuddalore", pct: 91 },
  { branch: "Poonamallee", pct: 85 },
  { branch: "Vellore", pct: 79 },
  { branch: "Coimbatore", pct: 75 },
  { branch: "Bangalore", pct: 73 },
  { branch: "Trichy", pct: 43 },
];

export const BRANCH_NPA = [
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

export const DISB_VS_COLL = [
  { branch: "Bangalore", disb: 73, coll: 55.7 },
  { branch: "Peenya", disb: 166, coll: 65.0 },
  { branch: "Poonamallee", disb: 85, coll: 50.6 },
  { branch: "Channel", disb: 126, coll: 56.4 },
  { branch: "Coimbatore", disb: 75, coll: 38.1 },
  { branch: "Cuddalore", disb: 91, coll: 59.2 },
  { branch: "Hosur", disb: 120, coll: 49.3 },
  { branch: "Salem", disb: 111, coll: 63.4 },
  { branch: "Trichy", disb: 43, coll: 82.6 },
  { branch: "Vellore", disb: 79, coll: 40.1 },
];

export type BranchStatus = "Match" | "OK" | "Watch" | "High Risk";

export const BRANCH_SCORECARD: {
  branch: string;
  disb: string;
  ytd: string;
  coll: string;
  irr: string;
  npa: string;
  rc: number;
  status: BranchStatus;
}[] = [
  { branch: "Bangalore", disb: "73%", ytd: "96%", coll: "55.7%", irr: "19.38%", npa: "2.6%", rc: 8, status: "Match" },
  { branch: "Peenya", disb: "166%", ytd: "116%", coll: "65.0%", irr: "19.13%", npa: "1.5%", rc: 4, status: "OK" },
  { branch: "Poonamallee", disb: "85%", ytd: "73%", coll: "50.6%", irr: "18.98%", npa: "3.9%", rc: 10, status: "Watch" },
  { branch: "Channel", disb: "126%", ytd: "79%", coll: "56.4%", irr: "19.44%", npa: "2.4%", rc: 7, status: "Match" },
  { branch: "Coimbatore", disb: "75%", ytd: "79%", coll: "38.1%", irr: "19.90%", npa: "5.2%", rc: 14, status: "High Risk" },
  { branch: "Cuddalore", disb: "91%", ytd: "80%", coll: "59.2%", irr: "18.82%", npa: "1.8%", rc: 5, status: "OK" },
  { branch: "Hosur", disb: "120%", ytd: "120%", coll: "49.3%", irr: "19.22%", npa: "3.1%", rc: 9, status: "Match" },
  { branch: "Salem", disb: "111%", ytd: "75%", coll: "63.4%", irr: "19.27%", npa: "2.0%", rc: 6, status: "Watch" },
  { branch: "Trichy", disb: "43%", ytd: "72%", coll: "82.6%", irr: "19.34%", npa: "1.1%", rc: 3, status: "OK" },
  { branch: "Vellore", disb: "79%", ytd: "76%", coll: "40.1%", irr: "19.37%", npa: "4.8%", rc: 12, status: "High Risk" },
];
