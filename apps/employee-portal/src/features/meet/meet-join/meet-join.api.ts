import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MeetData,
  MeetJoinEnvelope,
  MeetJoinPayload,
  SessionEndResponse,
} from "./meet-join.types";

// Legacy ApiEndPoint.js:
//   MEET_JOIN   = /alpha/v1/meet/join
//   MEET_LEAVE  = /alpha/v1/meet/leave
//   SESSION_END = /alpha/v1/meet/session/:sessionId/end
const MEET_JOIN_URL = "/alpha/v1/meet/join";
const SESSION_END_URL = "/alpha/v1/meet/session/:sessionId/end";

export async function joinMeeting(payload: MeetJoinPayload): Promise<MeetData | null> {
  const body = await api.post<unknown, MeetJoinEnvelope>(MEET_JOIN_URL, payload);
  return body?.data ?? null;
}

export function useJoinMeeting() {
  return useMutation({ mutationFn: joinMeeting });
}

export async function endSession(
  sessionId: string | number
): Promise<SessionEndResponse> {
  const url = SESSION_END_URL.replace(":sessionId", String(sessionId));
  return api.post<unknown, SessionEndResponse>(url, {});
}
