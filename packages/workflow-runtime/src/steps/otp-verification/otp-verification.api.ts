import { getApiClient } from "@craft-apex/api";
import type { OtpPayload, OtpResponse } from "./otp-verification.types";

export async function sendOrVerifyOtp(payload: OtpPayload): Promise<OtpResponse> {
  const body = await getApiClient().post<unknown, any>("/alpha/v1/notification/otp", payload);
  return (body?.data ?? body) as OtpResponse;
}
