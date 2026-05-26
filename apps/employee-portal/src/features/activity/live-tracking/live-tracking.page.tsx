import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  GoogleMap,
  LoadScript,
  Marker,
  OverlayView,
} from "@react-google-maps/api";
import { AlertCircle, MapPin, Minus, Plus } from "lucide-react";
import { env } from "@/env";
import {
  useLeastTerritory,
  useLiveLocations,
} from "./live-tracking.api";
import type {
  BranchLocation,
  UserLocation,
  UserStatusCounts,
} from "./live-tracking.types";

const CONTAINER_STYLE = { width: "100%", height: "80vh" };

// Legacy color -> status key mapping (used as the dot color in OverlayView).
const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  idle: "#f59e0b",
  inactive: "#ef4444",
  selected: "#4a50ff",
};

function statusKeyFor(color: string | undefined): keyof typeof STATUS_COLORS {
  if (color === "GREEN") return "active";
  if (color === "RED") return "inactive";
  return "idle";
}

// Legacy `getDistanceFromLatLonInKm` — haversine.
function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveTrackingPage() {
  const territories = useLeastTerritory();
  // Legacy default: first territory in the LEAST_TERRITORY response.
  const [territoryId, setTerritoryId] = useState<string>("");

  useEffect(() => {
    if (!territoryId && territories.data && territories.data.length > 0) {
      setTerritoryId(String(territories.data[0]!.id));
    }
  }, [territories.data, territoryId]);

  const live = useLiveLocations({
    territoryId: territoryId || undefined,
  });

  const users: UserLocation[] = live.data?.user ?? [];
  const branches: BranchLocation[] = live.data?.branch ?? [];
  const activeStatus: UserStatusCounts = live.data?.user_status ?? {};
  const primaryBranch: BranchLocation | undefined = branches[0];
  const center = primaryBranch
    ? {
        lat: Number(primaryBranch.latitude),
        lng: Number(primaryBranch.longitude),
      }
    : { lat: 12.9716, lng: 77.5946 }; // Bengaluru fallback (only used pre-load).

  // Legacy: filter out users within 1km of any branch (they're "at office" — not plotted).
  const offsiteUsers = useMemo(
    () =>
      users.filter((u) => {
        return !branches.some((b) => {
          const d = distanceKm(
            Number(b.latitude),
            Number(b.longitude),
            Number(u.latitude),
            Number(u.longitude)
          );
          return d <= 1;
        });
      }),
    [users, branches]
  );

  const [hovered, setHovered] = useState<UserLocation | null>(null);
  const [zoom, setZoom] = useState(11);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((m: google.maps.Map) => {
    mapRef.current = m;
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);
  const zoomIn = () => {
    if (!mapRef.current) return setZoom((z) => z + 1);
    setZoom((mapRef.current.getZoom() ?? zoom) + 1);
  };
  const zoomOut = () => {
    if (!mapRef.current) return setZoom((z) => Math.max(1, z - 1));
    setZoom(Math.max(1, (mapRef.current.getZoom() ?? zoom) - 1));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Activity Tracking
          </p>
          <h1 className="text-2xl font-semibold text-slate-800">Live Tracking</h1>
        </div>
        {/* Territory picker — legacy uses TerritoryTree sidebar; we expose a
            simple select for now (sidebar deferred). */}
        {(territories.data?.length ?? 0) > 0 && (
          <select
            className="h-9 rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            value={territoryId}
            onChange={(e) => setTerritoryId(e.target.value)}
          >
            {(territories.data ?? []).map((t) => (
              <option key={String(t.id)} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {primaryBranch?.name ?? "Branch"}
          </h2>
        </div>

        {env.googleMapsApiKey ? (
          <div className="relative h-[80vh] w-full overflow-hidden rounded-lg border border-slate-200">
            <LoadScript googleMapsApiKey={env.googleMapsApiKey}>
              <GoogleMap
                mapContainerStyle={CONTAINER_STYLE}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  scrollwheel: false,
                  zoomControl: false,
                  mapTypeControl: false,
                  streetViewControl: false,
                }}
              >
                <StatusCard counts={activeStatus} />
                <ZoomButtons onZoomIn={zoomIn} onZoomOut={zoomOut} />

                {branches.map((b, i) => (
                  <Marker
                    key={`b-${i}`}
                    position={{
                      lat: Number(b.latitude),
                      lng: Number(b.longitude),
                    }}
                    title={b.name}
                  />
                ))}
                {branches.map((b, i) => (
                  <Circle
                    key={`c-${i}`}
                    center={{
                      lat: Number(b.latitude),
                      lng: Number(b.longitude),
                    }}
                    radius={(b.distance ?? 0) * 1000}
                    options={{
                      fillColor: "#c7fbc7",
                      fillOpacity: 0.35,
                      strokeColor: "#00FF00",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                ))}

                {offsiteUsers.map((u) => {
                  const key =
                    u.user_id === hovered?.user_id
                      ? "selected"
                      : statusKeyFor(u.color);
                  return (
                    <OverlayView
                      key={String(u.user_id)}
                      position={{
                        lat: Number(u.latitude),
                        lng: Number(u.longitude),
                      }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <div
                        onClick={() => setHovered(u)}
                        className="employee-marker"
                        style={{ backgroundColor: STATUS_COLORS[key] }}
                      >
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                    </OverlayView>
                  );
                })}
              </GoogleMap>
            </LoadScript>
            <style>{`
              .employee-marker {
                width: 30px; height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: bold; font-size: 10px;
                transform: translate(-50%, -50%);
                animation: ct-pulse 2s infinite;
              }
              @keyframes ct-pulse {
                0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
                70%  { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
                100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
              }
            `}</style>
          </div>
        ) : (
          <MissingKeyNotice />
        )}

        {hovered && <SelectedEmployeeCard user={hovered} onClose={() => setHovered(null)} />}
      </div>
    </div>
  );
}

function StatusCard({ counts }: { counts: UserStatusCounts }) {
  const items: Array<{ label: string; color: string; desc: string; count?: number }> = [
    { label: "Active", color: "#10b981", desc: "Active Now", count: counts.active },
    {
      label: "Idle",
      color: "#f59e0b",
      desc: "Active 3 hours or more",
      count: counts.idle,
    },
    {
      label: "Inactive",
      color: "#ef4444",
      desc: "Active 12 hours or more",
      count: counts.inactive,
    },
  ];

  return (
    <div className="absolute left-3 top-3 z-10 w-64 rounded-md bg-white p-3 shadow-md">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Employee Status</h3>
      {items.map((i) => (
        <div
          key={i.label}
          className="mb-2 flex items-center justify-between last:mb-0"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: i.color }}
            />
            <div>
              <div className="text-sm font-medium text-slate-800">{i.label}</div>
              <div className="text-[11px] text-slate-500">{i.desc}</div>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
            {i.count ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}

function ZoomButtons({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="absolute bottom-5 right-3 z-10 overflow-hidden rounded-md bg-white shadow-md">
      <button
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center border-b border-slate-200 text-slate-700 hover:bg-slate-50"
        aria-label="Zoom in"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-50"
        aria-label="Zoom out"
      >
        <Minus className="h-5 w-5" />
      </button>
    </div>
  );
}

function SelectedEmployeeCard({
  user,
  onClose,
}: {
  user: UserLocation;
  onClose: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4 text-slate-500" />
        <div>
          <div className="font-semibold text-slate-800">{user.username}</div>
          <div className="text-xs text-slate-500">
            {Number(user.latitude).toFixed(4)}, {Number(user.longitude).toFixed(4)}
            {user.color && ` · ${user.color.toLowerCase()}`}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-white"
      >
        Close
      </button>
    </div>
  );
}

function MissingKeyNotice() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
      <AlertCircle className="h-8 w-8 text-amber-600" />
      <h3 className="text-base font-semibold text-amber-900">
        Google Maps API key not configured
      </h3>
      <p className="max-w-md text-sm text-amber-800">
        Live Tracking needs a Google Maps key. Set{" "}
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
          VITE_GOOGLE_MAPS_API_KEY
        </code>{" "}
        in your <code>.env</code> file and reload. Legacy reads this from
        tenant configuration (<code>GOOGLE_MAP_API_KEY</code>) — until tenant
        config is wired in craft-apex, the env var stands in.
      </p>
    </div>
  );
}
