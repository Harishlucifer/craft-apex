import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  Link2,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  toast,
} from "@craft-apex/ui";
import {
  useApplicantTypes,
  useChecklistDetail,
  useChecklistHeader,
  useLoanTypes,
  usePromoCreatives,
} from "./shareable-links.api";
import type { ChecklistGroup, SharableLinkUser } from "./shareable-links.types";

// Legacy: channel-flexi/src/Components/ShareableLinks/index.js — three collapsible
// sections (Apply Link / Document Checklist / Promo), each with its own data source.
//
// Deviations:
//  - react-share <WhatsappShareButton> → a plain https://wa.me/?text= deep link.
//  - Swiper carousel in the promo section → a responsive card grid.
//  - Legacy also fetches LOOKUP?group_code=ENTITY_TYPE, but its <Select> is
//    commented out and alpha-api's /master/checklist only filters on
//    loanType / applicantType / type. `useEntityTypes()` is wired in the api
//    module for whoever restores that field; nothing renders it today.

const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-100";

/** Legacy shareToWhatsApp — swapped to the universal wa.me deep link. */
function shareOnWhatsApp(message: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} link is copied to clipboard`);
  } catch {
    toast.error("Could not copy the link. Copy it manually instead.");
  }
}

// ── Apply Link ───────────────────────────────────────────────────────────────

function LinkRow({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-[240px] flex-1 items-center rounded-md border border-slate-200 bg-slate-50">
        <span className="flex h-10 items-center px-3 text-slate-500">
          <Link2 className="h-4 w-4" />
        </span>
        <Input
          value={value}
          readOnly
          aria-label={label}
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => shareOnWhatsApp(value)}
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        title={`Copy ${label} link`}
        onClick={() => copyToClipboard(value, label)}
      >
        <Copy className="h-4 w-4" /> Copy
      </Button>
    </div>
  );
}

function ApplyLinkPanel() {
  // Legacy reads tenant.user.* (POST /alpha/v1/setup). partner-portal has no
  // tenant call yet, so the same fields are read off the persisted auth user.
  const user = useAuthStore((s) => s.user);
  const links = (user ?? {}) as SharableLinkUser;
  const partnerLink =
    typeof links.partner_sharable_link === "string"
      ? links.partner_sharable_link
      : "";
  const applicationLink =
    typeof links.application_sharable_link === "string"
      ? links.application_sharable_link
      : "";

  if (!partnerLink && !applicationLink) {
    return (
      <CardContent>
        <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">No shareable links configured</p>
            <p className="mt-1 text-amber-700">
              Partner onboarding and lead-creation links come from the tenant
              setup payload (<code>partner_sharable_link</code> /{" "}
              <code>application_sharable_link</code>). They are not present on
              your profile — please contact your IT admin.
            </p>
          </div>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800">
          Partner Onboarding
        </p>
        {partnerLink ? (
          <LinkRow value={partnerLink} label="Partner Onboarding" />
        ) : (
          <p className="text-sm text-slate-500">Please contact IT admin</p>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800">Lead Creation</p>
        {applicationLink ? (
          <LinkRow value={applicationLink} label="Lead Creation" />
        ) : (
          <p className="text-sm text-slate-500">Please contact IT admin</p>
        )}
      </div>
    </CardContent>
  );
}

// ── Document Checklist ───────────────────────────────────────────────────────

/** Legacy formatDocumentListForSharing — kept verbatim. */
function formatDocumentListForSharing(groups: ChecklistGroup[]): string {
  let shareText = "Documents Checklist:\n";
  groups.forEach((group) => {
    shareText += `\n${group.checklist_item_name ?? ""}:\n`;
    (group.items ?? []).forEach((item) => {
      shareText += `- ${item.document?.document_name ?? ""}\n`;
    });
  });
  return shareText;
}

function DocumentChecklistPanel() {
  const [loanTypeId, setLoanTypeId] = useState<string | null>(null);
  const [applicantType, setApplicantType] = useState("");
  const [submitted, setSubmitted] = useState<{
    loanTypeId: string;
    applicantType: string;
  } | null>(null);

  const { data: loanTypes = [], isLoading: loanTypesLoading } = useLoanTypes();
  const { data: applicantTypes = [] } = useApplicantTypes();
  const { data: header, isFetching: headerLoading } = useChecklistHeader(
    submitted?.loanTypeId ?? "",
    submitted?.applicantType ?? ""
  );
  const { data: detail, isFetching: detailLoading } = useChecklistDetail(
    header?.checklist_id ? String(header.checklist_id) : undefined
  );

  const groups = detail?.checklist_group ?? [];
  const noChecklist = submitted !== null && !headerLoading && header === null;

  const reset = () => {
    setLoanTypeId(null);
    setApplicantType("");
    setSubmitted(null);
  };

  // Stage 1 — loan-type tiles (legacy `view === "loanType"`).
  if (loanTypeId === null) {
    if (loanTypesLoading) {
      return (
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        </CardContent>
      );
    }
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
                onClick={() => {
                  setLoanTypeId(String(lt.id));
                  setApplicantType("");
                  setSubmitted(null);
                }}
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

  // Stage 2 — applicant type, then the document list.
  return (
    <CardContent className="space-y-4">
      {noChecklist ? (
        <>
          <p className="text-sm text-slate-500">
            No document checklist is mapped for this selection.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Back
          </Button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!applicantType) return;
            setSubmitted({ loanTypeId, applicantType });
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="applicantType" className="text-xs text-slate-700">
              Applicant Type <span className="text-rose-500">*</span>
            </Label>
            <select
              id="applicantType"
              className={selectClass}
              value={applicantType}
              onChange={(e) => setApplicantType(e.target.value)}
            >
              <option value="">Select applicant type</option>
              {applicantTypes.map((a) => (
                <option key={a.lu_key} value={a.lu_key}>
                  {a.lu_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-between gap-2 md:col-span-2">
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              Back
            </Button>
            <Button type="submit" size="sm" disabled={!applicantType}>
              {(headerLoading || detailLoading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </div>
        </form>
      )}

      {groups.length > 0 && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          {groups.map((group, gi) => (
            <div key={`${group.checklist_item_name ?? "group"}-${gi}`}>
              <p className="text-sm font-semibold text-slate-800">
                {group.checklist_item_name ?? "—"}
              </p>
              <ul className="ml-5 list-disc text-sm text-slate-700">
                {(group.items ?? []).map((item, ii) => (
                  <li key={item.document?.document_id ?? `${gi}-${ii}`}>
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
              onClick={() => shareOnWhatsApp(formatDocumentListForSharing(groups))}
            >
              <MessageCircle className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  );
}

// ── Promo ────────────────────────────────────────────────────────────────────

function PromoPanel() {
  const { data: creatives = [], isLoading } = usePromoCreatives();

  if (isLoading) {
    return (
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-md" />
          ))}
        </div>
      </CardContent>
    );
  }

  if (creatives.length === 0) {
    return (
      <CardContent>
        <p className="text-sm text-slate-500">No promo material available.</p>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {creatives.map((item, i) => (
          <div
            key={item.media_id ?? `${item.title ?? "promo"}-${i}`}
            className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            {item.media_url ? (
              <img
                src={item.media_url}
                alt={item.title ?? "Promo"}
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="h-44 w-full bg-slate-100" />
            )}
            <div className="flex flex-1 flex-col gap-2 p-3">
              <p className="text-sm font-semibold text-slate-800">
                {item.title ?? "—"}
              </p>
              {item.description && (
                <p className="line-clamp-3 text-xs text-slate-500">
                  {item.description}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                className="mt-auto w-fit"
                onClick={() =>
                  // Legacy promoMaterials.handleShare message format.
                  shareOnWhatsApp(
                    `*${item.title ?? ""}*\n${item.description ?? ""}\n${
                      item.media_url ?? ""
                    }\nView more: https://${item.sharable_url ?? ""}`
                  )
                }
              >
                <MessageCircle className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
}

// ── Collapsible shell ────────────────────────────────────────────────────────

type Section = "applyLink" | "documentChecklist" | "promo";

const SECTIONS: Array<{ key: Section; title: string; subtitle: string }> = [
  {
    key: "applyLink",
    title: "Apply Link",
    subtitle: "Partner onboarding and lead-creation links you can share.",
  },
  {
    key: "documentChecklist",
    title: "Document Checklist",
    subtitle: "Documents required for a loan type and applicant type.",
  },
  { key: "promo", title: "Promo", subtitle: "Marketing creatives to share." },
];

export default function ShareableLinksPage() {
  const [active, setActive] = useState<Section | null>("applyLink");

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Shareable Link
        </h1>
        <p className="text-sm text-slate-500">
          Marketing — apply links, document checklists and promo creatives.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const open = active === section.key;
          return (
            <Card key={section.key}>
              <CardHeader>
                <button
                  type="button"
                  onClick={() => setActive(open ? null : section.key)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <span className="mt-1 block text-xs text-slate-500">
                      {section.subtitle}
                    </span>
                  </span>
                  {open ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  )}
                </button>
              </CardHeader>
              {open && section.key === "applyLink" && <ApplyLinkPanel />}
              {open && section.key === "documentChecklist" && (
                <DocumentChecklistPanel />
              )}
              {open && section.key === "promo" && <PromoPanel />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
