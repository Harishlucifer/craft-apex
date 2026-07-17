// Static demo data for the MD Dashboard (SEP'25). No live API yet — these
// mirror the presentation deck the dashboard was modelled on.

export const COMPANY_HEALTH = [
  { key: "disbursement", label: "Disbursement", value: "₹430L", sub: "55.6%", note: "15.8k, short -35.8%", dir: "up", tone: "neutral", trend: [372, 410, 395, 430, 388, 430] },
  { key: "collection", label: "Collection", value: "55.5%", sub: "Collection", note: "5.5bps Increase · 6 months", dir: "up", tone: "good", trend: [50, 52, 54, 53, 56, 55.5] },
  { key: "irr", label: "IRR (AP)", value: "18.94%", sub: "IRR (AP)", note: "0.08bps Inline target", dir: "down", tone: "bad", trend: [19.1, 19.0, 18.9, 19.0, 18.9, 18.94] },
  { key: "gross", label: "Gross NPA %", value: "3.11%", sub: "Gross NPA %", note: "Recovered from 3.68% Aug", dir: "up", tone: "good", trend: [3.4, 3.5, 3.6, 3.68, 3.3, 3.11] },
  { key: "net", label: "Net NPA", value: "2.50%", sub: "Net NPA", note: "0.50bps above limit", dir: "down", tone: "warn", trend: [2.1, 2.4, 2.7, 2.93, 2.7, 2.5] },
  { key: "rc", label: "RC >120 Days", value: "33", sub: "RC >120 Days", note: "16 vs allowed MDM limit", dir: "up", tone: "warn", trend: [54, 40, 28, 9, 21, 33] },
] as const;

export const YTD_PROGRESS = [
  {
    key: "disb",
    title: "Disbursement YTD",
    subtitle: "Apr–Sep vs Targeted Target YTD",
    pct: 92.7,
    actual: "₹2,530L",
    target: "₹2,130L",
    gap: "FMBL",
    bars: [
      { month: "APR", value: 70 }, { month: "MAY", value: 65 }, { month: "JUN", value: 75 },
      { month: "JUL", value: 80 }, { month: "AUG", value: 60 }, { month: "SEP", value: 72 },
    ],
  },
  {
    key: "coll",
    title: "Cumulative Collection %",
    subtitle: "Actual Collection Rate vs Target",
    pct: 55.5,
    actual: "55.5%",
    target: "55%",
    gap: "FMBL",
    bars: [
      { month: "APR", value: 50 }, { month: "MAY", value: 52 }, { month: "JUN", value: 54 },
      { month: "JUL", value: 53 }, { month: "AUG", value: 56 }, { month: "SEP", value: 55 },
    ],
  },
  {
    key: "fos",
    title: "FOS Manpower Strength",
    subtitle: "Actual vs Budgeted FOS",
    pct: 72.5,
    actual: "72.5%",
    target: "80 FOS",
    gap: "FMBL",
    bars: [
      { month: "APR", value: 65 }, { month: "MAY", value: 68 }, { month: "JUN", value: 70 },
      { month: "JUL", value: 72 }, { month: "AUG", value: 75 }, { month: "SEP", value: 73 },
    ],
  },
] as const;

export type NpaStatus = "Match" | "OK" | "Watch" | "High Risk";

export const BRANCHES: {
  branch: string;
  disb: string;
  ytd: string;
  collection: string;
  irr: string;
  npa: NpaStatus;
}[] = [
  { branch: "Bangalore", disb: "73%", ytd: "96%", collection: "55.7%", irr: "19.38%", npa: "Match" },
  { branch: "Peenya", disb: "166%", ytd: "116%", collection: "65.0%", irr: "19.13%", npa: "OK" },
  { branch: "Poonamallee", disb: "85%", ytd: "73%", collection: "50.6%", irr: "18.98%", npa: "Watch" },
  { branch: "Channel", disb: "126%", ytd: "79%", collection: "56.4%", irr: "19.44%", npa: "Match" },
  { branch: "Coimbatore", disb: "75%", ytd: "79%", collection: "38.1%", irr: "19.90%", npa: "High Risk" },
  { branch: "Cuddalore", disb: "91%", ytd: "80%", collection: "59.2%", irr: "18.82%", npa: "OK" },
  { branch: "Hosur", disb: "120%", ytd: "120%", collection: "49.3%", irr: "19.22%", npa: "Match" },
  { branch: "Salem", disb: "111%", ytd: "75%", collection: "63.4%", irr: "19.27%", npa: "Watch" },
  { branch: "Trichy", disb: "43%", ytd: "72%", collection: "82.6%", irr: "19.34%", npa: "OK" },
  { branch: "Vellore", disb: "79%", ytd: "76%", collection: "40.1%", irr: "19.37%", npa: "High Risk" },
];

export const CRITICAL_ALERTS = [
  {
    severity: "critical" as const,
    title: "Collection 9.5pp below target — 6 consecutive months",
    lines: [
      "Cumulative collection at 55.46% vs 65% target. Aug worst at 54.29%. FY 24-25 same period was 65.76%. YoY deterioration of 10.3pp.",
      "Modules: All 10 branches · Nil collection 9.26% vs 7% target",
    ],
    badge: "-9.5pp",
    action: undefined as string | undefined,
  },
  {
    severity: "critical" as const,
    title: "Net NPA exceeds 2% every month since Apr'25",
    lines: [
      "Sep Net NPA 2.50% vs <2% target. Aug peak: 2.93%. 4+ bucket growing from 51 (Apr) to 88 contracts (Sep). No month achieved target.",
    ],
    badge: "+0.50pp",
    action: "Action: Daily NPA dashboard to BMs instituted",
  },
  {
    severity: "critical" as const,
    title: "RC above 120 days: 33 cases vs MOM target of 2",
    lines: [
      "Used/Refi RC >120 days at 33 in Sep. Peak was 54 in Jun. Sep new RC spiked to 21 (from 9 in Aug).",
      "MOM Action 21-Aug-25: Max 2 cases. Follow-up in progress.",
    ],
    badge: "16.5x",
    action: undefined,
  },
  {
    severity: "watch" as const,
    title: "19 FOS positions unfilled — Trichy short 5",
    lines: [
      "50 of 69 FOS filled (72.5%). Trichy: req 8, short 3. Salem: req 10, have 6. Hiring plan: Nov 4, Dec 7, Jan 8.",
      "Full strength expected Jan'26",
    ],
    badge: "-19 FOS",
    action: undefined,
  },
  {
    severity: "watch" as const,
    title: "YTD disbursement ₹19BL short vs revised target",
    lines: [
      "₹2,502L of ₹2,700L YTD revised target. Aug was worst at ₹372L (82.7%). Sep recovery at ₹430L (95.6%).",
      "Original target shortfall: ₹647L vs ₹3,150L",
    ],
    badge: "₹19BL",
    action: undefined,
  },
];

export const OM_ACTIONS = [
  { n: 1, title: "RC >120 days: Max 2 cases at any time", owner: "All BMs · Operations", status: "33 cases — ongoing", tone: "bad" },
  { n: 2, title: "Daily NPA dashboard to Branch Managers", owner: "IT / Collections Head", status: "In progress", tone: "info" },
  { n: 3, title: "Bus portfolio: maintain 15% of disbursement", owner: "All BMs · Sales", status: "May–Sep all below target", tone: "warn" },
  { n: 4, title: "FOS hiring: 4 by Nov, 7 by Dec, 8 by Jan", owner: "HR · Respective BMs", status: "Nov plan in progress", tone: "info" },
  { n: 5, title: "Disbursement revised to ₹450L/mo flat", owner: "MD Decision · Aug 25", status: "Implemented", tone: "good" },
  { n: 6, title: "Nil collection review: target <7%", owner: "Collections Team", status: "Sep: 9.26% — above target", tone: "bad" },
] as const;

export const OD_BUCKETS = [
  { label: "0 Bucket", nos: 1203, demand: "₹245.9L", pct: 96, color: "#1E2A6B" },
  { label: "1 Bucket", nos: 544, demand: "₹138.7L", pct: 70.5, color: "#F59E0B" },
  { label: "2 Bucket", nos: 401, demand: "₹201.6L", pct: 40.8, color: "#FB923C" },
  { label: "3 Bucket", nos: 118, demand: "₹85.3L", pct: 37.3, color: "#F97316" },
  { label: "4+ Bucket", nos: 88, demand: "₹174.1L", pct: 12, color: "#EF4444" },
] as const;

export const TABS = [
  "MD Dashboard", "Disbursement", "Portfolio Mix", "Collection",
  "NPA", "RC / PDD", "Branch", "Manpower",
] as const;
