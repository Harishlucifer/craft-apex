export interface OtpPayload {
  platform: string;
  type: "PARTNER_FLOW" | "APPLICATION_FLOW";
  name: string;
  mobile?: string;
  email?: string;
  template: string;
  otp?: string;
  resend?: boolean;
  retry_type?: string;
  dedupe?: boolean;
  source_id?: string;
  workflow_type?: string;
}

export interface OtpResponse {
  status: number;
  result?: string;
  verification_hash?: string;
  hash?: string;
  message?: {
    status?: number;
    error?: string;
    channel_id?: string;
  };
  data?: {
    message?: string;
    verification_hash?: string;
  };
}
