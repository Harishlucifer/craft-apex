import {
  LayoutGrid,
  Users,
  ShoppingCart,
  Wallet,
  Briefcase,
  BarChart3,
  Package,
  Settings,
  HelpCircle,
  FileText,
  ClipboardList,
  Truck,
  CreditCard,
  Building2,
  Landmark,
  Scale,
  Megaphone,
  UserCheck,
  ShieldCheck,
  ListChecks,
  Boxes,
  type LucideIcon,
} from "lucide-react";

/**
 * Legacy stores `module.icon` as an icon-font class (remix/feather), which
 * we can't render directly. Map by keyword from the icon class or the label
 * to a lucide icon; fall back to a neutral box. Presentational only.
 */
const KEYWORDS: [RegExp, LucideIcon][] = [
  [/dash|home|grid/, LayoutGrid],
  [/user|employee|hrms|hr\b|people|role/, Users],
  [/sale|lead|cart|order/, ShoppingCart],
  [/purchase|procure|vendor/, Boxes],
  [/finance|payable|receivable|invoice|payment|wallet/, Wallet],
  [/account|ledger|treasury|bank/, Landmark],
  [/card|disburs/, CreditCard],
  [/report|analytic|mis|chart/, BarChart3],
  [/product|catalog|scheme|loan-type/, Package],
  [/system|config|setting|master|parameter/, Settings],
  [/support|help|faq/, HelpCircle],
  [/legal|rule|compliance/, Scale],
  [/market|campaign|template/, Megaphone],
  [/verif|kyc|check/, UserCheck],
  [/security|access|privilege/, ShieldCheck],
  [/channel|partner|apf|company|builder/, Building2],
  [/collection|repayment|los|lms|recovery/, ListChecks],
  [/document|doc|note|quotation/, FileText],
  [/delivery|challan|tracking|conveyance/, Truck],
  [/queue|q\b|list|application/, ClipboardList],
];

export function resolveIcon(opts: {
  icon?: string;
  label: string;
}): LucideIcon {
  const hay = `${opts.icon ?? ""} ${opts.label}`.toLowerCase();
  for (const [re, Icon] of KEYWORDS) {
    if (re.test(hay)) return Icon;
  }
  return Briefcase;
}
