import { useMemo, useState } from "react";
import { ChevronRight, Download, FileText, Home, Inbox, Send } from "lucide-react";
import jsPDF from "jspdf";
import { Button, toast } from "@craft-apex/ui";
import {
  useChecklistDetail,
  useChecklists,
  useLoanTypeUser,
  useUserInfo,
} from "./doc-checklist-share.api";
import type {
  ChecklistGroup,
  ChecklistRow,
  LoanTypeOption,
  UserInfo,
} from "./doc-checklist-share.types";

const idOf = (lt: LoanTypeOption | null | undefined): string => {
  if (!lt) return "";
  const raw = lt.id ?? lt.loan_type_id;
  return raw == null ? "" : String(raw);
};

function buildShareText(
  loanType: LoanTypeOption | null,
  checklist: ChecklistRow | null,
  groups: ChecklistGroup[],
  user: UserInfo | null
): string {
  let s = `*Document Checklist*\n`;
  s += `*Category:* ${checklist?.title ?? "N/A"}\n`;
  s += `*Loan Type:* ${loanType?.name ?? "N/A"}\n\n`;

  groups.forEach((g, i) => {
    s += `*${i + 1}) ${g.checklist_item_name ?? `Group ${i + 1}`}*\n`;
    g.items?.forEach((item) => {
      s += `- ${item.document?.document_name ?? "Document"}\n`;
    });
    if (i < groups.length - 1) s += `\n`;
  });

  s += `\n*Note:*\n`;
  s += `The above list is indicative in nature and additional documents may be called for.\n\n`;
  s += `We, at Can Fin Homes provide you customised Home Loan Solutions and Realise Your Dream Home with us.\n\n`;
  s += `*For any Clarifications and Discussions Please Contact @*\n\n`;
  s += `*Name:* ${user?.username ?? "Admin Department"}\n`;
  s += `*Designation:* ${user?.designation ?? ""}\n`;
  s += `*Branch:* ${user?.office_name ?? ""}\n`;
  s += `*Contact No.:* ${user?.mobile ?? ""}`;
  return s;
}

// Faithful port of legacy `downloadChecklist`. Legacy embedded a base64 logo;
// the new app generates the PDF without the bitmap header (no verified asset
// shipped in this repo). Page layout, fonts, sizing, and copy preserved.
function generatePdf(
  loanType: LoanTypeOption | null,
  checklist: ChecklistRow | null,
  groups: ChecklistGroup[],
  user: UserInfo | null
) {
  const doc = new jsPDF("p", "mm", "a4");
  const leftMargin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const HEADER_FONT_SIZE = 10;
  const CONTENT_FONT_SIZE = 8;

  const logoY = 10;
  const logoHeight = 25; // reserved space for legacy logo

  // Enquiry Box (top right) — verbatim labels + layout from legacy.
  const boxWidth = 80;
  const boxHeight = 32;
  const boxX = pageWidth - boxWidth - 10;
  const boxY = 10;
  doc.rect(boxX, boxY, boxWidth, boxHeight);
  let headerY = boxY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(CONTENT_FONT_SIZE);
  doc.text("For any Queries, Please contact:", boxX + 4, headerY);
  headerY += 6;
  const fields = [
    { label: "Name", value: user?.username },
    { label: "Designation", value: user?.designation },
    { label: "Branch", value: user?.office_name },
    { label: "Contact No", value: user?.mobile },
  ];
  fields.forEach((item) => {
    doc.setFontSize(CONTENT_FONT_SIZE);
    doc.setFont("helvetica", "bold");
    doc.text(`${item.label} :`, boxX + 4, headerY);
    doc.setFont("helvetica", "normal");
    doc.text(`${item.value ?? ""}`, boxX + 34, headerY);
    headerY += 6;
  });

  // Title Section
  let y = logoY + logoHeight + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(HEADER_FONT_SIZE);
  doc.text("Document Checklist", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(CONTENT_FONT_SIZE);
  doc.text(
    `${loanType?.name ?? ""} | ${checklist?.title ?? ""}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 12;

  // Document List
  groups.forEach((section, i) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(HEADER_FONT_SIZE);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${section.sequence ?? i + 1}. ${section.checklist_item_name ?? ""}`,
      leftMargin,
      y
    );
    y += 6;
    const maxTextWidth = pageWidth - leftMargin - 20;
    section.items?.forEach((item) => {
      doc.setFontSize(CONTENT_FONT_SIZE);
      doc.setFont("helvetica", "normal");
      const wrappedText = doc.splitTextToSize(
        `• ${item.document?.document_name ?? "Document"}`,
        maxTextWidth
      );
      if (y + wrappedText.length * 5 > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }
      doc.text(wrappedText, leftMargin + 5, y);
      y += wrappedText.length * 5;
    });
    y += 4;
  });

  // Note Section
  if (y > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(CONTENT_FONT_SIZE);
  doc.text("Note:", leftMargin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const noteText = doc.splitTextToSize(
    "The above list is indicative in nature and additional documents may be called for.",
    pageWidth - leftMargin - 20
  );
  doc.text(noteText, leftMargin, y);

  doc.save(`Document_Checklist_${checklist?.title ?? "list"}.pdf`);
}

function shareToWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://web.whatsapp.com/send?text=${encoded}`, "_blank");
}

export default function DocChecklistSharePage() {
  const userInfo = useUserInfo();
  const loanTypes = useLoanTypeUser();

  const [selectedLoanType, setSelectedLoanType] =
    useState<LoanTypeOption | null>(null);
  const [selectedChecklist, setSelectedChecklist] =
    useState<ChecklistRow | null>(null);

  const loanTypeId = idOf(selectedLoanType);
  const checklists = useChecklists(loanTypeId || null);
  const checklistId =
    selectedChecklist?.checklist_id != null
      ? String(selectedChecklist.checklist_id)
      : null;
  const details = useChecklistDetail(checklistId);

  const groups = details.data ?? [];
  // Legacy filters to status === 1 in the sidebar.
  const visibleChecklists = useMemo(
    () => (checklists.data ?? []).filter((c) => c.status === 1),
    [checklists.data]
  );

  const handleLoanTypeSelect = (lt: LoanTypeOption) => {
    setSelectedLoanType(lt);
    setSelectedChecklist(null);
  };

  const onDownload = () => {
    if (!groups.length) return;
    try {
      generatePdf(selectedLoanType, selectedChecklist, groups, userInfo.data ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate PDF");
    }
  };

  const onShare = () => {
    if (!groups.length) return;
    const msg = buildShareText(
      selectedLoanType,
      selectedChecklist,
      groups,
      userInfo.data ?? null
    );
    shareToWhatsApp(msg);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">Utility</p>
        <h1 className="text-2xl font-semibold text-slate-800">
          Share Document Checklist
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loanTypes.isLoading ? (
          <p className="text-sm text-slate-500">Loading loan types…</p>
        ) : (loanTypes.data ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">
            <FileText className="mr-1 inline h-4 w-4" />
            No loan types available
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(loanTypes.data ?? []).map((lt) => {
              const isActive = idOf(selectedLoanType) === idOf(lt);
              const logo = lt.configuration?.logo;
              return (
                <button
                  key={idOf(lt) || lt.name}
                  onClick={() => handleLoanTypeSelect(lt)}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase transition ${
                    isActive
                      ? "border-[#4C7DF0] bg-[#4C7DF0] text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {logo ? (
                    <img
                      src={logo}
                      alt={lt.name ?? ""}
                      width={20}
                      height={20}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <Home className="h-4 w-4" />
                  )}
                  {lt.name ?? "Unnamed Loan Type"}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Checklist
                {selectedLoanType && (
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    · {selectedLoanType.name ?? "Selected Loan Type"}
                  </span>
                )}
              </h2>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {!selectedLoanType ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  Select a loan type to view checklists
                </div>
              ) : checklists.isLoading ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Loading checklists…
                </div>
              ) : visibleChecklists.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  No checklists available for this loan type
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {visibleChecklists.map((c) => {
                    const isActive =
                      String(selectedChecklist?.checklist_id ?? "") ===
                      String(c.checklist_id);
                    return (
                      <li key={String(c.checklist_id)}>
                        <button
                          onClick={() => setSelectedChecklist(c)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                            isActive
                              ? "bg-[#4C7DF0] text-white"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <FileText
                            className={`h-5 w-5 shrink-0 ${
                              isActive ? "text-white" : "text-[#4C7DF0]"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-semibold">
                              {c.title ?? "Unnamed Checklist"}
                            </div>
                            <div
                              className={`text-xs ${
                                isActive ? "text-white/70" : "text-slate-500"
                              }`}
                            >
                              {c.loan_type?.loan_type_name ?? "Loan Type"}
                            </div>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-white" : "text-slate-400"
                            }`}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="text-sm font-semibold text-slate-800">
                {selectedChecklist?.title ?? "Select a Checklist"}
              </h2>
              {selectedChecklist && groups.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={onDownload}>
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={onShare}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Send className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </div>
              )}
            </div>

            <div className="max-h-[600px] overflow-y-auto p-4">
              {!selectedChecklist ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  <FileText className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                  <h3 className="mb-1 text-base font-semibold text-slate-700">
                    Select a checklist to view items
                  </h3>
                  <p>
                    Choose a checklist from the left sidebar to see the required
                    documents
                  </p>
                </div>
              ) : details.isLoading ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Loading checklist items…
                </div>
              ) : groups.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  <Inbox className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                  No items found for this checklist
                </div>
              ) : (
                <div className="space-y-6">
                  {groups.map((g, gi) => (
                    <div key={`${g.checklist_item_name ?? gi}`}>
                      <h3 className="mb-3 text-base font-semibold text-[#4C7DF0]">
                        {g.checklist_item_name ?? `Group ${gi + 1}`}
                      </h3>
                      {g.items && g.items.length > 0 && (
                        <ol className="space-y-2">
                          {g.items.map((item, ii) => (
                            <li
                              key={String(item.checklist_item_id ?? ii)}
                              className="flex items-start gap-3"
                            >
                              <span className="text-sm font-medium text-slate-500">
                                {ii + 1}.
                              </span>
                              <span className="text-sm text-slate-800">
                                {item.document?.document_name ?? "Document"}
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
