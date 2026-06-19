import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@craft-apex/ui";
import { useMenuLabel } from "@craft-apex/i18n";
import { buildMenu, type MenuItem } from "../menu";
import { useModuleStore } from "../module-store";
import { resolveIcon } from "../utils/icon-map";

const cleanLink = (l: string) => l.split("?")[0]!.split("#")[0]!;
const isLink = (l?: string) => !!l && l !== "/#" && l !== "#";

function pathMatches(pathname: string, link: string) {
  if (!isLink(link)) return false;
  const l = cleanLink(link);
  return pathname === l || pathname.startsWith(l + "/");
}

function containsActive(item: MenuItem, pathname: string): boolean {
  if (pathMatches(pathname, item.link)) return true;
  if (item.subItems?.some((s) => containsActive(s, pathname))) return true;
  if (item.childItems?.some((c) => containsActive(c, pathname))) return true;
  return false;
}

const ACTIVE_FG = "#1E2A6B";

/** Outline circle (inactive) / filled dot (active) bullet — level 3. */
function Bullet({ active }: { active: boolean }) {
  return active ? (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: ACTIVE_FG }}
    />
  ) : (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-slate-300" />
  );
}

/** Level-3 capable row inside the flyout panel. `onNavigate` closes the panel. */
function PanelItem({
  item,
  pathname,
  onNavigate,
}: {
  item: MenuItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const ml = useMenuLabel();
  const hasChildren = item.isChildItem && (item.childItems?.length ?? 0) > 0;
  const [open, setOpen] = useState(() =>
    hasChildren ? containsActive(item, pathname) : false
  );

  useEffect(() => {
    if (hasChildren && containsActive(item, pathname)) setOpen(true);
  }, [pathname, hasChildren, item]);

  const activeStyle = { color: ACTIVE_FG, backgroundColor: `${ACTIVE_FG}12` };

  // Level-2 leaf (no children): plain link row, no icon.
  if (!hasChildren) {
    return (
      <NavLink
        to={isLink(item.link) ? item.link : "#"}
        target={item.target || undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
            isActive && isLink(item.link) && "font-semibold"
          )
        }
        style={({ isActive }) =>
          isActive && isLink(item.link) ? activeStyle : undefined
        }
      >
        {({ isActive }) => (
          <>
            <Bullet active={isActive && isLink(item.link)} />
            <span className="truncate">{ml(item.label)}</span>
          </>
        )}
      </NavLink>
    );
  }

  // Level-2 group: dash marker + label + chevron, expands level 3.
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <span className="h-0.5 w-2.5 shrink-0 rounded bg-slate-300" />
        <span className="flex-1 truncate text-start">{ml(item.label)}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
            !open && "-rotate-90 rtl:rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="mb-1 mt-0.5 space-y-0.5 ps-4">
          {item.childItems!.map((c) => (
            <NavLink
              key={c.id}
              to={isLink(c.link) ? c.link : "#"}
              target={c.target || undefined}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800",
                  isActive && isLink(c.link) && "font-semibold"
                )
              }
              style={({ isActive }) =>
                isActive && isLink(c.link) ? activeStyle : undefined
              }
            >
              {({ isActive }) => (
                <>
                  <Bullet active={isActive && isLink(c.link)} />
                  <span className="truncate">{ml(c.label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function DualSidebar() {
  const modules = useModuleStore((s) => s.modules);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menu = useMemo(() => buildMenu(modules), [modules]);
  const ml = useMenuLabel();

  // Hover-driven flyout: opens on rail hover, closes on click / pointer-out.
  const [openId, setOpenId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), 140);
  };
  const closeNow = () => {
    cancelClose();
    setOpenId(null);
  };
  useEffect(() => cancelClose, []);

  const open = menu.find((m) => m.id === openId) ?? null;
  const hasPanel = (open?.subItems?.length ?? 0) > 0;

  const onRailEnter = (item: MenuItem) => {
    cancelClose();
    setOpenId((item.subItems?.length ?? 0) > 0 ? item.id : null);
  };
  const onRailClick = (item: MenuItem) => {
    if ((item.subItems?.length ?? 0) === 0 && isLink(item.link)) {
      navigate(item.link);
    }
    closeNow(); // close on click
  };

  return (
    <div className="relative flex h-full shrink-0">
      {/* Icon rail — level 1 (always visible) */}
      <div
        className="z-40 flex w-[68px] flex-col items-center gap-1.5 overflow-y-auto py-4"
        style={{ backgroundColor: ACTIVE_FG }}
        onMouseLeave={scheduleClose}
      >
        {menu.map((m) => {
          const Icon = resolveIcon({ icon: m.icon, label: m.label });
          const active = containsActive(m, pathname);
          const label = ml(m.label);
          return (
            <button
              key={m.id}
              type="button"
              onMouseEnter={() => onRailEnter(m)}
              onClick={() => onRailClick(m)}
              title={label}
              className={cn(
                "flex w-[58px] flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-medium leading-tight transition-colors",
                active
                  ? "bg-white"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
                !active && openId === m.id && "bg-white/10 text-white"
              )}
              style={active ? { color: ACTIVE_FG } : undefined}
            >
              <Icon className="h-[22px] w-[22px] shrink-0" />
              <span className="line-clamp-2 text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Flyout panel — overlay, levels 2 & 3 (does not reflow content) */}
      {hasPanel && open && (
        <div
          className="absolute start-[68px] top-0 z-30 flex h-full w-64 flex-col overflow-y-auto border-e border-slate-200 bg-white shadow-2xl"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <nav className="flex-1 space-y-0.5 p-3 pt-4">
            {open.subItems!.map((s) => (
              <PanelItem
                key={s.id}
                item={s}
                pathname={pathname}
                onNavigate={closeNow}
              />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
