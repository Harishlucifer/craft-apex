// EXU_0XX -> user-facing message, per 05-api-contracts.md's Error Code Registry.
// L9 integration step: every code from the L5 contract gets a real message here
// instead of a generic "something went wrong" toast.
const EXU_ERROR_MESSAGES: Record<string, string> = {
  EXU_001: "File type invalid, unreadable, or failed the security scan.",
  EXU_002: "File exceeds the maximum size limit.",
  EXU_003: "File exceeds the maximum row count.",
  EXU_010: "A mandatory field is unmapped and has no default value.",
  EXU_011: "The dedupe key must reference a mandatory-mapped field.",
  EXU_012: "That field is blocked (Aadhaar-type) and cannot be mapped.",
  EXU_013: "You cannot approve your own template — maker and checker must differ.",
  EXU_014: "A comment is required to reject.",
  EXU_015: "That column isn't mapped to a recognized field.",
  EXU_020: "Another batch is already running against this template — try again shortly.",
  EXU_021: "The undo window for this batch has closed.",
  EXU_022: "Undo is blocked — one or more partners created by this batch already have activity.",
  EXU_023: "The typed confirmation doesn't match the valid-row count.",
  EXU_024: "This batch isn't in the right state for that action.",
};

interface ApiErrorShape {
  response?: { data?: { error_code?: string; error?: string } };
}

/** Extracts a user-facing message from a failed excel-upload API call. */
export function excelUploadErrorMessage(err: unknown, fallback: string): string {
  const code = (err as ApiErrorShape)?.response?.data?.error_code;
  if (code && EXU_ERROR_MESSAGES[code]) {
    return EXU_ERROR_MESSAGES[code];
  }
  const serverMessage = (err as ApiErrorShape)?.response?.data?.error;
  return serverMessage || fallback;
}
