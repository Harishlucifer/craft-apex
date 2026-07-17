// Static demo data for the PDD Tracker page.

export const PDD_PRODUCTS = [
  { name: "Credit Card Loan", count: 142 },
  { name: "Personal Loan", count: 67 },
  { name: "Business Loan", count: 37 },
  { name: "Payday Loan", count: 41 },
  { name: "Housing Loan", count: 71 },
  { name: "Non-Housing Loan", count: 157 },
  { name: "Vehicle Loan", count: 124 },
  { name: "Used Vehicle Loan", count: 123 },
  { name: "Passenger Vehicle Finance", count: 118 },
  { name: "Commercial Vehicle Finance", count: 99 },
];

export const PDD_KPIS = [
  { key: "total", label: "Total PDD Pending", value: 47, note: "18 critical cases", up: false },
  { key: "veh", label: "Vehicle Insurance", value: 15, note: "8 critical", up: false },
  { key: "invoice", label: "Invoice", value: 14, note: "2 critical", up: true },
  { key: "rc", label: "RC", value: 10, note: "4 critical", up: true },
  { key: "pdc", label: "PDC", value: 8, note: "5 critical", up: true },
] as const;

export const DOC_SPLIT = [
  { name: "Invoice", value: 14, color: "#1E2A6B" },
  { name: "RC", value: 10, color: "#14B8A6" },
  { name: "Veh. Ins.", value: 15, color: "#F59E0B" },
  { name: "PDC", value: 8, color: "#EF4444" },
];

export const AGING_BY_DOC = [
  { doc: "Invoice", Critical: 5, Warning: 5, OK: 4 },
  { doc: "RC", Critical: 4, Warning: 3, OK: 3 },
  { doc: "Veh. Ins.", Critical: 8, Warning: 4, OK: 3 },
  { doc: "PDC", Critical: 5, Warning: 2, OK: 1 },
];

export interface BranchGap {
  branch: string;
  invoice: number;
  rc: number;
  veh: number;
  pdc: number;
  mix: { c: number; w: number; o: number };
}

export const BRANCH_GAP: BranchGap[] = [
  { branch: "Chennai", invoice: 3, rc: 1, veh: 1, pdc: 1, mix: { c: 3, w: 2, o: 1 } },
  { branch: "Bangalore", invoice: 1, rc: 2, veh: 0, pdc: 0, mix: { c: 1, w: 1, o: 1 } },
  { branch: "Coimbatore", invoice: 3, rc: 1, veh: 0, pdc: 2, mix: { c: 3, w: 2, o: 1 } },
  { branch: "Trichy", invoice: 1, rc: 0, veh: 0, pdc: 1, mix: { c: 1, w: 1, o: 0 } },
  { branch: "Vellore", invoice: 0, rc: 3, veh: 0, pdc: 1, mix: { c: 2, w: 1, o: 1 } },
  { branch: "Salem", invoice: 3, rc: 0, veh: 2, pdc: 1, mix: { c: 3, w: 2, o: 1 } },
  { branch: "Poonamallee", invoice: 1, rc: 1, veh: 4, pdc: 2, mix: { c: 4, w: 2, o: 2 } },
  { branch: "Cuddalore", invoice: 1, rc: 0, veh: 2, pdc: 0, mix: { c: 1, w: 1, o: 1 } },
  { branch: "Hosur", invoice: 1, rc: 2, veh: 1, pdc: 2, mix: { c: 3, w: 2, o: 1 } },
];

export interface PddCase {
  sl: string;
  branch: string;
  contract: string;
  customer: string;
  executive: string;
  docType: string;
  aging: number;
  disb: string;
  vehicle: string;
}

export const PDD_CASES: PddCase[] = [
  { sl: "01", branch: "Chennai", contract: "LCHE23001001", customer: "RAVI SHANKAR P", executive: "Suresh K", docType: "RC", aging: 92, disb: "12/01/2025", vehicle: "Supro" },
  { sl: "02", branch: "Bangalore", contract: "LBAN22001002", customer: "JAYAKODI V", executive: "Priya M", docType: "Veh. Ins.", aging: 75, disb: "05/02/2025", vehicle: "Ertiga" },
  { sl: "03", branch: "Coimbatore", contract: "LC0T23001003", customer: "ARUMUGAM S", executive: "Vijay R", docType: "Invoice", aging: 45, disb: "18/02/2025", vehicle: "Marazzo" },
  { sl: "04", branch: "Hosur", contract: "LH0S23001004", customer: "BASKARAN R", executive: "Meena S", docType: "PDC", aging: 88, disb: "22/01/2025", vehicle: "Ciaz" },
  { sl: "05", branch: "Vellore", contract: "LVEL22001005", customer: "SELVARAJ M", executive: "Kumar A", docType: "RC", aging: 67, disb: "30/01/2025", vehicle: "Dost" },
  { sl: "06", branch: "Salem", contract: "LSAL23001006", customer: "RAJENDHIRAN P", executive: "Anbu T", docType: "Veh. Ins.", aging: 95, disb: "08/01/2025", vehicle: "Supro" },
  { sl: "07", branch: "Trichy", contract: "LTRI22001007", customer: "GOPALAKRISHNAN V", executive: "Rajan P", docType: "Invoice", aging: 38, disb: "25/02/2025", vehicle: "BMT" },
  { sl: "08", branch: "Poonamallee", contract: "LP00S23001008", customer: "PONNUSAMY K", executive: "Divya L", docType: "Veh. Ins.", aging: 82, disb: "14/01/2025", vehicle: "Frigo" },
  { sl: "09", branch: "Cuddalore", contract: "LCUD23001009", customer: "MURUGAN R", executive: "Senthil V", docType: "PDC", aging: 58, disb: "20/02/2025", vehicle: "Bolero" },
  { sl: "10", branch: "Chennai", contract: "LCHE23001010", customer: "VENKATESH M", executive: "Suresh K", docType: "RC", aging: 101, disb: "03/01/2025", vehicle: "Supro" },
];
