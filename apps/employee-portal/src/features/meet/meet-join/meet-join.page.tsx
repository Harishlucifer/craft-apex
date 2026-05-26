import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { AlertCircle, Loader2 } from "lucide-react";
import { env } from "@/env";
import { endSession, joinMeeting } from "./meet-join.api";
import type { MeetData } from "./meet-join.types";

/**
 * /meet/join — scaffolded LiveKit room mount.
 *
 * Legacy `Components/Verification/videoPDMeet/VideoCallScreen.js` (1382 LOC)
 * carries an extensive feature set on top of the plain LiveKit room:
 *   - photo capture w/ ExifData + signed upload + lightbox
 *   - recording start/stop (RECORDING_START / RECORDING_STOP endpoints)
 *   - HOST role-only controls (capture, recording, end-call, end-session)
 *   - custom mobile facingMode camera switching (front/back, Android-aware)
 *   - step data drawer + verification metadata bindings
 *   - data-channel messaging (DataPacket_Kind) between participants
 *   - meeting-expired panel based on `scheduled_end`
 *   - leave-meeting POST to MEET_LEAVE
 *
 * Here we render the room with LiveKit's prebuilt grid + control bar. Each of
 * the above is deferred until a dedicated session — see PHASES.md Phase 7
 * Landed entry.
 */
export default function MeetJoinPage() {
  const [params] = useSearchParams();
  const invitationToken = params.get("invitation_token");
  const title = params.get("title");

  const [meetData, setMeetData] = useState<MeetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!invitationToken || !title) {
      setError("Missing meeting parameters (invitation_token or title)");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await joinMeeting({
          invitation_token: invitationToken,
          name: title,
        });
        if (!data) {
          setError("Failed to join meeting session.");
        } else {
          setMeetData(data);
          if (data.scheduled_end) {
            // Legacy: replace " " → "T" so Date parses ISO-style.
            const t = data.scheduled_end.replace(" ", "T");
            const scheduled = new Date(t);
            if (!Number.isNaN(scheduled.getTime()) && new Date() > scheduled) {
              setExpired(true);
            }
          }
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "An unexpected error occurred while connecting to the meeting."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [invitationToken, title]);

  const handleDisconnect = async () => {
    if (!meetData?.session_id) {
      window.close();
      return;
    }
    try {
      await endSession(meetData.session_id);
    } catch (e) {
      console.error("end session error:", e);
    } finally {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Joining meeting…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-900 p-6 text-center text-white">
        <AlertCircle className="h-8 w-8 text-amber-400" />
        <h2 className="text-lg font-semibold">Meeting could not start</h2>
        <p className="max-w-md text-sm text-slate-300">{error}</p>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
        <h2 className="text-2xl font-semibold">Session Expired</h2>
        <p className="mt-2 text-sm text-slate-300">
          This meeting has already ended.
        </p>
      </div>
    );
  }

  const serverUrl = meetData?.livekit_url || env.liveKitUrl;
  const token = meetData?.token;

  if (!serverUrl || !token) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-900 p-6 text-center text-white">
        <AlertCircle className="h-8 w-8 text-amber-400" />
        <h2 className="text-lg font-semibold">Meeting endpoint not configured</h2>
        <p className="max-w-md text-sm text-slate-300">
          The backend `/alpha/v1/meet/join` response is missing `livekit_url` or
          `token`. Set <code>VITE_LIVEKIT_URL</code> as a fallback if needed.
        </p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      video
      audio
      data-lk-theme="default"
      style={{ height: "100vh", width: "100vw" }}
      onDisconnected={handleDisconnect}
    >
      <RoomView />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
}

function RoomView() {
  // Tracks of camera + screen share from all participants.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height, 80px))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
