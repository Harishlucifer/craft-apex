/**
 * CreditBureauAPI — handles all API calls for the Credit Bureau component.
 *
 * API Endpoints:
 *  - Lookup:              GET  /alpha/v1/lookup?group_code=APPLICATION_BUREAU
 *  - Bureau Pull List:    GET  /alpha/v1/onboarding/:applicationId/cam/APPLICATION_BUREAU
 *  - Applicant Update:    POST /alpha/v1/sync/direct-integrate/application/update
 *  - Bureau Init:         POST /alpha/v1/cam/bureau-analysis
 *  - Workflow Build:      POST /alpha/v1/workflow/build
 *  - Workflow Execution:  POST /alpha/v1/workflow/execution
 *  - Questionnaire:       POST /iaas/internal/bureau/application/:work_order_id/update
 */

import { BaseApiService } from "../../api/base";

export interface BureauApplicant {
  applicant_name: string;
  applicant_id: string;
  applicant_category: "PERSON" | "ENTITY";
  product_code?: string;
  bureau_details?: {
    first_name?: string;
    last_name?: string;
    dob?: string;
    mobile?: string;
    email?: string;
    address?: {
      line_1?: string;
      area?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    bureau_data?: {
      status?: number;
      bureau_analysis_id?: number;
      cam_application_id?: string;
      work_order_id?: number;
      response_data?: any;
      questionnaire_data?: any;
      computed_data?: {
        individual_information?: IndividualInformation;
        accounts?: BureauAccount[];
        enquiry?: BureauEnquiry[];
      };
    };
  };
  [key: string]: any;
}

export interface IndividualInformation {
  score?: number;
  full_name?: string;
  email?: string;
  total_secured_balance_amount?: number;
  total_unsecured_balance_amount?: number;
  zero_bal_accounts?: number;
  overdue_amount?: number;
  total_balance_amount?: number;
  sanctioned_amount?: number;
  last_30_days_dpd?: number;
  last_90_days_dpd?: number;
  last_180_days_dpd?: number;
  last_9months_dpd?: number;
  last_1year_dpd?: number;
  last_2year_dpd?: number;
  account_one_month_dpd?: number;
  account_three_month_dpd?: number;
  account_six_month_dpd?: number;
  account_nine_month_dpd?: number;
  account_one_year_dpd?: number;
  account_two_year_dpd?: number;
  total_enquiry?: number;
  past_30_days_enq?: number;
  past_12_months_enq?: number;
  recent_enquiry_date?: string;
  recent_open_date?: string;
  oldest_open_date?: string;
  recent_closed_date?: string;
  no_of_closed_account?: number;
  [key: string]: any;
}

export interface BureauAccount {
  loan_type?: string;
  status?: string;
  account_number?: string;
  sanctioned_amount?: number;
  current_balance?: number;
  overdue_amount?: number;
  emi_amount?: number;
  opened_date?: string;
  closed_date?: string;
  last_payment_date?: string;
  account_phone_number?: Array<{ number: string }>;
  [key: string]: any;
}

export interface BureauEnquiry {
  enquiry_purpose?: string;
  enquiry_date?: string;
  enquiry_amount?: number;
  member_name?: string;
  [key: string]: any;
}

/** Status mapping for bureau account statuses */
export const BUREAU_ACCOUNT_STATUS: Record<string, string> = {
  "0": "OTHER",
  "1": "ACTIVE",
  "2": "CLOSED",
  "ACTIVE": "ACTIVE",
  "CLOSED": "CLOSED",
  Active: "ACTIVE",
  Closed: "CLOSED",
  Current: "ACTIVE",
  "Written-off": "OTHER",
  "Settled": "OTHER",
};

export class CreditBureauAPI extends BaseApiService {
  /** Fetch lookup codes for APPLICATION_BUREAU */
  async fetchLookups(): Promise<any> {
    const response = await this.get(
      "/alpha/v1/lookup?group_code=APPLICATION_BUREAU"
    );
    return response?.data ?? response;
  }

  /** Fetch bureau pull list for an application */
  async fetchBureauPullList(applicationId: string): Promise<any> {
    const response = await this.get(
      `/alpha/v1/onboarding/${applicationId}/cam/APPLICATION_BUREAU`
    );
    return response?.data ?? response;
  }

  /** Update applicant bureau data via sync */
  async updateApplicantData(payload: {
    type: string;
    reference_id: number;
    product_code?: string;
  }): Promise<any> {
    const response = await this.post(
      "/alpha/v1/sync/direct-integrate/application/update",
      payload
    );
    return response?.data ?? response;
  }

  /** Initialise a bureau analysis run */
  async bureauInit(payload: Record<string, any>): Promise<any> {
    const response = await this.post(
      "/alpha/v1/cam/bureau-analysis",
      payload
    );
    if (response?.data) return response.data;
    throw new Error("Bureau Init failed");
  }

  /** Build a bureau workflow */
  async workflowBuild(payload: {
    source_id: string;
    workflow_type: string;
  }): Promise<any> {
    const response = await this.post("/alpha/v1/workflow/build", payload);
    if (response?.data?.data) return response.data.data;
    if (response?.data) return response.data;
    throw new Error("Workflow Build failed");
  }

  /** Execute a bureau workflow step */
  async workflowExecution(payload: {
    execute_step_id: string;
    source_id: string;
    workflow_type: string;
  }): Promise<any> {
    const response = await this.post(
      "/alpha/v1/workflow/execution",
      payload
    );
    if (response?.data) return response.data;
    throw new Error("Workflow Execution failed");
  }

  /** Submit questionnaire answers (IAAS) */
  async submitQuestionnaire(
    workOrderId: string,
    payload: any
  ): Promise<any> {
    const response = await this.post(
      `/iaas/internal/bureau/application/${workOrderId}/update`,
      payload
    );
    return response?.data ?? response;
  }
}
