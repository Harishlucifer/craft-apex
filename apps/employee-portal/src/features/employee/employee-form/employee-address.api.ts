import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeAddressSavePayload,
  FormattedAddressPayload,
  PincodeRow,
  UserAddress,
} from "./employee-address.types";

// Endpoints (verbatim from craft-frontend/src/Components/helper/ApiEndPoint.js).
const EMPLOYEE_URL = "/alpha/v1/employee";
const PINCODE_URL = "/alpha/v1/master/pin-code";
const GET_ADDRESS_URL = "/alpha/v1/utility/formatted-address";

// GET /alpha/v1/employee/{id} -> envelope { status, data, result: { ..., user_address } }
// Legacy reads response.data.result.user_address (line 214 of EmployeeAddress.js).
export function useEmployeeAddressDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["employee-address-detail", id ?? ""],
    enabled: Boolean(id),
    queryFn: async (): Promise<UserAddress | null> => {
      const body = await api.get<unknown, any>(
        `${EMPLOYEE_URL}/${encodeURIComponent(id!)}`
      );
      const r = body?.result ?? body?.data?.result ?? body?.data ?? body;
      const ua = r?.user_address;
      return ua && ua.user_address_id ? (ua as UserAddress) : null;
    },
  });
}

// GET /alpha/v1/master/pin-code?pincode=X -> { data: [PincodeRow] }
export async function fetchPincodeDetails(
  pincode: string
): Promise<PincodeRow[]> {
  if (!pincode) return [];
  const body = await api.get<unknown, any>(
    `${PINCODE_URL}?pincode=${encodeURIComponent(pincode)}`
  );
  const arr = body?.data ?? body?.result ?? body;
  return Array.isArray(arr) ? (arr as PincodeRow[]) : [];
}

// POST /alpha/v1/utility/formatted-address { latitude, longitude } -> { result: string }
export async function fetchFormattedAddress(
  payload: FormattedAddressPayload
): Promise<string> {
  try {
    const body = await api.post<unknown, any>(GET_ADDRESS_URL, payload);
    return body?.result ?? body?.data?.result ?? "";
  } catch {
    return "";
  }
}

// POST /alpha/v1/employee with { employee_id, user_address }
export function useSaveEmployeeAddress() {
  return useMutation({
    mutationFn: async (payload: EmployeeAddressSavePayload) =>
      api.post<unknown, any>(EMPLOYEE_URL, payload),
  });
}
