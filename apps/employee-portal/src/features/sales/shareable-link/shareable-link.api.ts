import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ChecklistDetail,
  ChecklistDetailResponse,
  ChecklistHeader,
  ChecklistListResponse,
  LoanTypeResponse,
  LoanTypeRow,
  LookupResponse,
  LookupRow,
  PromoCreative,
  PromoCreativeResponse,
} from "./shareable-link.types";

// Endpoint constants — verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js
const URL_LOAN_TYPE = "/alpha/v1/master/loan-type";      // LOAN_TYPE_MASTER
const URL_LOOKUP = "/alpha/v1/lookup";                   // LOOKUP_MASTER
const URL_CHECKLIST = "/alpha/v1/master/checklist";      // GET_DOCUMENT_CHECKLIST
const URL_CREATIVE = "/alpha/v1/marketing/creative";     // GET_CREATIVE

// ── Document Checklist ────────────────────────────────────────────────────────

export function useLoanTypes() {
  return useQuery({
    queryKey: ["sales-shareable-link.loan-types"],
    queryFn: async (): Promise<LoanTypeRow[]> => {
      const body = await api.get<unknown, LoanTypeResponse>(URL_LOAN_TYPE);
      return body?.data?.data ?? [];
    },
  });
}

export function useApplicantTypes() {
  return useQuery({
    queryKey: ["sales-shareable-link.applicant-types"],
    queryFn: async (): Promise<LookupRow[]> => {
      const body = await api.get<unknown, LookupResponse>(
        `${URL_LOOKUP}?group_code=APPLICANT_TYPE`,
      );
      return body?.data?.data ?? [];
    },
  });
}

// Stage 1: header lookup → returns checklist_id (or null if no checklist).
export function useChecklistHeader(loanType: string, applicantType: string) {
  return useQuery({
    queryKey: ["sales-shareable-link.checklist-header", loanType, applicantType],
    enabled: Boolean(loanType) && Boolean(applicantType),
    queryFn: async (): Promise<ChecklistHeader | null> => {
      const body = await api.get<unknown, ChecklistListResponse>(
        `${URL_CHECKLIST}?loanType=${encodeURIComponent(
          loanType,
        )}&applicantType=${encodeURIComponent(applicantType)}`,
      );
      // Legacy reads res.data.result[0]; result can be null (no-checklist case).
      const result = body?.data?.result;
      return Array.isArray(result) && result[0] ? result[0] : null;
    },
  });
}

// Stage 2: load grouped detail by checklist_id.
export function useChecklistDetail(checklistId: string | number | undefined) {
  return useQuery({
    queryKey: ["sales-shareable-link.checklist-detail", String(checklistId ?? "")],
    enabled: Boolean(checklistId),
    queryFn: async (): Promise<ChecklistDetail | null> => {
      const body = await api.get<unknown, ChecklistDetailResponse>(
        `${URL_CHECKLIST}/${encodeURIComponent(String(checklistId))}`,
      );
      return body?.data?.result ?? null;
    },
  });
}

// ── Promo ────────────────────────────────────────────────────────────────────
export function usePromoCreatives() {
  return useQuery({
    queryKey: ["sales-shareable-link.promo-creatives"],
    queryFn: async (): Promise<PromoCreative[]> => {
      const body = await api.get<unknown, PromoCreativeResponse>(
        `${URL_CREATIVE}?media_tag=PROMO`,
      );
      return body?.data?.result ?? [];
    },
  });
}

// ─── Deferred (legacy capabilities not yet ported) ────────────────────────────
// - Child-partner UTM generator (legacy ShareableLinks.js, distinct file mounted
//   at /shareable-links). Multi-step modal selecting partner → CHANNEL role,
//   then POST /alpha/v1/shortener/create to mint a short URL. Out of scope —
//   `/sales/shareable-link` (this port) wraps the *index.js* shell, which only
//   surfaces apply / checklist / promo. The modal lives behind a separate route.
// - Entity Type lookup (LOOKUP_MASTER?group_code=ENTITY_TYPE) — fetched in
//   legacy but its Select is commented out. We don't query it.
