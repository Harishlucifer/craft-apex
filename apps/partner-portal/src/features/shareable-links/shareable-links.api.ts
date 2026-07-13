// Legacy: channel-flexi/src/Components/ShareableLinks/{doucumentCheckList,promoMaterials}.js
//   LOAN_TYPE_MASTER       GET /alpha/v1/master/loan-type?status=1
//   LOOKUP_MASTER          GET /alpha/v1/lookup?group_code=ENTITY_TYPE|APPLICANT_TYPE
//   GET_DOCUMENT_CHECKLIST GET /alpha/v1/master/checklist?loanType=&applicantType=
//                          GET /alpha/v1/master/checklist/{checklist_id}
//   GET_CREATIVE           GET /alpha/v1/marketing/creative?media_tag=PROMO
// (applyLink.js has no API — see shareable-links.types.ts)
//
// Endpoints verified against alpha-api app/routes/v1.go:369-370, 546.
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ChecklistDetail,
  ChecklistHeader,
  LoanTypeRow,
  LookupRow,
  PromoCreative,
} from "./shareable-links.types";

const URL_LOAN_TYPE = "/alpha/v1/master/loan-type";
const URL_LOOKUP = "/alpha/v1/lookup";
const URL_CHECKLIST = "/alpha/v1/master/checklist";
const URL_CREATIVE = "/alpha/v1/marketing/creative";

/** Envelopes are inconsistent server-side — the standard defensive unwrap. */
interface Envelope {
  data?: unknown;
  result?: unknown;
}

function unwrapList<T>(body: Envelope | undefined | null): T[] {
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? (arr as T[]) : [];
}

function unwrapObject<T>(body: Envelope | undefined | null): T | null {
  const obj = body?.result ?? body?.data ?? body;
  return obj && typeof obj === "object" && !Array.isArray(obj) ? (obj as T) : null;
}

// ── Document Checklist ───────────────────────────────────────────────────────

/** Legacy fetchOptions(): `${LOAN_TYPE_MASTER}?status=1` */
export function useLoanTypes() {
  return useQuery({
    queryKey: ["shareable-links.loan-types"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, Envelope>(`${URL_LOAN_TYPE}?status=1`);
      return unwrapList<LoanTypeRow>(body);
    },
  });
}

/** Legacy fetchAdditionalOptions(): LOOKUP_MASTER + "?group_code=…" */
function useLookup(groupCode: string) {
  return useQuery({
    queryKey: ["shareable-links.lookup", groupCode],
    queryFn: async (): Promise<LookupRow[]> => {
      const body = await api.get<unknown, Envelope>(
        `${URL_LOOKUP}?group_code=${encodeURIComponent(groupCode)}`
      );
      return unwrapList<LookupRow>(body);
    },
  });
}

export function useEntityTypes() {
  return useLookup("ENTITY_TYPE");
}

export function useApplicantTypes() {
  return useLookup("APPLICANT_TYPE");
}

/**
 * Stage 1 — legacy handleSubmit():
 *   GET /alpha/v1/master/checklist?loanType={loanTypeId}&applicantType={luKey}
 *   → result[0].checklist_id (result can be null when no checklist is mapped)
 * alpha-api filters `loanType` against checklist.loan_type_id, so the param is
 * the loan-type id — not its code (master/controller.go:1005).
 */
export function useChecklistHeader(loanTypeId: string, applicantType: string) {
  return useQuery({
    queryKey: ["shareable-links.checklist-header", loanTypeId, applicantType],
    enabled: Boolean(loanTypeId) && Boolean(applicantType),
    queryFn: async (): Promise<ChecklistHeader | null> => {
      const body = await api.get<unknown, Envelope>(
        `${URL_CHECKLIST}?loanType=${encodeURIComponent(
          loanTypeId
        )}&applicantType=${encodeURIComponent(applicantType)}`
      );
      const rows = unwrapList<ChecklistHeader>(body);
      return rows[0] ?? null;
    },
  });
}

/** Stage 2 — legacy: GET `${GET_DOCUMENT_CHECKLIST}/${checklist_id}` → result.checklist_group */
export function useChecklistDetail(checklistId: string | undefined) {
  return useQuery({
    queryKey: ["shareable-links.checklist-detail", checklistId ?? ""],
    enabled: Boolean(checklistId),
    queryFn: async (): Promise<ChecklistDetail | null> => {
      const body = await api.get<unknown, Envelope>(
        `${URL_CHECKLIST}/${encodeURIComponent(String(checklistId))}`
      );
      return unwrapObject<ChecklistDetail>(body);
    },
  });
}

// ── Promo ────────────────────────────────────────────────────────────────────

/** Legacy promoMaterials.js: `${GET_CREATIVE}?media_tag=PROMO` → result[] */
export function usePromoCreatives() {
  return useQuery({
    queryKey: ["shareable-links.promo-creatives"],
    queryFn: async (): Promise<PromoCreative[]> => {
      const body = await api.get<unknown, Envelope>(
        `${URL_CREATIVE}?media_tag=PROMO`
      );
      return unwrapList<PromoCreative>(body);
    },
  });
}
