import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Legacy /Components/LOS/Customer360Relationship.js
//   GET /alpha/v1/customer/{mobile}/360
//   Legacy strips a leading "+" and "91" country prefix from the mobile before
//   the call (Customer360Relationship.js:25).
const URL = "/alpha/v1/customer";

export interface CustomerProfile {
  username?: string;
  userId?: string | number;
  mobile?: string;
  email?: string;
  createdAt?: string;
}

export interface OtherRelationshipPerson {
  applicantType?: string;
  type?: string;
  name?: string;
  mobile?: string;
  applicationCode?: string;
}

export interface PastApplication {
  code?: string;
  applicationId?: string | number;
  status?: number | string;
  loanStatus?: string;
  loanAmount?: number | string;
  createdAt?: string;
}

export interface Customer360Detail {
  customerProfile?: CustomerProfile;
  kycStatus?: string;
  lastKycUpdate?: string;
  reKycDueDate?: string;
  kycRiskRating?: string;
  casaBalance?: string;
  fdValue?: string;
  loans?: unknown[];
  creditCards?: string;
  insurancePolicies?: string;
  otherRelationships?: {
    coapplicants?: OtherRelationshipPerson[];
    entityUsers?: OtherRelationshipPerson[];
  };
  pastApplications?: PastApplication[];
}

export function useCustomer360(rawMobile?: string) {
  // Sanitize: strip leading "+" and "91" country prefix to match legacy.
  const mobile = rawMobile
    ?.replace(/^\+/, "")
    .replace(/^91/, "");

  return useQuery({
    queryKey: ["customer-360", mobile ?? ""],
    enabled: Boolean(mobile),
    queryFn: async (): Promise<Customer360Detail> => {
      const body = await api.get<unknown, any>(
        `${URL}/${encodeURIComponent(mobile!)}/360`
      );
      return (body?.data ?? body) as Customer360Detail;
    },
  });
}
