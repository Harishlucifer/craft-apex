// Exact shapes from legacy craft-frontend/src/Components/Verification/videoPDMeet/VideoCallScreen.js.
// /meet/join is reached with URL params: ?invitation_token=…&title=…[&step_id=…].
// The page posts to /alpha/v1/meet/join with {invitation_token, name: title}
// and uses the response to mount a LiveKit room.

export interface MeetJoinPayload {
  invitation_token: string;
  name: string;
}

export interface MeetData {
  token?: string;            // LiveKit JWT
  livekit_url?: string;      // wss://...
  participant_name?: string;
  participant_type?: string; // "HOST" | "GUEST" | etc.
  session_id?: string | number;
  source_id?: string | number;
  /** ISO-ish "YYYY-MM-DD HH:MM:SS" — legacy turns space → 'T' for Date parse. */
  scheduled_end?: string;
}

export interface MeetJoinEnvelope {
  data: MeetData | null;
}

export interface SessionEndResponse {
  status?: boolean | number;
  message?: string;
}
