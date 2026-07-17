// Static demo data for the Manpower tab (Sep'25).

export const MANPOWER_CARDS = [
  { key: "strength", label: "FOS Strength", value: "50 / 69", note: "72.5% filled", accent: "#2563EB" },
  { key: "vacancies", label: "Vacancies", value: "19", note: "across 10 branches", accent: "#EF4444" },
  { key: "hires", label: "New Hires Sep", value: "6", note: "+2 vs Aug", accent: "#10B981" },
  { key: "attrition", label: "Attrition (YTD)", value: "11%", note: "vs 15% budget", accent: "#F59E0B" },
  { key: "short", label: "Most Short", value: "Trichy", note: "5 positions open", accent: "#7C3AED" },
  { key: "productivity", label: "Avg Productivity", value: "₹8.6L", note: "per FOS / month", accent: "#0EA5E9" },
] as const;

export const FOS_STRENGTH = [
  { month: "Apr", pct: 65 },
  { month: "May", pct: 68 },
  { month: "Jun", pct: 70 },
  { month: "Jul", pct: 72 },
  { month: "Aug", pct: 75 },
  { month: "Sep", pct: 72.5 },
];
export const FOS_TARGET = 80;

export const HIRING_PLAN = [
  { month: "Nov", planned: 4 },
  { month: "Dec", planned: 7 },
  { month: "Jan", planned: 8 },
];

export const FOS_BY_ROLE = [
  { name: "Sales Officer", value: 24, color: "#2563EB" },
  { name: "Relationship Mgr", value: 12, color: "#10B981" },
  { name: "Collection Officer", value: 10, color: "#F59E0B" },
  { name: "Team Lead", value: 4, color: "#7C3AED" },
];

export const FOS_BY_BRANCH = [
  { branch: "Bangalore", budgeted: 9, actual: 8 },
  { branch: "Peenya", budgeted: 7, actual: 6 },
  { branch: "Poonamallee", budgeted: 6, actual: 4 },
  { branch: "Channel", budgeted: 5, actual: 4 },
  { branch: "Coimbatore", budgeted: 8, actual: 6 },
  { branch: "Cuddalore", budgeted: 4, actual: 4 },
  { branch: "Hosur", budgeted: 6, actual: 5 },
  { branch: "Salem", budgeted: 10, actual: 6 },
  { branch: "Trichy", budgeted: 8, actual: 3 },
  { branch: "Vellore", budgeted: 6, actual: 4 },
];

export const VACANCY_BY_BRANCH = [
  { branch: "Trichy", vacancy: 5 },
  { branch: "Salem", vacancy: 4 },
  { branch: "Coimbatore", vacancy: 2 },
  { branch: "Poonamallee", vacancy: 2 },
  { branch: "Vellore", vacancy: 2 },
  { branch: "Bangalore", vacancy: 1 },
  { branch: "Peenya", vacancy: 1 },
  { branch: "Channel", vacancy: 1 },
  { branch: "Hosur", vacancy: 1 },
  { branch: "Cuddalore", vacancy: 0 },
];

export const MANPOWER_TABLE = [
  { branch: "Bangalore", budgeted: 9, actual: 8, vacancy: 1, fill: "88.9%", attrition: "9%", productivity: "₹9.1L", tone: "good" },
  { branch: "Peenya", budgeted: 7, actual: 6, vacancy: 1, fill: "85.7%", attrition: "7%", productivity: "₹10.2L", tone: "good" },
  { branch: "Poonamallee", budgeted: 6, actual: 4, vacancy: 2, fill: "66.7%", attrition: "14%", productivity: "₹7.2L", tone: "warn" },
  { branch: "Channel", budgeted: 5, actual: 4, vacancy: 1, fill: "80.0%", attrition: "10%", productivity: "₹8.8L", tone: "good" },
  { branch: "Coimbatore", budgeted: 8, actual: 6, vacancy: 2, fill: "75.0%", attrition: "16%", productivity: "₹6.9L", tone: "warn" },
  { branch: "Cuddalore", budgeted: 4, actual: 4, vacancy: 0, fill: "100%", attrition: "6%", productivity: "₹9.0L", tone: "good" },
  { branch: "Hosur", budgeted: 6, actual: 5, vacancy: 1, fill: "83.3%", attrition: "11%", productivity: "₹8.4L", tone: "good" },
  { branch: "Salem", budgeted: 10, actual: 6, vacancy: 4, fill: "60.0%", attrition: "18%", productivity: "₹6.5L", tone: "bad" },
  { branch: "Trichy", budgeted: 8, actual: 3, vacancy: 5, fill: "37.5%", attrition: "21%", productivity: "₹5.8L", tone: "bad" },
  { branch: "Vellore", budgeted: 6, actual: 4, vacancy: 2, fill: "66.7%", attrition: "15%", productivity: "₹7.0L", tone: "warn" },
] as const;
