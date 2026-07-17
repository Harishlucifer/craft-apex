import { useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Briefcase,
  IdCard,
  Shield,
  UserRound,
  UserCog,
  Building2,
  Users,
  KeyRound,
  BadgeCheck,
  Camera,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button, Card, CardContent, toast } from "@craft-apex/ui";
import { useAuthStore } from "@craft-apex/auth";
import { useTranslation } from "@craft-apex/i18n";
import { MonthCalendar } from "@/components/month-calendar";
import { env } from "@/env";
import {
  useEmployeeDetail,
  useBranchColleagues,
  uploadProfilePhoto,
} from "./profile.api";
import type { EmployeeDetail } from "./profile.types";

const PHOTO_KEY = (id: string) => `profile-photo:${id || "me"}`;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3 MB

function readStoredPhoto(id: string): string {
  try {
    return localStorage.getItem(PHOTO_KEY(id)) ?? "";
  } catch {
    return "";
  }
}

// Brand palette (matches the login / header marks).
const NAVY = "#1E2A6B";
const ACCENT = "#2563EB"; // blue — matches the work calendar

const str = (v: unknown): string => (v == null || v === "" ? "" : String(v));

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #4C7DF0, #1E2A6B)",
  "linear-gradient(135deg, #25D366, #128C4B)",
  "linear-gradient(135deg, #8B5CF6, #6D28D9)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #EC4899, #BE185D)",
  "linear-gradient(135deg, #06B6D4, #0E7490)",
];
function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]!;
}

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation("pages");

  const employeeId = str(user?.["employee_id"]);
  const { data: detail, isLoading } = useEmployeeDetail(employeeId);

  const fileRef = useRef<HTMLInputElement>(null);
  // A fresh upload (or instant local preview) overrides the persisted value.
  const [override, setOverride] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const photo =
    override ||
    str(detail?.profile_image) ||
    str(user?.["profile_image"]) ||
    readStoredPhoto(employeeId);

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Image is too large (max 3 MB).");
      return;
    }

    // Instant local preview while the upload is in flight.
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setOverride(dataUrl);

    setUploading(true);
    try {
      const url = await uploadProfilePhoto(file);
      if (url) {
        setOverride(url);
        try {
          localStorage.setItem(PHOTO_KEY(employeeId), url);
        } catch {
          /* storage full — display still works for this session */
        }
      }
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to upload photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const officeId = str(detail?.office_detail?.office_id);
  const { data: colleagues = [], isLoading: teamLoading } = useBranchColleagues(
    officeId,
    employeeId
  );

  // Branch-team pagination.
  const TEAM_PAGE_SIZE = 15;
  const [teamPage, setTeamPage] = useState(0);
  const teamPages = Math.max(1, Math.ceil(colleagues.length / TEAM_PAGE_SIZE));
  const safeTeamPage = Math.min(teamPage, teamPages - 1);
  const pagedColleagues = colleagues.slice(
    safeTeamPage * TEAM_PAGE_SIZE,
    safeTeamPage * TEAM_PAGE_SIZE + TEAM_PAGE_SIZE
  );

  // Prefer the richer employee record, fall back to the session payload.
  const name =
    str(detail?.name) ||
    str(user?.name) ||
    str(user?.["username"]) ||
    str(user?.email).split("@")[0] ||
    "—";
  const phone = str(detail?.mobile) || str(user?.["mobile"]);
  const email = str(detail?.email) || str(user?.email);
  const designation = str(detail?.designation) || str(user?.["designation"]);
  const employeeCode = str(detail?.employee_code) || str(user?.["employee_code"]);
  const userType = str(user?.user_type);
  const role = str(detail?.user_role?.role_name);
  const branch = str(detail?.office_detail?.office_name);
  const supervisorName = str(detail?.supervisor_user?.username);
  const supervisorRole = str(detail?.supervisor_user?.user_role_name);

  const rows = [
    { icon: <Phone className="h-4 w-4" />, label: t("profile.phone"), value: phone },
    { icon: <Mail className="h-4 w-4" />, label: t("profile.email"), value: email },
    { icon: <Shield className="h-4 w-4" />, label: t("profile.role"), value: role },
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: t("profile.designation"),
      value: designation,
    },
    {
      icon: <UserRound className="h-4 w-4" />,
      label: t("profile.reportsTo"),
      value: supervisorName,
    },
    {
      icon: <UserCog className="h-4 w-4" />,
      label: t("profile.rm"),
      value: supervisorName
        ? supervisorRole
          ? `${supervisorName} · ${supervisorRole}`
          : supervisorName
        : "",
    },
    {
      icon: <Building2 className="h-4 w-4" />,
      label: t("profile.branch"),
      value: branch,
    },
    {
      icon: <IdCard className="h-4 w-4" />,
      label: t("profile.employeeCode"),
      value: employeeCode,
    },
  ].filter((r) => r.value);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column: profile + month calendar */}
      <div className="space-y-6 lg:col-span-2">
      {/* Main profile card */}
      <Card className="overflow-hidden p-0">
        <div
          className="relative h-36 border-b border-slate-100"
          style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #EEF4FF 100%)" }}
        >
          {/* Soft brand-tint blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-10 -top-12 h-40 w-40 rounded-full blur-3xl"
              style={{ backgroundColor: "#4C7DF026" }}
            />
            <div
              className="absolute -bottom-16 right-1/3 h-36 w-36 rounded-full blur-3xl"
              style={{ backgroundColor: "#5FDD9826" }}
            />
          </div>

          {/* Fingrid.ai logo — top-left */}
          <img
            src="/logo.png"
            alt={env.brandName}
            className="pointer-events-none absolute left-6 top-5 h-7 select-none"
          />

          {/* Employee Portal — centered */}
          <span
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: NAVY }}
          >
            Employee Portal
          </span>

          <div className="absolute -bottom-10 left-8">
            <div className="relative h-24 w-24">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <span
                  className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-2xl font-bold text-white shadow-md"
                  style={{ background: gradientFor(name) }}
                  aria-hidden
                >
                  {getInitials(name)}
                </span>
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Upload profile photo"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
                style={{ backgroundColor: ACCENT }}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickPhoto}
              />
            </div>
          </div>
        </div>

        <CardContent className="px-8 pb-8 pt-14">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold capitalize text-slate-900">
                  {name}
                </h2>
                {userType && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    <BadgeCheck className="h-3 w-3" style={{ color: ACCENT }} />
                    {userType}
                  </span>
                )}
              </div>
              {(role || designation) && (
                <p className="mt-1 text-sm text-slate-500">
                  {role || designation}
                  {branch ? ` · ${branch}` : ""}
                </p>
              )}
            </div>

            <Button asChild variant="outline" size="sm">
              <Link to="/change-password">
                <KeyRound className="h-4 w-4" /> {t("profile.changePassword")}
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> …
            </div>
          ) : (
            <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${ACCENT}14`, color: ACCENT }}
                  >
                    {r.icon}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {r.label}
                    </dt>
                    <dd className="truncate text-sm font-medium text-slate-800">
                      {r.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          )}

          {/* Quick links */}
          <Link
            to="/work-schedule"
            className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${ACCENT}14`, color: ACCENT }}
            >
              <CalendarDays className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">
                {t("profile.workSchedule")}
              </p>
              <p className="truncate text-xs text-slate-500">
                {t("profile.workScheduleHint")}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </CardContent>
      </Card>

      {/* Current-month work schedule */}
      <MonthCalendar
        initialYear={new Date().getFullYear()}
        initialMonth={new Date().getMonth()}
      />
      </div>

      {/* Branch team panel */}
      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <Users className="h-4 w-4" style={{ color: ACCENT }} />
          <h3 className="text-sm font-semibold text-slate-900">
            {t("profile.branchTeam")}
          </h3>
          {branch && (
            <span className="ml-auto truncate text-xs text-slate-400">{branch}</span>
          )}
        </div>
        <CardContent className="p-3">
          {teamLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> …
            </div>
          ) : colleagues.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-slate-500">
              {t("profile.noTeam")}
            </p>
          ) : (
            <>
              <ul className="space-y-1">
                {pagedColleagues.map((c) => (
                  <ColleagueRow key={c.employee_id ?? c.mobile} colleague={c} />
                ))}
              </ul>
              {teamPages > 1 && (
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTeamPage((p) => Math.max(0, p - 1))}
                    disabled={safeTeamPage === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    {safeTeamPage + 1} / {teamPages}
                    <span className="ml-1 text-slate-400">· {colleagues.length}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTeamPage((p) => Math.min(teamPages - 1, p + 1))
                    }
                    disabled={safeTeamPage >= teamPages - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ColleagueRow({ colleague }: { colleague: EmployeeDetail }) {
  const name = str(colleague.name) || "—";
  const role = str(colleague.user_role?.role_name);
  const phone = str(colleague.mobile);
  return (
    <li className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
        style={{ background: gradientFor(name) }}
        aria-hidden
      >
        {getInitials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize text-slate-900">{name}</p>
        {role && <p className="truncate text-xs text-slate-500">{role}</p>}
      </div>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full"
            style={{ backgroundColor: `${ACCENT}1f`, color: ACCENT }}
          >
            <Phone className="h-2.5 w-2.5" />
          </span>
          {phone}
        </a>
      )}
    </li>
  );
}
