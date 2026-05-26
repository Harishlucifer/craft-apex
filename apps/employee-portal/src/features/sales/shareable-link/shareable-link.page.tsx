import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Link2,
  MessageCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@craft-apex/ui";
import { useAuthStore } from "@craft-apex/auth";
import {
  useApplicantTypes,
  useChecklistDetail,
  useChecklistHeader,
  useLoanTypes,
  usePromoCreatives,
} from "./shareable-link.api";
import type { SharableLinkUser } from "./shareable-link.types";

// Legacy: craft-frontend/src/Components/ShareableLinks/index.js
// (mounted as <ShareableLinkComponent /> at /sales/shareable-link). Three
// collapsible sections — Apply Link / Document Checklist / Promo — each
// backed by its own data source.
//
// Deferred:
//  - Child-partner UTM generator modal (legacy ShareableLinks.js — a
//    different file mounted at /shareable-links). Not part of this page.
//  - WhatsApp share buttons in the legacy use `react-share`. Replaced here
//    with a plain `wa.me` deep-link to avoid pulling in the package.
//  - "Entity Type" select in the legacy checklist form is commented out and
//    not rendered here either.

// Mirrors legacy `formatDocumentListForSharing`.
function formatDocumentListForSharing(
  documentList: Array<{
    checklist_item_name?: string;
    items?: Array<{ document?: { document_name?: string } }>;
  }>,
): string {
  let shareText = "Documents Checklist:\n";
  documentList.forEach((checklist) => {
    shareText += `\n${checklist.checklist_item_name ?? ""}:\n`;
    (checklist.items ?? []).forEach((item) => {
      shareText += `- ${item.document?.document_name ?? ""}\n`;
    });
  });
  return shareText;
}

function openWhatsAppWeb(message: string) {
  // Legacy opens https://web.whatsapp.com/send?text=… in a new tab.
  window.open(
    `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Silently ignore — legacy has no fallback either.
  }
}

// ── Apply Link section ────────────────────────────────────────────────────────
function ApplyLinkPanel() {
  const user = useAuthStore((s) => s.user) as (SharableLinkUser & {}) | null;
  const partnerLink = user?.partner_sharable_link ?? "";
  const applicationLink = user?.application_sharable_link ?? "";

  return (
    <CardContent className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800">
          Partner Onboarding
        </p>
        {partnerLink ? (
          <LinkRow value={partnerLink} shareLabel="Partner Onboarding" />
        ) : (
          <p className="text-sm text-slate-500">Please contact IT admin</p>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800">Lead Creation</p>
        {applicationLink ? (
          <LinkRow value={applicationLink} shareLabel="Lead Creation" />
        ) : (
          <p className="text-sm text-slate-500">Please contact IT admin</p>
        )}
      </div>
    </CardContent>
  );
}

function LinkRow({ value, shareLabel }: { value: string; shareLabel: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-1 items-center rounded-md border border-slate-200 bg-slate-50">
        <span className="flex h-10 items-center px-3 text-slate-500">
          <Link2 className="h-4 w-4" />
        </span>
        <Input
          value={value}
          readOnly
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => openWhatsAppWeb(value)}
      >
        <MessageCircle className="h-4 w-4" /> Share
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(value)}
        title={`Copy ${shareLabel} link`}
      >
        <Copy className="h-4 w-4" /> Copy
      </Button>
    </div>
  );
}

// ── Document Checklist section ────────────────────────────────────────────────
function DocumentChecklistPanel() {
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);
  const [applicantType, setApplicantType] = useState<string>("");
  const [submitted, setSubmitted] = useState<{
    loanType: string;
    applicantType: string;
  } | null>(null);

  const { data: loanTypes = [] } = useLoanTypes();
  const { data: applicantTypes = [] } = useApplicantTypes();
  const { data: header, isFetching: headerLoading } = useChecklistHeader(
    submitted?.loanType ?? "",
    submitted?.applicantType ?? "",
  );
  const { data: detail } = useChecklistDetail(header?.checklist_id);

  const documentList = detail?.checklist_group ?? [];
  const noData = submitted !== null && !headerLoading && header === null;

  const onSelectLoanType = (id: string) => {
    setSelectedLoanType(id);
    setApplicantType("");
    setSubmitted(null);
  };

  const onBack = () => {
    setSelectedLoanType(null);
    setApplicantType("");
    setSubmitted(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanType || !applicantType) return;
    setSubmitted({ loanType: selectedLoanType, applicantType });
  };

  if (selectedLoanType === null) {
    // Stage 1: tile grid of loan types (mirrors `view === "loanType"`).
    return (
      <CardContent>
        {loanTypes.length === 0 ? (
          <p className="text-sm text-slate-500">No loan types available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {loanTypes.map((lt) => (
              <button
                key={String(lt.id)}
                type="button"
                onClick={() => onSelectLoanType(String(lt.id))}
                className="rounded-md border border-slate-200 bg-white p-4 text-center text-sm font-medium text-slate-800 transition hover:border-sky-300 hover:bg-sky-50"
              >
                {lt.name}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    );
  }

  // Stage 2: applicant-type form, then document list once submitted.
  return (
    <CardContent className="space-y-4">
      {noData ? (
        <>
          <p className="text-sm text-slate-500">No data</p>
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        </>
      ) : (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="space-y-1">
            <Label>Applicant Type</Label>
            <select
              value={applicantType}
              onChange={(e) => setApplicantType(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Select…</option>
              {applicantTypes.map((a) => (
                <option key={a.lu_key} value={a.lu_key}>
                  {a.lu_name}
                </option>
              ))}
            </select>
            {submitted && !applicantType && (
              <p className="text-xs text-rose-600">Applicant Type is required</p>
            )}
          </div>
          <div className="flex items-end justify-between gap-2 md:col-span-2">
            <Button type="button" variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" size="sm" disabled={!applicantType}>
              Submit
            </Button>
          </div>
        </form>
      )}

      {documentList.length > 0 && (
        <div className="space-y-4">
          {documentList.map((group, gi) => (
            <div key={`${group.checklist_item_name ?? "group"}-${gi}`}>
              <p className="text-sm font-semibold text-slate-800">
                {group.checklist_item_name ?? "—"}
              </p>
              <ul className="ml-4 list-disc text-sm text-slate-700">
                {(group.items ?? []).map((item, ii) => (
                  <li key={`${item.document?.document_id ?? ii}`}>
                    {item.document?.document_name ?? "—"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() =>
                openWhatsAppWeb(formatDocumentListForSharing(documentList))
              }
            >
              <MessageCircle className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  );
}

// ── Promo section ─────────────────────────────────────────────────────────────
function PromoPanel() {
  const { data: creatives = [], isLoading } = usePromoCreatives();

  if (isLoading) {
    return <CardContent>Loading…</CardContent>;
  }
  if (creatives.length === 0) {
    return <CardContent>No data available.</CardContent>;
  }

  const shareItem = (item: {
    title?: string;
    description?: string;
    media_url?: string;
    sharable_url?: string;
  }) => {
    // Verbatim message format from legacy promoMaterials.js handleShare.
    const message = `
            *${item.title ?? ""}*\n
            ${item.description ?? ""}\n
            ${item.media_url ?? ""}\n
            View more: https://${item.sharable_url ?? ""}
        `;
    openWhatsAppWeb(message);
  };

  return (
    <CardContent>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {creatives.map((item) => (
          <div
            key={String(item.media_id ?? item.title ?? Math.random())}
            className="overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            {item.media_url ? (
              <img
                src={item.media_url}
                alt={item.title ?? ""}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full bg-slate-100" />
            )}
            <div className="space-y-2 p-3">
              <p className="text-sm font-semibold text-slate-800">
                {item.title ?? "—"}
              </p>
              <Button type="button" size="sm" onClick={() => shareItem(item)}>
                <MessageCircle className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
}

// ── Outer collapsible shell ──────────────────────────────────────────────────
type Section = "applyLink" | "documentChecklist" | "promo";

interface SectionDef {
  key: Section;
  title: string;
}

const SECTIONS: SectionDef[] = [
  { key: "applyLink", title: "Apply Link" },
  { key: "documentChecklist", title: "Document Checklist" },
  { key: "promo", title: "Promo" },
];

export default function SalesShareableLinkPage() {
  const [active, setActive] = useState<Section | null>(null);

  const renderBody = useMemo(
    () => ({
      applyLink: <ApplyLinkPanel />,
      documentChecklist: <DocumentChecklistPanel />,
      promo: <PromoPanel />,
    }),
    [],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Shareable Link
          </h1>
          <p className="text-sm text-slate-500">
            Marketing — apply links, document checklists, and promo creatives.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const open = active === s.key;
          return (
            <Card key={s.key}>
              <CardHeader>
                <button
                  type="button"
                  onClick={() => setActive(open ? null : s.key)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  {open ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              </CardHeader>
              {open && renderBody[s.key]}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
