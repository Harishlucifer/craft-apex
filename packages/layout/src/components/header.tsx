import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Maximize,
  Minimize,
  User,
} from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { getApiClient, STORAGE_KEYS } from "@craft-apex/api";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@craft-apex/ui";

const BRAND = "#1E2A6B";

interface SearchType {
  label: string;
  value: string;
}

// Legacy SearchOption.handlePlaceholder — exact mapping by lookup key.
function placeholderFor(key: string): string {
  switch (key) {
    case "LEAD":
      return "Lead Id / Name / Mobile...";
    case "EMPLOYEE":
      return "Employee Id / Name/ Mobile...";
    case "PARTNER":
      return "Partner Code / Name / Mobile";
    case "LENDER":
      return "Lender Apply Id / Lender CRM Id";
    case "CUSTOMER":
      return "PAN / AADHAAR";
    case "VERIFICATION":
      return "Verification Id / Name...";
    default:
      return "search by..";
  }
}

// Legacy Header.formatDate — dd-MM-yyyy, raw string fallback.
function formatBusinessDate(v: unknown): string {
  if (!v) return "";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return String(v);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
}

function readBusinessDate(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tenant);
    const tenant = raw ? JSON.parse(raw) : null;
    return formatBusinessDate(tenant?.tenant?.BUSINESS_DATE);
  } catch {
    return "";
  }
}

/** Global search-type lookup (legacy GET /alpha/v1/lookup?group_code=SEARCH_TYPE). */
function useSearchTypes(): SearchType[] {
  const [types, setTypes] = useState<SearchType[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const body = await getApiClient().get<unknown, any>(
          "/alpha/v1/lookup?group_code=SEARCH_TYPE"
        );
        const data = body?.data ?? body;
        if (active && Array.isArray(data)) {
          setTypes(
            data.map((t: { lu_name: string; lu_key: string }) => ({
              label: t.lu_name,
              value: t.lu_key,
            }))
          );
        }
      } catch {
        /* lookup unavailable — selector stays empty */
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return types;
}

function useFullscreen() {
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };
  return { isFs, toggle };
}

export function Header({ brand }: { brand: string }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const searchTypes = useSearchTypes();
  const [searchBy, setSearchBy] = useState("");
  const [keyword, setKeyword] = useState("");
  const businessDate = readBusinessDate();
  const { isFs, toggle } = useFullscreen();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5">
        <img src="logo.png" alt={brand} className="h-7 w-auto object-contain" />
      </div>

      {/* Global search — type selector + keyword */}
      <div className="mx-4 hidden min-w-0 flex-1 items-center gap-2 md:flex">
        <div className="relative w-36 shrink-0">
          <select
            value={searchBy}
            onChange={(e) => {
              setSearchBy(e.target.value);
              setKeyword("");
            }}
            className="h-9 w-full appearance-none truncate rounded-md border border-slate-200 bg-slate-100 pl-3 pr-7 text-sm text-slate-700 outline-none focus:border-slate-300"
          >
            <option value="">Search by</option>
            {searchTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <input
          type="text"
          autoComplete="off"
          placeholder={placeholderFor(searchBy)}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="h-9 w-full max-w-xl rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
        />
      </div>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1.5">
        {businessDate && (
          <div className="mr-2 hidden flex-col items-end leading-tight sm:flex">
            <span className="text-[11px] text-slate-400">Business Date</span>
            <span className="text-sm font-semibold text-slate-800">
              {businessDate}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {isFs ? (
            <Minimize className="h-[18px] w-[18px]" />
          ) : (
            <Maximize className="h-[18px] w-[18px]" />
          )}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: BRAND }}
              >
                {initial}
              </span>
              <span className="hidden max-w-[12rem] flex-col items-start leading-tight sm:flex">
                <span className="truncate text-sm font-medium text-slate-900">
                  {user?.name ?? user?.email ?? "Account"}
                </span>
                {user?.user_type ? (
                  <span className="truncate text-xs text-slate-500">
                    {String(user.user_type)}
                  </span>
                ) : null}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email ?? "Signed in"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
