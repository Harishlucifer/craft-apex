import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Legacy /pages/Configuration/LenderOnboarding/LenderPincode/LenderEligiblePincode.js
//   GET /alpha/v1/master/lender/pincode?page=N[&loan_type=…&lender=…&keyword=…]
//   -> { data: EligiblePincodeRow[], pagination: { total } }
const URL = "/alpha/v1/master/lender/pincode";

export interface EligiblePincodeRow {
  id?: string | number;
  pincode?: string;
  lender?: { id?: string | number; name?: string };
  loan_type?: { id?: string | number; loan?: string };
}

export interface EligiblePincodeFilter {
  loan_type?: string;
  lender?: string;
  keyword?: string;
}

export interface EligiblePincodePage {
  data: EligiblePincodeRow[];
  total: number;
}

export function useEligiblePincodeList(page: number, filter: EligiblePincodeFilter) {
  const qs: string[] = [`page=${page}`];
  if (filter.loan_type) qs.push(`loan_type=${encodeURIComponent(filter.loan_type)}`);
  if (filter.lender) qs.push(`lender=${encodeURIComponent(filter.lender)}`);
  if (filter.keyword) qs.push(`keyword=${encodeURIComponent(filter.keyword)}`);
  const url = `${URL}?${qs.join("&")}`;

  return useQuery({
    queryKey: [
      "lender-eligible-pincode",
      page,
      filter.loan_type ?? "",
      filter.lender ?? "",
      filter.keyword ?? "",
    ],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<EligiblePincodePage> => {
      const body = await api.get<unknown, any>(url);
      const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
      const total = body?.pagination?.total ?? rows.length ?? 0;
      return { data: rows as EligiblePincodeRow[], total };
    },
  });
}
